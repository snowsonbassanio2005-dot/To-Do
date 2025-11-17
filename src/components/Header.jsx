import React from "react";

export default function Header({ onLogin, onSignup, user, onLogout }){
  return (
    <div className="header">
      <div className="brand">
        <div className="logo">TD</div>
        <div>
          <div style={{fontWeight:800,fontSize:18}}>Modern ToDo</div>
          <div style={{fontSize:13,color:'rgba(255,255,255,0.9)'}}>Cyan • Clean • Fast</div>
        </div>
      </div>

      <div className="header-actions">
        {user ? (
          <>
            <div style={{color:'white',fontWeight:700}}>{user.email}</div>
            <button className="btn ghost small" onClick={onLogout}>Logout</button>
          </>
        ) : (
          <>
            <button className="btn ghost small" onClick={onLogin}>Login</button>
            <button className="btn primary small" onClick={onSignup}>Create account</button>
          </>
        )}
      </div>
    </div>
  )
}
