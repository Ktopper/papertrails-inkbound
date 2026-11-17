import * as THREE from 'three';

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
