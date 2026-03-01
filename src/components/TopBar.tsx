"use client";

import { useEffect, useState } from "react";
import { Shield, Flame, Coins } from "lucide-react";
import XPBar from "./XPBar";
import StatBadge from "./StatBadge";

interface HunterData {
  hunterName: string;
  rank: string;
  level: number;
  xp: number;
  xpToNext: number;
  gold: number;
  streak: number;
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
      <div className="sq-panel p-3 animate-pulse">
        <div className="h-10 bg-sq-border/30 rounded" />
      </div>
    );
  }

  return (
    <div className="sq-panel p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="w-5 h-5 text-sq-gold" />
          <span className="font-display font-bold text-lg text-sq-text">
            {hunter.hunterName}
          </span>
          <StatBadge rank={hunter.rank} level={hunter.level} />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="font-mono text-sm text-sq-muted">
              {hunter.streak}d
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Coins className="w-4 h-4 text-sq-gold" />
            <span className="font-mono text-sm text-sq-gold">
              {hunter.gold.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      <XPBar
        currentXP={hunter.xp}
        xpToNext={hunter.xpToNext}
        level={hunter.level}
      />
    </div>
  );
}
