import { grantReward } from './inventory.js';

export const CHAPTER_NODES = [
  {id:'camp',number:1,name:'Mara’s waystation',x:0,z:0,kind:'Refuge',hint:'Rest, equip your gear, and follow the printed trail.'},
  {id:'trail',number:2,name:'Split-log trail',x:0,z:-8,kind:'Battle',hint:'Two quill Inklings, then a briar hound. Read the attack marks.'},
  {id:'workshops',number:3,name:'Three workshops',x:-6,z:-15,kind:'Puzzle · armor',hint:'Turn each hinge to its matching printed symbol.'},
  {id:'mill',number:4,name:'Abandoned mill',x:5,z:-25,kind:'Battle · weapon',hint:'Heavy strikes break the keeper’s guard. Recover the bridge hinge.'},
  {id:'school',number:5,name:'Crease school',x:13,z:-25,kind:'Puzzle · magic',hint:'Match the valley folds and learn Fold. The practice is free.'},
  {id:'anchors',number:6,name:'Bridge anchors',x:21,z:-29,kind:'Defense',hint:'Set both anchors, then defend the rising bridge.'},
  {id:'gate',number:7,name:'Castle-road gate',x:21,z:-40,kind:'Chapter ending',hint:'Cross the bridge and lower a permanent return ladder.'},
  {id:'tree',number:8,name:'The last tree',x:-9,z:-8,kind:'Side quest · charm',hint:'Escort Ivo past two trail signs and deliver his birthday letter.'},
];
export const FIXTURES = [
  {id:'printer',name:'Printer’s floor',x:-9,z:-13,type:'workshop',index:0,clue:'The printer’s floor rests FLAT. Match the — mark.',answer:0},
  {id:'carpenter',name:'Carpenter’s stair',x:-5,z:-17,type:'workshop',index:1,clue:'The carpenter’s stair climbs UP. Match the / mark.',answer:1},
  {id:'baker',name:'Baker’s awning',x:-2,z:-13,type:'workshop',index:2,clue:'The baker’s awning shelters DOWN. Match the \\ mark.',answer:2},
  {id:'mill-door',name:'Enter the abandoned mill',x:5,z:-24,type:'door'},
  {id:'mill-exit',name:'Return to the workshop woods',x:60,z:-19.2,type:'door'},
  {id:'mill-chest',name:'The hinge keeper’s chest',x:60,z:-27.2,type:'chest'},
  {id:'school',name:'Crease school',x:13,z:-25,type:'fold'},
  {id:'anchor-west',name:'West bridge anchor',x:19.7,z:-30,type:'anchor',index:0},
  {id:'anchor-east',name:'East bridge anchor',x:22.3,z:-30,type:'anchor',index:1},
  {id:'gate',name:'Castle-road signpost',x:21,z:-40,type:'exit'},
  {id:'letter-start',name:'Ivo’s delivery board',x:-1.7,z:1.7,type:'letter'},
  {id:'letter-sign-one',name:'First postal sign',x:-4,z:-4,type:'letter',index:1},
  {id:'letter-sign-two',name:'Second postal sign',x:-9,z:-5.5,type:'letter',index:2},
  {id:'tree',name:'The last tree on the left',x:-9,z:-9,type:'letter',index:3},
];
export const ENCOUNTERS = {
  trail: {x:0,z:-8,radius:4.2,waves:[[['imp',-1,-1],['imp',1,-1.3]],[['wolf',0,-2]]]},
  mill: {x:60,z:-25,radius:5,waves:[[['knight',0,-1],['imp',1,1]]]},
  bridge: {x:21,z:-29,radius:4.5,waves:[[['imp',-2,1],['wolf',2,1]],[['knight',0,2]]]},
  letter: {x:-9,z:-8,radius:4,waves:[[['imp',-1,0],['imp',1,0]]]},
};
export const freshChapter = () => ({metMara:false,trail:false,workshops:[false,false,false],hinges:[2,0,1],mill:false,hinge:false,fold:false,folds:[0,0,0],anchors:[false,false],bridge:false,complete:false,letter:0,letterBattle:false,checkpoint:'camp'});
export function sanitizeChapter(raw) {
  const s=freshChapter();if(!raw||typeof raw!=='object')return s;
  for(const key of ['metMara','trail','mill','hinge','fold','bridge','complete','letterBattle'])s[key]=raw[key]===true;
  for(const key of ['workshops','anchors'])s[key]=s[key].map((_,i)=>raw[key]?.[i]===true);
  for(const key of ['hinges','folds'])s[key]=s[key].map((_,i)=>Number.isInteger(raw[key]?.[i])?Math.max(0,Math.min(2,raw[key][i])):0);
  s.letter=Number.isInteger(raw.letter)?Math.max(0,Math.min(4,raw.letter)):0;
  s.checkpoint=['camp','school','gate'].includes(raw.checkpoint)?raw.checkpoint:'camp';return s;
}
export const workshopsDone = s => s.workshops.every(Boolean);
export function chapterObjective(save) {
  const s=save.chapter;
  const step=!s.metMara?0:!s.trail?1:!workshopsDone(s)?2:!s.hinge?3:!s.fold?4:!s.bridge?5:6;
  const node=CHAPTER_NODES[step];
  const text=[
    'Speak to Mara with E. Open your satchel with I to inspect your starter gear.',
    'Clear the split-log trail. Dodge the marked leap; hold Q to guard.',
    `Reconnect the printer, carpenter, and baker’s hinges (${s.workshops.filter(Boolean).length}/3).`,
    'Follow the raised mill approach. Defeat the keeper, then open the hinge chest.',
    'Match the three valley folds at Crease school. Earn Fold and a lantern focus.',
    s.anchors.every(Boolean)?'Defeat the Inkbound at the anchors while the bridge rises.':'Use Fold at both marked bridge anchors. Puzzle casts are free.',
    s.complete?'Chapter complete. The waystation and bridge are yours to revisit.':'Cross the stable bridge. Read the castle-road signpost to finish the chapter.',
  ][step];
  return {chapter:'BOOK I · CHAPTER 1',title:s.complete?'A road, remembered':'A Road Out of Nowhere',text,count:s.complete?7:step,total:7,target:node};
}
// All changes are idempotent at reward boundaries; wrong puzzle attempts are free.
export function chapterAction(save,action,id) {
  const s=save.chapter,fixture=FIXTURES.find(f=>f.id===id);
  if(action==='meet'){s.metMara=true;return 'Mara: “The wizard crossed out our road. Let’s give it something to remember.”';}
  if(action==='turn'&&fixture?.type==='workshop'&&!s.workshops[fixture.index]){s.hinges[fixture.index]=(s.hinges[fixture.index]+1)%3;return 'The paper hinge turns.';}
  if(action==='repair'&&fixture?.type==='workshop'){
    if(!s.trail)return 'Clear the split-log ambush first; the residents need a safe road.';
    if(s.workshops[fixture.index])return 'This workshop is restored.';
    if(s.hinges[fixture.index]!==fixture.answer)return 'The seam does not meet. Read the resident’s clue and turn the hinge again.';
    s.workshops[fixture.index]=true;
    if(workshopsDone(s)){grantReward(save,'thorn:workshops',{items:['binders-coat'],story:['workshop-agreement'],paper:4});return 'All three workshops rise! Bookbinder’s coat found · open I to equip. The mill approach unfolds.';}
    return 'A promise kept. The workshop rises from the page.';
  }
  if(action==='chest'){
    if(!s.mill)return 'The hinge keeper is still here. Clear the mill before opening the chest.';
    if(s.hinge)return 'The chest is empty. Your hinge is safe in the story pouch.';
    s.hinge=true;grantReward(save,'thorn:mill-chest',{items:['cleaver'],story:['bridge-hinge'],paper:3});
    return 'Bridge hinge recovered · Briarwood cleaver found! Inspect and equip it in your satchel.';
  }
  if(action==='fold-turn'&&Number.isInteger(id)&&id>=0&&id<3&&!s.fold){s.folds[id]=(s.folds[id]+1)%3;return 'The practice strip creases.';}
  if(action==='fold-learn'){
    if(!s.hinge)return 'Recover the bridge hinge from the mill first.';
    if(s.fold)return 'Fold is yours permanently. Use F in battle, or E at a marked crease.';
    if(s.folds.some(v=>v!==2))return 'The bridge sags. Match three valley folds: \\ / · \\ / · \\ /. Try again; no ink is spent.';
    s.fold=true;s.checkpoint='school';grantReward(save,'thorn:fold-school',{items:['crease-focus'],tools:['Fold'],story:['fold-learned']});
    return 'Fold learned! F creases nearby foes. Creaseglass focus found · equip it in I. A safe bookmark is set here.';
  }
  if(action==='anchor'&&fixture?.type==='anchor'){
    if(!s.fold||!workshopsDone(s))return 'You need Fold and the workshop agreement to raise this bridge.';
    s.anchors[fixture.index]=true;return s.anchors.every(Boolean)?'Both anchors hold. Protect the bridge from the approaching Inkbound!':'One anchor holds. Fold the other marked crease.';
  }
  if(action==='finish'){
    if(!s.bridge)return 'The bridge must be defended before the road can open.';
    s.complete=true;s.checkpoint='gate';grantReward(save,'thorn:chapter-one',{gold:40,paper:5,story:['castle-road-open']});
    return 'Chapter 1 complete · +40 gold · the return ladder is open. The erased village waits on the next page.';
  }
  if(action==='letter'){
    if(s.letter===0){s.letter=1;grantReward(save,'thorn:letter-accepted',{story:['birthday-letter']});return 'Ivo joins you. Follow the two postal signs west, then deliver the letter at the last tree.';}
    if(id==='letter-sign-one'&&s.letter===1){s.letter=2;return 'Ivo: “Left at the first comma. I knew that.” Follow the second sign.';}
    if(id==='letter-sign-two'&&s.letter===2){s.letter=3;return 'Root-bound Inklings block the last tree. Protect the post!';}
    if(id==='tree'&&s.letter===3&&s.letterBattle){s.letter=4;grantReward(save,'thorn:letter-delivered',{items:['postmark-charm'],gold:65,potions:2,story:['last-tree-address']});return 'Happy 303rd birthday! +65 gold · two tonics · Last-tree postmark charm found.';}
    return s.letter===4?'The last tree has pinned its birthday letter to a branch.':s.letter===3?'Clear the root-bound Inklings, then deliver the letter at the tree.':'Read the next postal sign with Ivo beside you.';
  }
  return null;
}
export function completeEncounter(save,id) {
  const s=save.chapter,key={trail:'trail',mill:'mill',bridge:'bridge',letter:'letterBattle'}[id];
  if(!key||s[key])return false;
  s[key]=true;grantReward(save,`thorn:encounter:${id}`,{paper:id==='bridge'?4:2});return true;
}
