// XP Rank System
export const RANKS = [
  { min: 0,    max: 99,   title: 'Recruit',    color: 'text-slate-400',   glow: 'rgba(148,163,184,0.5)' },
  { min: 100,  max: 299,  title: 'Cadet',      color: 'text-blue-400',    glow: 'rgba(96,165,250,0.5)' },
  { min: 300,  max: 599,  title: 'Operative',  color: 'text-cyan-400',    glow: 'rgba(34,211,238,0.5)' },
  { min: 600,  max: 999,  title: 'Specialist', color: 'text-amber-400',   glow: 'rgba(251,191,36,0.5)' },
  { min: 1000, max: 1499, title: 'Commander',  color: 'text-orange-400',  glow: 'rgba(251,146,60,0.5)' },
  { min: 1500, max: 2499, title: 'Vanguard',   color: 'text-red-400',     glow: 'rgba(248,113,113,0.5)' },
  { min: 2500, max: Infinity, title: 'Legend', color: 'text-yellow-300',  glow: 'rgba(253,224,71,0.8)' },
];

export function getRank(xp: number) {
  return RANKS.find(r => xp >= r.min && xp <= r.max) || RANKS[0];
}

export function getNextRank(xp: number) {
  const idx = RANKS.findIndex(r => xp >= r.min && xp <= r.max);
  return RANKS[idx + 1] || null;
}

export function getLevelProgress(xp: number) {
  const rank = getRank(xp);
  if (rank.max === Infinity) return 100;
  const rangeSize = rank.max - rank.min + 1;
  const progress = xp - rank.min;
  return Math.round((progress / rangeSize) * 100);
}

export const XP_PER_TASK = 15;
export const XP_PERFECT_DAY_BONUS = 50;
