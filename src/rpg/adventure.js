import * as THREE from 'three';
import { state } from '../core/state.js';
import { bus } from '../core/events.js';
import { mulberry32 } from '../core/rng.js';
import { WEAPONS, ENEMIES, freshSave, sanitizeSave, levelFor, maxHealth, upgradeCost, inStrike, questFor } from './rules.js';
import { createWeapon, disposeObject } from './art.js';
import { createActor } from './actors.js';
import { ENEMY_ATTACKS, windupDuration, attackProgress, enemyAttackHits } from './enemy-attacks.js';
import { createTelegraph } from './telegraph.js';
import { CHARACTERS, talkAction, courierQuest } from './characters.js';
import { attackTiming, swingPose } from './combat-motion.js';
import { createUI } from './ui.js';
import './style.css';

export function createAdventure(ctx) {
  const { scene, traveller, world, follow, controls, game, seed, music, daynight, audio, materials } = ctx;
  const key=`papertrails-inkbound-v1:${seed}${world.id==='moonveil'?':moonveil':''}`;
  let saved=null;try{saved=JSON.parse(localStorage.getItem(key));}catch{/* Storage may be unavailable. */}
  let save=sanitizeSave(saved), health=maxHealth(save.xp), stamina=100;
  let heldLight=false,heldHeavy=false,mouseHeld=false;
  let started=false,panel=null,ready=false,guarding=false,attack=null,dash=0,invincible=0,cooldown=0,combo=0,comboUntil=0;
  let npcClock=0,clock=0,spawnTimer=2.5,hudTimer=0,grace=4,saveWarning=false,bossSpawned=false,chapter=questFor(save).chapter;
  const random=mulberry32(seed^0x1abcde),enemies=[],effects=[];
  const campPos=new THREE.Vector3(),facing=new THREE.Vector3(0,0,-1),dashDir=new THREE.Vector3(0,0,-1),lastInput={x:0,z:0};
  const aim=new THREE.Vector3(),ndc=new THREE.Vector2(),ray=new THREE.Raycaster(),plane=new THREE.Plane(new THREE.Vector3(0,1,0),0),projected=new THREE.Vector3();
  let pointerActive=false;
  const camp=createActor('camp',.75,{paperMaterials:materials});scene.add(camp.group);
  const npcs=[{...camp,id:'camp',placed:false,barkAt:10},...['courier','moth'].map((id,i)=>{const actor=createActor(id,id==='moth'?.66:.73,{paperMaterials:materials});actor.group.visible=false;scene.add(actor.group);return {...actor,id,placed:false,barkAt:18+i*9};})];
  const campRing=new THREE.Mesh(new THREE.RingGeometry(.58,.6,48),new THREE.MeshBasicMaterial({color:'#e5c584',transparent:true,opacity:.45,side:THREE.DoubleSide,depthWrite:false}));campRing.rotation.x=-Math.PI/2;campRing.position.y=.025;camp.group.add(campRing);
  const weaponPivot=new THREE.Group();traveller.rig.add(weaponPivot);weaponPivot.position.set(-.17,.33,.05);
  let weaponMesh=createWeapon(save.weapon);weaponPivot.add(weaponMesh);weaponMesh.scale.setScalar(1.22);
  const guardRing=new THREE.Mesh(new THREE.RingGeometry(.4,.44,40,1,0,Math.PI*1.25),new THREE.MeshBasicMaterial({color:'#a6d6cb',transparent:true,opacity:.8,side:THREE.DoubleSide,depthWrite:false}));guardRing.rotation.x=-Math.PI/2;guardRing.position.y=.06;guardRing.visible=false;traveller.group.add(guardRing);
  const ui=createUI({
    start(){if(!ready)return;started=true;world.reveal?.();ui.start();controls.clearTarget();bus.emit('input:first',{});music.chime?.('lantern');ui.toast('Mara awaits beside the golden circle. Press E to speak.');persist();},
    attack:()=>strike(false),heavy:()=>strike(true),dodge,potion,
    equip,
    journal:()=>openPanel('journal'),pause:()=>openPanel('pause'),
    map(){if(!modal()){guarding=false;controls.clearTarget();game.atlasmap.toggle();}},
    camp:interact,
    acceptDelivery:()=>characterAction('acceptDelivery'),claimDelivery:()=>characterAction('claimDelivery'),blessing:()=>characterAction('blessing'),
    rumor(){const lines={camp:'The knights still remember their oath. Their shields face forward. A heavy blow or a step behind them will break their rhythm.',courier:'The hounds crouch before they leap. Move sideways once they commit. Trust me; I run professionally.',moth:'The Warden’s crown floats when it is angry. Its violet ring strikes in every direction. Save enough breath to dodge.'};if(lines[panel])ui.dialogueLine(lines[panel]);},
    close:closePanel,
    rest(){if(panel!=='camp')return;health=maxHealth(save.xp);stamina=100;save.potions=Math.max(3,save.potions);grace=3;persist();ui.toast('Restored. A fresh page, a steadier hand.');closePanel();},
    upgrade(){const cost=upgradeCost(save.upgrades);if(panel!=='camp'||save.upgrades>=5||save.gold<cost)return;save.gold-=cost;save.upgrades++;persist();ui.panel('camp',save);ui.toast('Weapons honed · +4 damage');},
    revive(){if(panel!=='death')return;health=maxHealth(save.xp);stamina=100;save.potions=Math.max(3,save.potions);traveller.teleport(campPos.x,campPos.z+.4);clearEnemies();grace=4;spawnTimer=5;bossSpawned=false;closePanel(true);persist();},
    music(){music.toggle();},night(){daynight.toggle();},newGame(){openPanel('reset');},
    reset(){save=freshSave();health=100;stamina=100;chapter=questFor(save).chapter;clearEnemies();bossSpawned=false;spawnTimer=4;grace=4;replaceWeapon();traveller.teleport(campPos.x,campPos.z+.4);persist();closePanel(true);ui.toast('A new story begins.');},
  },!!saved,{id:world.id||'heartland',name:world.name||'The Heartland'});
  function persist(){try{localStorage.setItem(key,JSON.stringify(save));}catch{if(!saveWarning){saveWarning=true;ui.toast('Saving is unavailable in this browser session.');}}}
  function modal(){return !started||panel!==null;}
  const blocked=()=>modal()||game.atlasmap.open||document.hidden;
  function nearbyCharacter(){let best=null,distance=1.15;for(const n of npcs){const d=n.group.position.distanceTo(traveller.position);if(n.placed&&d<distance){best=n;distance=d;}}return best;}
  function interact(){const npc=nearbyCharacter();if(npc)openPanel(npc.id);else ui.toast('Mara, Ivo, and Pip wait near the golden waystation.');}
  function characterAction(action){if((panel==='courier'&&['acceptDelivery','claimDelivery'].includes(action))||(panel==='moth'&&action==='blessing')){const message=talkAction(save,action);if(message){persist();ui.panel(panel,save);ui.toast(message);music.chime?.('lantern');}}}
  function placeFriends(){for(const npc of npcs){if(npc.placed)continue;for(let i=0;i<80;i++){const a=i*2.399+(npc.id==='moth'?1:0),r=1.5+(i%4)*.45,x=campPos.x+Math.cos(a)*r,z=campPos.z+Math.sin(a)*r;if(!traveller.canPass(x,z)||!lineClear(campPos,{x,z},.1)||npcs.some(other=>other.placed&&Math.hypot(other.group.position.x-x,other.group.position.z-z)<1.6))continue;npc.group.position.set(x,world.heightAt(x,z)||0,z);npc.group.visible=true;npc.placed=true;break;}}}
  function updateFriends(dt){
    if(!document.hidden)npcClock+=dt;
    if(npcs.some(n=>!n.placed)&&Math.floor(clock)%3===0)placeFriends();
    const labels=[],near=nearbyCharacter();
    for(const n of npcs){if(!n.placed)continue;const p=n.group.position,d=p.distanceTo(traveller.position),direction=d<3?{x:traveller.position.x-p.x,z:traveller.position.z-p.z}:{x:.2,z:1};n.update(dt,{time:npcClock,direction,talking:panel===n.id});
      if(started&&!panel&&d<2.2&&clock>n.barkAt){n.barkAt=clock+35;ui.toast(`${CHARACTERS[n.id].name}: “${CHARACTERS[n.id].line}”`);}
      projected.copy(p);projected.y+=n.id==='moth'?.8:1;projected.project(follow.camera);if(d<4.5&&projected.z>-1&&projected.z<1&&Math.abs(projected.x)<1&&Math.abs(projected.y)<1)labels.push({id:n.id,x:(projected.x*.5+.5)*innerWidth,y:(-.5*projected.y+.5)*innerHeight,near:near===n});
    }ui.characters(labels);
  }
  function openPanel(type){if(!started)return;if(panel==='death'&&type!=='death')return;game.atlasmap.show(false);panel=type;heldLight=heldHeavy=mouseHeld=false;guarding=false;guardRing.visible=false;traveller.model.visible=true;attack=null;dash=0;controls.clearTarget();ui.threat(null);ui.panel(type,save);persist();}
  function closePanel(force=false){if(panel==='death'&&!force)return;panel=null;ui.close();controls.clearTarget();}
  function replaceWeapon(){disposeObject(weaponMesh);weaponMesh=createWeapon(save.weapon);weaponPivot.add(weaponMesh);weaponMesh.scale.setScalar(1.22);}
  function equip(index){if(blocked())return;const w=WEAPONS[index];if(!w)return;if(levelFor(save.xp)<w.level){ui.toast(`${w.name} unlocks at level ${w.level}.`);return;}if(attack)return;save.weapon=index;replaceWeapon();persist();ui.toast(w.name+' · '+w.description);}
  function textAt(text,p,color='#ffe7aa',height=.65){projected.copy(p);projected.y+=height;projected.project(follow.camera);if(projected.z>1||projected.z<-1)return;ui.floater(text,(projected.x*.5+.5)*innerWidth,(-projected.y*.5+.5)*innerHeight,color);}
  let audioCtx;
  function sound(freq,duration=.08,type='triangle',volume=.045){if(audio.muted)return;try{audioCtx??=new AudioContext();if(audioCtx.state==='suspended')audioCtx.resume();const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();osc.type=type;osc.frequency.setValueAtTime(freq,audioCtx.currentTime);osc.frequency.exponentialRampToValueAtTime(Math.max(40,freq*.4),audioCtx.currentTime+duration);gain.gain.setValueAtTime(volume,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,audioCtx.currentTime+duration);osc.connect(gain);gain.connect(audioCtx.destination);osc.start();osc.stop(audioCtx.currentTime+duration);}catch{/* Audio is optional. */}}
  function burst(pos,color,count=8){for(let i=0;i<count;i++){const mesh=new THREE.Mesh(new THREE.PlaneGeometry(.035,.065),new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,transparent:true}));mesh.position.copy(pos);mesh.position.y+=.3;scene.add(mesh);effects.push({mesh,life:.55,max:.55,vx:(random()-.5)*2,vz:(random()-.5)*2,vy:1+random()});}}
  function slash(w,heavy){const angle=Math.atan2(facing.x,facing.z);const mesh=new THREE.Mesh(new THREE.RingGeometry(w.reach*.84,w.reach,36,1,-w.arc,w.arc*2),new THREE.MeshBasicMaterial({color:w.color,transparent:true,opacity:.55,side:THREE.DoubleSide,depthWrite:false}));mesh.rotation.x=-Math.PI/2;mesh.rotation.z=angle-Math.PI/2;mesh.position.copy(traveller.position);mesh.position.y+=.26;scene.add(mesh);effects.push({mesh,life:heavy?.2:.14,max:heavy?.2:.14,slash:true});}
  function targetFacing(mouse=false){
    const p=traveller.position;let nearest=null,d=2.15;
    if(mouse&&pointerActive){facing.set(aim.x-p.x,0,aim.z-p.z);if(facing.lengthSq()>.01)facing.normalize();else facing.copy(traveller.moveDir);}
    else {for(const enemy of enemies){const dist=enemy.group.position.distanceTo(p);if(enemy.hp>0&&dist<d){nearest=enemy;d=dist;}}if(nearest)facing.copy(nearest.group.position).sub(p).setY(0).normalize();else facing.copy(traveller.moveDir);}
    traveller.face(facing.x,facing.z);
  }
  function strike(heavy,mouse=false){
    if(blocked()||attack||cooldown>0||dash>0)return;
    const w=WEAPONS[save.weapon],cost=w.cost*(heavy?1.75:1);
    if(stamina<cost){return;}
    targetFacing(mouse);guarding=false;stamina-=cost;
    combo=clock<comboUntil?(combo%3)+1:1;comboUntil=clock+1.25;
    const timing=attackTiming(w,heavy);attack={t:0,heavy,w,hit:false,direction:facing.clone(),combo,...timing};cooldown=timing.duration;controls.clearTarget();sound(heavy?110:220,.12,'triangle');
  }
  function dodge(){if(blocked()||dash>0||stamina<24)return;attack=null;guarding=false;stamina-=24;dash=.26;invincible=Math.max(invincible,.34);dashDir.set(lastInput.x,0,lastInput.z);if(dashDir.lengthSq()<.01)dashDir.copy(traveller.moveDir);dashDir.normalize();sound(160,.16);controls.clearTarget();burst(traveller.position,'#ded2ad',5);}
  function potion(){if(blocked())return;if(!save.potions){ui.toast('No tonics left. Rest with Mara to refill them.');return;}if(health>=maxHealth(save.xp)){ui.toast('Your health is already full.');return;}save.potions--;health=Math.min(maxHealth(save.xp),health+60);textAt('+60',traveller.position,'#b3e5b2');burst(traveller.position,'#a3d29c');sound(650,.3);persist();}
  function reward(enemy){
    const oldLevel=levelFor(save.xp);save.xp+=enemy.spec.xp;save.gold+=enemy.spec.gold;save.kills++;
    textAt(`+${enemy.spec.xp} XP`,enemy.group.position,'#e9ca85',.9);burst(enemy.group.position,enemy.kind==='boss'?'#c6a1d1':'#83b6a1',12);sound(440,.16);
    if(save.kills%4===0&&save.potions<5){save.potions++;ui.toast('A healing tonic found among the scraps.');}
    if(levelFor(save.xp)>oldLevel){health=maxHealth(save.xp);stamina=100;const unlock=WEAPONS.find(w=>w.level===levelFor(save.xp));ui.toast(`Level ${levelFor(save.xp)} · Health restored${unlock?' · '+unlock.short+' unlocked':''}`);music.chime?.('lantern');}
    if(enemy.kind==='boss'){save.bossDefeated=true;openPanel('victory');}
    const newChapter=questFor(save).chapter;if(chapter!==newChapter){chapter=newChapter;if(!save.bossDefeated)ui.toast(chapter+' · '+questFor(save).title);}
    persist();
  }
  function lineClear(a,b,radius=.06){const d=Math.hypot(b.x-a.x,b.z-a.z),n=Math.max(1,Math.ceil(d/.12));for(let i=1;i<=n;i++){const t=i/n;if(world.clearance(a.x+(b.x-a.x)*t,a.z+(b.z-a.z)*t)<radius)return false;}return true;}
  function hitEnemies(a){
    facing.copy(a.direction);slash(a.w,a.heavy);let hits=0;
    for(const e of enemies){if(e.hp<=0||!inStrike(traveller.position,e.group.position,a.direction,a.w.reach,a.w.arc,e.spec.size*.19)||!lineClear(traveller.position,e.group.position,0))continue;
      const frontalGuard=e.kind==='knight'&&inStrike(e.group.position,traveller.position,e.direction,10,1.05);
      const damage=Math.round((a.w.damage+save.upgrades*4+(levelFor(save.xp)-1)*3)*(a.heavy?1.9:a.combo===3?1.4:1)*(frontalGuard&&!a.heavy?.55:1));
      e.hp=Math.max(0,e.hp-damage);e.stun=a.heavy?.65:.2;e.flash=.14;e.mode='recover';e.recovery=.55;e.timer=.55;hits++;
      textAt(String(damage)+(a.combo===3&&!a.heavy?'!':''),e.group.position,a.heavy?'#ffdc8a':'#fff2d9',e.spec.size);burst(e.group.position,a.w.color,5);
      const dx=e.group.position.x+a.direction.x*.18,dz=e.group.position.z+a.direction.z*.18;if(traveller.canPass(dx,dz))e.group.position.set(dx,world.heightAt(dx,dz)||0,dz);
      if(frontalGuard&&!a.heavy)textAt('ARMORED',e.group.position,'#b9cbd0',e.spec.size+.2);
      if(e.hp<=0)reward(e);
    }
    if(hits)sound(a.heavy?65:105,.15,'sawtooth',.035);
  }
  function damagePlayer(e){
    if(invincible>0||grace>0||health<=0)return;
    const p=traveller.position;if(!enemyAttackHits(e.attack,e.origin,e.direction,p)||!lineClear(e.group.position,p,0))return;
    let damage=e.spec.damage*(e.enraged?1.25:1)*(save.lanternBlessing?.9:1);
    const toward=e.group.position.clone().sub(p).setY(0).normalize();
    if(guarding&&toward.dot(traveller.moveDir)>.05&&stamina>=16){stamina-=16;damage=Math.ceil(damage*.15);textAt('GUARD',p,'#b6ded0');sound(600,.1,'triangle');}
    else {ui.damage();sound(75,.14,'sawtooth',.04);if(guarding){guarding=false;stamina=0;ui.toast('Guard broken. Dodge to regain your footing.');}}
    health=Math.max(0,health-damage);invincible=.65;textAt(`−${Math.ceil(damage)}`,p,'#f19d86');
    if(health<=0){save.gold=Math.max(0,save.gold-10);openPanel('death');persist();}
  }
  function findSpawn(min=2.4,max=4.3){
    const p=traveller.position;
    for(let i=0;i<80;i++){const a=random()*Math.PI*2,r=min+random()*(max-min),x=p.x+Math.cos(a)*r,z=p.z+Math.sin(a)*r;
      const tile=world.tileRecord(Math.round(x/2),Math.round(z/2));
      if(!tile||tile.fold.progress<.9||!traveller.canPass(x,z)||enemies.some(e=>Math.hypot(e.group.position.x-x,e.group.position.z-z)<.6))continue;
      // Every encounter starts on reachable ground in the currently unfolded world.
      if(!lineClear(p,{x,z},.1))continue;
      return {x,z};
    }return null;
  }
  function spawn(kind){const point=findSpawn(kind==='boss'?3:2.1,kind==='boss'?4.2:3.5);if(!point)return false;const spec=ENEMIES[kind],actor=createActor(kind,spec.size,{paperMaterials:materials});actor.group.position.set(point.x,world.heightAt(point.x,point.z)||0,point.z);scene.add(actor.group);const barBack=new THREE.Mesh(new THREE.PlaneGeometry(spec.size*.65,.034),new THREE.MeshBasicMaterial({color:'#3d3031'})),bar=new THREE.Mesh(new THREE.PlaneGeometry(spec.size*.65,.025),new THREE.MeshBasicMaterial({color:kind==='boss'?'#c99ccf':'#c98468'}));barBack.position.y=spec.size+0.12;bar.position.y=spec.size+0.12;bar.position.z=.003;const healthBar=new THREE.Group();healthBar.add(barBack,bar);actor.group.add(healthBar);enemies.push({...actor,spec,kind,hp:spec.hp,maxHp:spec.hp,mode:'approach',timer:1,stun:0,flash:0,age:0,bar,barBack,healthBar,direction:new THREE.Vector3(0,0,1),attack:ENEMY_ATTACKS[kind],telegraph:createTelegraph(ENEMY_ATTACKS[kind]),origin:actor.group.position.clone(),windup:windupDuration(kind),attackDuration:ENEMY_ATTACKS[kind].duration,hit:false,recovery:spec.cooldown,side:random()>.5?1:-1,enraged:false});scene.add(enemies.at(-1).telegraph.group);return true;}
  function clearEnemies(){for(const e of enemies){e.telegraph.dispose();e.dispose();}enemies.length=0;}
  function moveEnemy(e,dx,dz,dt){const p=e.group.position,step=e.spec.speed*(e.enraged?1.3:1)*dt;const a=Math.atan2(dz,dx);for(const offset of [0,.6*e.side,1.2*e.side,1.7*e.side,-.6*e.side]){const nx=p.x+Math.cos(a+offset)*step,nz=p.z+Math.sin(a+offset)*step;if(world.clearance(nx,nz)>.1){p.set(nx,world.heightAt(nx,nz)||0,nz);return;}}}
  function updateEnemies(dt){
    const p=traveller.position;
    for(let i=enemies.length-1;i>=0;i--){const e=enemies[i];e.age+=dt;e.flash=Math.max(0,e.flash-dt);e.stun=Math.max(0,e.stun-dt);
      const d=e.group.position.distanceTo(p);
      if(e.hp<=0||d>13){if(e.kind==='boss'&&e.hp>0)bossSpawned=false;e.telegraph.dispose();e.dispose();enemies.splice(i,1);continue;}
      e.healthBar.rotation.y=Math.atan2(follow.camera.position.x-e.group.position.x,follow.camera.position.z-e.group.position.z);
      e.bar.scale.x=e.hp/e.maxHp;e.bar.position.x=-(1-e.hp/e.maxHp)*e.spec.size*.325;e.bar.visible=e.barBack.visible=e.hp<e.maxHp||d<2;
      const progress=attackProgress(e.mode,e.timer,e.windup,e.attackDuration,e.recovery);
      e.ring.visible=false;e.telegraph.update(e.mode,progress,e.origin,e.direction);
      e.update(dt,{time:e.age,moving:e.mode==='approach'&&e.stun<=0&&grace<=0?1:0,direction:e.direction,mode:e.mode,progress:Math.max(0,Math.min(1,progress)),flash:e.flash,enraged:e.enraged});
      if(e.kind==='boss'&&e.hp<e.maxHp*.5&&!e.enraged){e.enraged=true;ui.toast('The Warden’s crown breaks free — its attacks quicken.');burst(e.group.position,'#c99dd4',20);}
      if(e.stun>0||grace>0)continue;
      if(e.mode==='approach'){
        e.direction.copy(p).sub(e.group.position).setY(0).normalize();
        if(d<e.attack.reach*.9&&lineClear(e.group.position,p,0)&&enemies.filter(other=>other!==e&&['windup','strike'].includes(other.mode)).length<2){e.mode='windup';e.windup=windupDuration(e.kind,e.enraged);e.timer=e.windup;e.origin.copy(e.group.position);sound(e.attack.sound,.16,'triangle',.025);}
        else if(d>0){const sideStep=e.kind==='imp'&&d>1.2?Math.sin(e.age*3)*.35:0;moveEnemy(e,e.direction.x+e.direction.z*sideStep,e.direction.z-e.direction.x*sideStep,dt);}
      } else if(e.mode==='windup'){
        // Facing is locked during the tell: a sideways dodge can avoid the blow.
        e.timer-=dt;
        if(e.timer<=0){e.mode='strike';e.timer=e.attackDuration;e.hit=false;}
      } else if(e.mode==='strike'){
        e.timer-=dt;
        if(e.kind==='wolf'){const t=Math.min(1,(1-e.timer/e.attackDuration)/e.attack.hitAt),x=e.origin.x+e.direction.x*e.attack.leap*t,z=e.origin.z+e.direction.z*e.attack.leap*t;if(lineClear(e.group.position,{x,z},.1))e.group.position.set(x,world.heightAt(x,z)||0,z);}
        if(!e.hit&&e.timer<=e.attackDuration*(1-e.attack.hitAt)){e.hit=true;damagePlayer(e);if(e.kind==='boss'){burst(e.group.position,'#bd8ecb',15);sound(50,.25,'sawtooth',.03);}}
        if(e.timer<=0){e.mode='recover';e.recovery=e.spec.cooldown*(e.enraged?.75:1);e.timer=e.recovery;}
      } else {e.timer-=dt;if(e.timer<=0)e.mode='approach';}
    }
    const warning=enemies.filter(e=>e.mode==='windup').sort((a,b)=>a.timer-b.timer)[0];
    ui.threat(warning?{name:warning.spec.name,attack:warning.attack.name,hint:warning.attack.hint,progress:1-warning.timer/warning.windup}:null);
  }
  function updateEffects(dt){for(let i=effects.length-1;i>=0;i--){const e=effects[i];e.life-=dt;if(e.life<=0){disposeObject(e.mesh);effects.splice(i,1);continue;}e.mesh.material.opacity=e.life/e.max;if(e.slash)e.mesh.scale.multiplyScalar(1+dt*1.7);else{e.vy-=dt*4;e.mesh.position.x+=e.vx*dt;e.mesh.position.z+=e.vz*dt;e.mesh.position.y+=e.vy*dt;e.mesh.rotation.x+=dt*6;e.mesh.rotation.z+=dt*4;}}}
  function onKey(e){
    if(e.metaKey||e.ctrlKey||e.altKey||!started)return;
    if(e.code==='Escape'){e.preventDefault();if(game.atlasmap.open)return;if(panel)closePanel();else openPanel('pause');return;}
    if(blocked())return;
    if(['Space','KeyJ','KeyK','KeyQ','KeyH','KeyE','KeyR','Digit1','Digit2','Digit3'].includes(e.code))e.preventDefault();
    if(e.repeat)return;
    if(e.code==='KeyJ'){heldLight=true;mouseHeld=false;strike(false);}if(e.code==='KeyK'){heldHeavy=true;mouseHeld=false;strike(true);}if(e.code==='Space')dodge();if(e.code==='KeyH')potion();
    if(e.code==='KeyQ'){if(!attack&&dash<=0){guarding=true;targetFacing(pointerActive);}}
    if(e.code==='KeyE')interact();
    if(e.code==='KeyR')openPanel('journal');if(/^Digit[123]$/.test(e.code))equip(+e.code.at(-1)-1);
  }
  function onUp(e){if(e.code==='KeyQ')guarding=false;if(e.code==='KeyJ')heldLight=false;if(e.code==='KeyK')heldHeavy=false;}
  const canvas=document.getElementById('atlas');
  function point(e){const r=canvas.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ndc,follow.camera);pointerActive=!!ray.ray.intersectPlane(plane,aim);}
  function onPointer(e){if(e.pointerType==='touch'||blocked()||e.button>2||e.button===1)return;e.preventDefault();point(e);mouseHeld=true;if(e.button===2)heldHeavy=true;else heldLight=true;strike(e.button===2,true);}
  function pointerUp(){if(mouseHeld){heldLight=heldHeavy=mouseHeld=false;}}
  function onBlur(){guarding=false;heldLight=heldHeavy=mouseHeld=false;if(started&&!panel&&!game.atlasmap.open)openPanel('pause');}
  function onVisibility(){if(document.hidden)onBlur();}
  window.addEventListener('keydown',onKey);window.addEventListener('keyup',onUp);window.addEventListener('blur',onBlur);document.addEventListener('visibilitychange',onVisibility);canvas.addEventListener('pointerdown',onPointer);canvas.addEventListener('pointermove',point);window.addEventListener('pagehide',persist);window.addEventListener('pointerup',pointerUp);window.addEventListener('pointercancel',pointerUp);
  return {
    modal,
    ready(){ready=true;campPos.copy(traveller.position);for(const [x,z] of [[.65,.25],[-.65,.25],[0,.65]]){if(traveller.canPass(campPos.x+x,campPos.z+z)){campPos.x+=x;campPos.z+=z;break;}}campPos.y=world.heightAt(campPos.x,campPos.z)||0;camp.group.position.copy(campPos);npcs[0].placed=true;placeFriends();ui.ready();},
    preUpdate(dt,input){
      if(blocked()){state.combatSpeed=1;return {x:0,z:0};}
      lastInput.x=input.x;lastInput.z=input.z;state.combatSpeed=guarding?.4:attack?.65:1;
      if(dash>0){state.combatSpeed=3.4/(state.speedMul||1);return {x:dashDir.x,z:dashDir.z};}
      return input;
    },
    update(dt){
      updateFriends(dt);
      ui.mapping(game.atlasmap.open);
      if(blocked())return;
      clock+=dt;cooldown=Math.max(0,cooldown-dt);dash=Math.max(0,dash-dt);invincible=Math.max(0,invincible-dt);grace=Math.max(0,grace-dt);
      stamina=Math.min(100,stamina+dt*(guarding?9:cooldown>0?12:30));
      traveller.model.visible=invincible<=0||Math.floor(clock*18)%2===0||dash>0;
      guardRing.visible=guarding;
      if(attack){
        attack.t+=dt;traveller.face(attack.direction.x,attack.direction.z);
        const pose=swingPose(attack.t,attack.duration,attack.combo,attack.w.id,attack.heavy);
        weaponPivot.rotation.set(pose.tilt,pose.yaw,-.12);
        weaponPivot.position.z=.05+pose.extension;
        traveller.combatPose(pose);
        if(!attack.hit&&attack.t>=attack.hitAt){attack.hit=true;hitEnemies(attack);}
        if(attack&&attack.t>=attack.duration)attack=null;
      } else {weaponPivot.rotation.set(.24,0,-.35);weaponPivot.position.z=.05;}
      if(!attack&&cooldown<=0&&(heldLight||heldHeavy))strike(heldHeavy,mouseHeld);
      if(guarding)traveller.face(facing.x,facing.z);
      updateEnemies(dt);updateEffects(dt);
      spawnTimer-=dt;
      if(spawnTimer<=0){
        if(save.kills>=10&&!save.bossDefeated&&!bossSpawned){bossSpawned=spawn('boss');if(bossSpawned)ui.toast('The Hollow Warden has entered the story.');}
        else if(enemies.filter(e=>e.kind!=='boss').length<(save.bossDefeated?3:save.kills>=4?4:2)){
          const roll=random(),kind=save.kills<3?'imp':save.kills<7?(roll<.6?'imp':'wolf'):(roll<.3?'imp':roll<.65?'wolf':'knight');spawn(kind);
        }spawnTimer=save.kills>=10&&!bossSpawned&&!save.bossDefeated?2:4.5;
      }
      hudTimer-=dt;if(hudTimer<=0){hudTimer=.1;const boss=enemies.find(e=>e.kind==='boss');ui.update(save,health,stamina,nearbyCharacter()?.id,world.biomeAt(traveller.position.x,traveller.position.z).replace('heartland','The Heartland').replace('pinewood','The Pinewood').toUpperCase(),boss,guarding);const target=boss?.group.position||campPos,dx=target.x-traveller.position.x,dz=target.z-traveller.position.z;const right=new THREE.Vector3().setFromMatrixColumn(follow.camera.matrixWorld,0),dist=Math.hypot(dx,dz);ui.waypoint(`${boss?'Hollow Warden':'Mara’s waystation'} · ${dist.toFixed(0)}m`,Math.atan2(dx*right.x+dz*right.z,-(-dx*right.z+dz*right.x)));}
    },
    snapshot(){return {save:{...save},health,stamina,started,panel,dash,guarding,attack:attack?.heavy?'heavy':attack?'light':null,position:{x:traveller.position.x,z:traveller.position.z},camp:{x:campPos.x,z:campPos.z},npcs:npcs.map(n=>({id:n.id,placed:n.placed,x:n.group.position.x,z:n.group.position.z})),delivery:courierQuest(save),enemies:enemies.map(e=>({kind:e.kind,hp:e.hp,mode:e.mode,timer:+e.timer.toFixed(2),windup:e.windup,attack:e.attack.name,origin:{x:e.origin.x,z:e.origin.z},direction:{x:e.direction.x,z:e.direction.z},x:e.group.position.x,z:e.group.position.z})),quest:questFor(save)};},
    dispose(){persist();clearEnemies();for(const e of effects)disposeObject(e.mesh);for(const n of npcs)n.dispose();disposeObject(weaponMesh);disposeObject(guardRing);weaponPivot.removeFromParent();ui.dispose();audioCtx?.close();window.removeEventListener('keydown',onKey);window.removeEventListener('keyup',onUp);window.removeEventListener('blur',onBlur);window.removeEventListener('pagehide',persist);window.removeEventListener('pointerup',pointerUp);window.removeEventListener('pointercancel',pointerUp);document.removeEventListener('visibilitychange',onVisibility);canvas.removeEventListener('pointerdown',onPointer);canvas.removeEventListener('pointermove',point);},
  };
}
