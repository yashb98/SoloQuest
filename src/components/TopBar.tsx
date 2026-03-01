"use client";

import { useEffect, useState } from "react";
import XPBar from "./XPBar";
import StatBadge from "./StatBadge";

interface HunterData {
  hunterName: string;
  class: string;
  rank: string;
  level: number;
  xp: number;
  xpToNext: number;
  gold: number;
  streak: number;
  title: string;
}

export default function TopBar() {
  const [hunter, setHunter] = useState<HunterData | null>(null);

  useEffect(() => {
    fetch("/api/hunter")
      .then((res) => res.json())
      .then((data) => setHunter(data))
      .catch(console.error);
  }, []);

  if (!hunter) {
    return (
      <div className="bg-white border-b border-sq-border p-4 animate-pulse">
        <div className="h-10 bg-sq-hover rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white border-b border-sq-border sticky top-0 z-30">
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
              <XPBar currentXP={hunter.xp} xpToNext={hunter.xpToNext} level={hunter.level} />
            </div>
          </div>
        </div>

        {/* Right side stats */}
        <div className="flex items-center gap-4">
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
