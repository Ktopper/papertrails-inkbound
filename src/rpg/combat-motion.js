const clamp = value => Math.max(0, Math.min(1, value));
const ease = value => {const t=clamp(value);return t*t*(3-2*t);};

export function attackTiming(weapon, heavy=false) {
  const duration = weapon.speed * (heavy ? 1.45 : 1);
  return {duration, hitAt: duration * (heavy ? .34 : .27)};
}

/** Shoulder-led arcs: anticipation, fast contact, follow-through, and return to rest. */
export function swingPose(elapsed, duration, combo=1, kind='sword', heavy=false) {
  const t=clamp(elapsed/duration),direction=combo===2?-1:1;
  const wind=ease(t/.2),cut=ease((t-.2)/.36),recover=ease((t-.64)/.36);
  const active=1-recover;
  if(kind==='spear')return {yaw:0,tilt:1.3*wind*active,extension:Math.sin(cut*Math.PI)*.48*active,twist:0,arm:-1.1*wind*active,lean:.08*wind*active};
  const yaw=direction*((-1.35*wind+2.85*cut)*active);
  return {yaw,tilt:(heavy?1.65:1.42)*wind*active+.24*recover,extension:.12*wind*active,twist:yaw*.16,arm:-1.25*wind*active,lean:(heavy?.13:.055)*Math.sin(cut*Math.PI)*active};
}
