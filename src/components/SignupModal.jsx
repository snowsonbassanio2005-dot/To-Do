import React, { useState } from "react";

export default function SignupModal({ onClose, onSuccess }){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e){
    e?.preventDefault();
    setLoading(true);
    try{
      const res = await fetch('/.netlify/functions/auth', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ action:'signup', email, password })
      });
      const j = await res.json();
      if(res.ok && j.token){
        localStorage.setItem('token', j.token);
        const payload = JSON.parse(atob(j.token.split('.')[1]));
        onSuccess({ email: payload.email, id: payload.id });
      } else {
        alert('Signup failed: '+(j?.error || 'unknown'));
      }
    }catch(err){ alert('Error: '+err.message) }
    setLoading(false);
  }

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <h3 style={{margin:0}}>Create Account</h3>
          <button className="btn small" onClick={onClose}>Close</button>
        </div>

        <form onSubmit={submit} style={{marginTop:12}}>
          <div className="form-row">
            <label>Email</label>
            <input className="input-plain" value={email} onChange={e=>setEmail(e.target.value)} required />
          </div>
          <div className="form-row">
            <label>Password</label>
            <input type="password" className="input-plain" value={password} onChange={e=>setPassword(e.target.value)} required />
          </div>
          <div style={{display:'flex',gap:8,marginTop:12}}>
            <button className="btn primary" disabled={loading} type="submit">{loading ? 'Creating...' : 'Create account'}</button>
            <button type="button" className="btn" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}
