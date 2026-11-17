// The warning footprint and the hit test share one attack definition.
export const ENEMY_ATTACKS = {
  imp: {name:'Quill jab', shape:'sector', reach:.9, arc:.6, windup:.95, duration:.36, hitAt:.48, color:'#ffd591', hint:'Sidestep or face it + Q', sound:360},
  wolf: {name:'Briar leap', shape:'lane', reach:1.65, width:.42, leap:.95, windup:1.05, duration:.56, hitAt:.72, color:'#ffbb78', hint:'Dodge sideways · Space', sound:180},
  knight: {name:'Oathbreaker chop', shape:'sector', reach:1.15, arc:.72, windup:1.35, duration:.5, hitAt:.56, color:'#f6c67f', hint:'Step aside or face it + Q', sound:260},
  boss: {name:'Pagebreaker sweep', shape:'circle', reach:1.75, windup:1.65, duration:.68, hitAt:.56, color:'#e4acff', hint:'Leave the circle · Space', sound:110},
};
export const windupDuration=(kind,enraged=false)=>ENEMY_ATTACKS[kind].windup*(enraged?.8:1);
export function attackProgress(mode,timer,windup,duration,recovery){return Math.max(0,Math.min(1,1-timer/(mode==='windup'?windup:mode==='strike'?duration:recovery)));}
export function enemyAttackHits(attack,origin,direction,target) {
  const dx=target.x-origin.x,dz=target.z-origin.z,d=Math.hypot(dx,dz);
  if(attack.shape==='circle')return d<=attack.reach;
  const forward=dx*direction.x+dz*direction.z,side=dx*direction.z-dz*direction.x;
  if(attack.shape==='lane')return forward>=-.16&&forward<=attack.reach&&Math.abs(side)<=attack.width;
  return d<=attack.reach&&(d<.12||forward/d+1e-10>=Math.cos(attack.arc));
}

// Coordinates on the ground, local +Z forward. Used by the warning's fill and outline.
export function attackOutline(a) {
  if(a.shape==='lane')return [[-a.width,-.16],[a.width,-.16],[a.width,a.reach],[-a.width,a.reach]];
  const full=a.shape==='circle',arc=full?Math.PI:a.arc,points=full?[]:[[0,0]];
  for(let i=0;i<=(full?64:32);i++){const angle=-arc+2*arc*i/(full?64:32);points.push([Math.sin(angle)*a.reach,Math.cos(angle)*a.reach]);}
  return points;
}
