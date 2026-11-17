import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { ENEMY_ATTACKS, enemyAttackHits, attackOutline, windupDuration } from '../src/rpg/enemy-attacks.js';
import { enemyPose } from '../src/rpg/enemy-motion.js';
import { chunkLayout, propObstacles, residentCoordinates, regionAt, REGIONS } from '../src/world/moonveil-layout.js';
import { createFoldInstance } from '../src/world/fold.js';
import fs from 'node:fs';

test('enemy tells give reaction time and all four silhouettes are distinct',()=>{
  const poses=[];
  for(const kind of Object.keys(ENEMY_ATTACKS)){
    assert(windupDuration(kind)>=.9);assert(windupDuration(kind,true)>=.75);
    poses.push(JSON.stringify(enemyPose(kind,'windup',.9)));
    for(const mode of ['windup','strike','recover'])for(let i=0;i<=20;i++)assert(Object.values(enemyPose(kind,mode,i/20)).every(Number.isFinite));
    const rest=enemyPose(kind,'recover',1);assert.equal(rest.bodyX,0);assert.equal(rest.hop,0);
  }
  assert.equal(new Set(poses).size,4);
});

test('warning footprints agree with rotated attack hit areas, including safe side and rear escapes',()=>{
  const o={x:11,z:-17},dir={x:1,z:0};
  for(const attack of Object.values(ENEMY_ATTACKS)){
    assert(enemyAttackHits(attack,o,dir,{x:o.x+attack.reach*.5,z:o.z}));
    assert(!enemyAttackHits(attack,o,dir,{x:o.x+attack.reach+.01,z:o.z}));
    if(attack.shape!=='circle'){
      assert(!enemyAttackHits(attack,o,dir,{x:o.x-.3,z:o.z}));
      assert(!enemyAttackHits(attack,o,dir,{x:o.x+.4,z:o.z+attack.reach}));
    }
    // Every ground-outline vertex belongs to the damage boundary (roundoff tolerance only).
    for(const [x,z] of attackOutline(attack)){
      const inside={x:o.x+z*.999999,z:o.z-x*.999999};
      assert(enemyAttackHits(attack,o,dir,inside),`${attack.name} outline stays truthful`);
    }
  }
});

test('seeded terrain regenerates identically at distant and negative coordinates with bounded residents',()=>{
  for(const [x,z] of [[0,0],[1500,-912],[-2400,3600],[250000,250000]]){
    const coords=residentCoordinates(x,z);assert.equal(coords.length,25);assert.equal(new Set(coords.map(c=>c.join(','))).size,25);
    for(const [cx,cz] of coords)assert.deepEqual(chunkLayout(42,cx,cz),chunkLayout(42,cx,cz));
  }
  assert.notDeepEqual(chunkLayout(42,31,17),chunkLayout(43,31,17));
});

test('regions provide valid, varied paper art and keep avenues and arch openings traversable',()=>{
  const sprites=JSON.parse(fs.readFileSync(new URL('../public/textures/art/atlas.json',import.meta.url))).sprites;
  const seen=new Set(),regions=new Set();
  for(let cz=-8;cz<=8;cz++)for(let cx=-8;cx<=8;cx++){
    const layout=chunkLayout(42,cx,cz);regions.add(regionAt(42,layout.x,layout.z).name);
    const blockers=layout.props.flatMap(propObstacles);
    for(const p of layout.props){seen.add(p.asset);assert(p.asset.startsWith('moon:')||sprites[p.asset],p.asset);}
    for(let t=-6;t<=6;t+=.2){
      assert(blockers.every(o=>Math.hypot(layout.x-o.x,layout.z+t-o.z)-o.r>.2),'north/south corridor');
      assert(blockers.every(o=>Math.hypot(layout.x+t-o.x,layout.z-o.z)-o.r>.2),'east/west corridor');
    }
  }
  assert.equal(regions.size,REGIONS.length);assert(seen.size>=50);
});

test('Moonveil paper hinges rise with overshoot, close, and reopen using the original spring',()=>{
  const anchor=new THREE.Group(),hinge=new THREE.Group();hinge.name='arch';hinge.userData={hinge:true,size:1,foldAngle:-Math.PI/2};anchor.add(hinge);
  const card=new THREE.Mesh(new THREE.PlaneGeometry(3,3).translate(0,1.5,0));hinge.add(card);
  const fold=createFoldInstance(anchor,{tileId:'test-arch'});assert.equal(fold.progress,0);
  fold.setTarget(1);let peak=0;
  for(let i=0;i<180;i++){fold.update(1/60);peak=Math.max(peak,fold.progress);assert(hinge.quaternion.toArray().every(Number.isFinite));}
  assert(peak>1.02,'paper should overshoot upright');assert(fold.settled);assert.equal(fold.progress,1);
  fold.setTarget(0);for(let i=0;i<180;i++)fold.update(1/60);assert.equal(fold.progress,0);
  fold.setTarget(1);for(let i=0;i<180;i++)fold.update(1/60);assert.equal(fold.progress,1);
  card.geometry.dispose();card.material.dispose();
});
