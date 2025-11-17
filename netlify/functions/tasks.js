const { MongoClient, ServerApiVersion } = require('mongodb');
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

function getUserIdFromEvent(event){
  const auth = (event.headers && (event.headers.authorization || event.headers.Authorization)) || null;
  if(!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.split(' ')[1];
  try{
    const payload = jwt.verify(token, jwtSecret);
    return payload.id;
  }catch(e){
    return null;
  }
}

exports.handler = async function(event, context){
  try {
    const method = event.httpMethod;
    const userId = getUserIdFromEvent(event);
    if(!userId) return { statusCode:401, body: JSON.stringify({ error: 'Unauthorized' }) };

    const client = await connect();
    const db = client.db();
    const tasks = db.collection('todo_tasks');

    if(method === 'GET'){
      const userTasks = await tasks.find({ userId }).sort({ createdAt: -1 }).toArray();
      return { statusCode:200, body: JSON.stringify({ tasks: userTasks }) };
    }

    if(method === 'POST'){
      const body = JSON.parse(event.body || '{}');
      if(!body.title) return { statusCode:400, body: JSON.stringify({ error: 'title required' }) };
      const doc = {
        userId,
        title: body.title,
        poster: body.poster || (`https://picsum.photos/seed/${Math.floor(Math.random()*1000)}/400/300`),
        createdAt: new Date().toISOString(),
        completedAt: null
      };
      const res = await tasks.insertOne(doc);
      doc._id = res.insertedId.toString();
      doc.id = doc._id;
      return { statusCode:200, body: JSON.stringify({ task: doc }) };
    }

    if(method === 'PUT'){
      const body = JSON.parse(event.body || '{}');
      const id = body.id;
      if(!id) return { statusCode:400, body: JSON.stringify({ error: 'id required' }) };
      const update = {};
      if(body.title !== undefined) update.title = body.title;
      if(body.completedAt !== undefined) update.completedAt = body.completedAt || null;
      await tasks.updateOne({ _id: require('mongodb').ObjectId(id), userId }, { $set: update });
      const updated = await tasks.findOne({ _id: require('mongodb').ObjectId(id), userId });
      return { statusCode:200, body: JSON.stringify({ task: updated }) };
    }

    if(method === 'DELETE'){
      const body = JSON.parse(event.body || '{}');
      const id = body.id;
      if(!id) return { statusCode:400, body: JSON.stringify({ error: 'id required' }) };
      await tasks.deleteOne({ _id: require('mongodb').ObjectId(id), userId });
      return { statusCode:200, body: JSON.stringify({ ok:true }) };
    }

    return { statusCode:405, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch(err){
    console.error(err);
    return { statusCode:500, body: JSON.stringify({ error: err.message || 'server error' }) };
  }
};
