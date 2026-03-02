"use client";

import { useState, useEffect, useCallback } from "react";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, ResponsiveContainer,
  Tooltip, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, Radar,
} from "recharts";
import {
  TrendingUp, Flame, Target, Clock, Zap, Trophy,
  Calendar,
} from "lucide-react";

interface AnalyticsData {
  heatmap: Array<{ date: string; xp: number; quests: number; gold: number }>;
  weeklyTrend: Array<{ week: string; xp: number; quests: number }>;
  categoryBreakdown: Record<string, { count: number; xp: number }>;
  statDistribution: Record<string, number>;
  stats: Record<string, number>;
  totals: { xp: number; gold: number; quests: number; minutesFocused: number; sessions: number };
  bestDay: { date: string; xp: number };
  streak: number;
  bestStreak: number;
  level: number;
  rank: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  health: "#22C55E",
  learning: "#3B82F6",
  jobs: "#F59E0B",
  finance: "#6366F1",
  focus: "#EC4899",
  food: "#F97316",
  mental: "#A855F7",
  agentiq: "#3B82F6",
};

const STAT_LABELS: Record<string, string> = {
  vitality: "VIT",
  intel: "INT",
  hustle: "HUS",
  wealth: "WLT",
  focus: "FOC",
  agentIQ: "AIQ",
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/analytics");
    setData(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading || !data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-sq-hover rounded-xl w-48" />
        {[1, 2, 3].map((i) => <div key={i} className="sq-panel p-6 h-48" />)}
      </div>
    );
  }

  // Build category pie data
  const catPieData = Object.entries(data.categoryBreakdown).map(([key, val]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: val.count,
    color: CATEGORY_COLORS[key] || "#9CA3AF",
  }));

  // Build radar data for stats
  const radarData = Object.entries(data.stats).map(([key, value]) => ({
    stat: STAT_LABELS[key] || key,
    value,
  }));

  // Heatmap: get intensity level (0-4) for each day
  const maxXP = Math.max(...data.heatmap.map((d) => d.xp), 1);
  const getHeatLevel = (xp: number) => {
    if (xp === 0) return 0;
    const pct = xp / maxXP;
    if (pct < 0.25) return 1;
    if (pct < 0.5) return 2;
    if (pct < 0.75) return 3;
    return 4;
  };
  const heatColors = [
    "bg-sq-hover",
    "bg-sq-accent/20",
    "bg-sq-accent/40",
    "bg-sq-accent/70",
    "bg-sq-accent",
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-[32px] font-bold text-sq-text tracking-[-0.03em]">Analytics</h1>

      {/* ─── Overview Cards ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="sq-panel p-4">
          <Zap className="w-4 h-4 text-sq-accent mb-1" />
          <span className="text-[24px] font-bold text-sq-text">{data.totals.xp.toLocaleString()}</span>
          <p className="text-[12px] text-sq-muted">Total XP (90d)</p>
        </div>
        <div className="sq-panel p-4">
          <Target className="w-4 h-4 text-sq-green mb-1" />
          <span className="text-[24px] font-bold text-sq-text">{data.totals.quests}</span>
          <p className="text-[12px] text-sq-muted">Quests Done</p>
        </div>
        <div className="sq-panel p-4">
          <Flame className="w-4 h-4 text-sq-accent mb-1" />
          <span className="text-[24px] font-bold text-sq-text">{data.bestStreak}</span>
          <p className="text-[12px] text-sq-muted">Best Streak</p>
        </div>
        <div className="sq-panel p-4">
          <Clock className="w-4 h-4 text-sq-purple mb-1" />
          <span className="text-[24px] font-bold text-sq-text">{data.totals.minutesFocused}m</span>
          <p className="text-[12px] text-sq-muted">Focused Time</p>
        </div>
      </div>

      {/* ─── Activity Heatmap ─── */}
      <div className="sq-panel p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-4 h-4 text-sq-accent" />
          <span className="text-[14px] font-bold text-sq-text">Activity Heatmap (90 days)</span>
        </div>
        <div className="flex flex-wrap gap-[3px]">
          {data.heatmap.map((day) => {
            const level = getHeatLevel(day.xp);
            return (
              <div
                key={day.date}
                className={`w-[11px] h-[11px] rounded-[2px] ${heatColors[level]} transition-colors`}
                title={`${day.date}: ${day.xp} XP, ${day.quests} quests`}
              />
            );
          })}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-[11px] text-sq-muted">Less</span>
          {heatColors.map((color, i) => (
            <div key={i} className={`w-[11px] h-[11px] rounded-[2px] ${color}`} />
          ))}
          <span className="text-[11px] text-sq-muted">More</span>
        </div>
        {data.bestDay.xp > 0 && (
          <p className="text-[12px] text-sq-muted mt-2">
            Best day: <span className="text-sq-accent font-semibold">{data.bestDay.date}</span> with {data.bestDay.xp} XP
          </p>
        )}
      </div>

      {/* ─── Weekly XP Trend + Category Breakdown ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly Trend */}
        <div className="sq-panel p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-sq-accent" />
            <span className="text-[14px] font-bold text-sq-text">Weekly XP Trend</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data.weeklyTrend}>
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--sq-muted)" }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: "var(--sq-panel)", border: "1px solid var(--sq-border)", borderRadius: "10px", fontSize: "13px" }}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(value: any) => [`${value} XP`, "XP"]}
              />
              <Line type="monotone" dataKey="xp" stroke="var(--sq-accent)" strokeWidth={2.5} dot={{ fill: "var(--sq-accent)", r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie */}
        <div className="sq-panel p-5">
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-sq-gold" />
            <span className="text-[14px] font-bold text-sq-text">Category Breakdown</span>
          </div>
          {catPieData.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={catPieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={2} dataKey="value">
                    {catPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 flex-1">
                {catPieData.map((cat) => (
                  <div key={cat.name} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ background: cat.color }} />
                    <span className="text-[12px] text-sq-text font-medium">{cat.name}</span>
                    <span className="text-[11px] text-sq-muted ml-auto">{cat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[140px] flex items-center justify-center text-sq-muted text-[13px]">
              No data yet
            </div>
          )}
        </div>
      </div>

      {/* ─── Stat Radar Chart ─── */}
      <div className="sq-panel p-5">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-sq-purple" />
          <span className="text-[14px] font-bold text-sq-text">Stat Distribution</span>
        </div>
        <div className="flex justify-center">
          <ResponsiveContainer width={300} height={250}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--sq-border)" />
              <PolarAngleAxis dataKey="stat" tick={{ fontSize: 12, fill: "var(--sq-text)" }} />
              <PolarRadiusAxis tick={{ fontSize: 10, fill: "var(--sq-muted)" }} />
              <Radar dataKey="value" stroke="var(--sq-accent)" fill="var(--sq-accent)" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ─── Quests per Week Bar Chart ─── */}
      <div className="sq-panel p-5">
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-4 h-4 text-sq-green" />
          <span className="text-[14px] font-bold text-sq-text">Quests Per Week</span>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data.weeklyTrend} barSize={20}>
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "var(--sq-muted)" }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ background: "var(--sq-panel)", border: "1px solid var(--sq-border)", borderRadius: "10px", fontSize: "13px" }}
            />
            <Bar dataKey="quests" fill="#22C55E" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
