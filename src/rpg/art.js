import * as THREE from 'three';

// Original, local cut-paper illustrations. No image service or remote asset dependency.
const textures = new Map();
function portrait(kind) {
  if (textures.has(kind)) return textures.get(kind);
  const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
  const c = canvas.getContext('2d');
  c.lineJoin = 'round'; c.lineWidth = 5;
  const shape = (points, fill, stroke = '#eee0c3') => {
    c.beginPath(); points.forEach(([x,y],i) => i ? c.lineTo(x,y) : c.moveTo(x,y)); c.closePath();
    c.fillStyle = fill; c.fill(); c.strokeStyle = stroke; c.stroke();
  };
  const eye = (x,y,w=16) => { c.fillStyle = '#ffd77d'; c.fillRect(x,y,w,7); c.fillStyle='#fff4ca'; c.fillRect(x+3,y,5,5); };
  if (kind === 'wolf') {
    shape([[24,193],[34,122],[18,70],[71,99],[118,68],[182,87],[227,144],[204,162],[186,153],[170,195],[176,228],[147,228],[130,179],[81,180],[65,227],[38,228]], '#3e555b');
    shape([[71,100],[120,84],[144,119],[108,157],[53,151]],'#71817b','#263b42');
    shape([[178,94],[204,119],[227,144],[196,147],[180,135]],'#21363b','#21363b');
    eye(168,119,13);
    shape([[197,149],[201,165],[208,150]], '#f4e8cf','#f4e8cf');
  } else if (kind === 'camp') {
    shape([[75,230],[86,166],[71,113],[91,90],[95,65],[132,40],[160,61],[170,93],[191,118],[177,172],[188,230]],'#50776c');
    shape([[95,99],[110,74],[148,73],[163,102],[151,128],[111,128]],'#eac79c');
    shape([[72,91],[106,38],[150,35],[178,91]],'#b96943');
    shape([[72,160],[119,169],[151,149],[185,166],[172,213],[125,201],[88,212]],'#f1dfb8');
    c.strokeStyle='#877750';c.lineWidth=2;c.beginPath();c.moveTo(125,175);c.lineTo(125,198);c.moveTo(95,182);c.lineTo(113,178);c.moveTo(140,176);c.lineTo(165,181);c.stroke();
  } else {
    const boss = kind === 'boss', knight = kind === 'knight' || boss;
    const ink = boss ? '#47384d' : knight ? '#41505c' : '#395d5b';
    shape([[69,235],[83,167],[58,132],[82,97],[79,57],[105,75],[128,48],[153,76],[184,54],[174,103],[199,134],[173,173],[190,235],[153,221],[129,240],[104,221]], ink);
    shape([[85,110],[103,88],[151,88],[173,111],[158,151],[128,163],[98,147]],knight ? '#89918e':'#638c7f','#243a3e');
    shape([[95,114],[124,121],[120,134],[97,126]],'#23383d','#23383d');
    shape([[135,121],[162,112],[160,126],[138,134]],'#23383d','#23383d');
    eye(99,119,18);eye(139,119,18);
    shape([[108,145],[128,150],[147,144],[128,157]],'#e8d8b8','#e8d8b8');
    shape([[92,168],[128,181],[165,167],[151,205],[128,216],[105,202]],boss?'#9a637b':'#718378','#243a3e');
    c.strokeStyle='#c1af7e';c.lineWidth=3;c.beginPath();c.moveTo(128,185);c.lineTo(128,206);c.moveTo(117,194);c.lineTo(139,194);c.stroke();
    if (knight) {
      shape([[47,118],[55,90],[62,118],[62,224],[48,224]],'#cbc8b3');
      shape([[35,175],[72,175],[72,183],[35,183]],'#b1965e');
      shape([[174,145],[213,150],[210,196],[191,212],[173,189]],'#788782');
    }
    if (boss) shape([[79,78],[69,32],[103,53],[128,19],[152,53],[187,32],[177,78]],'#bc9e5d');
  }
  // Tiny ink hatching makes the flat shapes feel printed on cardstock.
  c.save();c.globalCompositeOperation='source-atop';c.strokeStyle='rgba(35,28,27,.11)';c.lineWidth=1;
  for(let y=7;y<256;y+=6){ c.beginPath();c.moveTo(0,y);c.lineTo(256,y-25);c.stroke(); } c.restore();
  const texture = new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  textures.set(kind,texture);return texture;
}
export function createPaperActor(kind, size) {
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({map:portrait(kind),transparent:true,alphaTest:.2,side:THREE.DoubleSide,roughness:1});
  const card = new THREE.Mesh(new THREE.PlaneGeometry(size,size),material);card.position.y=size*.48;card.castShadow=true;group.add(card);
  const shadow = new THREE.Mesh(new THREE.CircleGeometry(size*.24,24),new THREE.MeshBasicMaterial({color:'#292432',opacity:.19,transparent:true,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=.018;group.add(shadow);
  const ring = new THREE.Mesh(new THREE.RingGeometry(size*.37,size*.41,40),new THREE.MeshBasicMaterial({color:'#e57359',side:THREE.DoubleSide,transparent:true,opacity:.7,depthWrite:false}));
  ring.rotation.x=-Math.PI/2;ring.position.y=.024;ring.visible=false;group.add(ring);
  return {group,card,material,ring,dispose(){group.traverse(o=>{o.geometry?.dispose();if(o.material)o.material.dispose();});group.removeFromParent();}};
}
export function createWeapon(index) {
  const group=new THREE.Group();
  const steel=new THREE.MeshStandardMaterial({color:index===2?'#b9ded4':'#e2d6b1',metalness:.25,roughness:.65});
  const wood=new THREE.MeshStandardMaterial({color:'#80513b',roughness:1});
  const gold=new THREE.MeshStandardMaterial({color:'#c4944f',roughness:.8});
  const box=(w,h,d,y,mat,x=0)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,0);m.castShadow=true;group.add(m);};
  box(.035,index===2?.48:.15,.035,index===2?.12:0,wood);
  if(index===1){box(.036,.3,.04,.17,wood);box(.22,.16,.035,.28,steel,.065);box(.045,.05,.048,.34,gold);}
  else {box(index===2?.065:.06,index===2?.22:.33,.018,index===2?.42:.23,steel);box(index===2?.1:.18,.025,.04,.065,gold);}
  return group;
}
export function disposeObject(group) {group.traverse(o=>{o.geometry?.dispose();if(o.material) (Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose());});group.removeFromParent();}
