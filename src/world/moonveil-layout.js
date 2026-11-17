import { hash2, mulberry32 } from '../core/rng.js';

export const CHUNK_SIZE=12;
export const REGIONS=[
  {name:'Moonveil Ruins',color:'#b4c9be',trees:['moon:0','darkpine_0','darkpine_2','birch_1'],small:['moon:3','moon:2','fern_1','mossy_log_0'],landmarks:['moon:1','moon:4','watchtower_0']},
  {name:'Mosswood Wilds',color:'#bbcba6',trees:['darkpine_1','darkpine_3','giant_mushroom_0','giant_mushroom_1'],small:['fern_0','fern_1','mossy_log_0','stump_1','mossy_boulder_0'],landmarks:['stilt_cabin_0','giant_mushroom_2','watchtower_0']},
  {name:'Frostleaf Heights',color:'#d1e1df',trees:['snowpine_0','snowpine_2','snowpine_4','birch_0'],small:['snowbush_0','ice_rock_0','snowdrift_0','woodpile_0'],landmarks:['cabin_front_0','igloo_0','snowman_0']},
  {name:'Amberfall Hamlets',color:'#dbc5a0',trees:['trees_a_1','trees_a_3','trees_b_0','trees_b_4'],small:['bushes_2','barrels_0','hay_bales_0','pumpkin_cart_0','guidepost_0'],landmarks:['houses_3','market_stall_0','stone_tower_0','barn_front_0']},
  {name:'Blossom Reach',color:'#dfc5cd',trees:['blossom_tree_0','blossom_tree_1','blossom_tree_white_0','birch_1'],small:['flower_bed_0','flower_bed_1','bench_0','stone_lantern_0'],landmarks:['gazebo_0','greenhouse_0','wisteria_arch_0','fountain_0']},
];
export function regionAt(seed,x,z){const rx=Math.floor((x+18)/36),rz=Math.floor((z+18)/36);return rx===0&&rz===0?REGIONS[0]:REGIONS[1+hash2(rx,rz,seed^0x827a)%4];}
export function pathDistance(x,z){return Math.min(Math.abs(x-Math.round(x/CHUNK_SIZE)*CHUNK_SIZE),Math.abs(z-Math.round(z/CHUNK_SIZE)*CHUNK_SIZE));}
export function chunkLayout(seed,cx,cz) {
  const random=mulberry32(hash2(cx,cz,seed)),x=cx*CHUNK_SIZE,z=cz*CHUNK_SIZE,region=regionAt(seed,x,z),props=[];
  const pick=list=>list[Math.floor(random()*list.length)];
  const add=(asset,px,pz,size,block=.2,rotation=0)=>props.push({asset,x:px,z:pz,size,block,rotation});
  // Four open avenues meet at every chunk centre. Props never seal a chunk edge.
  for(const sx of [-1,1])for(const sz of [-1,1]){
    add(pick(region.trees),x+sx*(3.2+random()*1.3),z+sz*(3+random()*1.7),2.2+random()*1.2,.25,(random()-.5)*.5);
    add(pick(region.small),x+sx*(1.9+random()*1.2),z+sz*(2+random()*2.9),.65+random()*.6,0,(random()-.5)*.5);
    add(pick(region.small),x+sx*(4.5+random()*.6),z+sz*1.8,.6+random()*.65,0);
  }
  const landmark=pick(region.landmarks);
  if(landmark==='moon:1'||landmark==='wisteria_arch_0')add(landmark,x,z-3.2,3.2,0);
  else add(landmark,x+2.8,z+2.8,2.1+random()*.5,.5);
  add(region===REGIONS[0]?'moon:5':'lamp_post_0',x-1.9,z+.7,1.05,.13);
  if(cx===0&&cz===0){props.length=0;add('moon:1',0,-3,3.1,0);add('moon:5',1.9,1.6,1.1,.19);add('moon:2',-2.1,-1.4,1.4,.27);add('moon:0',-3.8,-3,3.2,.25);add('darkpine_1',3.6,-3.4,3.1,.25);add('giant_mushroom_0',-3.6,3.6,1.8,.2);add('birch_1',3.8,3.5,3,.25);add('moon:3',-1.9,-3.8,1,0);add('fern_1',2.1,-4.3,.8,0);add('guidepost_0',-1.7,.6,.8,.1);}
  return {cx,cz,x,z,region,props};
}

export function residentCoordinates(x,z,radius=2){const cx=Math.round(x/CHUNK_SIZE),cz=Math.round(z/CHUNK_SIZE),coords=[];for(let dz=-radius;dz<=radius;dz++)for(let dx=-radius;dx<=radius;dx++)coords.push([cx+dx,cz+dz]);return coords;}
