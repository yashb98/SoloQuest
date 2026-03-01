"use client";

import { useEffect, useState, useCallback } from "react";
import { Shield, Flame, Coins, Calendar, Clock, Award } from "lucide-react";
import StatBadge from "@/components/StatBadge";
import XPBar from "@/components/XPBar";

interface Hunter {
  hunterName: string;
  rank: string;
  level: number;
  xp: number;
  xpToNext: number;
  gold: number;
  streak: number;
  wakeUpTime: string;
  discipline: number;
  vitality: number;
  intelligence: number;
  hustle: number;
  wealth: number;
  createdAt: string;
}

export default function ProfilePage() {
  const [hunter, setHunter] = useState<Hunter | null>(null);

  const fetchHunter = useCallback(async () => {
    const res = await fetch("/api/hunter");
    setHunter(await res.json());
  }, []);

  useEffect(() => {
    fetchHunter();
  }, [fetchHunter]);

  if (!hunter) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-sq-border/30 rounded w-48" />
        <div className="sq-panel p-6 h-64" />
      </div>
    );
  }

  const joinDate = new Date(hunter.createdAt).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const stats = [
    { label: "Discipline", value: hunter.discipline, color: "text-red-400" },
    { label: "Vitality", value: hunter.vitality, color: "text-sq-green" },
    {
      label: "Intelligence",
      value: hunter.intelligence,
      color: "text-sq-blue",
    },
    { label: "Hustle", value: hunter.hustle, color: "text-orange-400" },
    { label: "Wealth", value: hunter.wealth, color: "text-sq-gold" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl text-sq-gold">
        HUNTER PROFILE
      </h1>

      {/* Hunter card */}
      <div className="sq-panel p-6 space-y-4 border-2 border-sq-gold/30">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-sq-bg border border-sq-border flex items-center justify-center">
            <Shield className="w-8 h-8 text-sq-gold" />
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-sq-text">
              {hunter.hunterName}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <StatBadge rank={hunter.rank} level={hunter.level} />
              <span className="font-mono text-xs text-sq-muted">
                ID: YB-001
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

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="sq-panel p-3 text-center">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="font-mono text-lg font-bold text-orange-400">
            {hunter.streak}
          </p>
          <p className="font-mono text-[10px] text-sq-muted">DAY STREAK</p>
        </div>
        <div className="sq-panel p-3 text-center">
          <Coins className="w-5 h-5 text-sq-gold mx-auto mb-1" />
          <p className="font-mono text-lg font-bold text-sq-gold">
            {hunter.gold.toLocaleString()}
          </p>
          <p className="font-mono text-[10px] text-sq-muted">GOLD</p>
        </div>
        <div className="sq-panel p-3 text-center">
          <Award className="w-5 h-5 text-sq-blue mx-auto mb-1" />
          <p className="font-mono text-lg font-bold text-sq-blue">
            {hunter.xp.toLocaleString()}
          </p>
          <p className="font-mono text-[10px] text-sq-muted">TOTAL XP</p>
        </div>
      </div>

      {/* Stats */}
      <div className="sq-panel p-4 space-y-3">
        <h3 className="font-display font-semibold text-sm text-sq-text">
          HUNTER STATS
        </h3>
        {stats.map((s) => (
          <div key={s.label} className="flex items-center justify-between">
            <span className="font-mono text-sm text-sq-muted">{s.label}</span>
            <span className={`font-mono text-sm font-bold ${s.color}`}>
              {s.value}
            </span>
          </div>
        ))}
      </div>

      {/* Info */}
      <div className="sq-panel p-4 space-y-2">
        <h3 className="font-display font-semibold text-sm text-sq-text">
          SYSTEM INFO
        </h3>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-sq-muted" />
          <span className="font-mono text-sq-muted">Joined: {joinDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-sq-muted" />
          <span className="font-mono text-sq-muted">
            Wake-up: {hunter.wakeUpTime}
          </span>
        </div>
      </div>
    </div>
  );
}
