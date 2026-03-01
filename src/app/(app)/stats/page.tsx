"use client";

import { useEffect, useState, useCallback } from "react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer,
} from "recharts";
import { Trophy, Target, Flame, Coins } from "lucide-react";

interface Hunter {
  hunterName: string;
  rank: string;
  level: number;
  xp: number;
  xpToNext: number;
  gold: number;
  streak: number;
  bestStreak: number;
  vitality: number;
  intel: number;
  hustle: number;
  wealth: number;
  focus: number;
  agentIQ: number;
}

export default function StatsPage() {
  const [hunter, setHunter] = useState<Hunter | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/hunter");
    setHunter(await res.json());
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (!hunter) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-sq-hover rounded-xl w-48" />
        <div className="sq-panel p-6 h-64" />
      </div>
    );
  }

  const radarData = [
    { stat: "Vitality", value: hunter.vitality, fullMark: 120 },
    { stat: "Intel", value: hunter.intel, fullMark: 120 },
    { stat: "Hustle", value: hunter.hustle, fullMark: 120 },
    { stat: "Wealth", value: hunter.wealth, fullMark: 120 },
    { stat: "Focus", value: hunter.focus, fullMark: 120 },
    { stat: "AgentIQ", value: hunter.agentIQ, fullMark: 120 },
  ];

  const totalStats = radarData.reduce((sum, s) => sum + s.value, 0);
  const strongestStat = radarData.reduce((a, b) => (a.value > b.value ? a : b));
  const weakestStat = radarData.reduce((a, b) => (a.value < b.value ? a : b));

  return (
    <div className="space-y-6">
      <h1 className="text-[32px] font-bold text-sq-text tracking-[-0.03em]">Hunter Analytics</h1>

      {/* Quick stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="sq-panel p-4 text-center">
          <Trophy className="w-5 h-5 text-sq-accent mx-auto mb-1" />
          <p className="text-lg font-bold text-sq-accent">{hunter.rank}-{hunter.level}</p>
          <p className="text-[12px] text-sq-muted font-medium uppercase">Rank</p>
        </div>
        <div className="sq-panel p-4 text-center">
          <Target className="w-5 h-5 text-sq-blue mx-auto mb-1" />
          <p className="text-lg font-bold text-sq-blue">{totalStats}</p>
          <p className="text-[12px] text-sq-muted font-medium uppercase">Total Stats</p>
        </div>
        <div className="sq-panel p-4 text-center">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-orange-500">{hunter.streak}</p>
          <p className="text-[12px] text-sq-muted font-medium uppercase">Streak</p>
        </div>
        <div className="sq-panel p-4 text-center">
          <Coins className="w-5 h-5 text-sq-gold mx-auto mb-1" />
          <p className="text-lg font-bold text-sq-gold">{hunter.gold.toLocaleString()}</p>
          <p className="text-[12px] text-sq-muted font-medium uppercase">Gold</p>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="sq-panel p-5">
        <h2 className="font-semibold text-[15px] text-sq-text mb-4">Stat Distribution</h2>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E8E4DE" />
              <PolarAngleAxis dataKey="stat" tick={{ fill: "#9C8E82", fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, Math.max(20, ...radarData.map((d) => d.value))]} tick={{ fill: "#9C8E82", fontSize: 9 }} />
              <Radar name="Stats" dataKey="value" stroke="#C4653A" fill="#C4653A" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stat breakdown */}
      <div className="sq-panel p-5 space-y-3">
        <h2 className="font-semibold text-[15px] text-sq-text">Stat Details</h2>
        {radarData.map((stat) => (
          <div key={stat.stat} className="flex items-center gap-3">
            <span className="text-[13px] text-sq-muted w-20">{stat.stat}</span>
            <div className="flex-1 h-2 bg-sq-hover rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sq-accent to-sq-accent-light rounded-full transition-all"
                style={{ width: `${Math.min((stat.value / Math.max(20, ...radarData.map((d) => d.value))) * 100, 100)}%` }}
              />
            </div>
            <span className="text-[13px] text-sq-accent w-8 text-right font-semibold">{stat.value}</span>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="sq-panel p-5 space-y-2">
        <h2 className="font-semibold text-[15px] text-sq-text">System Analysis</h2>
        <p className="text-[14px] text-sq-muted">
          Strongest: <span className="text-sq-green font-medium">{strongestStat.stat}</span> ({strongestStat.value} pts)
        </p>
        <p className="text-[14px] text-sq-muted">
          Weakest: <span className="text-red-500 font-medium">{weakestStat.stat}</span> ({weakestStat.value} pts)
        </p>
        <p className="text-[14px] text-sq-muted">
          Best streak: <span className="text-orange-500 font-medium">{hunter.bestStreak} days</span>
        </p>
        <p className="text-[14px] text-sq-muted">
          XP Progress: <span className="text-sq-accent font-medium">{hunter.xp.toLocaleString()} / {hunter.xpToNext.toLocaleString()}</span>{" "}
          ({Math.round((hunter.xp / hunter.xpToNext) * 100)}%)
        </p>
      </div>
    </div>
  );
}
