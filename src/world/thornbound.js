import * as THREE from 'three';
import { CONFIG } from '../core/config.js';
import { mulberry32 } from '../core/rng.js';
import { createFoldInstance } from './fold.js';
import { alphaCollisionProfile, propObstacles, paperClearance } from './paper-collision.js';
import { cardstockPrint, foldedPaperBox } from '../rpg/cardstock.js';
import { CHAPTER_NODES, FIXTURES, freshChapter, workshopsDone } from '../rpg/thornbound-rules.js';
import { BOUNDS, ROUTES, CRATES, terrainClearance, routeDistance } from './thornbound-layout.js';

const BASE=import.meta.env.BASE_URL;
export async function createThornboundWorld({scene,seed}) {
  const group=new THREE.Group();group.name='The Thornbound Kingdom · Chapter 1';scene.add(group);
  const loader=new THREE.TextureLoader(),[art,meta,paper]=await Promise.all([
    loader.loadAsync(`${BASE}textures/art/atlas.webp`),fetch(`${BASE}textures/art/atlas.json`).then(r=>r.json()),loader.loadAsync(`${BASE}textures/paper/page_albedo.png`),
  ]);
  art.colorSpace=paper.colorSpace=THREE.SRGBColorSpace;
  scene.background=new THREE.Color('#c6cdb4');scene.fog=new THREE.Fog('#c6cdb4',20,57);
  let chapter=freshChapter(),time=0;
  const cards=[],obstacles=[],styles=new Map(),dynamic=[],ownedTextures=[],random=mulberry32(seed^0x725ad);
  const canvas=document.createElement('canvas');canvas.width=art.image.width;canvas.height=art.image.height;
  const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(art.image,0,0);const pixels=c.getImageData(0,0,canvas.width,canvas.height);
  const paperMat=color=>new THREE.MeshStandardMaterial({map:cardstockPrint(),color,roughness:1,side:THREE.DoubleSide});
  const edge=paperMat('#f7e6bb');
  function register(root,meshes,name,x,z) {
    root.position.x=x;root.position.z=z;group.add(root);
    const fold=createFoldInstance(root,{tileId:`thornbound:${name}:${x},${z}`});
    for(const mesh of meshes)cards.push({asset:name,mesh,anchor:root,fold,x,z});
    return fold;
  }
  function box(name,x,z,w,h,d,color,solid=false) {
    const root=new THREE.Group(),hinge=new THREE.Group();hinge.userData={hinge:true,foldAngle:-Math.PI/2,size:Math.min(1,h/3),wobble:1.2};root.add(hinge);
    const mesh=new THREE.Mesh(foldedPaperBox(w,h,d),[paperMat(color),edge]);mesh.position.y=h/2;mesh.castShadow=mesh.receiveShadow=true;hinge.add(mesh);
    const fold=register(root,[mesh],name,x,z);
    if(solid)obstacles.push({asset:name,ax:x-w/2,az:z,bx:x+w/2,bz:z,r:d/2,minX:x-w/2-d/2,maxX:x+w/2+d/2,minZ:z-d/2,maxZ:z+d/2});
    return {root,mesh,hinge,fold};
  }
  function addArt(asset,x,z,size,rotation=0,solid=true) {
    if(!styles.has(asset)){
      const sprite=meta.sprites[asset];if(!sprite)return null;
      const [ax,ay,w,h]=sprite.rect,[W,H]=meta.size,texture=art.clone();texture.repeat.set(w/W,h/H);texture.offset.set(ax/W,1-(ay+h)/H);texture.needsUpdate=true;
      const geometry=new THREE.PlaneGeometry(sprite.aspect,1);geometry.translate(0,.5,0);
      styles.set(asset,{geometry,material:new THREE.MeshStandardMaterial({map:texture,alphaTest:.36,side:THREE.DoubleSide,roughness:1}),texture,profile:alphaCollisionProfile(pixels,sprite.rect)});
    }
    const style=styles.get(asset),root=new THREE.Group(),hinge=new THREE.Group();root.rotation.y=rotation;root.add(hinge);
    hinge.userData={hinge:true,foldAngle:-Math.PI/2,size:Math.min(1,size/3),delay:random()*.3,wobble:1.3};
    const mesh=new THREE.Mesh(style.geometry,style.material);mesh.scale.setScalar(size);mesh.castShadow=mesh.receiveShadow=true;hinge.add(mesh);
    const fold=register(root,[mesh],asset,x,z);
    if(solid)obstacles.push(...propObstacles({asset,x,z,size,rotation},style.profile));
    return {root,mesh,fold};
  }
  function label(text,x,z,color='#314e41',width=2.2,y=.75) {
    const cv=document.createElement('canvas');cv.width=512;cv.height=160;const ctx=cv.getContext('2d');
    ctx.fillStyle='#eee3c7';ctx.fillRect(8,8,496,144);ctx.strokeStyle=color;ctx.lineWidth=3;ctx.strokeRect(15,15,482,130);ctx.fillStyle=color;ctx.font='bold 28px Georgia';ctx.textAlign='center';
    const lines=text.split('\n');lines.forEach((line,i)=>ctx.fillText(line,256,lines.length===1?91:65+i*42));
    const texture=new THREE.CanvasTexture(cv);texture.colorSpace=THREE.SRGBColorSpace;ownedTextures.push(texture);
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,width*160/512),new THREE.MeshStandardMaterial({map:texture,transparent:true,side:THREE.DoubleSide,roughness:1}));
    mesh.position.y=y;mesh.rotation.x=-.25;const root=new THREE.Group(),hinge=new THREE.Group();hinge.userData={hinge:true,foldAngle:-Math.PI/2,size:.3};root.add(hinge);hinge.add(mesh);register(root,[mesh],text,x,z);return mesh;
  }
  // A printed page beneath the stand-up scenery. Routes are visible from the opening frame.
  const floorCanvas=document.createElement('canvas');floorCanvas.width=1024;floorCanvas.height=1280;const fc=floorCanvas.getContext('2d');
  fc.fillStyle='#d1d4ac';fc.fillRect(0,0,1024,1280);
  const X=x=>(x-BOUNDS.left)/44*1024,Z=z=>(z-BOUNDS.top)/51*1280;
  for(let i=0;i<9000;i++){fc.fillStyle=i%3?'#73885a12':'#f8ebcb22';fc.fillRect(random()*1024,random()*1280,1+random()*5,1);}
  for(const n of CHAPTER_NODES){fc.fillStyle=n.id==='school'?'#e1dbbf':'#dfe0ba';fc.beginPath();fc.ellipse(X(n.x),Z(n.z),94,90,0,0,Math.PI*2);fc.fill();}
  fc.lineCap=fc.lineJoin='round';for(const points of ROUTES){fc.strokeStyle='#b3ac7d';fc.lineWidth=37;fc.beginPath();points.forEach(([x,z],i)=>i?fc.lineTo(X(x),Z(z)):fc.moveTo(X(x),Z(z)));fc.stroke();fc.strokeStyle='#e9dbb7';fc.lineWidth=28;fc.stroke();}
  fc.strokeStyle='#7b8f6266';fc.lineWidth=2;fc.strokeRect(12,12,1000,1256);
  const floorTexture=new THREE.CanvasTexture(floorCanvas);floorTexture.colorSpace=THREE.SRGBColorSpace;floorTexture.anisotropy=8;ownedTextures.push(floorTexture);
  const floor=new THREE.Mesh(new THREE.PlaneGeometry(44,51),new THREE.MeshStandardMaterial({map:floorTexture,roughness:1}));floor.rotation.x=-Math.PI/2;floor.position.set(7,-.018,-18.5);floor.receiveShadow=true;group.add(floor);
  paper.wrapS=paper.wrapT=THREE.RepeatWrapping;paper.repeat.set(8,8);
  const pageEdge=new THREE.Mesh(new THREE.BoxGeometry(44.5,.18,51.5),new THREE.MeshStandardMaterial({map:paper,color:'#e5d4aa',roughness:1}));pageEdge.position.set(7,-.15,-18.5);group.add(pageEdge);
  const millFloor=new THREE.Mesh(new THREE.BoxGeometry(12,.15,12),new THREE.MeshStandardMaterial({map:paper,color:'#d9c39d',roughness:1}));millFloor.position.set(60,-.1,-24);millFloor.receiveShadow=true;group.add(millFloor);
  const boards=document.createElement('canvas');boards.width=boards.height=768;const bc=boards.getContext('2d');bc.fillStyle='#cfbf96';bc.fillRect(0,0,768,768);
  for(let i=0;i<14;i++){bc.fillStyle=i%2?'#b5a17b25':'#f8e6bd20';bc.fillRect(i*56,0,54,768);bc.strokeStyle='#796e5140';bc.lineWidth=1;bc.beginPath();bc.moveTo(i*56,0);bc.lineTo(i*56,768);bc.stroke();for(let j=0;j<5;j++){bc.strokeRect(i*56,((j*180+i*55)%900)-50,54,180);}}
  bc.fillStyle='#50635b55';bc.font='32px Georgia';bc.textAlign='center';bc.fillText('THE MILL REMEMBERS',384,160);bc.font='20px monospace';bc.fillText('[ ]   /   —   \\   [ ]',384,195);bc.fillText('PAPER • THREAD • PROMISES',384,655);
  const boardTexture=new THREE.CanvasTexture(boards);boardTexture.colorSpace=THREE.SRGBColorSpace;ownedTextures.push(boardTexture);
  const boardFace=new THREE.Mesh(new THREE.PlaneGeometry(11.7,11.7),new THREE.MeshStandardMaterial({map:boardTexture,roughness:1}));boardFace.rotation.x=-Math.PI/2;boardFace.position.set(60,-.015,-24);boardFace.receiveShadow=true;group.add(boardFace);
  box('Mill back wall',60,-30,12,2.4,.12,'#64796b');box('Mill west wall',54,-24,.12,1.6,12,'#8a997a');box('Mill east wall',66,-24,.12,1.6,12,'#8a997a');
  box('Folded printing press',55.4,-26.7,1.4,1.1,.9,'#6e8072',true);box('Paper spool cabinet',64.7,-26.5,1.2,1.3,.8,'#977b58',true);
  const wheel=box('Mill wheel stand',64,-29,.45,.8,.5,'#7a6549',true),gear=new THREE.Group();gear.position.set(0,1.4,0);wheel.hinge.add(gear);
  const gearRing=new THREE.Mesh(new THREE.TorusGeometry(.8,.09,4,20),paperMat('#e0c18e'));gear.add(gearRing);
  for(let i=0;i<8;i++){const spoke=new THREE.Mesh(foldedPaperBox(.09,1.55,.07),[paperMat('#b79765'),edge]);spoke.rotation.z=i*Math.PI/4;gear.add(spoke);}
  gear.traverse(mesh=>{if(mesh.isMesh)cards.push({asset:'Mill wheel',mesh,anchor:wheel.root,fold:wheel.fold,x:64,z:-29});});
  dynamic.push({pivot:gear,kind:'wheel',test:()=>chapter.mill});
  label('THE HINGE KEEPER\nABANDONED MILL',60,-29.7,'#7b493a',3.7,1.7);
  label('RETURN TO THE WOODS',60,-18.5,'#526e57',2.3,.85);
  addArt('barrels_0',56,-28,1.1);addArt('woodpile_0',64,-28.3,1.3);
  const inkMat=new THREE.MeshStandardMaterial({color:'#587e86',roughness:.9});
  for(const [z,depth]of[[-20.25,2.5],[-34.75,3.5]]){
    const water=new THREE.Mesh(new THREE.PlaneGeometry(44,depth),inkMat);water.rotation.x=-Math.PI/2;water.position.set(7,.001,z);group.add(water);
    for(let i=0;i<23;i++){const wave=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.045),new THREE.MeshBasicMaterial({color:'#b3d1c3',transparent:true,opacity:.5}));wave.rotation.x=-Math.PI/2;wave.position.set(-14+i*1.9,.018,z+Math.sin(i)*depth*.25);group.add(wave);}
  }
  function deck(x,z,length,test) {
    const pivot=new THREE.Group();pivot.position.set(x,.035,z+length/2);group.add(pivot);
    const mesh=new THREE.Mesh(foldedPaperBox(3.2,.07,length),[paperMat('#d1b576'),edge]);mesh.position.z=-length/2;mesh.receiveShadow=true;pivot.add(mesh);
    dynamic.push({pivot,test,progress:0,kind:'deck'});
    for(const dx of [-1.45,1.45])for(const dz of [-length/2,length/2])box('Bridge post',x+dx,z+dz,.15,.6,.16,'#b3935d',true);
  }
  deck(5,-20.25,3.1,()=>workshopsDone(chapter));deck(21,-34.75,4.1,()=>chapter.bridge);
  // The layout keeps hard props outside the readable combat lanes.
  addArt('stilt_cabin_0',-2.5,2.5,2.3);addArt('lamp_post_0',1.7,.5,1.45);addArt('guidepost_0',1.8,-2.6,1.1);
  addArt('mossy_log_0',-4.2,-8.8,1.1);addArt('mossy_log_0',4.5,-9.8,1.2);
  for(const [i,f]of FIXTURES.filter(f=>f.type==='workshop').entries()){
    const shop=addArt(['market_stall_0','barn_front_0','houses_3'][i],f.x,f.z-1.5,2.6);
    if(shop)dynamic.push({pivot:shop.root,test:()=>chapter.workshops[i],kind:'workshop',shop});
    label(`${['PRINTER','CARPENTER','BAKER'][i]}\n${['— FLAT','/ UP','\\ DOWN'][i]}`,f.x,f.z-.3,'#426551',1.65,.8);
  }
  addArt('watchtower_0',7.7,-28.6,3.5);addArt('barn_front_0',3.8,-28.5,3);
  for(const crate of CRATES)box('Solid mill crate',crate.x,crate.z,crate.w,.7,crate.d,'#aa825b');
  label('ENTER THE MILL',5,-24.6,'#74543b',1.9,.8);
  const chest=box('Hinge chest',60,-27.8,.72,.46,.5,'#bc9257',true);dynamic.push({pivot:chest.mesh,test:()=>chapter.hinge,kind:'chest'});
  addArt('wisteria_arch_0',13,-26.6,3);addArt('stone_lantern_0',11.4,-24.5,1);
  label('CREASE SCHOOL\n\\ /    \\ /    \\ /',13,-25.8,'#497f80',2.25,1.1);
  for(const [id,x]of[['anchor-west',19.7],['anchor-east',22.3]]){
    box('Fold anchor',x,-30.7,.55,.35,.55,'#9aaec0',true);label('FOLD',x,-30.6,'#507d87',.95,.65);
  }
  addArt('stone_tower_0',18.3,-41.6,3.5);addArt('stone_tower_0',23.7,-41.6,3.5);addArt('wisteria_arch_0',21,-41.8,3.5);
  label('THE CASTLE ROAD\nCHAPTER I',21,-40.8,'#6f5c43',2.4,1.3);
  addArt('trees_a_3',-9,-10.5,3.8);label('THE LAST TREE\n303 TODAY',-9,-9.7,'#7b6941',1.7,1.15);
  label('MOSSMAIL\nA LETTER FOR A TREE',-1.7,1.5,'#856047',1.5,.9);
  for(const f of FIXTURES.filter(f=>f.id.startsWith('letter-sign')))addArt('guidepost_0',f.x+.5,f.z,1);
  const trees=['trees_a_1','trees_a_3','trees_b_0','birch_1','giant_mushroom_0','blossom_tree_0'];
  for(let i=0;i<135;i++){
    const x=-14+random()*42,z=-43+random()*49;
    if(routeDistance(x,z)<2.8||CHAPTER_NODES.some(n=>Math.hypot(x-n.x,z-n.z)<4.2)||FIXTURES.some(f=>Math.hypot(x-f.x,z-f.z)<2.7)||Math.abs(z+20.25)<2||Math.abs(z+34.75)<2.5)continue;
    addArt(trees[i%trees.length],x,z,2+random()*1.9,(random()-.5)*.4);
    if(i%3===0)addArt(['fern_0','flower_bed_0','bushes_2'][i%3],x+1,z+.6,.65,0,false);
  }
  // Warm lantern motes are printed punctuation, floating off the page.
  const glyphCanvas=document.createElement('canvas');glyphCanvas.width=glyphCanvas.height=64;const gc=glyphCanvas.getContext('2d');gc.fillStyle='#ffe4a0';gc.font='bold 48px Georgia';gc.fillText(';',20,47);
  const glyphTexture=new THREE.CanvasTexture(glyphCanvas);ownedTextures.push(glyphTexture);
  const moteGeo=new THREE.BufferGeometry(),points=new Float32Array(90);for(let i=0;i<30;i++){points[i*3]=(random()-.5)*12;points[i*3+1]=random()*2;points[i*3+2]=(random()-.5)*12;}
  moteGeo.setAttribute('position',new THREE.BufferAttribute(points,3));const motes=new THREE.Points(moteGeo,new THREE.PointsMaterial({map:glyphTexture,size:.1,transparent:true,opacity:.6,depthWrite:false,color:'#ffdf94'}));group.add(motes);
  const clearance=(x,z)=>Math.min(terrainClearance(x,z,chapter),paperClearance(obstacles,x,z));
  return {id:'thornbound',name:'The Thornbound Kingdom',group,cards,obstacles,fixtures:FIXTURES,
    setChapter(s){chapter=s;},clearance,isWalkable:(x,z)=>clearance(x,z)>0,heightAt:()=>0,surfaceAt:(x,z)=>routeDistance(x,z)<1?'path':'grass',
    biomeAt(x,z){return x>40?'Inside the abandoned mill':z<-37?'Castle-road overlook':z<-22?'The mill & the river':x<-3&&z<-11?'Workshop woods':'The Thornbound Kingdom';},
    tileRecord(){return {fold:{progress:1}};},reveal(){for(const fold of new Set(cards.map(c=>c.fold)))fold.snap(0);},faceCamera(){},
    update(dt,p){time+=dt;const updated=new Set();for(const card of cards){const distance=Math.hypot(card.x-p.x,card.z-p.z);card.anchor.visible=distance<17;if(updated.has(card.fold))continue;updated.add(card.fold);if(distance<8)card.fold.setTarget(1,distance*.015);else if(distance>11)card.fold.setTarget(0);card.fold.update(dt);card.fold.applyWind(time,.4,1,1,0);}
      for(const item of dynamic){const on=item.test();if(item.kind==='deck'){item.progress+=(Number(on)-item.progress)*(1-Math.exp(-dt*2));item.pivot.rotation.x=(1-item.progress)*1.48;}
        else if(item.kind==='workshop')item.pivot.scale.y=on?1:.55;
        else if(item.kind==='chest')item.pivot.material[0].color.set(on?'#77836c':'#bc9257');else if(item.kind==='wheel')item.pivot.rotation.z+=dt*(on?.4:.07);}
      motes.position.set(p.x,0,p.z);for(let i=0;i<30;i++)points[i*3+1]=1+Math.sin(time*.5+i*3)*.7;moteGeo.attributes.position.needsUpdate=true;
    },
    snapshot(){return {id:'thornbound',cards:cards.length,folding:cards.filter(c=>!c.fold.settled).length,chapter:{...chapter},colliders:obstacles.length};},
    dispose(){const geometries=new Set(),mats=new Set();group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[])mats.add(m);});geometries.forEach(g=>g.dispose());mats.forEach(m=>m.dispose());ownedTextures.forEach(t=>t.dispose());styles.forEach(s=>s.texture.dispose());art.dispose();paper.dispose();group.removeFromParent();},
  };
}
export function createThornboundLighting(){let night=false;return {get night(){return night;},toggle(){night=!night;},update(){
  const L=CONFIG.lights,P=CONFIG.post;L.key.color=night?'#c2d9db':'#fff0c9';L.key.intensity=night?1.6:2.8;L.fill.color='#c5d3a4';L.fill.intensity=.8;L.hemi.sky='#e4e9c8';L.hemi.ground='#717d54';L.hemi.intensity=.9;L.background='#c6cdb4';L.fade.amount=.12;L.fade.color=L.fade.colorRight='#b6c2a0';P.tint=[1.02,1.01,.95];P.exposure=1;P.saturation=.9;P.shadowTint='#4d6655';P.shadowLift=.025;P.vignette=.16;P.aoTint='#68775b';CONFIG.dof.maxBlurPx=4;CONFIG.dof.focusBand=.65;
}};}
