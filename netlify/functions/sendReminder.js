const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const jwtSecret = process.env.JWT_SECRET || 'change_this_securely';

exports.handler = async function(event, context){
  try {
    if(event.httpMethod !== 'POST') return { statusCode:405, body: JSON.stringify({ error: 'Only POST' }) };
    const body = JSON.parse(event.body || '{}');
    const { email, tasks } = body;
    if(!email) return { statusCode:400, body: JSON.stringify({ error: 'Email required' }) };

    // optional: verify token if present
    const auth = (event.headers && (event.headers.authorization || event.headers.Authorization)) || null;
    if(auth && auth.startsWith('Bearer ')){
      const token = auth.split(' ')[1];
      try{
        jwt.verify(token, jwtSecret);
      }catch(e){
        return { statusCode:401, body: JSON.stringify({ error: 'Invalid token' }) };
      }
    }

    let html = `<h3>Your To-Do Reminders</h3><p>Here are your pending tasks:</p><ul>`;
    (tasks || []).forEach(t=>{
      html += `<li style="margin:8px 0"><strong>${escapeHtml(t.title || t)}</strong> <div style="font-size:12px;color:#666">${t.createdAt ? new Date(t.createdAt).toLocaleString() : ''}</div></li>`;
    });
    html += `</ul><p>— Sent from Modern ToDo</p>`;

    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const from = process.env.FROM_EMAIL || process.env.SMTP_USER;

    if(!host || !user || !pass) return { statusCode:500, body: JSON.stringify({ error: 'SMTP not configured' }) };

    const transporter = nodemailer.createTransport({ host, port, secure: port===465, auth:{ user, pass } });

    await transporter.sendMail({
      from,
      to: email,
      subject: 'Your ToDo Reminders',
      html
    });

    return { statusCode:200, body: JSON.stringify({ ok:true }) };
  } catch(err){
    console.error(err);
    return { statusCode:500, body: JSON.stringify({ error: err.message || 'server error' }) };
  }
};

function escapeHtml(text){
  if(!text) return '';
  return text.replace(/[&<>"']/g, (m)=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m]));
}
