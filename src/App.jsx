import React, { useEffect, useState } from "react";
import Header from "./components/Header";
import TaskInput from "./components/TaskInput";
import TaskItem from "./components/TaskItem";
import CompletedRow from "./components/CompletedRow";
import OptionsSection from "./components/OptionsSection";
import LoginModal from "./components/LoginModal";
import SignupModal from "./components/SignupModal";
import Footer from "./components/Footer";
import jwt_decode from "jwt-decode";

function apiFetch(path, method='GET', body=null, token=null){
  const opts = { method, headers: {} };
  if(body) { opts.headers['Content-Type']='application/json'; opts.body=JSON.stringify(body); }
  if(token) opts.headers['Authorization']=`Bearer ${token}`;
  return fetch('/.netlify/functions/'+path, opts).then(r=>r.json().then(j=>({ok:r.ok, json:j})));
}

function App(){
  const [tasks, setTasks] = useState([]);
  const [completed, setCompleted] = useState([]);
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [user, setUser] = useState(null);
  const [options, setOptions] = useState([
    {id:1,label:"Daily Standup",on:true},
    {id:2,label:"Grocery",on:false},
    {id:3,label:"Gym",on:false},
    {id:4,label:"Read",on:true}
  ]);

  useEffect(()=>{
    const raw = localStorage.getItem('todo_tasks');
    const rawc = localStorage.getItem('todo_completed');
    if(raw) setTasks(JSON.parse(raw));
    if(rawc) setCompleted(JSON.parse(rawc));
    const token = localStorage.getItem('token');
    if(token){
      try{
        const info = jwt_decode(token);
        setUser({email: info.email, id: info.id});
      }catch(e){ localStorage.removeItem('token') }
    }
  },[])

  // when user logs in, fetch server tasks
  useEffect(()=>{
    async function load(){
      const token = localStorage.getItem('token');
      if(!token) return;
      const res = await apiFetch('tasks', 'GET', null, token);
      if(res.ok){
        const t = res.json.tasks || [];
        const serverTasks = t.filter(x=>!x.completedAt);
        const serverCompleted = t.filter(x=>x.completedAt);
        setTasks(serverTasks);
        setCompleted(serverCompleted);
        localStorage.setItem('todo_tasks', JSON.stringify(serverTasks));
        localStorage.setItem('todo_completed', JSON.stringify(serverCompleted));
      }
    }
    load();
  }, [user && user.id]);

  useEffect(()=>{ localStorage.setItem('todo_tasks', JSON.stringify(tasks)); },[tasks])
  useEffect(()=>{ localStorage.setItem('todo_completed', JSON.stringify(completed)); },[completed])

  async function addTask(t){
    if(!t) return;
    const newTask = { id: Date.now().toString(), title:t, createdAt: new Date().toISOString(), poster:`https://picsum.photos/seed/${Math.floor(Math.random()*1000)}/400/300` };
    // optimistic UI
    setTasks(prev=>[newTask, ...prev]);
    const token = localStorage.getItem('token');
    if(token){
      const res = await apiFetch('tasks', 'POST', { title: t, poster: newTask.poster }, token);
      if(res.ok){
        // replace temp id with server id
        const server = res.json.task;
        setTasks(prev=> prev.map(p=> p.id===newTask.id ? server : p ));
      } else {
        alert('Failed to save task to server: '+(res.json.error||''));
      }
    }
  }

  async function completeTask(id){
    const t = tasks.find(x=>x.id===id);
    if(!t) return;
    setTasks(tasks.filter(x=>x.id!==id));
    const completedTask = {...t, completedAt: new Date().toISOString()};
    setCompleted([completedTask, ...completed]);
    const token = localStorage.getItem('token');
    if(token){
      const res = await apiFetch(`tasks`, 'PUT', { id, completedAt: completedTask.completedAt }, token);
      if(!res.ok) alert('Failed to update task on server');
    }
  }

  async function undoComplete(id){
    const t = completed.find(x=>x.id===id);
    if(!t) return;
    setCompleted(completed.filter(x=>x.id!==id));
    setTasks([ {...t, completedAt: undefined}, ...tasks ]);
    const token = localStorage.getItem('token');
    if(token){
      const res = await apiFetch('tasks', 'PUT', { id, completedAt: null }, token);
      if(!res.ok) alert('Failed to update task on server');
    }
  }

  async function removeTask(id){
    setTasks(tasks.filter(x=>x.id!==id));
    setCompleted(completed.filter(x=>x.id!==id));
    const token = localStorage.getItem('token');
    if(token){
      const res = await apiFetch('tasks', 'DELETE', { id }, token);
      if(!res.ok) alert('Failed to delete task on server');
    }
  }

  async function handleSendReminders(toEmail){
    if(!toEmail) return alert("Please enter an email to send reminders to.");
    try{
      const token = localStorage.getItem('token');
      const res = await fetch('/.netlify/functions/sendReminder', {
        method:'POST',
        headers: {'Content-Type':'application/json', Authorization: token ? `Bearer ${token}` : ''},
        body: JSON.stringify({ email: toEmail, tasks })
      });
      const j = await res.json();
      if(res.ok) alert('Reminder sent! Check your inbox.');
      else alert('Error: '+ (j?.error || 'failed to send'));
    }catch(e){ alert('Failed to send reminder: '+e.message) }
  }

  return (
    <div className="app">
      <Header
        onLogin={()=>setShowLogin(true)}
        onSignup={()=>setShowSignup(true)}
        user={user}
        onLogout={()=>{ localStorage.removeItem('token'); setUser(null); alert('Logged out') }}
      />

      <div className="grid">
        <div>
          <div className="card">
            <h3 className="h2">Your Tasks</h3>
            <TaskInput onAdd={addTask} />
            <div className="tasks">
              {tasks.length===0 && <div style={{padding:14,color:'var(--muted)'}}>No tasks yet — add one above.</div>}
              {tasks.map(t=>(
                <TaskItem key={t.id} task={t} onComplete={()=>completeTask(t.id)} onDelete={()=>removeTask(t.id)} />
              ))}
            </div>
          </div>

          <div className="card completed-row" style={{marginTop:14}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <h3 className="h2">Completed</h3>
              <div style={{fontSize:13,color:'var(--muted)'}}>{completed.length} done</div>
            </div>
            <CompletedRow items={completed} onUndo={undoComplete} />
          </div>
        </div>

        <aside>
          <div className="card">
            <h3 className="h2">Options</h3>
            <OptionsSection options={options} setOptions={setOptions} />
            <hr style={{margin:'12px 0'}} />
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <div style={{fontWeight:700}}>Send reminders</div>
              <div style={{fontSize:13,color:'var(--muted)'}}>Email yourself the open tasks</div>
              <RemindBox onSend={handleSendReminders} userEmail={user?.email} />
            </div>
          </div>

          <div style={{height:12}} />
          <div className="card">
            <h3 className="h2">Completed Highlights</h3>
            <p style={{color:'var(--muted)',marginTop:6}}>Quick glance at recently completed tasks</p>
            <CompletedRow items={completed.slice(0,6)} minimal onUndo={undoComplete} />
          </div>
        </aside>
      </div>

      <Footer />

      {showLogin && <LoginModal onClose={()=>setShowLogin(false)} onSuccess={(u)=>{ setUser(u); setShowLogin(false) }} />}
      {showSignup && <SignupModal onClose={()=>setShowSignup(false)} onSuccess={(u)=>{ setUser(u); setShowSignup(false) }} />}
    </div>
  )
}

function RemindBox({ onSend, userEmail }){
  const [email, setEmail] = useState(userEmail || '');
  return (
    <div style={{display:'flex',gap:8,marginTop:8}}>
      <input className="input-plain" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" />
      <button className="btn primary small" onClick={()=>onSend(email)}>Send</button>
    </div>
  )
}

export default App;
