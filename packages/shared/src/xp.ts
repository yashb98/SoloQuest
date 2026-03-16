// Shared XP engine — used by web, mobile, and agent backend
// Source of truth: apps/web/src/lib/xp.ts (keep in sync)

export function xpForLevel(n: number): number {
  return Math.floor(100 * n * Math.pow(1.15, n / 10));
}

export const RANK_BOUNDARIES: Record<string, { start: number; end: number }> = {
  E:        { start: 1,  end: 9 },
  D:        { start: 10, end: 18 },
  C:        { start: 19, end: 26 },
  B:        { start: 27, end: 39 },
  A:        { start: 40, end: 54 },
  S:        { start: 55, end: 65 },
  National: { start: 66, end: Infinity },
};

export function rankFromLevel(level: number): string {
  if (level < 10) return "E";
  if (level < 19) return "D";
  if (level < 27) return "C";
  if (level < 40) return "B";
  if (level < 55) return "A";
  if (level < 66) return "S";
  return "National";
}

export function rankLevel(globalLevel: number): number {
  const rank = rankFromLevel(globalLevel);
  const boundary = RANK_BOUNDARIES[rank];
  return globalLevel - boundary.start + 1;
}

export const RANK_CONFIG: Record<string, {
  color: string;
  frameColor: string;
  ceremony: string;
  statCap: number;
}> = {
  E: { color: "#9CA3AF", frameColor: "Grey", ceremony: "None (starter)", statCap: 20 },
  D: { color: "#22C55E", frameColor: "Green", ceremony: "Green aura flash", statCap: 35 },
  C: { color: "#3B82F6", frameColor: "Blue", ceremony: "Blue lightning burst", statCap: 50 },
  B: { color: "#E2B04A", frameColor: "Gold", ceremony: "Gold particle storm", statCap: 70 },
  A: { color: "#EF4444", frameColor: "Red", ceremony: "Red flame pillar", statCap: 90 },
  S: { color: "#A855F7", frameColor: "Purple", ceremony: "Purple void rift", statCap: 120 },
  National: { color: "#F59E0B", frameColor: "Rainbow", ceremony: "Full-screen transformation", statCap: 999 },
};

export const GATE_LEVELS = [5, 10, 15, 20, 25, 30, 35, 40, 50] as const;

export function isGateLevel(level: number): boolean {
  return GATE_LEVELS.includes(level as (typeof GATE_LEVELS)[number]);
}

export const CLASS_BUFFS: Record<string, { stat: string; multiplier: number }> = {
  warrior: { stat: "hustle", multiplier: 1.10 },
  scholar: { stat: "intel", multiplier: 1.10 },
  rogue: { stat: "wealth", multiplier: 1.10 },
  paladin: { stat: "vitality", multiplier: 1.10 },
};

export function streakMultiplier(streak: number): number {
  if (streak < 3) return 1.0;
  if (streak < 7) return 1.05;
  if (streak < 14) return 1.10;
  if (streak < 21) return 1.15;
  if (streak < 30) return 1.20;
  if (streak < 60) return 1.25;
  if (streak < 90) return 1.35;
  if (streak < 180) return 1.50;
  if (streak < 365) return 1.75;
  return 2.0;
}

export function effectiveXP(
  baseXP: number,
  level: number,
  streak: number,
  hunterClass: string = "none",
  questStatTarget: string = "",
  isExamOrProject: boolean = false
): number {
  if (isExamOrProject) return baseXP;
  let xp = baseXP;
  xp = xp * streakMultiplier(streak);
  const classBuff = CLASS_BUFFS[hunterClass];
  if (classBuff && classBuff.stat === questStatTarget) {
    xp = xp * classBuff.multiplier;
  }
  return Math.floor(xp);
}

export function effectiveGold(baseGold: number, hustle: number): number {
  const hustleBonus = Math.floor(hustle / 10);
  return baseGold + hustleBonus;
}
