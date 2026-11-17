import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createPlayerVisibility } from '../src/render/visibility.js';
import { paperRectangle, paperDisc, foldedPaperBox } from '../src/rpg/cardstock.js';

function setup(){
  const scene=new THREE.Scene(),group=new THREE.Group();scene.add(group);
  const camera=new THREE.PerspectiveCamera(40,1,.1,50);camera.position.set(0,2,5);camera.lookAt(0,.4,0);camera.updateMatrixWorld();
  const traveller={position:new THREE.Vector3()};
  return {scene,group,camera,traveller};
}
function advance(v,n=40){for(let i=0;i<n;i++){v.beforeUpdate();v.update(1/60);}}
function scenery(group,x=0,z=2,material=new THREE.MeshStandardMaterial({side:THREE.DoubleSide})){
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(2,3),material);mesh.position.set(x,1.5,z);group.add(mesh);return mesh;
}
test('only foreground blockers fade, then fully restore without changing shared materials',()=>{
  const c=setup(),material=new THREE.MeshStandardMaterial({side:THREE.DoubleSide});
  const blocking=scenery(c.group,0,2,material),aside=scenery(c.group,6,2,material),behind=scenery(c.group,0,-2,material);
  const world={group:c.group,cards:[blocking,aside,behind].map(mesh=>({mesh,kind:0}))};
  const visibility=createPlayerVisibility({...c,world});advance(visibility);
  assert.equal(visibility.snapshot().faded.length,1);assert(visibility.snapshot().faded[0].opacity<.18);
  assert.equal(blocking.visible,false);assert.equal(aside.visible,true);assert.equal(behind.visible,true);
  assert.equal(material.transparent,false);assert.equal(material.opacity,1);
  c.traveller.position.x=-4;advance(visibility,100);
  assert.equal(visibility.snapshot().faded.length,0);assert.equal(blocking.visible,true);
  assert.equal(c.scene.children.length,1);visibility.dispose();
});
test('transparent artwork gaps do not trigger scenery fading',()=>{
  const c=setup(),pixels=new Uint8Array(4*4*4).fill(255);
  for(let i=0;i<16;i++)pixels[i*4+3]=0;
  const map=new THREE.DataTexture(pixels,4,4);map.needsUpdate=true;
  const material=new THREE.MeshStandardMaterial({map,alphaTest:.36,side:THREE.DoubleSide});
  const mesh=scenery(c.group,0,2,material),world={group:c.group,cards:[{mesh,kind:1}]};
  const visibility=createPlayerVisibility({...c,world});advance(visibility);
  assert.equal(visibility.snapshot().faded.length,0);assert.equal(mesh.visible,true);visibility.dispose();
});
test('batched scenery fades per instance and streaming never resurrects hidden props',()=>{
  const c=setup(),geometry=new THREE.PlaneGeometry(2,3),material=new THREE.MeshLambertMaterial({side:THREE.DoubleSide});
  const batch=new THREE.BatchedMesh(2,geometry.attributes.position.count,geometry.index.count,material);
  const gid=batch.addGeometry(geometry),a=batch.addInstance(gid),b=batch.addInstance(gid);
  batch.setMatrixAt(a,new THREE.Matrix4().makeTranslation(0,1.5,2));batch.setMatrixAt(b,new THREE.Matrix4().makeTranslation(6,1.5,2));
  c.group.add(batch);
  const rec={key:'test',shown:true,group:new THREE.Group(),meshes:[new THREE.Mesh(geometry,material),new THREE.Mesh(geometry,material)],inst:[{b:{mesh:batch,material},id:a},{b:{mesh:batch,material},id:b}]};
  const visibility=createPlayerVisibility({...c,world:{group:c.group,activeTiles:()=>[rec]}});advance(visibility);
  assert.equal(batch.getVisibleAt(a),false);assert.equal(batch.getVisibleAt(b),true);assert.equal(visibility.snapshot().faded.length,1);
  visibility.beforeUpdate();rec.shown=false;batch.setVisibleAt(a,false);batch.setVisibleAt(b,false);visibility.update(1/60);
  assert.equal(visibility.snapshot().faded.length,0);assert.equal(batch.getVisibleAt(a),false);assert.equal(c.scene.children.length,1);visibility.dispose();
});
test('paper pieces have printed faces, exposed rims, and actual thin sheet geometry',()=>{
  for(const geometry of [paperRectangle(.3,.4),paperDisc(.16)]){
    assert(geometry.boundingBox.max.z-geometry.boundingBox.min.z<.021);
    assert.deepEqual(geometry.groups.map(g=>g.materialIndex),[0,1]);
    for(const attribute of Object.values(geometry.attributes))assert([...attribute.array].every(Number.isFinite));
    geometry.dispose();
  }
});

test('inherited printed-card UV holes remain open without fading their whole card',()=>{
  const c=setup(),artTexture=new THREE.DataTexture(new Uint8Array(16),2,2);
  const mesh=scenery(c.group);mesh.geometry.setAttribute('uv1',mesh.geometry.attributes.uv.clone());
  const visibility=createPlayerVisibility({...c,artTexture,world:{group:c.group,cards:[{mesh,kind:0}]}});
  advance(visibility);assert.equal(visibility.snapshot().faded.length,0);visibility.dispose();
});

test('folded paper boxes retain three-dimensional depth and a two-material print/edge layout',()=>{
  const box=foldedPaperBox(.3,.4,.2),size=new THREE.Vector3();box.boundingBox.getSize(size);
  assert(size.x>=.3&&size.y>=.4&&size.z>=.2);assert(size.z<.23);
  assert.equal(box.groups.length,2);assert(box.userData.foldedBox);
  assert([...box.attributes.normal.array].every(Number.isFinite));box.dispose();
});
