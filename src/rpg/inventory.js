// Stable item IDs are shared by rewards, equipment, and versioned saves.
export const ITEMS = {
  blade: { name: 'Wayfarer’s blade', slot: 'weapon', weapon: 0, icon: 'sword', color: '#d2b27b', description: 'Quick cuts and a three-hit flourish. 22 damage · 0.28 s · 10 stamina.', source: 'Mara’s waystation' },
  cleaver: { name: 'Briarwood cleaver', slot: 'weapon', weapon: 1, icon: 'axe', color: '#bc7758', description: 'Wide, heavy cuts. 36 damage · 0.48 s · 17 stamina. Heavy blows break a knight’s guard.', source: 'Abandoned mill · defeat the hinge keeper' },
  pike: { name: 'Dawnkeeper’s pike', slot: 'weapon', weapon: 2, icon: 'spear', color: '#82a898', description: 'A long, precise thrust. 27 damage · 0.35 s · 13 stamina.', source: 'Legacy level 3 unlock · later story chapter' },
  'patched-coat': { name: 'Patched coat', slot: 'coat', icon: 'shield', armor: .05, color: '#9a7757', description: '5% less incoming damage. Soft paper, carefully mended.', source: 'Mara’s waystation' },
  'binders-coat': { name: 'Bookbinder’s coat', slot: 'coat', icon: 'shield', armor: .08, color: '#588d7b', description: '8% less incoming damage. Folded green shoulder panels protect without slowing you.', source: 'Three workshops · restore every hinge' },
  'travel-boots': { name: 'Travel boots', slot: 'boots', icon: 'leaf', color: '#9a7757', description: 'Reliable paper soles. Normal movement and dodge distance.', source: 'Mara’s waystation' },
  'crease-focus': { name: 'Creaseglass focus', slot: 'focus', icon: 'bolt', color: '#89c4c0', description: 'Fold costs 16 ink instead of 22 and holds enemies for 1.8 s instead of 1.2 s. Puzzle casts remain free.', source: 'Crease school · align the practice bridge' },
  'postmark-charm': { name: 'Last-tree postmark', slot: 'charm', icon: 'leaf', color: '#c29b61', description: 'A successful guard returns 3 stamina. A thank-you stamped in tree years.', source: 'Ivo’s letter · deliver it to the last tree' },
};
export const WEAPON_ITEMS = ['blade', 'cleaver', 'pike'];
export const SLOT_LABELS = { weapon: 'Active weapon', coat: 'Coat', boots: 'Boots', focus: 'Lantern focus', charmA: 'Charm A', charmB: 'Charm B' };
export const freshInventory = () => ({
  owned: { blade: 0, 'patched-coat': 0, 'travel-boots': 0 },
  equipped: { weapon: 'blade', coat: 'patched-coat', boots: 'travel-boots', focus: null, charmA: null, charmB: null },
  shortcuts: ['blade', null, null], materials: { paper: 0 }, tools: [], story: [], claimed: [],
});
const bounded = (n, cap) => Number.isFinite(n) ? Math.max(0, Math.min(cap, Math.floor(n))) : 0;
const ids = value => Array.isArray(value) ? [...new Set(value.filter(x => typeof x === 'string' && /^[a-zA-Z0-9:-]{1,60}$/.test(x)))].slice(0,200) : [];
export function sanitizeInventory(raw, legacy = null) {
  const inv = freshInventory();
  if (legacy) {
    const level = Math.min(10, 1 + Math.floor(Math.sqrt(legacy.xp / 75)));
    WEAPON_ITEMS.forEach((id,i) => { if (level >= i + 1) { inv.owned[id] = legacy.upgrades; inv.shortcuts[i] = id; } });
    inv.equipped.weapon = inv.shortcuts[legacy.weapon] || 'blade';
    return inv;
  }
  if (!raw || typeof raw !== 'object') return inv;
  for (const id of Object.keys(ITEMS)) if (Object.hasOwn(raw.owned || {},id)) inv.owned[id] = bounded(raw.owned[id],5);
  for (const slot of Object.keys(inv.equipped)) {
    const id=raw.equipped?.[slot], type=slot.startsWith('charm')?'charm':slot;
    if (id === null && !['weapon','coat','boots'].includes(slot)) inv.equipped[slot]=null;
    else if (Object.hasOwn(inv.owned,id) && ITEMS[id]?.slot === type) inv.equipped[slot]=id;
  }
  if(inv.equipped.charmA===inv.equipped.charmB) inv.equipped.charmB=null;
  inv.shortcuts=[0,1,2].map(i=>{const id=raw.shortcuts?.[i];return Object.hasOwn(inv.owned,id)&&ITEMS[id]?.slot==='weapon'?id:null;});
  if(!inv.shortcuts.some(Boolean))inv.shortcuts[0]='blade';
  inv.materials.paper=bounded(raw.materials?.paper,9999);
  inv.tools=ids(raw.tools).filter(id=>id==='Fold');
  inv.story=ids(raw.story);inv.claimed=ids(raw.claimed);
  return inv;
}
export function grantReward(save, id, reward = {}) {
  const inv=save.inventory;
  if(inv.claimed.includes(id))return false;
  for(const item of reward.items || []) if(ITEMS[item]&&!Object.hasOwn(inv.owned,item)) {
    inv.owned[item]=0;
    if(ITEMS[item].slot==='weapon') { const empty=inv.shortcuts.indexOf(null); if(empty>=0)inv.shortcuts[empty]=item; }
  }
  for(const tool of reward.tools||[])if(!inv.tools.includes(tool))inv.tools.push(tool);
  for(const flag of reward.story||[])if(!inv.story.includes(flag))inv.story.push(flag);
  save.gold+=reward.gold||0;save.potions=Math.min(5,save.potions+(reward.potions||0));
  inv.materials.paper+=reward.paper||0;inv.claimed.push(id);return true;
}
export function equipItem(save,id,slot=ITEMS[id]?.slot) {
  if(!Object.hasOwn(save.inventory.owned,id)||!Object.hasOwn(SLOT_LABELS,slot))return false;
  const item=ITEMS[id];if(item.slot!==(slot.startsWith('charm')?'charm':slot))return false;
  if(item.slot==='charm')for(const other of ['charmA','charmB'])if(other!==slot&&save.inventory.equipped[other]===id)save.inventory.equipped[other]=null;
  save.inventory.equipped[slot]=id;
  if(item.slot==='weapon')save.weapon=item.weapon;
  return true;
}
export function assignShortcut(save,id,index) {
  if(!Number.isInteger(index)||index<0||index>2||!Object.hasOwn(save.inventory.owned,id)||ITEMS[id]?.slot!=='weapon')return false;
  save.inventory.shortcuts[index]=id;return true;
}
export function unequipItem(save,slot) {
  if(!['focus','charmA','charmB'].includes(slot))return false;
  save.inventory.equipped[slot]=null;return true;
}
export function equipmentStats(save) {
  const e=save.inventory.equipped,focus=e.focus==='crease-focus';
  return { armor:ITEMS[e.coat]?.armor||0, damageReduction:Math.min(.4,1-(1-(ITEMS[e.coat]?.armor||0))*(save.lanternBlessing?.9:1)),
    foldCost:focus?16:22, foldHold:focus?1.8:1.2, guardRefund:[e.charmA,e.charmB].includes('postmark-charm')?3:0,
    weaponRank:save.inventory.owned[e.weapon]||0 };
}
export function itemUpgradeCost(save,id) {
  const rank=save.inventory.owned[id];return {gold:35+rank*30,paper:3+rank*2};
}
export function upgradeItem(save,id) {
  if(!Object.hasOwn(save.inventory.owned,id)||ITEMS[id]?.slot!=='weapon'||save.inventory.owned[id]>=5)return false;
  const cost=itemUpgradeCost(save,id);if(save.gold<cost.gold||save.inventory.materials.paper<cost.paper)return false;
  save.gold-=cost.gold;save.inventory.materials.paper-=cost.paper;save.inventory.owned[id]++;return true;
}
