// Paper scenery has a thin but solid footprint. Read the printed silhouette at
// the hero's body height, preserving real openings instead of blocking the quad.
export const COLLISION_HEIGHT=.68;
export const PAPER_THICKNESS=.055;
export function isSolidPaper(asset){
  return !/^(fern_|bushes_|snowbush_|snowdrift_)/.test(asset);
}
function runs(mask,width,minWidth=1){
  const result=[];let start=-1;
  for(let x=0;x<=width;x++){
    if(x<width&&mask[x]){if(start<0)start=x;}
    else if(start>=0){if(x-start>=minWidth)result.push([start/width,x/width]);start=-1;}
  }return result;
}
export function alphaCollisionProfile(image,rect,bandCount=32){
  const [left,top,width,height]=rect.map(Math.round),bands=[];
  for(let band=0;band<bandCount;band++){
    const columns=new Uint8Array(width);
    const from=Math.floor(height*(1-(band+1)/bandCount)),to=Math.ceil(height*(1-band/bandCount));
    for(let y=Math.max(0,from);y<Math.min(height,to);y++)for(let x=0;x<width;x++){
      if(image.data[((top+y)*image.width+left+x)*4+3]>=92)columns[x]=1;
    }
    bands.push(runs(columns,width,Math.max(1,Math.floor(width*.006))));
  }return {aspect:width/height,bands};
}
export function profileIntervals(profile,size,height=COLLISION_HEIGHT){
  const count=Math.min(profile.bands.length,Math.max(1,Math.ceil(height/size*profile.bands.length)));
  const intervals=profile.bands.slice(0,count).flat().sort((a,b)=>a[0]-b[0]),merged=[];
  for(const interval of intervals){const prev=merged.at(-1);if(prev&&interval[0]<=prev[1]+.008)prev[1]=Math.max(prev[1],interval[1]);else merged.push([...interval]);}
  return merged;
}
export function propObstacles(prop,profile){
  if(!isSolidPaper(prop.asset)||!profile)return [];
  const c=Math.cos(prop.rotation||0),s=Math.sin(prop.rotation||0),width=prop.size*profile.aspect;
  return profileIntervals(profile,prop.size).map(([u,v])=>{
    const a=(u-.5)*width,b=(v-.5)*width,ax=prop.x+a*c,az=prop.z-a*s,bx=prop.x+b*c,bz=prop.z-b*s,r=PAPER_THICKNESS;
    return {asset:prop.asset,ax,az,bx,bz,r,minX:Math.min(ax,bx)-r,maxX:Math.max(ax,bx)+r,minZ:Math.min(az,bz)-r,maxZ:Math.max(az,bz)+r};
  });
}
export function obstacleClearance(o,x,z){
  const dx=o.bx-o.ax,dz=o.bz-o.az,length2=dx*dx+dz*dz,t=length2?Math.max(0,Math.min(1,((x-o.ax)*dx+(z-o.az)*dz)/length2)):0;
  return Math.hypot(x-o.ax-dx*t,z-o.az-dz*t)-o.r;
}
export function paperClearance(obstacles,x,z){
  let room=4;
  for(const o of obstacles){if(x<o.minX-room||x>o.maxX+room||z<o.minZ-room||z>o.maxZ+room)continue;room=Math.min(room,obstacleClearance(o,x,z));}
  return room;
}

// Keep the procedural avenues open by moving a whole solid prop, never by
// cutting an invisible pass-through strip through its collision shape.
export function reservePaperRoutes(prop,profile,cx,cz,chunkSize=12){
  const p={...prop};if(!isSolidPaper(p.asset)||p.asset==='moon:1'||p.asset==='wisteria_arch_0')return p;
  const obstacles=propObstacles({...p,x:0,z:0},profile);if(!obstacles.length)return p;
  const x0=Math.min(...obstacles.map(o=>o.minX)),x1=Math.max(...obstacles.map(o=>o.maxX)),z0=Math.min(...obstacles.map(o=>o.minZ)),z1=Math.max(...obstacles.map(o=>o.maxZ));
  const gap=.62;
  // Halfway to the neighbouring centre is not an avenue: only each full chunk
  // centre line is reserved. The same clamp works at negative coordinates.
  const fit=(v,center,lo,hi)=>v<center?Math.max(center-chunkSize+gap-lo,Math.min(center-gap-hi,v)):Math.min(center+chunkSize-gap-hi,Math.max(center+gap-lo,v));
  p.x=fit(p.x,cx,x0,x1);p.z=fit(p.z,cz,z0,z1);return p;
}
