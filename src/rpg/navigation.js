/** A small local route around physical props. Failed searches wait rather than cross a wall. */
export function combatRoute(start,goal,clearance,radius=.13) {
  const step=.35,limit=Math.min(26,Math.ceil(Math.hypot(goal.x-start.x,goal.z-start.z)/step)+8),key=(x,z)=>`${x},${z}`;
  const node=(x,z,g,parent)=>({x,z,g,parent,score:g+Math.hypot(start.x+x*step-goal.x,start.z+z*step-goal.z)});
  const first=node(0,0,0,null),open=[first],seen=new Map([[key(0,0),0]]);
  const safe=(ax,az,bx,bz)=>{for(let i=1;i<=4;i++)if(clearance(ax+(bx-ax)*i/4,az+(bz-az)*i/4)<radius)return false;return true;};
  for(let visits=0;open.length&&visits<1200;visits++){
    let best=0;for(let i=1;i<open.length;i++)if(open[i].score<open[best].score)best=i;
    const current=open.splice(best,1)[0],wx=start.x+current.x*step,wz=start.z+current.z*step;
    if(Math.hypot(wx-goal.x,wz-goal.z)<.45){const path=[];for(let n=current;n.parent;n=n.parent)path.unshift({x:start.x+n.x*step,z:start.z+n.z*step});return path;}
    for(const [dx,dz]of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){
      const x=current.x+dx,z=current.z+dz;if(Math.abs(x)>limit||Math.abs(z)>limit)continue;
      const g=current.g+Math.hypot(dx,dz)*step,k=key(x,z);if((seen.get(k)??Infinity)<=g)continue;
      const nx=start.x+x*step,nz=start.z+z*step;if(!safe(wx,wz,nx,nz))continue;
      seen.set(k,g);open.push(node(x,z,g,current));
    }
  }return [];
}
