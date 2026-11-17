import { FIXTURES } from './thornbound-rules.js';
// Only imported by the development build with ?debug=1. Travel does not grant rewards.
export function createChapterDevtools({traveller,follow,controls,world}) {
  if(world.id!=='thornbound')return;
  const points=[{id:'camp',name:'Waystation',x:0,z:0},{id:'trail',name:'Trail encounter',x:0,z:-6.5},...FIXTURES,{id:'mill-fight',name:'Mill combat floor',x:60,z:-23}];
  const panel=document.createElement('details');panel.id='chapter-devtools';panel.style.cssText='position:fixed;left:12px;bottom:110px;z-index:15;background:#1f302de8;color:#eee0b9;padding:8px;font:11px system-ui;max-width:270px;pointer-events:auto';
  panel.innerHTML='<summary>Development travel</summary><label>Location <select aria-label="Development location">'+points.map(p=>`<option value="${p.id}">${p.name}</option>`).join('')+'</select></label><button>Travel for testing</button><p role="status"></p>';
  panel.querySelector('button').onclick=()=>{const p=points.find(p=>p.id===panel.querySelector('select').value);controls.clearTarget();traveller.teleport(p.x,p.z+.65,0,-1);follow.snap(traveller);panel.querySelector('p').textContent=`${p.name} · clearance ${world.clearance(p.x,p.z+.65).toFixed(2)}`;};
  document.body.append(panel);
}
