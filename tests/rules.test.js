import test from 'node:test';
import assert from 'node:assert/strict';
import { inStrike, levelFor, maxHealth, sanitizeSave, freshSave, questFor, WEAPONS } from '../src/rpg/rules.js';

test('melee hits within reach and in front, never behind or outside range',()=>{
  const p={x:0,z:0},front={x:0,z:-1};
  assert.equal(inStrike(p,{x:.3,z:-.8},front,1,1.2),true);
  assert.equal(inStrike(p,{x:0,z:1},front,1,1.2),false);
  assert.equal(inStrike(p,{x:0,z:-1.3},front,1,1.2),false);
  assert.equal(inStrike(p,p,front,1,1.2),true);
});
test('spear reaches further but requires more precise aim than axe',()=>{
  const p={x:0,z:0},front={x:0,z:-1},s=WEAPONS[2],a=WEAPONS[1];
  assert(inStrike(p,{x:0,z:-1.6},front,s.reach,s.arc));
  assert(!inStrike(p,{x:0,z:-1.6},front,a.reach,a.arc));
  assert(inStrike(p,{x:.8,z:-.1},front,a.reach,a.arc));
  assert(!inStrike(p,{x:.8,z:-.1},front,s.reach,s.arc));
});
test('level thresholds unlock weapons and increase health',()=>{
  assert.equal(levelFor(74),1);assert.equal(levelFor(75),2);assert.equal(levelFor(300),3);
  assert.equal(maxHealth(300),136);assert.equal(levelFor(1e7),10);
});
test('invalid and old saves cannot create broken or locked loadouts',()=>{
  assert.deepEqual(sanitizeSave(null),freshSave());assert.deepEqual(sanitizeSave({version:0,xp:100}),freshSave());
  const s=sanitizeSave({version:1,xp:-2,gold:Infinity,kills:2.8,weapon:2,potions:999,upgrades:NaN,bossDefeated:'false'});
  assert.equal(s.xp,0);assert.equal(s.gold,0);assert.equal(s.kills,2);assert.equal(s.weapon,0);assert.equal(s.potions,5);assert.equal(s.upgrades,0);assert.equal(s.bossDefeated,false);
});
test('earned progress survives save/reload, including upgrades and victory',()=>{
  const s={...freshSave(),xp:550,kills:12,weapon:2,upgrades:3,potions:1,gold:82,bossDefeated:true};
  assert.deepEqual(sanitizeSave(JSON.parse(JSON.stringify(s))),s);
});
test('quest advances through encounters, boss, and a completed epilogue',()=>{
  const s=freshSave();assert.equal(questFor(s).chapter,'Chapter I');s.kills=4;assert.equal(questFor(s).chapter,'Chapter II');s.kills=10;assert.equal(questFor(s).chapter,'Chapter III');s.bossDefeated=true;assert.equal(questFor(s).chapter,'Epilogue');
});

test('new melee timing lands hits during a short, bounded swing', async()=>{
  const {attackTiming,swingPose}=await import('../src/rpg/combat-motion.js');
  assert.equal(attackTiming(WEAPONS[0]).duration,.28);
  for(const weapon of WEAPONS) for(const heavy of [false,true]){
    const timing=attackTiming(weapon,heavy);
    assert(timing.hitAt>0&&timing.hitAt<timing.duration);
    for(let i=0;i<=10;i++)for(const value of Object.values(swingPose(i/10*timing.duration,timing.duration,2,weapon.id,heavy)))assert(Number.isFinite(value));
  }
  const first=swingPose(.12,.28,1),second=swingPose(.12,.28,2),rest=swingPose(.28,.28,1);
  assert(first.yaw*second.yaw<0);assert.equal(rest.yaw,0);assert(Math.abs(rest.arm)<1e-9);
});
