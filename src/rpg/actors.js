import * as THREE from 'three';
import { createWeapon, disposeObject } from './art.js';
import { cardstockPrint, cardGeometry, paperRectangle, paperDisc, foldedPaperBox } from './cardstock.js';

// Articulated puppets made of printed cardstock; local +Z is forward.
// Folded boxes and simple faceted volumes carry the same paper finish as the hero;
// masks, shields, cloth, and crown details remain thin cut sheets.
export function createActor(kind, size = 1, {paperMaterials=null} = {}) {
  const group = new THREE.Group(), rig = new THREE.Group();
  group.add(rig); rig.scale.setScalar(size);
  const materials = [], joints = {};
  const cutout=['imp','wolf','knight','boss'].includes(kind),layerDepth=1;
  const mat = (color, glow = false) => {
    const template=paperMaterials?.paper({color,side:THREE.DoubleSide,variant:'traveller',...(glow?{emissive:color,emissiveIntensity:.75}:{})});
    const m=template?template.clone():new THREE.MeshLambertMaterial({color,side:THREE.DoubleSide,...(glow?{emissive:color,emissiveIntensity:.75}:{})});
    // Own the clone so per-enemy hit flashes/disposal never change another figure.
    if(template){m.onBeforeCompile=template.onBeforeCompile;m.customProgramCacheKey=template.customProgramCacheKey;}
    m.map=cardstockPrint();
    m.userData.baseGlow = glow ? .75 : 0; materials.push(m); return m;
  };
  const ink = mat('#283f48'), cream = mat('#ead8ad'), gold = mat('#b68b48');
  const skin = mat(kind === 'imp' ? '#8ba994' : '#d4ac80');
  const armor = mat(kind === 'boss' ? '#69536f' : '#637b7e');
  const cloth = mat(kind === 'camp' ? '#4c786d' : kind === 'courier' ? '#71834f' : kind === 'moth' ? '#8e739f' : '#a96247');
  const edge = mat('#f1dfb8');
  const dark = mat('#39404c'), glow = mat(kind === 'boss' ? '#d4a0ee' : '#ffd78a', true);
  function mesh(parent, geometry, material, x=0, y=0, z=0) {
    const m = new THREE.Mesh(geometry, geometry.userData.cardstock?[material,edge]:material); m.position.set(x,y,z*layerDepth); m.castShadow=true; m.receiveShadow=true; parent.add(m); return m;
  }
  const box = (p,w,h,d,m,x=0,y=0,z=0) => mesh(p,cutout?(d>=.085&&Math.min(w,h)>.055?foldedPaperBox(w,h,d):paperRectangle(w,h)):new THREE.BoxGeometry(w,h,d),m,x,y,z);
  const orb = (p,r,m,x=0,y=0,z=0) => mesh(p,cutout&&r<=.07?paperDisc(r):new THREE.IcosahedronGeometry(r,0),m,x,y,z);
  const cone = (p,r,h,m,x=0,y=0,z=0,n=5) => mesh(p,cutout?cardGeometry([[-r,-h/2],[r,-h/2],[r*.08,h/2]]):new THREE.ConeGeometry(r,h,n),m,x,y,z);
  const joint = (name,parent,x,y,z) => {const g=new THREE.Group();g.name=name;g.position.set(x,y,z*layerDepth);parent.add(g);joints[name]=g;return g;};
  function limb(name, parent, x, y, z, length, width, material, boot = false) {
    const pivot=joint(name,parent,x,y,z);box(pivot,width,length,.12,material,0,-length/2,0);
    if(cutout){orb(pivot,width*.18,gold,0,-.025,.06);box(pivot,width*.45,.018,.01,cream,0,-length*.55,.04);}
    if(boot)box(pivot,width*1.25,.09,.19,ink,0,-length+.025,.035);
    else orb(pivot,width*.55,skin,0,-length,0);
    return pivot;
  }
  function lantern(parent,x,y,z) {
    const l=joint('lantern',parent,x,y,z);
    box(l,.11,.16,.1,gold);box(l,.075,.115,.108,glow);
    cone(l,.09,.07,ink,0,.11,0,4);box(l,.02,.11,.02,ink,0,.16,0);
  }
  if(kind === 'wolf') {
    const body=joint('body',rig,0,.36,0);box(body,.32,.27,.58,armor);
    const head=joint('head',body,0,.1,.3);orb(head,.19,ink);box(head,.19,.12,.22,dark,0,-.045,.16);
    for(const side of [-1,1]) {
      cone(head,.075,.2,armor,side*.13,.18,-.025,3).rotation.z=-side*.25;
      box(head,.045,.035,.028,glow,side*.105,.035,.17);
      cone(head,.025,.08,cream,side*.075,-.1,.2,3).rotation.z=Math.PI;
      for(const back of [-1,1])limb(`leg${side}${back}`,body,side*.15,-.02,back*.2,.31,.085,ink,true);
    }
    for(let i=0;i<5;i++)cone(body,.07,.18,cloth,0,.2,-.23+i*.1,3).rotation.x=-.55;
    const tail=joint('tail',body,0,.03,-.3);cone(tail,.09,.38,armor,0,.06,-.15,4).rotation.x=-1;
    box(body,.35,.055,.08,gold,0,.025,.17);
  } else {
    const boss=kind==='boss', knight=kind==='knight'||boss, npc=['camp','courier','moth'].includes(kind);
    const body=joint('body',rig,0,.43,0);
    box(body,knight?.32:.27,.32,.18,knight?armor:cloth,0,.12,0);
    if(cutout)for(const side of [-1,1]){const fold=box(body,.085,.29,.01,cloth,side*.12,.12,-.045);fold.rotation.y=side*.6;}
    box(body,.29,.055,.21,gold,0,-.025,.005);
    box(body,.075,.065,.025,cream,.03,-.025,.12);
    const head=joint('head',body,0,.38,0);
    orb(head,.16,knight?armor:skin,0,.03,0);
    if(cutout)mesh(head,paperDisc(.14),knight?armor:skin,0,.03,.142);
    box(head,.16,.04,.03,ink,0,.04,cutout?.16:.14);
    for(const side of [-1,1])box(head,.035,.028,.02,npc?ink:glow,side*.052,.045,cutout?.183:.161);
    const left=limb('armL',body,-.205,.25,0,.27,.09,knight?armor:cloth);
    const right=limb('armR',body,.205,.25,0,.27,.09,knight?armor:cloth);
    for(const side of [-1,1]) {
      const leg=limb(side<0?'legL':'legR',rig,side*.085,.39,0,.33,.1,knight?armor:dark,true);
      if(knight){orb(body,.1,armor,side*.205,.27,0);box(leg,.12,.13,.04,gold,0,-.15,.075);}
    }
    const cape=joint('cape',body,0,.23,-.115);
    const cloak=cone(cape,.24,.48,boss?dark:cloth,0,-.22,-.025,4);cloak.scale.z=.24;
    if(knight) {
      box(head,.035,.25,.035,gold,0,.05,.165);
      cone(head,.05,.23,cloth,0,.25,-.015,4).rotation.x=-.4;
      const shield=box(left,.23,.3,.055,boss?gold:ink,0,-.22,.09);shield.rotation.z=-.12;
      box(left,.15,.21,.025,armor,0,-.22,.125);box(left,.025,.15,.025,cream,0,-.22,.145);
      const weapon=createWeapon(boss?1:0);weapon.traverse(m=>{if(m.isMesh){const previous=m.material;m.material=mat('#'+previous.color.getHexString());previous.dispose();}});weapon.rotation.x=Math.PI*.45;weapon.position.set(0,-.27,.025);weapon.scale.setScalar(boss?1.45:1.05);right.add(weapon);
      box(body,.2,.15,.035,ink,0,.14,.11);orb(body,.055,glow,0,.14,.145);
      if(boss) {
        const crown=joint('crown',head,0,.19,0);
        for(let i=0;i<7;i++){const a=i*Math.PI*2/7;cone(crown,.045,.2+(i%2)*.08,gold,Math.sin(a)*.16,.1,Math.cos(a)*.16,3);}
        for(const side of [-1,1])for(let i=0;i<3;i++){const page=box(cape,.14,.4,.025,cream,side*(.1+i*.06),-.27,-.025-i*.025);page.rotation.z=side*(.2+i*.18);}
      }
    } else if(kind==='imp') {
      for(const side of [-1,1]){const ear=cone(head,.08,.23,skin,side*.16,.1,0,3);ear.rotation.z=-side*.9;}
      cone(head,.16,.27,cloth,0,.23,-.025,4).rotation.z=-.3;
      box(body,.32,.075,.23,cloth,0,.26,.01);
      for(let i=0;i<4;i++)box(body,.025,.008,.01,cream,-.1+i*.065,.26,.055);
      const scarf=box(cape,.1,.25,.025,cloth,-.12,-.07,-.06);scarf.rotation.z=.5;
      const quill=cone(right,.07,.46,cream,0,-.22,.21,3);quill.rotation.x=1.25;
      box(right,.03,.03,.25,ink,0,-.27,.08);orb(left,.085,ink,0,-.26,.01);
      box(body,.12,.14,.07,dark,-.14,.03,.09);
    } else if(kind==='camp') {
      cone(head,.24,.2,cloth,0,.19,0,6);box(head,.5,.025,.26,cloth,0,.1,0);
      box(body,.2,.22,.04,cream,0,.07,.12);
      const map=box(left,.23,.19,.02,cream,0,-.22,.12);map.rotation.x=-.5;
      box(map,.015,.14,.007,gold,0,0,.015);box(map,.14,.015,.007,cloth,0,.01,.015);
      lantern(right,0,-.36,.04);
      for(let i=0;i<3;i++){const roll=mesh(body,new THREE.CylinderGeometry(.035,.035,.31,6),cream,.1-i*.075,.07,-.19);roll.rotation.z=.15;}
    } else if(kind==='courier') {
      cone(head,.3,.18,cloth,0,.2,0,8);orb(head,.25,mat('#bd6949'),0,.2,0).scale.y=.42;
      for(const [x,z] of [[-.13,.12],[.11,.13],[0,-.14]])orb(head,.04,cream,x,.28,z).scale.y=.2;
      const pack=box(body,.35,.3,.19,cream,0,.1,-.19);pack.rotation.z=.1;
      for(const x of [-.1,.1])box(body,.035,.35,.025,gold,x,.1,-.3);
      box(right,.17,.11,.025,cream,0,-.24,.06);box(right,.05,.025,.03,cloth,0,-.24,.08);
      box(body,.22,.025,.23,gold,0,.13,.02).rotation.z=.6;
    } else if(kind==='moth') {
      for(const side of [-1,1]){
        const wing=joint(side<0?'wingL':'wingR',body,side*.12,.22,-.11);
        const paper=orb(wing,.29,cream,side*.15,.06,-.025);paper.scale.set(.8,1.25,.12);
        orb(wing,.09,cloth,side*.18,.11,-.065).scale.z=.2;
        orb(wing,.045,gold,side*.18,.11,-.085).scale.z=.25;
        box(head,.018,.19,.018,ink,side*.09,.2,0).rotation.z=-side*.4;
        orb(head,.035,glow,side*.13,.3,0);
      }
      box(head,.23,.12,.18,cloth,0,.16,-.01);box(body,.16,.18,.025,gold,0,.08,.11);
      lantern(right,0,-.34,.06);
    }
  }
  const shadow=mesh(group,new THREE.CircleGeometry(size*.24,24),new THREE.MeshBasicMaterial({color:'#17282d',transparent:true,opacity:.23,depthWrite:false}),0,.018,0);shadow.rotation.x=-Math.PI/2;shadow.castShadow=false;
  const ring=mesh(group,new THREE.RingGeometry(size*.37,size*.41,40),new THREE.MeshBasicMaterial({color:'#e57359',side:THREE.DoubleSide,transparent:true,opacity:.7,depthWrite:false}),0,.025,0);ring.rotation.x=-Math.PI/2;ring.visible=false;ring.castShadow=false;
  let gait=0,phase=0,heading=0;
  return {group,rig,ring,joints,
    update(dt,{time=0,moving=0,direction=null,mode='idle',progress=0,flash=0,enraged=false,talking=false}={}) {
      if(direction&&(direction.x||direction.z)) {
        const want=Math.atan2(direction.x,direction.z),delta=Math.atan2(Math.sin(want-heading),Math.cos(want-heading));
        heading+=delta*(1-Math.exp(-dt*14));rig.rotation.y=heading;
      }
      gait+=(moving-gait)*(1-Math.exp(-dt*12));phase+=dt*(kind==='wolf'?13:10)*gait;
      const walk=Math.sin(phase)*.65*gait,breathe=Math.sin(time*2.1)*.018;
      rig.position.y=Math.abs(Math.sin(phase))*.025*gait+breathe;
      const body=joints.body,head=joints.head;
      body.rotation.set(gait*.09,Math.sin(phase)*gait*.07,Math.sin(time*1.6)*.025);
      head.rotation.set(Math.sin(time*2)*.04,Math.sin(time*.8)*.12,0);
      if(kind==='wolf') {
        for(const side of [-1,1])for(const back of [-1,1])joints[`leg${side}${back}`].rotation.x=walk*side*back;
        joints.tail.rotation.y=Math.sin(time*6)*.3;
        if(mode==='windup'){body.rotation.x=-.22;rig.position.y-=.05*progress;head.rotation.x=-.25;}
        if(mode==='strike'){rig.position.y+=Math.sin(progress*Math.PI)*.15;body.rotation.x=.22;}
      } else {
        joints.legL.rotation.x=walk;joints.legR.rotation.x=-walk;
        joints.armL.rotation.set(-walk*.6,0,.1);joints.armR.rotation.set(walk*.6,0,-.1);
        joints.cape.rotation.x=.1+Math.sin(time*3)*.07+gait*.15;
        if(mode==='windup'){joints.armR.rotation.x=-1.7*progress;body.rotation.y=-.55*progress;joints.armL.rotation.x=-.6;head.rotation.x=-.13;}
        if(mode==='strike'){const swing=Math.sin(Math.min(1,progress*1.7)*Math.PI/2);joints.armR.rotation.x=-1.7+2.7*swing;body.rotation.y=-.55+1.1*swing;body.rotation.x=.18*swing;}
        if(mode==='recover'){joints.armR.rotation.x=.65*(1-progress);body.rotation.x=.1*(1-progress);}
        if(talking){joints.armL.rotation.z=.35+Math.sin(time*3)*.12;head.rotation.x=Math.sin(time*4)*.08;}
      }
      if(joints.lantern)joints.lantern.rotation.z=Math.sin(time*2.7)*.12;
      if(joints.wingL){joints.wingL.rotation.y=Math.sin(time*3)*.16-.2;joints.wingR.rotation.y=-Math.sin(time*3)*.16+.2;}
      if(joints.crown){joints.crown.rotation.y=enraged?time*.5:0;joints.crown.position.y=.19+(enraged?.08+Math.sin(time*3)*.03:0);}
      for(const m of materials){m.emissive.set(flash>0?'#e2b98b':m.userData.baseGlow?m.color:0x000000);m.emissiveIntensity=flash>0?.8:m.userData.baseGlow*(enraged?1.7:1);}
      if(flash>0)body.rotation.z=-.12;
    },
    dispose(){disposeObject(group);},
  };
}
