// lib/xp.ts — XP Engine
// Implements EXACTLY the formulas from the Master Build Prompt

// --- Rank multiplier based on level ---
export function rankMultiplier(level: number): number {
  if (level <= 10) return 1.0; // E-Rank
  if (level <= 20) return 1.5; // D-Rank
  if (level <= 30) return 2.2; // C-Rank
  if (level <= 40) return 3.0; // B-Rank
  if (level <= 50) return 4.0; // A-Rank
  return 5.5; // S-Rank
}

// --- XP required to reach the next level from level N ---
export function xpForLevel(n: number): number {
  return Math.floor(500 * Math.pow(n, 1.65) + rankMultiplier(n) * n * 100);
}

// --- Rank letter from level ---
export function rankFromLevel(level: number): string {
  if (level <= 10) return "E";
  if (level <= 20) return "D";
  if (level <= 30) return "C";
  if (level <= 40) return "B";
  if (level <= 50) return "A";
  return "S";
}

// --- Gate levels (hard cap — exam required to pass) ---
export const GATE_LEVELS = [5, 10, 15, 20, 25, 30, 35, 40, 50] as const;

export function isGateLevel(level: number): boolean {
  return GATE_LEVELS.includes(level as (typeof GATE_LEVELS)[number]);
}

// --- Decay factor: quests give less XP at higher levels ---
export function decayFactor(level: number): number {
  return Math.max(0.35, 1 - (level - 1) * 0.018);
}

// --- Streak multiplier ---
export function streakMultiplier(streak: number): number {
  if (streak < 3) return 1.0;
  if (streak < 7) return 1.1;
  if (streak < 14) return 1.25;
  if (streak < 30) return 1.3;
  if (streak < 60) return 1.4;
  return 1.6;
}

// --- Effective XP earned from completing a quest ---
// NOTE: Exams and project quests NEVER decay — always return baseXP
export function effectiveXP(
  baseXP: number,
  level: number,
  streak: number,
  isExamOrProject: boolean = false
): number {
  if (isExamOrProject) {
    return baseXP;
  }
  return Math.floor(baseXP * decayFactor(level) * streakMultiplier(streak));
}
