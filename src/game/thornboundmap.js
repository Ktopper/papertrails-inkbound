import { CHAPTER_NODES, chapterObjective } from '../rpg/thornbound-rules.js';
import { ROUTES } from '../world/thornbound-layout.js';
export function createThornboundMap({traveller,game,controls}) {
  let open=false;
  const panel=document.createElement('section');panel.className='moon-map chapter-map';panel.hidden=true;panel.setAttribute('aria-label','Chapter 1 map');
  panel.innerHTML='<p class="eyebrow">BOOK I · THE THORNBOUND KINGDOM</p><h2>A Road Out of Nowhere</h2><canvas width="560" height="560" aria-label="Chapter map showing battles, puzzles, equipment and your position"></canvas><p class="map-objective"></p><p>◆ You · gold: refuge · rust: battle · teal: puzzle<br>W weapon · A armor · M magic · C charm</p><button>Return to the page <kbd>Tab / Esc</kbd></button>';
  document.body.append(panel);const c=panel.querySelector('canvas').getContext('2d');
  function draw(){
    const X=x=>55+(x+15)*10,Z=z=>35+(z+44)*9.5;
    c.fillStyle='#eae0c4';c.fillRect(0,0,560,560);c.strokeStyle='#adab82';c.lineWidth=1;c.strokeRect(30,15,500,510);
    c.fillStyle='#b5ccc4';for(const [top,height]of[[-21.5,2.5],[-36.5,3.5]])c.fillRect(X(-15),Z(top),440,height*9.5);
    c.strokeStyle='#9c926f';c.lineWidth=3;for(const route of ROUTES){c.beginPath();route.forEach(([x,z],i)=>i?c.lineTo(X(x),Z(z)):c.moveTo(X(x),Z(z)));c.stroke();}
    c.textAlign='center';for(const n of CHAPTER_NODES){c.fillStyle=n.kind.startsWith('Battle')||n.kind==='Defense'?'#a35b46':n.kind.startsWith('Puzzle')?'#4e8179':'#a0864e';c.beginPath();c.arc(X(n.x),Z(n.z),13,0,Math.PI*2);c.fill();c.fillStyle='#fff4d7';c.font='bold 13px system-ui';c.fillText(n.number,X(n.x),Z(n.z)+4);c.fillStyle='#354b3f';c.font='12px Georgia';const labels={workshops:'Workshops · A',mill:'Mill interior · W',school:'Crease school · M',tree:'Last tree · C',anchors:'Bridge defense'};c.fillText(labels[n.id]||n.name,X(n.x),Z(n.z)+(['school','tree'].includes(n.id)?-23:28));}
    const p=traveller.position,inside=p.x>40;c.fillStyle='#b5352f';c.font='bold 23px Georgia';c.fillText('◆',X(inside?5:p.x),Z(inside?-25:p.z)+6);c.font='12px Georgia';c.fillText(inside?'You are inside the mill':'North ↑',280,546);
    const save=game.adventure.snapshot().save;panel.querySelector('.map-objective').textContent=chapterObjective(save).text;
  }
  function show(value=true){open=!!value;panel.hidden=!open;controls.clearTarget();if(open){draw();panel.querySelector('button').focus();}}
  const onKey=e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;if(e.code==='Tab'&&!game.adventure?.modal()){e.preventDefault();if(!e.repeat)show(!open);}else if(open&&e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();show(false);}};
  panel.querySelector('button').addEventListener('click',()=>show(false));window.addEventListener('keydown',onKey,true);
  return {get open(){return open;},show,toggle(){show(!open);},render(){},update(){},dispose(){window.removeEventListener('keydown',onKey,true);panel.remove();}};
}
