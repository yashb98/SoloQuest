"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useHunter } from "@/contexts/HunterContext";
import StatBadge from "./StatBadge";

export default function TopBar() {
  const { hunter, loading, darkMode, toggleDarkMode } = useHunter();

  if (loading || !hunter) {
    return (
      <div className="bg-sq-panel border-b border-sq-border p-4 animate-pulse sticky top-0 z-30">
        <div className="h-10 bg-sq-hover rounded-xl" />
      </div>
    );
  }

  const xpPct = Math.min((hunter.xp / hunter.xpToNext) * 100, 100);

  return (
    <div className="bg-sq-panel border-b border-sq-border sticky top-0 z-30">
      <div className="px-6 py-4 flex items-center justify-between">
        {/* Profile section */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sq-accent to-sq-accent-light flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {hunter.hunterName.charAt(0).toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-sq-text tracking-[-0.02em]">{hunter.hunterName}</span>
              <StatBadge rank={hunter.rank} level={hunter.level} />
            </div>
            <div className="mt-1 max-w-[300px]">
              {/* Inline XP bar for real-time updates */}
              <div className="w-full">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[13px] font-medium text-sq-muted">Level {hunter.level} - </span>
                  <span className="text-[13px] font-medium text-sq-muted">
                    - ({hunter.xp.toLocaleString()} / {hunter.xpToNext.toLocaleString()} XP)
                  </span>
                </div>
                <div className="h-2 bg-sq-hover rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-sq-accent to-sq-accent-light rounded-full"
                    initial={false}
                    animate={{ width: `${xpPct}%` }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right side stats */}
        <div className="flex items-center gap-3">
          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="w-9 h-9 rounded-full flex items-center justify-center bg-sq-hover border border-sq-border hover:border-sq-accent/50 transition-colors"
            title={darkMode ? "Light mode" : "Dark mode"}
          >
            {darkMode ? (
              <Sun className="w-4 h-4 text-sq-gold" />
            ) : (
              <Moon className="w-4 h-4 text-sq-subtle" />
            )}
          </button>
          <div className="flex items-center gap-2 bg-sq-warm px-4 py-2 rounded-full border border-sq-warm-border">
            <span className="text-[18px]">🔥</span>
            <span className="font-semibold text-[15px] text-sq-accent">{hunter.streak}d</span>
          </div>
          <div className="flex items-center gap-2 bg-sq-warm px-4 py-2 rounded-full border border-sq-warm-border">
            <span className="text-[18px]">🪙</span>
            <span className="font-semibold text-[15px] text-sq-accent">{hunter.gold.toLocaleString()}G</span>
          </div>
        </div>
      </div>
    </div>
  );
}
