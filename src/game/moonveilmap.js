import { regionAt, CHUNK_SIZE } from '../world/moonveil-layout.js';

export function createMoonveilMap({world,traveller,game,controls,seed}) {
  let open=false,span=48,home=false;
  const panel=document.createElement('section');panel.className='moon-map';panel.hidden=true;
  panel.innerHTML='<p class="eyebrow">THE WAYFARER’S ATLAS</p><h2>The Unwritten Wilds</h2><p class="map-region"></p><canvas width="540" height="540" aria-label="Exploration map centred on the wayfarer"></canvas><div class="map-tools"><button data-map="out" aria-label="Zoom out map">−</button><button data-map="in" aria-label="Zoom in map">+</button><button data-map="home">Show waystation</button></div><p>✦ You · ◆ Waystation · Inked squares are explored<br>Trails continue in every direction · North ↑</p><button data-map="close">Return to the trail <kbd>Tab / Esc</kbd></button>';
  document.body.append(panel);const canvas=panel.querySelector('canvas'),c=canvas.getContext('2d');
  function draw(){
    const center=home?{x:0,z:0}:traveller.position,scale=500/span,X=x=>270+(x-center.x)*scale,Z=z=>270+(z-center.z)*scale;
    c.clearRect(0,0,540,540);c.fillStyle='#e8dec1';c.fillRect(0,0,540,540);
    c.save();c.beginPath();c.rect(20,20,500,500);c.clip();
    const left=Math.floor((center.x-span/2)/CHUNK_SIZE),right=Math.ceil((center.x+span/2)/CHUNK_SIZE),top=Math.floor((center.z-span/2)/CHUNK_SIZE),bottom=Math.ceil((center.z+span/2)/CHUNK_SIZE);
    for(let cz=top;cz<=bottom;cz++)for(let cx=left;cx<=right;cx++){
      const x=cx*CHUNK_SIZE,z=cz*CHUNK_SIZE,r=regionAt(seed,x,z);c.globalAlpha=.32;c.fillStyle=r.color;c.fillRect(X(x-6),Z(z-6),CHUNK_SIZE*scale,CHUNK_SIZE*scale);
      c.strokeStyle='#998b68';c.globalAlpha=.24;c.lineWidth=1;c.beginPath();c.moveTo(X(x-6),Z(z));c.lineTo(X(x+6),Z(z));c.moveTo(X(x),Z(z-6));c.lineTo(X(x),Z(z+6));c.stroke();
    }
    c.globalAlpha=.48;c.fillStyle='#658575';game.progress.eachCell((cx,cz)=>c.fillRect(X(cx*2-1),Z(cz*2-1),2*scale,2*scale));c.globalAlpha=1;
    for(const card of world.cards){if(card.fold.progress<.5)continue;c.fillStyle=card.asset==='moon:2'?'#8e6e9e':'#4b6e5c';c.beginPath();c.arc(X(card.x),Z(card.z),Math.max(1.5,card.size*scale*.1),0,Math.PI*2);c.fill();}
    c.fillStyle='#aa7844';c.font='20px Georgia';c.textAlign='center';c.fillText('◆',X(0),Z(0));
    c.fillStyle='#a54137';c.beginPath();c.arc(X(traveller.position.x),Z(traveller.position.z),6,0,Math.PI*2);c.fill();c.strokeStyle='#fff0d4';c.lineWidth=2;c.stroke();c.restore();
    c.fillStyle='#56634e';c.font='10px Georgia';c.textAlign='center';
    for(let rz=Math.floor((center.z-span/2+18)/36);rz<=Math.ceil((center.z+span/2)/36);rz++)for(let rx=Math.floor((center.x-span/2+18)/36);rx<=Math.ceil((center.x+span/2)/36);rx++){const x=rx*36,z=rz*36,px=X(x),py=Z(z);if(px>85&&px<455&&py>45&&py<490)c.fillText(regionAt(seed,x,z).name.toUpperCase(),px,py-10);}
    c.strokeStyle='#aa9870';c.lineWidth=1;c.strokeRect(20,20,500,500);c.font='12px Georgia';c.textAlign='left';c.fillStyle='#586951';c.fillText(`${span} m across · ${game.progress.cellCount()} squares explored`,25,534);
    panel.querySelector('.map-region').textContent=`${world.biomeAt(traveller.position.x,traveller.position.z)} · ${Math.round(traveller.position.x)}, ${Math.round(traveller.position.z)}`;
    panel.querySelector('[data-map="home"]').textContent=home?'Follow wayfarer':'Show waystation';
  }
  function show(v=true){open=!!v;panel.hidden=!open;controls.clearTarget();if(open)draw();}
  const onKey=e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;if(e.code==='Tab'){e.preventDefault();if(!game.adventure?.modal()&&!e.repeat)show(!open);}else if(open&&e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();show(false);}};
  panel.addEventListener('click',e=>{const action=e.target.closest('[data-map]')?.dataset.map;if(action==='close')show(false);if(action==='out')span=Math.min(384,span*2);if(action==='in')span=Math.max(24,span/2);if(action==='home')home=!home;if(open)draw();});window.addEventListener('keydown',onKey,true);
  return {get open(){return open;},show,toggle(){show(!open);},render(){},update(){},dispose(){window.removeEventListener('keydown',onKey,true);panel.remove();}};
}
