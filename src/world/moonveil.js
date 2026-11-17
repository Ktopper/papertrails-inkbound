import * as THREE from 'three';
import { CONFIG } from '../core/config.js';
import { mulberry32 } from '../core/rng.js';
import { createFoldInstance } from './fold.js';
import { CHUNK_SIZE, regionAt, chunkLayout, pathDistance, residentCoordinates, REGIONS } from './moonveil-layout.js';
import { alphaCollisionProfile, propObstacles, paperClearance, reservePaperRoutes, isSolidPaper } from './paper-collision.js';

const BASE = `${import.meta.env.BASE_URL}textures/`;

/** A seeded, streamed paper world. Only the neighbouring 25 chunks live in memory. */
export async function createMoonveilWorld({scene,seed}) {
  const group=new THREE.Group();group.name='Moonveil paper wilderness';scene.add(group);
  const loader=new THREE.TextureLoader();
  const [atlas,art,ground,backdrop,artMeta]=await Promise.all([
    loader.loadAsync(`${BASE}moonveil/scenery-atlas.png`),loader.loadAsync(`${BASE}art/atlas.webp`),
    loader.loadAsync(`${BASE}moonveil/ground.png`),loader.loadAsync(`${BASE}moonveil/backdrop.png`),
    fetch(`${BASE}art/atlas.json`).then(r=>{if(!r.ok)throw Error('Scenery atlas unavailable');return r.json();}),
  ]);
  for(const t of [atlas,art,ground,backdrop])t.colorSpace=THREE.SRGBColorSpace;
  function pixels(texture){const canvas=document.createElement('canvas');canvas.width=texture.image.width;canvas.height=texture.image.height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(texture.image,0,0);return ctx.getImageData(0,0,canvas.width,canvas.height);}
  const profiles=new Map();
  // Extract all footprints once; large pixel buffers can then be collected.
  {
    const moonPixels=pixels(atlas),artPixels=pixels(art);
    const names=new Set([...REGIONS.flatMap(r=>[...r.trees,...r.small,...r.landmarks]),...Array.from({length:6},(_,i)=>`moon:${i}`),'lamp_post_0','guidepost_0']);
    for(const name of names){if(!isSolidPaper(name))continue;
      if(name.startsWith('moon:')){const k=+name.slice(5),w=moonPixels.width/3,h=moonPixels.height/2;profiles.set(name,alphaCollisionProfile(moonPixels,[(k%3)*w,k<3?0:h,w,h]));}
      else profiles.set(name,alphaCollisionProfile(artPixels,artMeta.sprites[name].rect));
    }
  }
  scene.background=backdrop;
  ground.wrapS=ground.wrapT=THREE.RepeatWrapping;ground.repeat.set(18,18);ground.anisotropy=8;
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(72,72),new THREE.MeshStandardMaterial({map:ground,color:'#adc4b8',roughness:1}));floor.rotation.x=-Math.PI/2;floor.receiveShadow=true;group.add(floor);
  const cards=[],obstacles=[],chunks=new Map(),styles=new Map();
  const stoneGeo=new THREE.CylinderGeometry(.23,.25,.025,5),stoneMat=new THREE.MeshStandardMaterial({color:'#71847c',roughness:1});
  function style(asset){
    if(styles.has(asset))return styles.get(asset);
    let texture,aspect=1;
    if(asset.startsWith('moon:')){const kind=+asset.slice(5);texture=atlas.clone();texture.repeat.set(1/3,1/2);texture.offset.set(kind%3/3,kind<3?.5:0);}
    else {const sprite=artMeta.sprites[asset];if(!sprite)throw Error(`Missing scenery ${asset}`);const [x,y,w,h]=sprite.rect,[W,H]=artMeta.size;texture=art.clone();texture.repeat.set(w/W,h/H);texture.offset.set(x/W,1-(y+h)/H);aspect=sprite.aspect;}
    texture.needsUpdate=true;texture.anisotropy=4;
    const material=new THREE.MeshStandardMaterial({map:texture,alphaTest:.36,side:THREE.DoubleSide,roughness:1});
    if(asset==='moon:2'||asset==='moon:5'){material.emissiveMap=texture;material.emissive.set(asset==='moon:2'?'#81729b':'#b89a59');material.emissiveIntensity=.4;}
    const geometry=new THREE.PlaneGeometry(aspect,1);geometry.translate(0,.5,0);
    const result={texture,material,geometry};styles.set(asset,result);return result;
  }
  function addChunk(cx,cz){
    const layout=chunkLayout(seed,cx,cz),chunk={...layout,cards:[],obstacles:[]},root=new THREE.Group();root.name=`Page ${cx},${cz}`;root.position.set(layout.x,0,layout.z);group.add(root);chunk.root=root;
    for(const original of layout.props){
      const prop=reservePaperRoutes(original,profiles.get(original.asset),layout.x,layout.z);
      const {geometry,material}=style(prop.asset),anchor=new THREE.Group();anchor.position.set(prop.x,.025,prop.z);anchor.rotation.y=prop.rotation;group.add(anchor);
      const hinge=new THREE.Group();hinge.name=prop.asset;hinge.userData={hinge:true,foldAngle:-Math.PI/2,size:Math.min(1,prop.size/3),delay:Math.abs(Math.sin(prop.x+prop.z))*.4,wobble:prop.size>2?1.3:1};anchor.add(hinge);
      const mesh=new THREE.Mesh(geometry,material);mesh.scale.setScalar(prop.size);mesh.name=prop.asset;mesh.castShadow=true;mesh.receiveShadow=true;hinge.add(mesh);
      const fold=createFoldInstance(anchor,{tileId:`moonveil:${cx},${cz}:${prop.asset}`});
      const card={...prop,mesh,anchor,fold,kind:prop.asset.startsWith('moon:')?+prop.asset.slice(5):-1};cards.push(card);chunk.cards.push(card);
      chunk.obstacles.push(...propObstacles(prop,profiles.get(prop.asset)));
    }
    // Instanced stepping stones join the open avenues across every seam.
    const positions=[];for(let i=-10;i<=10;i++){positions.push([0,i*.56]);if(i!==0)positions.push([i*.56,0]);}
    const stones=new THREE.InstancedMesh(stoneGeo,stoneMat,positions.length),dummy=new THREE.Object3D();positions.forEach(([x,z],i)=>{dummy.position.set(x,.015,z);dummy.rotation.y=i*.8;dummy.updateMatrix();stones.setMatrixAt(i,dummy.matrix);});stones.receiveShadow=true;root.add(stones);chunk.stones=stones;
    chunks.set(`${cx},${cz}`,chunk);
  }
  function removeChunk(chunk){for(const c of chunk.cards){c.anchor.removeFromParent();cards.splice(cards.indexOf(c),1);}chunk.stones.dispose();chunk.root.removeFromParent();chunks.delete(`${chunk.cx},${chunk.cz}`);}
  let chunkKey='',time=0;
  function stream(p){const key=`${Math.round(p.x/CHUNK_SIZE)},${Math.round(p.z/CHUNK_SIZE)}`;if(key===chunkKey)return;chunkKey=key;const coords=residentCoordinates(p.x,p.z),wanted=new Set(coords.map(c=>c.join(',')));
    for(const chunk of chunks.values())if(!wanted.has(`${chunk.cx},${chunk.cz}`))removeChunk(chunk);
    for(const [cx,cz] of coords)if(!chunks.has(`${cx},${cz}`))addChunk(cx,cz);
    obstacles.length=0;for(const chunk of chunks.values())obstacles.push(...chunk.obstacles);
  }
  stream({x:0,z:0});
  const random=mulberry32(seed^0xaff331),count=70,positions=new Float32Array(count*3),phases=new Float32Array(count);
  for(let i=0;i<count;i++){positions[i*3]=(random()-.5)*24;positions[i*3+1]=random()*1.4;positions[i*3+2]=(random()-.5)*24;phases[i]=random()*6.28;}
  const flyGeo=new THREE.BufferGeometry();flyGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));const flies=new THREE.Points(flyGeo,new THREE.PointsMaterial({color:'#e8e0ac',size:.027,transparent:true,opacity:.8,depthWrite:false}));group.add(flies);
  const clearance=(x,z)=>paperClearance(obstacles,x,z);
  return {id:'moonveil',name:'Moonveil & the Unwritten Wilds',group,cards,obstacles,
    update(dt,p){time+=dt;stream(p);floor.position.set(Math.round(p.x/4)*4,-.012,Math.round(p.z/4)*4);ground.offset.set(floor.position.x/4,-floor.position.z/4);flies.position.set(p.x,0,p.z);
      for(const c of cards){const d=Math.hypot(c.x-p.x,c.z-p.z);if(d<6.2)c.fold.setTarget(1,(d/6.2)*.1);else if(d>9)c.fold.setTarget(0);
        c.fold.update(dt);c.fold.applyWind(time,.65,1,Math.cos(c.rotation),Math.sin(c.rotation));c.mesh.visible=d<15;c.anchor.visible=d<15;
      }
      for(let i=0;i<count;i++)positions[i*3+1]=.7+Math.sin(time*.45+phases[i])*.5;flyGeo.attributes.position.needsUpdate=true;
    },
    clearance,isWalkable:(x,z)=>clearance(x,z)>0,heightAt:()=>0,surfaceAt:(x,z)=>pathDistance(x,z)<.8?'path':'grass',biomeAt:(x,z)=>regionAt(seed,x,z).name,
    tileRecord(cx,cz){const x=cx*2,z=cz*2,chunk=chunks.get(`${Math.round(x/CHUNK_SIZE)},${Math.round(z/CHUNK_SIZE)}`);if(!chunk)return null;const nearby=chunk.cards.filter(c=>Math.hypot(c.x-x,c.z-z)<3);return {fold:{progress:nearby.length?Math.min(...nearby.map(c=>c.fold.progress)):1}};},
    reveal(){for(const c of cards)c.fold.snap(0);},faceCamera(){},snapshot(){return {chunks:chunks.size,cards:cards.length,region:regionAt(seed,floor.position.x,floor.position.z).name,folding:cards.filter(c=>!c.fold.settled).length,folds:cards.filter(c=>c.fold.progress>0&&c.fold.progress<.95).slice(0,8).map(c=>({asset:c.asset,x:c.x,z:c.z,progress:+c.fold.progress.toFixed(2)})),assets:[...new Set(cards.map(c=>c.asset))],colliders:obstacles.filter(o=>Math.hypot((o.ax+o.bx)/2-floor.position.x,(o.az+o.bz)/2-floor.position.z)<6).map(o=>({asset:o.asset,a:[o.ax,o.az],b:[o.bx,o.bz],r:o.r}))};},
    dispose(){for(const chunk of [...chunks.values()])removeChunk(chunk);for(const s of styles.values()){s.geometry.dispose();s.material.dispose();s.texture.dispose();}stoneGeo.dispose();stoneMat.dispose();floor.geometry.dispose();floor.material.dispose();flyGeo.dispose();flies.material.dispose();for(const t of [atlas,art,ground,backdrop])t.dispose();group.removeFromParent();},
  };
}

/** The new level gets its own neutral moonlit grade; the original world's grading stays intact. */
export function createMoonveilLighting() {
  let night=true;
  return {get night(){return night;},toggle(){night=!night;return night;},update(){
    const L=CONFIG.lights,P=CONFIG.post;
    L.key.color=night?'#b9d7e4':'#e8e5cc';L.key.intensity=night?2.4:3.1;
    L.fill.color='#98c8c1';L.fill.intensity=.8;L.hemi.sky='#b1d3ce';L.hemi.ground='#425c55';L.hemi.intensity=.7;
    L.background='#132a2b';L.fade.color='#15302d';L.fade.colorRight='#162d35';L.fade.amount=.45;
    P.tint=[.89,1.04,1.05];P.exposure=.9;P.saturation=.91;P.shadowTint='#183631';P.shadowLift=.035;P.vignette=.22;P.aoTint='#243f37';
    CONFIG.dof.maxBlurPx=7;CONFIG.dof.focusBand=.48;
  }};
}
