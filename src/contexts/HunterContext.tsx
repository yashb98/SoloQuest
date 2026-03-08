"use client";

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";

export interface HunterData {
  id: number;
  hunterName: string;
  class: string;
  title: string;
  rank: string;
  level: number;
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

interface Toast {
  id: string;
  type: "xp" | "gold" | "level" | "achievement" | "info" | "error" | "stat";
  title: string;
  description?: string;
  icon?: string;
  duration?: number;
}

interface HunterContextType {
  hunter: HunterData | null;
  loading: boolean;
  refreshHunter: () => Promise<void>;
  // Optimistic update for instant XP bar changes
  updateHunterOptimistic: (partial: Partial<HunterData>) => void;
  // Toast notifications
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  // Dark mode
  darkMode: boolean;
  toggleDarkMode: () => void;
  // Achievement check trigger
  checkAchievements: () => Promise<void>;
  // Newly unlocked achievements
  newAchievements: Array<{ name: string; rarity: string; xpReward: number; goldReward: number; titleReward?: string }>;
  clearNewAchievements: () => void;
}

const HunterContext = createContext<HunterContextType | null>(null);

export function useHunter() {
  const ctx = useContext(HunterContext);
  if (!ctx) throw new Error("useHunter must be used within HunterProvider");
  return ctx;
}

let toastCounter = 0;

export function HunterProvider({ children }: { children: ReactNode }) {
  const [hunter, setHunter] = useState<HunterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [newAchievements, setNewAchievements] = useState<Array<{ name: string; rarity: string; xpReward: number; goldReward: number; titleReward?: string }>>([]);

  // Load dark mode preference
  useEffect(() => {
    const stored = localStorage.getItem("sq-dark-mode");
    if (stored === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem("sq-dark-mode", String(next));
      if (next) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
      return next;
    });
  }, []);

  const refreshHunter = useCallback(async () => {
    try {
      const res = await fetch("/api/hunter");
      const data = await res.json();
      setHunter(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch hunter:", err);
      setLoading(false);
    }
  }, []);

  const updateHunterOptimistic = useCallback((partial: Partial<HunterData>) => {
    setHunter((prev) => (prev ? { ...prev, ...partial } : null));
  }, []);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${Date.now()}-${++toastCounter}`;
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    // Auto-remove after duration
    const duration = toast.duration || 3500;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const checkAchievements = useCallback(async () => {
    try {
      const res = await fetch("/api/achievements/check", { method: "POST" });
      const data = await res.json();
      if (data.unlocked && data.unlocked.length > 0) {
        setNewAchievements(data.unlocked);
        for (const ach of data.unlocked) {
          addToast({
            type: "achievement",
            title: `🏆 ${ach.name}`,
            description: `${ach.rarity} achievement unlocked!${ach.xpReward ? ` +${ach.xpReward} XP` : ""}${ach.goldReward ? ` +${ach.goldReward}G` : ""}`,
            duration: 5000,
          });
        }
        // Refresh hunter data to get updated XP/gold from achievement rewards
        await refreshHunter();
      }
    } catch (err) {
      console.error("Achievement check failed:", err);
    }
  }, [addToast, refreshHunter]);

  const clearNewAchievements = useCallback(() => {
    setNewAchievements([]);
  }, []);

  // Initial fetch + daily quest reset
  useEffect(() => {
    const init = async () => {
      await refreshHunter();
      // Trigger daily reset (streak engine + quest reset) — idempotent, safe to call each session
      try {
        const res = await fetch("/api/quests/reset", { method: "POST" });
        const data = await res.json();
        // If reset actually ran (not "already reset"), refresh hunter to get updated gold/streak
        if (data.success) {
          await refreshHunter();
        }
      } catch {
        // Silent fail — reset will happen next load
      }
    };
    init();
  }, [refreshHunter]);

  return (
    <HunterContext.Provider
      value={{
        hunter,
        loading,
        refreshHunter,
        updateHunterOptimistic,
        toasts,
        addToast,
        removeToast,
        darkMode,
        toggleDarkMode,
        checkAchievements,
        newAchievements,
        clearNewAchievements,
      }}
    >
      {children}
    </HunterContext.Provider>
  );
}
