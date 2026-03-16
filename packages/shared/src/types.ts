// Shared types used across web, mobile, and agent backend

export interface HunterData {
  id: number;
  hunterName: string;
  class: string;
  title: string;
  rank: string;
  level: number;
  rankLevel: number;
  xp: number;
  xpToNext: number;
  gold: number;
  streak: number;
  bestStreak: number;
  streakShields: number;
  streakFreezes: number;
  statPoints: number;
  vitality: number;
  intel: number;
  hustle: number;
  wealth: number;
  focus: number;
  agentIQ: number;
  prestigeCount: number;
  wakeUpTime: string;
}

export interface Quest {
  id: number;
  title: string;
  description: string;
  checklist: string;
  category: string;
  difficulty: string;
  tier: string;
  xpBase: number;
  goldBase: number;
  statTarget: string;
  statGain: number;
  isDaily: boolean;
  isActive: boolean;
  isCompleted: boolean;
  completedAt?: string;
  unlocksAtLevel: number;
  dungeonId?: number;
  roadmapId?: number;
}

export interface TodoItem {
  id: number;
  title: string;
  description: string;
  date: string;
  isCompleted: boolean;
  completedAt?: string;
  priority: number;
  sortOrder: number;
  category: string;
  isRecurring: boolean;
  recurType?: string;
  recurDays?: string;
  roadmapId?: number;
  certId?: number;
}

export interface AgentRun {
  id: number;
  agentName: string;
  eventType: string;
  input: string;
  output: string;
  status: string;
  durationMs: number;
  traceId?: string;
  createdAt: string;
}

export interface DeviceData {
  id: number;
  dataType: string;
  value: string;
  date: string;
  processedAt?: string;
  createdAt: string;
}

export interface AgentConfig {
  id: number;
  agentName: string;
  enabled: boolean;
  config: string;
}

export interface CompletionResult {
  success: boolean;
  xpEarned: number;
  goldEarned: number;
  statGain: number;
  statTarget: string;
  didLevelUp: boolean;
  levelsGained: number;
  newLevel: number;
  newRankLevel: number;
  newRank: string;
  isGateLocked: boolean;
  gateLevel?: number;
  statPointsEarned: number;
  levelUpGoldBonus: number;
}

// Agent event types
export type AgentEventType =
  | "health_sync"
  | "screen_time_update"
  | "expense_notification"
  | "calendar_sync"
  | "daily_focus"
  | "morning_plan"
  | "check_progress"
  | "evening_wrap"
  | "weekly_strategy"
  | "notion_sync"
  | "learning_check";

// Agent names
export type AgentName =
  | "steps"
  | "screen_time"
  | "expense"
  | "todo"
  | "quest"
  | "streak_guardian"
  | "sleep"
  | "weekly_strategist"
  | "daily_focus"
  | "notion_sync"
  | "adaptive_learning"
  | "calendar"
  | "social_accountability";

// Quest categories
export const CATEGORIES = [
  "health", "learning", "jobs", "finance", "focus", "food", "mental", "agentiq"
] as const;
export type Category = (typeof CATEGORIES)[number];

// Stat names
export const STATS = [
  "vitality", "intel", "hustle", "wealth", "focus", "agentIQ"
] as const;
export type StatName = (typeof STATS)[number];

// Difficulties
export const DIFFICULTIES = ["normal", "hard", "legendary"] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

// Quest tiers
export const TIERS = ["daily", "weekly", "custom"] as const;
export type Tier = (typeof TIERS)[number];
