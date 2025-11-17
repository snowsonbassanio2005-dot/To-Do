import React from "react";

export default function CompletedRow({ items=[], onUndo, minimal=false }){
  return (
    <div className="row-scroll" style={{marginTop:8}}>
      {items.map(it=>(
        <div key={it.id} className="poster" style={{minWidth: minimal ? 140 : 160}}>
          <img src={it.poster} alt="" />
          <div className="pt">{it.title}</div>
          <div className="pmeta">{it.completedAt ? `Completed ${new Date(it.completedAt).toLocaleString()}` : 'Completed'}</div>
          <div style={{display:'flex',justifyContent:'space-between',marginTop:8}}>
            <button className="btn small" onClick={()=>onUndo && onUndo(it.id)}>Undo</button>
            <a style={{fontSize:13,color:'var(--muted)'}} href="#details">View</a>
          </div>
        </div>
      ))}
      {items.length===0 && <div style={{color:'var(--muted)',padding:8}}>No completed items yet</div>}
    </div>
  )
}
