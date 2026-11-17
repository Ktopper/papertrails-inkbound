import { workshopsDone } from '../rpg/thornbound-rules.js';
export const BOUNDS={left:-15,right:29,top:-44,bottom:7};
export const ROUTES=[[[0,0],[0,-8],[-6,-15]], [[-6,-15],[5,-16],[5,-25],[13,-25],[21,-29],[21,-40]], [[-1.7,1.7],[-4,-4],[-9,-5.5],[-9,-9],[-6,-15]]];
export const INTERIOR={left:54,right:66,top:-30,bottom:-18};
export const CRATES=[{x:58.3,z:-24,w:.9,d:.9},{x:62,z:-25.3,w:.9,d:1},{x:57.5,z:-27.2,w:1.1,d:.8}];
export function rectangleClearance(x,z,left,right,top,bottom) {
  const dx=Math.max(left-x,0,x-right),dz=Math.max(top-z,0,z-bottom);
  return dx||dz?Math.hypot(dx,dz):-Math.min(x-left,right-x,z-top,bottom-z);
}
export function terrainClearance(x,z,s) {
  let d=Math.min(x-BOUNDS.left,BOUNDS.right-x,z-BOUNDS.top,BOUNDS.bottom-z);
  // Full-width ink cuts end at the physical page edges. Only real raised decks cross them.
  for(const cut of [{top:-21.5,bottom:-19,x:5,width:1.6,open:workshopsDone(s)},{top:-36.5,bottom:-33,x:21,width:1.65,open:s.bridge}]){
    if(!cut.open)d=Math.min(d,rectangleClearance(x,z,BOUNDS.left,BOUNDS.right,cut.top,cut.bottom));
    else for(const [left,right] of [[BOUNDS.left,cut.x-cut.width],[cut.x+cut.width,BOUNDS.right]])d=Math.min(d,rectangleClearance(x,z,left,right,cut.top,cut.bottom));
  }
  d=Math.max(d,Math.min(x-INTERIOR.left,INTERIOR.right-x,z-INTERIOR.top,INTERIOR.bottom-z));
  for(const c of CRATES)d=Math.min(d,rectangleClearance(x,z,c.x-c.w/2,c.x+c.w/2,c.z-c.d/2,c.z+c.d/2));
  return d;
}
export function routeDistance(x,z) {
  let best=Infinity;
  for(const points of ROUTES)for(let i=1;i<points.length;i++){
    const [a,b]=[points[i-1],points[i]],dx=b[0]-a[0],dz=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(z-a[1])*dz)/(dx*dx+dz*dz)));
    best=Math.min(best,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t));
  }return best;
}
