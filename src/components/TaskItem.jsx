import React, { useState } from "react";

export default function TaskItem({ task, onComplete, onDelete }){
  const [pressed, setPressed] = useState(false);
  return (
    <div
      className={"task" + (task.completedAt ? " completed": "")}
      onMouseDown={()=>setPressed(true)}
      onMouseUp={()=>setPressed(false)}
      onMouseLeave={()=>setPressed(false)}
      style={pressed ? {transform:'scale(.995)', boxShadow:'0 14px 30px rgba(0,0,0,0.06)'} : {}}
    >
      <div style={{width:64,height:64,borderRadius:10,overflow:'hidden',flexShrink:0}}>
        <img src={task.poster} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
      </div>
      <div style={{flex:1}}>
        <div className="title">{task.title}</div>
        <div className="meta">Added {new Date(task.createdAt).toLocaleString()}</div>
      </div>
      <div style={{display:'flex',flexDirection:'column',gap:6}}>
        <button className="btn small" onClick={onComplete}>Done</button>
        <button className="btn small" onClick={onDelete} style={{borderColor:'#ffd3d3'}}>Delete</button>
      </div>
    </div>
  )
}
