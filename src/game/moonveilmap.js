export function createMoonveilMap({world,traveller,game,controls}) {
  let open=false;
  const panel=document.createElement('section');panel.className='moon-map';panel.hidden=true;
  panel.innerHTML='<p class="eyebrow">THE WAYFARER’S ATLAS</p><h2>Moonveil Ruins</h2><canvas width="540" height="690" aria-label="Map of Moonveil Ruins"></canvas><p>✦ Your position &nbsp; · &nbsp; Three forest clearings &nbsp; · &nbsp; North ↑</p><button>Return to the trail <kbd>Tab / Esc</kbd></button>';
  document.body.append(panel);const canvas=panel.querySelector('canvas'),c=canvas.getContext('2d');
  function draw(){
    const X=x=>270+x*19,Z=z=>68+(z+22)*17;c.clearRect(0,0,540,690);c.fillStyle='#dfd8ba';c.fillRect(0,0,540,690);
    c.strokeStyle='#78856b';c.lineWidth=30;c.lineCap='round';c.beginPath();for(let z=8;z>=-22;z-=.3)c.lineTo(X(Math.sin(z*.29)*.7),Z(z));c.stroke();
    for(const card of world.cards){c.fillStyle=card.kind===0?'#49695b':card.kind===2?'#947f9e':'#a69b7b';c.beginPath();c.arc(X(card.x),Z(card.z),card.kind===0?7:5,0,Math.PI*2);c.fill();}
    c.font='14px Georgia';c.textAlign='center';c.fillStyle='#34564b';c.fillText('THE SHATTERED GATE',270,Z(-17)-16);c.fillText('THE LANTERN WALK',270,Z(-5)-20);c.fillText('MARA’S WAYSTATION',270,Z(2)+20);
    c.fillStyle='#ad503d';c.beginPath();c.arc(X(traveller.position.x),Z(traveller.position.z),7,0,Math.PI*2);c.fill();c.strokeStyle='#f7e8b9';c.lineWidth=2;c.stroke();
  }
  function show(v=true){open=!!v;panel.hidden=!open;controls.clearTarget();if(open)draw();}
  const onKey=e=>{if(e.ctrlKey||e.metaKey||e.altKey)return;if(e.code==='Tab'){e.preventDefault();if(!game.adventure?.modal()&&!e.repeat)show(!open);}else if(open&&e.code==='Escape'){e.preventDefault();e.stopImmediatePropagation();show(false);}};
  panel.querySelector('button').addEventListener('click',()=>show(false));window.addEventListener('keydown',onKey,true);
  return {get open(){return open;},show,toggle(){show(!open);},render(){},update(){},dispose(){window.removeEventListener('keydown',onKey,true);panel.remove();}};
}
