// lib/leveling.ts — Level-up logic and gate checking
// Blueprint Step 2: Every level-up grants +1 Stat Point, +50 Gold

import { xpForLevel, rankFromLevel, isGateLevel } from "./xp";

export interface LevelUpResult {
  didLevelUp: boolean;
  levelsGained: number;
  newLevel: number;
  newRank: string;
  newXP: number;
  newXPToNext: number;
  isGateLocked: boolean;
  gateLevel: number | null;
  statPointsEarned: number;
  goldBonus: number;
}

/**
 * Process XP gain and determine if the hunter levels up.
 * Handles multiple level-ups from a single large XP gain.
 * Stops at gate levels — exam required to pass.
 * Awards +1 stat point and +50 gold per level-up.
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
  let levelsGained = 0;
  let isGateLocked = false;
  let gateLevel: number | null = null;

  while (xp >= xpToNext) {
    // Check if next level is a gate level — stop here
    if (isGateLevel(level + 1)) {
      xp = xpToNext;
      isGateLocked = true;
      gateLevel = level + 1;
      break;
    }

    // Level up
    xp -= xpToNext;
    level += 1;
    xpToNext = xpForLevel(level + 1);
    didLevelUp = true;
    levelsGained += 1;
  }

  return {
    didLevelUp,
    levelsGained,
    newLevel: level,
    newRank: rankFromLevel(level),
    newXP: xp,
    newXPToNext: xpToNext,
    isGateLocked,
    gateLevel,
    statPointsEarned: levelsGained,
    goldBonus: levelsGained * 50,
  };
}
