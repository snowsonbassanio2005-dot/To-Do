import React from "react";

export default function OptionsSection({ options, setOptions }){
  function toggle(id){
    setOptions(options.map(o=> o.id===id ? {...o, on:!o.on} : o));
  }
  return (
    <div className="options-list">
      {options.map(opt=>(
        <div key={opt.id} className="option">
          <div style={{display:'flex',gap:10,alignItems:'center'}}>
            <div style={{width:36,height:36,borderRadius:8,background:opt.on ? 'linear-gradient(90deg,var(--cyan),var(--blue))' : '#eef6fb',display:'flex',alignItems:'center',justifyContent:'center',color: opt.on ? 'white' : 'var(--muted)',fontWeight:700}}>{opt.label[0]}</div>
            <div>
              <div style={{fontWeight:700}}>{opt.label}</div>
              <div style={{fontSize:12,color:'var(--muted)'}}>Regular task</div>
            </div>
          </div>
          <div>
            <label style={{display:'inline-flex',alignItems:'center',gap:6}}>
              <input type="checkbox" checked={opt.on} onChange={()=>toggle(opt.id)} />
            </label>
          </div>
        </div>
      ))}
    </div>
  )
}
