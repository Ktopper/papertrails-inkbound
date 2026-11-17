import * as THREE from 'three';
import { CONFIG } from '../core/config.js';
import { mulberry32 } from '../core/rng.js';

const BASE = `${import.meta.env.BASE_URL}textures/moonveil/`;
export const MOONVEIL_BOUNDS = { minX: -11, maxX: 11, minZ: -22, maxZ: 9 };

/** A second, authored level made from the generated paper scenery atlas. */
export async function createMoonveilWorld({ scene, seed }) {
  const group = new THREE.Group(); group.name = 'Moonveil Ruins'; scene.add(group);
  const loader = new THREE.TextureLoader();
  const [atlas, ground, backdrop] = await Promise.all([
    loader.loadAsync(`${BASE}scenery-atlas.png`),
    loader.loadAsync(`${BASE}ground.png`),
    loader.loadAsync(`${BASE}backdrop.png`),
  ]);
  for (const texture of [atlas,ground,backdrop]) texture.colorSpace = THREE.SRGBColorSpace;
  ground.wrapS = ground.wrapT = THREE.RepeatWrapping; ground.repeat.set(8,10); ground.anisotropy = 8;
  scene.background = backdrop;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(27,36),new THREE.MeshStandardMaterial({ map: ground, color: '#a9c8bd', roughness: 1 }));
  floor.rotation.x = -Math.PI/2; floor.position.z = -6.5; floor.receiveShadow = true; group.add(floor);
  const random = mulberry32(seed ^ 0xaff331), cards = [], obstacles = [], textures = [];
  const bounds = MOONVEIL_BOUNDS;
  const stoneMat = new THREE.MeshStandardMaterial({color:'#51685e',roughness:1});
  // The stepping-stone trail links three open combat clearings.
  for (let z = 7; z > -21; z -= .56) {
    const x = Math.sin(z*.29)*.7;
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(.21+random()*.11,.24,.025,5),stoneMat);
    mesh.position.set(x+(random()-.5)*.2,.015,z);mesh.rotation.y=random()*Math.PI;mesh.receiveShadow=true;group.add(mesh);
  }
  function card(kind,x,z,size,{block=.22,rot=0}={}) {
    const texture=atlas.clone();texture.needsUpdate=true;texture.repeat.set(1/3,1/2);texture.offset.set((kind%3)/3,kind<3?.5:0);texture.anisotropy=4;textures.push(texture);
    const material=new THREE.MeshStandardMaterial({map:texture,alphaTest:.36,side:THREE.DoubleSide,roughness:1,transparent:false});
    if(kind===2||kind===5){material.emissiveMap=texture;material.emissive.set(kind===2?'#81729b':'#b89a59');material.emissiveIntensity=.4;}
    const geometry=new THREE.PlaneGeometry(size,size);geometry.translate(0,size*.48,0);
    const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,.02,z);mesh.rotation.y=rot;mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);
    cards.push({mesh,x,z,size,kind,fold:0,rot});
    if(block>0)obstacles.push({x,z,r:block});
    return mesh;
  }
  // Landmarks keep the middle of the trail clear: arch openings are walkable.
  card(1,0,-3,3.1,{block:0});obstacles.push({x:-1.08,z:-3,r:.25},{x:1.08,z:-3,r:.25});
  card(1,0,-16,4.2,{block:0});obstacles.push({x:-1.5,z:-16,r:.3},{x:1.5,z:-16,r:.3});
  card(5,1.9,1.6,1.1,{block:.19});card(5,-2.5,-4.4,1.1,{block:.18});card(5,2.3,-13,1.1,{block:.18});
  card(2,-2.1,-1.4,1.4,{block:.27});card(2,3.4,-5.8,1.5,{block:.3});card(2,-3.8,-14.4,2,{block:.4});
  card(4,-3.1,-7.4,2.4,{block:.4});card(4,3.4,-17.1,2.4,{block:.4});
  for(const [x,z,size] of [[-2.8,-2.1,3.2],[2.7,-1.4,3],[-2.7,2.9,2.6],[2.8,3.4,2.8],[-2.9,-10,3],[2.8,-11,3.3]])card(0,x,z,size,{block:.22});
  for(const [x,z] of [[-1.9,1.2],[1.8,-.8],[-1.9,-3.8],[2.1,-4.3],[-1.8,3.2],[1.7,3.8]])card(3,x,z,1,{block:0});
  // Dense forest borders, with small fern clusters inside. No scenery spawns in the clearings.
  for(let z=8;z>=-23;z-=2.4){for(const side of [-1,1]){for(let row=0;row<2;row++){const x=side*(4.5+row*3+random()*1.1);card(0,x,z+(random()-.5)*1.2,2.7+random()*1.4,{block:.25,rot:(random()-.5)*.35});}}}
  for(let i=0;i<65;i++){const x=(random()-.5)*20,z=8-random()*30;if(Math.abs(x)<2.15||Math.hypot(x,z)<2.8||Math.hypot(x,z+10)<2.8)continue;card(i%7===0?2:3,x,z,.55+random()*.65,{block:0,rot:(random()-.5)*.6});}
  const fireflyCount=80,positions=new Float32Array(fireflyCount*3),phases=new Float32Array(fireflyCount);
  for(let i=0;i<fireflyCount;i++){positions[i*3]=(random()-.5)*19;positions[i*3+1]=.2+random()*1.6;positions[i*3+2]=8-random()*29;phases[i]=random()*6.28;}
  const flyGeo=new THREE.BufferGeometry();flyGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));
  const flies=new THREE.Points(flyGeo,new THREE.PointsMaterial({color:'#e8e0ac',size:.027,transparent:true,opacity:.8,depthWrite:false}));group.add(flies);
  let time=0;
  function clearance(x,z){let result=Math.min(x-bounds.minX,bounds.maxX-x,z-bounds.minZ,bounds.maxZ-z);if(result<0)return result;for(const o of obstacles)result=Math.min(result,Math.hypot(x-o.x,z-o.z)-o.r);return result;}
  return {
    id:'moonveil',name:'Moonveil Ruins',group,bounds,cards,obstacles,
    update(dt,p){time+=dt;for(const c of cards){const distance=Math.hypot(c.x-p.x,c.z-p.z),target=distance<12?1:0;c.fold+=(target-c.fold)*Math.min(1,dt*5);c.mesh.rotation.x=-(1-c.fold)*Math.PI*.49;c.mesh.visible=c.fold>.01;c.mesh.rotation.z=c.kind===0?Math.sin(time*.7+c.x)*.009:0;}
      for(let i=0;i<fireflyCount;i++)positions[i*3+1]=.7+Math.sin(time*.45+phases[i])*.5;
      flyGeo.attributes.position.needsUpdate=true;
    },
    clearance,isWalkable:(x,z)=>clearance(x,z)>0,heightAt:()=>0,surfaceAt:(x)=>Math.abs(x)<1?'path':'grass',
    biomeAt:()=> 'Moonveil Ruins',tileRecord:(x,z)=>Math.abs(x*2)<12&&z*2>-23&&z*2<10?{fold:{progress:1}}:null,
    faceCamera(){},
    dispose(){group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});textures.forEach(t=>t.dispose());atlas.dispose();ground.dispose();backdrop.dispose();group.removeFromParent();},
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
