// lib/xp.ts — XP Engine
// Blueprint formula: XP required for Level N = 100 × N × 1.15^(N/10)

// --- XP required to reach the next level from level N ---
export function xpForLevel(n: number): number {
  return Math.floor(100 * n * Math.pow(1.15, n / 10));
}

// --- Rank letter from level (Blueprint Step 2) ---
export function rankFromLevel(level: number): string {
  if (level < 10) return "E";
  if (level < 20) return "D";
  if (level < 30) return "C";
  if (level < 40) return "B";
  if (level < 50) return "A";
  if (level < 60) return "S";
  return "National";
}

// --- Rank info with colors and ceremonies ---
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

// --- Gate levels (hard cap — exam required to pass) ---
export const GATE_LEVELS = [5, 10, 15, 20, 25, 30, 35, 40, 50] as const;

export function isGateLevel(level: number): boolean {
  return GATE_LEVELS.includes(level as (typeof GATE_LEVELS)[number]);
}

// --- Class buffs (Blueprint Step 1) ---
export const CLASS_BUFFS: Record<string, { stat: string; multiplier: number }> = {
  warrior: { stat: "hustle", multiplier: 1.10 },
  scholar: { stat: "intel", multiplier: 1.10 },
  rogue: { stat: "wealth", multiplier: 1.10 },
  paladin: { stat: "vitality", multiplier: 1.10 },
};

// --- Streak multiplier (Blueprint Step 5) ---
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
  return 2.0; // 365+ days = DOUBLE XP
}

// --- Streak bonus gold (Blueprint Step 5) ---
export function streakBonusGold(streak: number): number {
  if (streak >= 365) return 2500;
  if (streak >= 180) return 1000;
  if (streak >= 90) return 500;
  if (streak >= 60) return 200;
  if (streak >= 30) return 100;
  if (streak >= 21) return 75;
  if (streak >= 14) return 50;
  if (streak >= 7) return 25;
  if (streak >= 3) return 10;
  return 0;
}

// --- Streak title (Blueprint Step 5) ---
export function streakTitle(streak: number): string | null {
  if (streak >= 365) return "Sovereign";
  if (streak >= 90) return "Monarch";
  if (streak >= 60) return "Unbreakable";
  if (streak >= 30) return "Iron Will";
  if (streak >= 14) return "Consistent";
  return null;
}

// --- Effective XP earned from completing a quest ---
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

  // Apply streak multiplier
  xp = xp * streakMultiplier(streak);

  // Apply class buff (+10% if quest matches class stat)
  const classBuff = CLASS_BUFFS[hunterClass];
  if (classBuff && classBuff.stat === questStatTarget) {
    xp = xp * classBuff.multiplier;
  }

  return Math.floor(xp);
}

// --- Effective Gold earned ---
export function effectiveGold(
  baseGold: number,
  hustle: number
): number {
  // +1 bonus Gold per quest per 10 Hustle points
  const hustleBonus = Math.floor(hustle / 10);
  return baseGold + hustleBonus;
}
