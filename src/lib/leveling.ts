// lib/leveling.ts — Level-up logic and gate checking

import { xpForLevel, rankFromLevel, isGateLevel } from "./xp";

export interface LevelUpResult {
  didLevelUp: boolean;
  newLevel: number;
  newRank: string;
  newXP: number;
  newXPToNext: number;
  isGateLocked: boolean;
  gateLevel: number | null;
}

/**
 * Process XP gain and determine if the hunter levels up.
 * Handles multiple level-ups from a single large XP gain.
 * Stops at gate levels — exam required to pass.
 */
export function processXPGain(
  currentXP: number,
  currentLevel: number,
  currentXPToNext: number,
  xpGained: number
): LevelUpResult {
  let xp = currentXP + xpGained;
  let level = currentLevel;
  let xpToNext = currentXPToNext;
  let didLevelUp = false;
  let isGateLocked = false;
  let gateLevel: number | null = null;

  while (xp >= xpToNext) {
    // Check if next level is a gate level — stop here
    if (isGateLevel(level + 1)) {
      // Cap XP at the threshold — don't overflow past the gate
      xp = xpToNext;
      isGateLocked = true;
      gateLevel = level + 1;
      break;
    }

    // Level up
    xp -= xpToNext;
    level += 1;
    xpToNext = xpForLevel(level);
    didLevelUp = true;
  }

  return {
    didLevelUp,
    newLevel: level,
    newRank: rankFromLevel(level),
    newXP: xp,
    newXPToNext: xpToNext,
    isGateLocked,
    gateLevel,
  };
}
