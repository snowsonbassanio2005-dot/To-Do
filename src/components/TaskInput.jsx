import React, { useState } from "react";

export default function TaskInput({ onAdd }){
  const [val, setVal] = useState('');
  function submit(e){
    e?.preventDefault();
    if(!val.trim()) return;
    onAdd(val.trim());
    setVal('');
  }
  return (
    <form onSubmit={submit} className="task-input" style={{marginTop:6}}>
      <input className="input" value={val} onChange={e=>setVal(e.target.value)} placeholder="Add a new task (press Enter or Add)" />
      <button type="submit" className="add-btn">Add</button>
    </form>
  )
}
