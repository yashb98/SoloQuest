"use client";

import { useEffect, useState, useCallback } from "react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
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
  discipline: number;
  vitality: number;
  intelligence: number;
  hustle: number;
  wealth: number;
}

export default function StatsPage() {
  const [hunter, setHunter] = useState<Hunter | null>(null);

  const fetchData = useCallback(async () => {
    const hunterRes = await fetch("/api/hunter");
    setHunter(await hunterRes.json());
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!hunter) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-sq-border/30 rounded w-48" />
        <div className="sq-panel p-6 h-64" />
      </div>
    );
  }

  // Stat radar data
  const radarData = [
    { stat: "Discipline", value: hunter.discipline, fullMark: 100 },
    { stat: "Vitality", value: hunter.vitality, fullMark: 100 },
    { stat: "Intelligence", value: hunter.intelligence, fullMark: 100 },
    { stat: "Hustle", value: hunter.hustle, fullMark: 100 },
    { stat: "Wealth", value: hunter.wealth, fullMark: 100 },
  ];

  // Summary stats
  const totalStats =
    hunter.discipline +
    hunter.vitality +
    hunter.intelligence +
    hunter.hustle +
    hunter.wealth;
  const strongestStat = radarData.reduce((a, b) =>
    a.value > b.value ? a : b
  );
  const weakestStat = radarData.reduce((a, b) =>
    a.value < b.value ? a : b
  );

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl text-sq-gold">
        HUNTER ANALYTICS
      </h1>

      {/* Quick stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="sq-panel p-3 text-center">
          <Trophy className="w-5 h-5 text-sq-gold mx-auto mb-1" />
          <p className="font-mono text-lg font-bold text-sq-gold">
            {hunter.rank}-{hunter.level}
          </p>
          <p className="font-mono text-[10px] text-sq-muted">RANK</p>
        </div>
        <div className="sq-panel p-3 text-center">
          <Target className="w-5 h-5 text-sq-blue mx-auto mb-1" />
          <p className="font-mono text-lg font-bold text-sq-blue">
            {totalStats}
          </p>
          <p className="font-mono text-[10px] text-sq-muted">TOTAL STATS</p>
        </div>
        <div className="sq-panel p-3 text-center">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="font-mono text-lg font-bold text-orange-400">
            {hunter.streak}
          </p>
          <p className="font-mono text-[10px] text-sq-muted">STREAK</p>
        </div>
        <div className="sq-panel p-3 text-center">
          <Coins className="w-5 h-5 text-sq-gold mx-auto mb-1" />
          <p className="font-mono text-lg font-bold text-sq-gold">
            {hunter.gold.toLocaleString()}
          </p>
          <p className="font-mono text-[10px] text-sq-muted">GOLD</p>
        </div>
      </div>

      {/* Stat Radar Chart */}
      <div className="sq-panel p-4">
        <h2 className="font-display font-semibold text-sm text-sq-text mb-4">
          STAT DISTRIBUTION
        </h2>
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#1E3A5F" />
              <PolarAngleAxis
                dataKey="stat"
                tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "monospace" }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, Math.max(20, ...radarData.map((d) => d.value))]}
                tick={{ fill: "#94A3B8", fontSize: 9 }}
              />
              <Radar
                name="Stats"
                dataKey="value"
                stroke="#E2B04A"
                fill="#E2B04A"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stat breakdown */}
      <div className="sq-panel p-4 space-y-3">
        <h2 className="font-display font-semibold text-sm text-sq-text">
          STAT DETAILS
        </h2>
        {radarData.map((stat) => (
          <div key={stat.stat} className="flex items-center gap-3">
            <span className="font-mono text-xs text-sq-muted w-24">
              {stat.stat}
            </span>
            <div className="flex-1 h-2 bg-sq-bg rounded-full overflow-hidden">
              <div
                className="h-full bg-sq-gold rounded-full transition-all"
                style={{
                  width: `${Math.min(
                    (stat.value / Math.max(20, ...radarData.map((d) => d.value))) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
            <span className="font-mono text-xs text-sq-gold w-8 text-right">
              {stat.value}
            </span>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div className="sq-panel p-4 space-y-2">
        <h2 className="font-display font-semibold text-sm text-sq-text">
          SYSTEM ANALYSIS
        </h2>
        <p className="font-mono text-xs text-sq-muted">
          Strongest: <span className="text-sq-green">{strongestStat.stat}</span>{" "}
          ({strongestStat.value} pts)
        </p>
        <p className="font-mono text-xs text-sq-muted">
          Weakest: <span className="text-red-400">{weakestStat.stat}</span> (
          {weakestStat.value} pts)
        </p>
        <p className="font-mono text-xs text-sq-muted">
          XP Progress:{" "}
          <span className="text-sq-gold">
            {hunter.xp.toLocaleString()} / {hunter.xpToNext.toLocaleString()}
          </span>{" "}
          ({Math.round((hunter.xp / hunter.xpToNext) * 100)}%)
        </p>
      </div>
    </div>
  );
}
