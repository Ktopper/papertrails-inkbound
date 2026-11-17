import test from 'node:test';
import assert from 'node:assert/strict';
import { freshSave, sanitizeSave } from '../src/rpg/rules.js';
import { grantReward, equipItem, assignShortcut, upgradeItem, equipmentStats } from '../src/rpg/inventory.js';
import { chapterAction, completeEncounter, FIXTURES, chapterObjective } from '../src/rpg/thornbound-rules.js';
import { terrainClearance, CRATES } from '../src/world/thornbound-layout.js';
import { combatRoute } from '../src/rpg/navigation.js';

test('version 1 migration preserves all legacy progress and every unlocked weapon rank',()=>{
  const old={version:1,xp:550,gold:92,kills:13,weapon:2,upgrades:4,potions:5,bossDefeated:true,lanternBlessing:true,courier:{accepted:true,startKills:6,claimed:true}};
  const s=sanitizeSave(old);assert.equal(s.version,2);
  for(const key of ['xp','gold','kills','weapon','upgrades','potions','bossDefeated','lanternBlessing','courier'])assert.deepEqual(s[key],old[key]);
  for(const id of ['blade','cleaver','pike'])assert.equal(s.inventory.owned[id],4);
  assert.equal(s.inventory.equipped.weapon,'pike');assert.equal(s.chapter.complete,false);
  assert.deepEqual(sanitizeSave(JSON.parse(JSON.stringify(s))),s);
});
test('equipment must be owned, match its slot, and cannot duplicate a charm',()=>{
  const s=freshSave();assert.equal(equipItem(s,'cleaver'),false);assert.equal(equipItem(s,'blade','coat'),false);
  grantReward(s,'test:gear',{items:['cleaver','binders-coat','crease-focus','postmark-charm']});
  assert(equipItem(s,'cleaver'));assert.equal(s.weapon,1);assert(equipItem(s,'binders-coat'));assert.equal(equipmentStats(s).armor,.08);
  assert(equipItem(s,'crease-focus'));assert.equal(equipmentStats(s).foldCost,16);
  assert(equipItem(s,'postmark-charm','charmA'));assert(equipItem(s,'postmark-charm','charmB'));assert.equal(s.inventory.equipped.charmA,null);
  assert(assignShortcut(s,'cleaver',2));assert.equal(assignShortcut(s,'binders-coat',0),false);
  s.lanternBlessing=true;assert(Math.abs(equipmentStats(s).damageReduction-.172)<1e-9);
});
test('malformed inventory cannot equip unknown or unowned items, corrupt ranks, or duplicate charms',()=>{
  const raw=freshSave();raw.inventory={owned:{blade:Infinity,cleaver:100,'postmark-charm':-5,unknown:1},equipped:{weapon:'pike',coat:'cleaver',charmA:'postmark-charm',charmB:'postmark-charm'},shortcuts:['unknown','cleaver','patched-coat'],tools:['Fold','Fold','Cheat'],materials:{paper:NaN}};
  const s=sanitizeSave(raw);assert.equal(s.weapon,0);assert.equal(s.inventory.owned.cleaver,5);assert.equal(s.inventory.owned.unknown,undefined);assert.equal(s.inventory.equipped.coat,'patched-coat');assert.equal(s.inventory.equipped.charmB,null);assert.deepEqual(s.inventory.tools,['Fold']);assert.equal(s.inventory.materials.paper,0);
});
test('rewards survive full supplies and reload without duplicate money, paper, or replacement ranks',()=>{
  let s=freshSave();s.potions=5;
  assert(grantReward(s,'test:once',{items:['cleaver'],gold:65,potions:2,paper:5,tools:['Fold'],story:['bridge-hinge']}));s.inventory.owned.cleaver=3;
  s=sanitizeSave(JSON.parse(JSON.stringify(s)));
  assert.equal(grantReward(s,'test:once',{items:['cleaver'],gold:65,potions:2,paper:5}),false);
  assert.equal(s.gold,65);assert.equal(s.potions,5);assert.equal(s.inventory.materials.paper,5);assert.equal(s.inventory.owned.cleaver,3);
  equipItem(s,'blade');assert(s.inventory.tools.includes('Fold'));assert(s.inventory.story.includes('bridge-hinge'));
});
test('item workbench spends exact resources, changes only the selected weapon, and caps rank',()=>{
  const s=freshSave();grantReward(s,'test:resources',{items:['cleaver'],gold:1000,paper:100});
  assert(upgradeItem(s,'cleaver'));assert.equal(s.gold,965);assert.equal(s.inventory.materials.paper,97);assert.equal(s.inventory.owned.cleaver,1);assert.equal(s.inventory.owned.blade,0);
  for(let i=0;i<4;i++)assert(upgradeItem(s,'cleaver'));const gold=s.gold;assert.equal(upgradeItem(s,'cleaver'),false);assert.equal(s.gold,gold);assert.equal(upgradeItem(s,'patched-coat'),false);
});
function finishWorkshops(s){for(const f of FIXTURES.filter(f=>f.type==='workshop')){while(s.chapter.hinges[f.index]!==f.answer)chapterAction(s,'turn',f.id);chapterAction(s,'repair',f.id);}}
test('the complete chapter requires battles and puzzle solutions, and rewards equipment before its exit',()=>{
  let s=freshSave();chapterAction(s,'finish');assert.equal(s.chapter.complete,false);chapterAction(s,'chest');assert.equal(s.chapter.hinge,false);
  chapterAction(s,'meet');finishWorkshops(s);assert(!s.chapter.workshops.some(Boolean));
  completeEncounter(s,'trail');finishWorkshops(s);assert(Object.hasOwn(s.inventory.owned,'binders-coat'));
  completeEncounter(s,'mill');chapterAction(s,'chest');assert(Object.hasOwn(s.inventory.owned,'cleaver'));assert(s.chapter.hinge);
  chapterAction(s,'fold-learn');assert.equal(s.chapter.fold,false);
  for(let i=0;i<3;i++){chapterAction(s,'fold-turn',i);chapterAction(s,'fold-turn',i);}chapterAction(s,'fold-learn');
  assert(s.inventory.tools.includes('Fold'));assert(Object.hasOwn(s.inventory.owned,'crease-focus'));assert.equal(s.chapter.checkpoint,'school');
  s=sanitizeSave(JSON.parse(JSON.stringify(s)));chapterAction(s,'anchor','anchor-west');chapterAction(s,'anchor','anchor-east');assert(s.chapter.anchors.every(Boolean));
  assert.equal(s.chapter.bridge,false);completeEncounter(s,'bridge');chapterAction(s,'finish');const gold=s.gold;chapterAction(s,'finish');assert.equal(s.gold,gold);assert(s.chapter.complete);assert.equal(chapterObjective(s).count,7);
  assert.equal(s.chapter.letter,0,'optional side quest is never required');assert(!Object.hasOwn(s.inventory.owned,'pike'),'level alone does not unlock story gear');
});
test('the birthday letter requires both signs and the root-bound encounter, then pays once',()=>{
  let s=freshSave();chapterAction(s,'letter','letter-start');chapterAction(s,'letter','tree');assert.equal(s.chapter.letter,1);
  chapterAction(s,'letter','letter-sign-one');chapterAction(s,'letter','letter-sign-two');chapterAction(s,'letter','tree');assert.equal(s.chapter.letter,3);
  completeEncounter(s,'letter');chapterAction(s,'letter','tree');assert.equal(s.gold,65);assert(Object.hasOwn(s.inventory.owned,'postmark-charm'));
  s=sanitizeSave(JSON.parse(JSON.stringify(s)));chapterAction(s,'letter','tree');assert.equal(s.gold,65);assert.equal(s.chapter.letter,4);
});
test('hard page edges, ink cuts, and mill crates remain solid; earned crossings open only their decks',()=>{
  const s=freshSave().chapter;
  assert(terrainClearance(5,-20,s)<0);assert(terrainClearance(21,-35,s)<0);assert(terrainClearance(30,-35,s)<0);
  s.workshops.fill(true);assert(terrainClearance(5,-20,s)>1);assert(terrainClearance(8,-20,s)<0);
  s.bridge=true;assert(terrainClearance(21,-35,s)>1);assert(terrainClearance(24,-35,s)<0);
  assert(terrainClearance(60,-20,s)>0);assert(terrainClearance(67,-25,s)<0);
  for(const c of CRATES)assert(terrainClearance(c.x,c.z,s)<0);
});
test('an enemy can route around a solid crate without crossing it or an unopened river',()=>{
  const s=freshSave().chapter,clearance=(x,z)=>terrainClearance(x,z,s);
  const route=combatRoute({x:58.3,z:-25.3},{x:58.3,z:-22.5},clearance);
  assert(route.length>0);for(const p of route)assert(clearance(p.x,p.z)>=.13);
  assert.equal(combatRoute({x:5,z:-18},{x:5,z:-23},clearance).length,0);
});
