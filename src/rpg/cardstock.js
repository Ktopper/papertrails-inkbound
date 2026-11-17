import * as THREE from 'three';

let printTexture;
/** A neutral ink-and-fibre print shared by the cast; it moves with each paper piece. */
export function cardstockPrint() {
  if (printTexture) return printTexture;
  const n=128,data=new Uint8Array(n*n*4);
  let seed=90731;
  for(let y=0;y<n;y++)for(let x=0;x<n;x++) {
    seed=(Math.imul(seed,1664525)+1013904223)>>>0;
    const grain=(seed/4294967296-.5)*22;
    const hatch=(x+y*2)%19<2&&x>80?19:0;
    const fibre=(x*7+y*3)%83<2?15:0;
    const v=Math.max(180,Math.min(255,242+grain-hatch-fibre));
    const i=(y*n+x)*4;data[i]=v;data[i+1]=v-3;data[i+2]=v-9;data[i+3]=255;
  }
  printTexture=new THREE.DataTexture(data,n,n);
  printTexture.colorSpace=THREE.SRGBColorSpace;printTexture.wrapS=printTexture.wrapT=THREE.RepeatWrapping;
  printTexture.magFilter=THREE.LinearFilter;printTexture.minFilter=THREE.LinearMipmapLinearFilter;
  printTexture.generateMipmaps=true;printTexture.needsUpdate=true;return printTexture;
}

/** Thin die-cut sheet: printed inset face, exposed cream border, reverse and cut edge. */
export function cardGeometry(outline,depth=.014) {
  const points=outline.map(([x,y])=>new THREE.Vector2(x,y));
  if(THREE.ShapeUtils.isClockWise(points))points.reverse();
  const inner=points.map(p=>p.clone().multiplyScalar(.935));
  const triangles=THREE.ShapeUtils.triangulateShape(inner,[]),positions=[],uvs=[];
  const min=new THREE.Vector2(Infinity,Infinity),max=new THREE.Vector2(-Infinity,-Infinity);
  points.forEach(p=>{min.min(p);max.max(p);});
  const vertex=(p,z)=>{positions.push(p.x,p.y,z);uvs.push((p.x-min.x)/Math.max(.001,max.x-min.x),(p.y-min.y)/Math.max(.001,max.y-min.y));};
  for(const t of triangles)for(const i of t)vertex(inner[i],depth/2+.0001);
  const faceCount=positions.length/3;
  for(const t of triangles)for(const i of [...t].reverse())vertex(points[i],-depth/2);
  for(let i=0;i<points.length;i++) {
    const j=(i+1)%points.length,a=points[i],b=points[j],c=inner[i],d=inner[j];
    for(const p of [a,b,c,b,d,c])vertex(p,depth/2);
    vertex(a,depth/2);vertex(a,-depth/2);vertex(b,depth/2);
    vertex(b,depth/2);vertex(a,-depth/2);vertex(b,-depth/2);
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.computeVertexNormals();
  geo.addGroup(0,faceCount,0);geo.addGroup(faceCount,positions.length/3-faceCount,1);
  geo.userData.cardstock=true;geo.computeBoundingBox();return geo;
}

export function paperRectangle(w,h) {
  const x=w/2,y=h/2,c=Math.min(w,h)*.08;
  return cardGeometry([[-x+c,-y],[x-c,-y],[x,-y+c],[x,y-c],[x-c,y],[-x+c,y],[-x,y-c],[-x,-y+c]],Math.min(.018,Math.min(w,h)*.14));
}
export function paperDisc(radius,sides=8) {
  return cardGeometry(Array.from({length:sides},(_,i)=>{const a=i*Math.PI*2/sides;return [Math.cos(a)*radius,Math.sin(a)*radius];}));
}

/** Six printed sheets folded around a box. Two material groups keep it cheap to draw. */
export function foldedPaperBox(w,h,d) {
  const pieces=[
    paperRectangle(w,h).translate(0,0,d/2),
    paperRectangle(w,h).rotateY(Math.PI).translate(0,0,-d/2),
    paperRectangle(d,h).rotateY(Math.PI/2).translate(w/2,0,0),
    paperRectangle(d,h).rotateY(-Math.PI/2).translate(-w/2,0,0),
    paperRectangle(w,d).rotateX(-Math.PI/2).translate(0,h/2,0),
    paperRectangle(w,d).rotateX(Math.PI/2).translate(0,-h/2,0),
  ];
  const channels=[{position:[],normal:[],uv:[]},{position:[],normal:[],uv:[]}];
  for(const part of pieces) {
    for(const group of part.groups)for(const key of ['position','normal','uv']) {
      const attr=part.attributes[key];
      channels[group.materialIndex][key].push(...attr.array.subarray(group.start*attr.itemSize,(group.start+group.count)*attr.itemSize));
    }part.dispose();
  }
  const geo=new THREE.BufferGeometry();
  for(const key of ['position','normal','uv'])geo.setAttribute(key,new THREE.Float32BufferAttribute([...channels[0][key],...channels[1][key]],key==='uv'?2:3));
  const front=channels[0].position.length/3;geo.addGroup(0,front,0);geo.addGroup(front,channels[1].position.length/3,1);
  geo.userData.cardstock=true;geo.userData.foldedBox=true;geo.computeBoundingBox();return geo;
}
