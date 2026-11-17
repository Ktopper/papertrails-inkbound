export const CHARACTERS = {
  camp: {name:'Mara',role:'Cartographer & keeper of the waystation',color:'#d8b874',subtitle:'Rest & forge',line:'Maps remember the roads. People remember why they took them.'},
  courier: {name:'Ivo Mossmail',role:'Mushroom courier · exceptionally late',color:'#dca47a',subtitle:'A peculiar delivery',line:'Rain, sleet, ravenous ink monsters… none of those were in my contract.'},
  moth: {name:'Pip Wick',role:'Moth lamplighter · collector of tiny suns',color:'#ccb6ea',subtitle:'Lantern blessing',line:'I used to eat books. Now I keep them lit. Personal growth.'},
};
export function courierQuest(save) {
  const q=save.courier;
  if(q?.claimed)return {state:'done',count:6,total:6};
  if(!q?.accepted)return {state:'offer',count:0,total:6};
  const count=Math.min(6,Math.max(0,save.kills-q.startKills));
  return {state:count===6?'ready':'active',count,total:6};
}
// Reward application lives here so saves cannot pay the same delivery twice.
export function talkAction(save, action) {
  if(action==='acceptDelivery'&&courierQuest(save).state==='offer') {
    save.courier={accepted:true,startKills:save.kills,claimed:false};return 'Six Inkbound stand between Ivo and his delivery. Clear the trail.';
  }
  if(action==='claimDelivery'&&courierQuest(save).state==='ready') {
    save.courier.claimed=true;save.gold+=65;save.potions=Math.min(5,save.potions+2);return 'Delivery secured · +65 gold · two tonics (up to five carried)';
  }
  if(action==='blessing'&&!save.lanternBlessing) {
    save.lanternBlessing=true;return 'Pip’s lantern blessing · incoming damage reduced by 10%';
  }
  return null;
}
