const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t);};
// Every attack has a held silhouette, a fast release, and a readable recovery.
export function enemyPose(kind,mode,p) {
  const pose={bodyX:0,bodyY:0,bodyZ:0,headX:0,armX:0,armZ:-.1,shieldX:0,crouch:0,hop:0,legs:0,crown:0};
  if(!['windup','strike','recover'].includes(mode))return null;
  const w=mode==='windup'?ease(p/.7):1;
  const s=mode==='windup'?0:mode==='recover'?1:ease(p/(kind==='wolf'?.72:kind==='imp'?.48:.56));
  const fade=mode==='recover'?1-ease(p):1;
  if(kind==='imp')Object.assign(pose,{bodyY:(-.8*w+1.1*s)*fade,bodyZ:-.15*w*(1-s)*fade,armX:(.85*w-2.4*s)*fade,armZ:(-.65*w+.55*s)*fade,shieldX:-.35*w*fade,headX:-.12*w*fade,crouch:-.04*w*(1-s)*fade});
  if(kind==='wolf')Object.assign(pose,{bodyX:(-.3*w+.55*s)*fade,headX:(.4*w-.65*s)*fade,crouch:-.13*w*(1-s)*fade,hop:mode==='strike'?Math.sin(Math.PI*Math.min(1,p/.9))*.24:0,legs:(.85*w-1.4*s)*fade});
  if(kind==='knight')Object.assign(pose,{bodyX:(-.2*w+.6*s)*fade,bodyY:(-.25*w+.35*s)*fade,armX:(-2.65*w+2.45*s)*fade,armZ:-.25*w*fade,shieldX:-1.1*w*fade,headX:(-.25*w+.45*s)*fade,crouch:-.035*s*fade});
  if(kind==='boss')Object.assign(pose,{bodyY:(mode==='recover'?-1.05:(-1.05*w+Math.PI*2*s))*fade,bodyX:(-.18*w+.22*s)*fade,armX:-1.4*w*fade,armZ:-1.1*w*fade,shieldX:-.7*w*fade,headX:-.2*w*fade,crouch:-.07*w*(1-s)*fade,crown:.16*w*fade});
  return pose;
}
