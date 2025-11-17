const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const uri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET || 'change_this_securely';

let cachedClient = null;

async function connect(){
  if(cachedClient) return cachedClient;
  if(!uri) throw new Error('MONGODB_URI not configured');
  const client = new MongoClient(uri, { useNewUrlParser:true, useUnifiedTopology:true, serverApi: ServerApiVersion.v1 });
  await client.connect();
  cachedClient = client;
  return client;
}

exports.handler = async function(event, context){
  try {
    if(event.httpMethod !== 'POST') return { statusCode: 405, body: JSON.stringify({ error: 'Only POST' }) };
    const body = JSON.parse(event.body || '{}');
    const { action, email, password } = body;
    if(!action || !email || !password) return { statusCode:400, body: JSON.stringify({ error: 'action, email, password required' }) };

    const client = await connect();
    const db = client.db();
    const users = db.collection('todo_users');

    if(action === 'signup'){
      const existing = await users.findOne({ email: email.toLowerCase() });
      if(existing) return { statusCode:400, body: JSON.stringify({ error: 'Email already registered' }) };
      const hash = await bcrypt.hash(password, 10);
      const res = await users.insertOne({ email: email.toLowerCase(), password: hash, createdAt: new Date() });
      const payload = { id: res.insertedId.toString(), email: email.toLowerCase() };
      const token = jwt.sign(payload, jwtSecret, { expiresIn: '30d' });
      return { statusCode:200, body: JSON.stringify({ token }) };
    }

    if(action === 'login'){
      const user = await users.findOne({ email: email.toLowerCase() });
      if(!user) return { statusCode:401, body: JSON.stringify({ error: 'Invalid credentials' }) };
      const ok = await bcrypt.compare(password, user.password);
      if(!ok) return { statusCode:401, body: JSON.stringify({ error: 'Invalid credentials' }) };
      const payload = { id: user._id.toString(), email: user.email };
      const token = jwt.sign(payload, jwtSecret, { expiresIn: '30d' });
      return { statusCode:200, body: JSON.stringify({ token }) };
    }

    return { statusCode:400, body: JSON.stringify({ error: 'Unknown action' }) };
  } catch(err){
    console.error(err);
    return { statusCode:500, body: JSON.stringify({ error: err.message || 'server error' }) };
  }
}
