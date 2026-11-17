export const WEAPONS = [
  { id: 'sword', name: 'Wayfarer’s blade', short: 'Sword', level: 1, damage: 22, reach: 1.05, arc: 1.35, speed: 0.28, cost: 10, color: '#f9dea2', description: 'A nimble blade. Three quick cuts finish with a powerful flourish.' },
  { id: 'axe', name: 'Briarwood cleaver', short: 'Axe', level: 2, damage: 36, reach: 0.98, arc: 1.65, speed: 0.48, cost: 17, color: '#f0a27a', description: 'Heavy sweeping blows. Excellent against a crowded trail.' },
  { id: 'spear', name: 'Dawnkeeper’s pike', short: 'Spear', level: 3, damage: 27, reach: 1.65, arc: 0.65, speed: 0.35, cost: 13, color: '#9fddd1', description: 'Long, precise thrusts. Keep dangerous enemies at a distance.' },
];
export const ENEMIES = {
  imp: { name: 'Inkling', hp: 44, speed: 0.72, damage: 9, reach: 0.5, windup: 0.8, cooldown: 1.45, xp: 22, gold: 9, size: 0.58 },
  wolf: { name: 'Briar hound', hp: 65, speed: 1.05, damage: 13, reach: 0.58, windup: 0.62, cooldown: 1.65, xp: 32, gold: 13, size: 0.65 },
  knight: { name: 'Hollow knight', hp: 100, speed: 0.55, damage: 20, reach: 0.75, windup: 1.15, cooldown: 2, xp: 48, gold: 20, size: 0.83 },
  boss: { name: 'The Hollow Warden', hp: 560, speed: 0.62, damage: 26, reach: 1.2, windup: 1.25, cooldown: 1.7, xp: 200, gold: 100, size: 1.45 },
};
export const levelFor = xp => Math.min(10, 1 + Math.floor(Math.sqrt(Math.max(0, xp) / 75)));
export const xpFor = level => (level - 1) ** 2 * 75;
export const maxHealth = xp => 100 + (levelFor(xp) - 1) * 18;
export const upgradeCost = rank => 35 + rank * 30;
export const freshSave = () => ({ version: 1, xp: 0, gold: 0, kills: 0, weapon: 0, upgrades: 0, potions: 3, bossDefeated: false, lanternBlessing: false, courier: { accepted: false, startKills: 0, claimed: false } });
export function sanitizeSave(raw) {
  const clean = freshSave();
  if (!raw || raw.version !== 1) return clean;
  for (const key of ['xp', 'gold', 'kills', 'upgrades', 'potions']) {
    const cap = key === 'upgrades' ? 5 : key === 'potions' ? 5 : 1e7;
    if (Number.isFinite(raw[key])) clean[key] = Math.max(0, Math.min(cap, Math.floor(raw[key])));
  }
  if (Number.isInteger(raw.weapon) && WEAPONS[raw.weapon]?.level <= levelFor(clean.xp)) clean.weapon = raw.weapon;
  clean.bossDefeated = raw.bossDefeated === true;
  clean.lanternBlessing = raw.lanternBlessing === true;
  if (raw.courier?.accepted === true && Number.isFinite(raw.courier.startKills)) {
    clean.courier = { accepted: true, startKills: Math.max(0, Math.min(clean.kills, Math.floor(raw.courier.startKills))), claimed: raw.courier.claimed === true };
  }
  return clean;
}
/** A directional melee sector; a target directly underfoot can always be hit. */
export function inStrike(origin, target, facing, reach, arc, radius = 0.16) {
  const dx = target.x - origin.x, dz = target.z - origin.z;
  const distance = Math.hypot(dx, dz);
  return distance <= reach + radius && (distance < 0.22 || (dx * facing.x + dz * facing.z) / distance >= Math.cos(arc));
}
export function questFor(save) {
  if (save.bossDefeated) return { chapter: 'Epilogue', title: 'A story worth saving', text: 'The Warden has fallen. The trails are yours to explore.', count: 1, total: 1 };
  if (save.kills < 4) return { chapter: 'Chapter I', title: 'Ink on the wind', text: 'Defeat the Inkbound haunting these living pages.', count: save.kills, total: 4 };
  if (save.kills < 10) return { chapter: 'Chapter II', title: 'The gathering dark', text: 'Break the curse. Defeat ten Inkbound in total.', count: save.kills, total: 10 };
  return { chapter: 'Chapter III', title: 'The last unwritten page', text: 'Follow the violet marker. Defeat the Hollow Warden.', count: 0, total: 1 };
}
