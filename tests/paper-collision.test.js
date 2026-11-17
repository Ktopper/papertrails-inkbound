import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { alphaCollisionProfile, propObstacles, paperClearance, reservePaperRoutes } from '../src/world/paper-collision.js';
import { createTraveller } from '../src/player/traveller.js';
import { state } from '../src/core/state.js';

function picture(w,h,solid){const data=new Uint8ClampedArray(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++)data[(y*w+x)*4+3]=solid(x,y)?255:0;return {width:w,height:h,data};}
const wallProfile=alphaCollisionProfile(picture(200,100,()=>true),[0,0,200,100]);
const archProfile=alphaCollisionProfile(picture(100,100,(x,y)=>x<20||x>79||y<20),[0,0,100,100]);
const prop=(asset='houses_3',rotation=0)=>({asset,x:0,z:0,size:3,rotation,block:0});

test('solid printed scenery blocks its full visible width even when formerly marked decoration',()=>{
  const obstacles=propObstacles(prop(),wallProfile);
  for(const x of [-2.9,-2,0,2,2.9])assert(paperClearance(obstacles,x,0)<0);
  assert(paperClearance(obstacles,3.3,0)>.12);
  assert(paperClearance(propObstacles(prop('barrels_0'),wallProfile),2.8,0)<0);
  assert.equal(propObstacles(prop('fern_1'),wallProfile).length,0);
});

test('arch posts collide while the opening, transparent borders and overhead arch stay clear',()=>{
  const obstacles=propObstacles(prop('moon:1'),archProfile);
  assert.equal(obstacles.length,2);
  assert(paperClearance(obstacles,-1.2,0)<0);assert(paperClearance(obstacles,1.2,0)<0);
  for(let z=-1;z<=1;z+=.05)assert(paperClearance(obstacles,0,z)>.12);
  const inset=alphaCollisionProfile(picture(100,100,(x)=>x>40&&x<60),[0,0,100,100]);
  assert(paperClearance(propObstacles(prop('birch_1'),inset),1,0)>.12);
});

test('collision follows prop yaw and ignores visual fading',()=>{
  const p=prop('moon:1',Math.PI/2),obstacles=propObstacles(p,archProfile);
  assert(paperClearance(obstacles,0,1.2)<0);assert(paperClearance(obstacles,0,-1.2)<0);
  assert(paperClearance(obstacles,0,0)>.12);
  assert.deepEqual(propObstacles({...p,visible:false,opacity:.16},archProfile),obstacles);
});

test('route reservation moves a wide prop intact instead of allowing movement through its wall',()=>{
  const before={...prop(),x:1,z:1},after=reservePaperRoutes(before,wallProfile,0,0),obstacles=propObstacles(after,wallProfile);
  assert(after.x>before.x);
  for(let t=-6;t<=6;t+=.1){assert(paperClearance(obstacles,0,t)>.2);assert(paperClearance(obstacles,t,0)>.2);}
  assert(paperClearance(obstacles,after.x,after.z)<0);
});

function travellerFor(obstacles){const scene=new THREE.Scene(),world={clearance:(x,z)=>paperClearance(obstacles,x,z),isWalkable:(x,z)=>paperClearance(obstacles,x,z)>0,heightAt:()=>0,surfaceAt:()=> 'grass'};return createTraveller({scene,world,assets:{traveller:new THREE.Group()}});}

test('actual player movement cannot tunnel through a paper wall while walking, running or dodging',()=>{
  const wall=propObstacles({...prop(),size:100},wallProfile);
  for(const speed of [1,1.8,3.4])for(const dt of [1/30,1/60]){
    const traveller=travellerFor(wall);traveller.teleport(0,1);state.speedMul=1;state.combatSpeed=speed;
    for(let i=0;i<Math.ceil(2/dt);i++){traveller.update(dt,{x:0,z:-1});assert(paperClearance(wall,traveller.position.x,traveller.position.z)>=.119);assert(traveller.position.z>0);}
    traveller.dispose();
  }
  state.combatSpeed=1;
});

test('the actual player can walk through the arch opening',()=>{
  const obstacles=propObstacles(prop('moon:1'),archProfile),traveller=travellerFor(obstacles);traveller.teleport(0,1);state.combatSpeed=1;state.speedMul=1;
  for(let i=0;i<120;i++)traveller.update(1/60,{x:0,z:-1});
  assert(traveller.position.z<-.8);assert(Math.abs(traveller.position.x)<.01);traveller.dispose();
});

test('sidling around finite and rotated paper props never cuts through their solid footprint',()=>{
  for(const angle of [0,Math.PI/4,Math.PI/2]){
    const obstacles=propObstacles({...prop('barrels_0',angle),size:.7},wallProfile),traveller=travellerFor(obstacles);
    const sx=Math.sin(angle),sz=Math.cos(angle);traveller.teleport(sx,sz);state.combatSpeed=3.4;state.speedMul=1;
    for(let i=0;i<90;i++){traveller.update(1/30,{x:-sx,z:-sz});assert(paperClearance(obstacles,traveller.position.x,traveller.position.z)>=.119);}
    traveller.dispose();
  }
  state.combatSpeed=1;
});
