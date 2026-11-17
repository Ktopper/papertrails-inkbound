import * as THREE from 'three';
import { attackOutline } from './enemy-attacks.js';

export function createTelegraph(attack) {
  const group=new THREE.Group();group.visible=false;
  const points=attackOutline(attack),shape=new THREE.Shape(points.map(([x,z])=>new THREE.Vector2(x,-z)));
  const material=new THREE.MeshBasicMaterial({color:attack.color,transparent:true,opacity:.1,side:THREE.DoubleSide,depthWrite:false,depthTest:true});
  const fill=new THREE.Mesh(new THREE.ShapeGeometry(shape),material);fill.rotation.x=-Math.PI/2;fill.renderOrder=8;group.add(fill);
  const outline=new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(points.map(([x,z])=>new THREE.Vector3(x,.005,z))),new THREE.LineBasicMaterial({color:attack.color,transparent:true,opacity:.9,depthTest:false,depthWrite:false}));outline.renderOrder=9;group.add(outline);
  const countdown=new THREE.Mesh(new THREE.RingGeometry(.16,.2,32),new THREE.MeshBasicMaterial({color:'#fff3d4',side:THREE.DoubleSide,depthTest:false,depthWrite:false,transparent:true}));countdown.rotation.x=-Math.PI/2;countdown.position.y=.01;countdown.renderOrder=10;group.add(countdown);
  // A fixed arrow also communicates direction without relying on color.
  if(attack.shape!=='circle'){
    const arrow=new THREE.Line(new THREE.BufferGeometry().setFromPoints([[0,.22],[0,attack.reach*.8],[-.1,attack.reach*.65],[0,attack.reach*.8],[.1,attack.reach*.65]].map(([x,z])=>new THREE.Vector3(x,.008,z))),new THREE.LineBasicMaterial({color:'#fff3d4',depthTest:false,depthWrite:false}));arrow.renderOrder=10;group.add(arrow);
  }
  return {group,update(mode,progress,origin,direction){
    group.visible=mode==='windup'||mode==='strike';if(!group.visible)return;
    group.position.copy(origin);group.position.y+=.045;group.rotation.y=Math.atan2(direction.x,direction.z);
    material.color.set(mode==='strike'?'#fff1dc':attack.color);material.opacity=mode==='strike'?.28:.1+progress*.17;
    countdown.scale.setScalar(Math.max(.12,1-progress*.85));outline.material.opacity=progress>.8?1:.7;
  },dispose(){group.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});group.removeFromParent();}};
}
