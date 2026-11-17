import * as THREE from 'three';

// Fade only scenery intersecting the camera-to-body sight lines. The original
// opaque draw stays in its batch; a temporary transparent copy handles the fade.
export function createPlayerVisibility({scene,world,camera,traveller,artTexture=null}) {
  const fades=new Map(),alphaPixels=new WeakMap(),ray=new THREE.Raycaster();
  const probe=new THREE.Mesh(),matrix=new THREE.Matrix4(),bounds=new THREE.Box3();
  const origin=new THREE.Vector3(),target=new THREE.Vector3(),direction=new THREE.Vector3(),hitPoint=new THREE.Vector3();
  const uv=new THREE.Vector2(),right=new THREE.Vector3(),color=new THREE.Vector4();
  let time=0,nextScan=0;
  const samples=[[0,.17],[0,.38],[0,.64],[-.17,.39],[.17,.39]];

  function hasInk(hit,material) {
    const printed=artTexture&&hit.uv1?.x>0;
    const map=printed?artTexture:material?.map,coords=printed?hit.uv1:hit.uv,threshold=printed?.4:material?.alphaTest;
    if(!map||!coords||!threshold)return true;
    let pixels=alphaPixels.get(map.image);
    if(!pixels) {
      const image=map.image;if(!image)return true;
      if(image.data)pixels=image;
      else {try{const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(image,0,0);pixels=ctx.getImageData(0,0,image.width,image.height);}catch{return true;}}
      alphaPixels.set(image,pixels);
    }
    map.updateMatrix();uv.copy(coords);map.transformUv(uv);
    const x=Math.max(0,Math.min(pixels.width-1,Math.floor(uv.x*pixels.width))),y=Math.max(0,Math.min(pixels.height-1,Math.floor(uv.y*pixels.height)));
    return pixels.data[(y*pixels.width+x)*4+3]/255>=threshold;
  }
  function blocks(source) {
    probe.geometry=source.geometry;probe.material=source.material;probe.matrixWorld.copy(source.matrix);
    if(!probe.geometry.boundingBox)probe.geometry.computeBoundingBox();
    bounds.copy(probe.geometry.boundingBox).applyMatrix4(source.matrix);
    // Floors and low stepping stones should stay solid.
    if(bounds.max.y<traveller.position.y+.2)return false;
    for(const [side,height] of samples) {
      target.copy(traveller.position).addScaledVector(right,side);target.y+=height;
      direction.subVectors(target,origin);const distance=direction.length();direction.normalize();
      ray.set(origin,direction);ray.near=.03;ray.far=Math.max(.03,distance-.08);
      if(!ray.ray.intersectBox(bounds,hitPoint)||hitPoint.distanceTo(origin)>ray.far)continue;
      for(const hit of ray.intersectObject(probe,false)) {
        const m=Array.isArray(source.material)?source.material[hit.face.materialIndex]:source.material;
        if(hasInk(hit,m))return true;
      }
    }return false;
  }
  function copyMaterial(source,fade) {
    const m=source.clone(),before=source.onBeforeCompile,key=source.customProgramCacheKey;
    m.transparent=true;m.depthWrite=false;m.alphaToCoverage=false;m.forceSinglePass=true;
    m.onBeforeCompile=(shader,renderer)=>{
      before.call(source,shader,renderer);shader.uniforms.uSceneryFade=fade;
      shader.fragmentShader='uniform float uSceneryFade;\n'+shader.fragmentShader;
      // Apply after the paper shader's own edge coverage, preserving alpha-cut holes.
      shader.fragmentShader=shader.fragmentShader.replace(/}\s*$/, 'gl_FragColor.a *= uSceneryFade;\n}');
    };
    m.customProgramCacheKey=()=>key.call(source)+'|scenery-fade-v1';return m;
  }
  function startFade(source) {
    const uniform={value:1};
    const material=Array.isArray(source.material)?source.material.map(m=>copyMaterial(m,uniform)):copyMaterial(source.material,uniform);
    let mesh;
    if(source.batch) {
      const g=source.geometry;mesh=new THREE.BatchedMesh(1,g.attributes.position.count,g.index?.count||g.attributes.position.count,material);
      mesh.addInstance(mesh.addGeometry(g));mesh.frustumCulled=false;
    } else {mesh=new THREE.Mesh(source.geometry,material);mesh.matrixAutoUpdate=false;}
    mesh.name='Faded '+source.name;mesh.castShadow=true;mesh.receiveShadow=true;
    scene.add(mesh);const item={source,mesh,uniform,lastHit:time,hidden:false};fades.set(source.key,item);return item;
  }
  function remove(item) {
    if(item.hidden)item.source.show(true);
    scene.remove(item.mesh);if(item.mesh.isBatchedMesh)item.mesh.dispose();
    for(const m of Array.isArray(item.mesh.material)?item.mesh.material:[item.mesh.material])m.dispose();
    fades.delete(item.source.key);
  }
  function sources() {
    const result=[];
    if(world.cards) {
      world.group.updateWorldMatrix(true,true);
      for(const card of world.cards) {
        const mesh=card.mesh;if(!mesh.visible||!mesh.parent.visible||(card.anchor&&!card.anchor.visible))continue;
        result.push({key:mesh.uuid,name:card.asset||`Moonveil ${['tree','arch','crystal','fern','column','lantern'][card.kind]}`,geometry:mesh.geometry,material:mesh.material,matrix:mesh.matrixWorld,show:v=>{mesh.visible=v;}});
      }
    } else if(world.activeTiles) {
      world.group.updateWorldMatrix(true,true);
      for(const rec of world.activeTiles()) {
        if(!rec.shown||rec.group.position.distanceTo(traveller.position)>15)continue;
        for(let i=0;i<rec.meshes.length;i++) {
          const src=rec.meshes[i],{b,id}=rec.inst[i];if(!b.mesh.getVisibleAt(id)||/^base/i.test(src.name))continue;
          b.mesh.getMatrixAt(id,matrix);matrix.premultiply(b.mesh.matrixWorld);
          result.push({key:`${b.mesh.uuid}:${id}:${rec.key}`,name:src.name,geometry:src.geometry,material:b.material,matrix:matrix.clone(),batch:b.mesh,id,show:v=>b.mesh.setVisibleAt(id,v)});
        }
      }
    }return result;
  }
  return {
    // Restore before streaming/folding can recycle an instance or change visibility.
    beforeUpdate(){for(const item of fades.values()){if(item.hidden)item.source.show(true);item.hidden=false;}},
    update(dt) {
      time+=Math.min(.1,Math.max(0,dt));camera.updateMatrixWorld();camera.getWorldPosition(origin);right.setFromMatrixColumn(camera.matrixWorld,0);
      const scan=time>=nextScan;if(scan)nextScan=time+.06;
      const seen=new Set();
      for(const source of sources()) {
        let item=fades.get(source.key);
        if(scan&&blocks(source)){item??=startFade(source);item.lastHit=time;}
        if(!item)continue;seen.add(source.key);item.source=source;
        const obscured=time-item.lastHit<.14,targetOpacity=obscured?.16:1;
        item.uniform.value+=(targetOpacity-item.uniform.value)*(1-Math.exp(-dt*(obscured?18:8)));
        if(!obscured&&item.uniform.value>.995){remove(item);continue;}
        if(source.batch){item.mesh.setMatrixAt(0,source.matrix);source.batch.getColorAt(source.id,color);item.mesh.setColorAt(0,color);}
        else item.mesh.matrix.copy(source.matrix);
        source.show(false);item.hidden=true;
      }
      for(const [key,item] of fades)if(!seen.has(key))remove(item);
    },
    snapshot(){return {faded:[...fades.values()].map(f=>({name:f.source.name,opacity:+f.uniform.value.toFixed(3)}))};},
    dispose(){for(const item of [...fades.values()])remove(item);},
  };
}
