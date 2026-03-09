"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import {
  Flame, Swords, CalendarCheck, Target, Trophy, TrendingUp,
  Plus, ChevronRight, Timer, Shield, Map,
} from "lucide-react";
import Link from "next/link";
import QuestBoard from "@/components/QuestBoard";
import LevelUpModal from "@/components/LevelUpModal";
import { useHunter } from "@/contexts/HunterContext";

interface Quest {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  tier: string;
  xpBase: number;
  goldBase: number;
  statTarget: string;
  statGain: number;
  isCompleted: boolean;
}

interface LevelUpData {
  newLevel: number;
  newRank: string;
  isGateLocked: boolean;
  gateLevel: number | null;
  levelsGained: number;
  statPointsEarned: number;
  goldBonus: number;
}

interface DashboardData {
  todayTodos: { total: number; completed: number };
  quests: { total: number; completed: number };
  activeDungeon: { title: string; deadline: string | null; dayNumber: number } | null;
  weeklyXPChart: Array<{ date: string; day: string; xp: number }>;
  weeklyStats: { xp: number; gold: number; quests: number };
  achievements: { unlocked: number; total: number };
  upcomingGoals: Array<{ id: number; title: string; type: string; targetDate: string | null; xpReward: number }>;
  streak: number;
  bestStreak: number;
  streakShields: number;
}

interface RoadmapProgress {
  hasRoadmap: boolean;
  roadmap?: { targetRole: string; experienceLevel: string; timeline: string; summary: string };
  progress?: { overall: number; quests: { total: number; completed: number } };
  milestones?: Array<{ title: string; weekNumber: number; isCompleted: boolean }>;
}

export default function DashboardPage() {
  const { refreshHunter, addToast, checkAchievements, updateHunterOptimistic, hunter } = useHunter();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loadingQuestId, setLoadingQuestId] = useState<number | null>(null);
  const [levelUpData, setLevelUpData] = useState<LevelUpData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dashData, setDashData] = useState<DashboardData | null>(null);
  const [roadmapData, setRoadmapData] = useState<RoadmapProgress | null>(null);

  const fetchQuests = useCallback(async () => {
    const res = await fetch("/api/quests");
    const data = await res.json();
    setQuests(data);
    setIsLoading(false);
  }, []);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      setDashData(data);
    } catch (err) {
      console.error("Dashboard fetch failed:", err);
    }
  }, []);

  const fetchRoadmap = useCallback(async () => {
    try {
      const res = await fetch("/api/roadmap/progress");
      const data = await res.json();
      setRoadmapData(data);
    } catch {
      // Roadmap progress not critical
    }
  }, []);

  useEffect(() => {
    fetchQuests();
    fetchDashboard();
    fetchRoadmap();
    // Re-fetch everything when day changes at midnight
    const onDayChange = () => { fetchQuests(); fetchDashboard(); fetchRoadmap(); };
    window.addEventListener("sq-day-changed", onDayChange);
    return () => window.removeEventListener("sq-day-changed", onDayChange);
  }, [fetchQuests, fetchDashboard, fetchRoadmap]);

  const handleCompleteQuest = async (questId: number) => {
    setLoadingQuestId(questId);

    try {
      const res = await fetch("/api/quests/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questId }),
      });

      const data = await res.json();

      if (data.success) {
        // Optimistic UI update for quest list
        setQuests((prev) =>
          prev.map((q) => (q.id === questId ? { ...q, isCompleted: true } : q))
        );

        // Optimistic XP/gold update in TopBar — instant
        if (hunter) {
          updateHunterOptimistic({
            xp: data.didLevelUp ? 0 : (hunter.xp + data.xpEarned),
            gold: hunter.gold + data.goldEarned + (data.levelUpGoldBonus || 0),
            level: data.newLevel || hunter.level,
            rank: data.newRank || hunter.rank,
          });
        }

        // Toast for XP + gold
        addToast({
          type: "xp",
          title: `+${data.xpEarned} XP`,
          description: `+${data.goldEarned}G earned`,
          duration: 2500,
        });

        if (data.statGain && data.statTarget) {
          addToast({
            type: "stat",
            title: `+${data.statGain} ${data.statTarget.toUpperCase()}`,
            description: "Stat increased!",
            duration: 2000,
          });
        }

        if (data.didLevelUp || data.isGateLocked) {
          setLevelUpData({
            newLevel: data.newLevel,
            newRank: data.newRank,
            isGateLocked: data.isGateLocked,
            gateLevel: data.gateLevel,
            levelsGained: data.levelsGained ?? 1,
            statPointsEarned: data.statPointsEarned ?? 0,
            goldBonus: data.levelUpGoldBonus ?? 0,
          });
        }

        // Background: refresh hunter data (authoritative) + check achievements + refresh dashboard
        refreshHunter();
        checkAchievements();
        fetchDashboard();
      }
    } catch (error) {
      console.error("Failed to complete quest:", error);
      addToast({ type: "error", title: "Failed to complete quest" });
    } finally {
      setLoadingQuestId(null);
    }
  };

  const handleUndoQuest = async (questId: number) => {
    setLoadingQuestId(questId);

    try {
      const res = await fetch("/api/quests/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questId, undo: true }),
      });

      const data = await res.json();

      if (data.success && data.undone) {
        setQuests((prev) =>
          prev.map((q) => (q.id === questId ? { ...q, isCompleted: false } : q))
        );

        addToast({
          type: "info",
          title: "Quest undone",
          description: `-${data.xpReversed} XP reversed`,
          duration: 2500,
        });

        refreshHunter();
        fetchDashboard();
      }
    } catch (error) {
      console.error("Failed to undo quest:", error);
    } finally {
      setLoadingQuestId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="sq-panel p-4 animate-pulse">
              <div className="h-4 bg-sq-hover rounded w-20 mb-2" />
              <div className="h-7 bg-sq-hover rounded w-16" />
            </div>
          ))}
        </div>
        <div className="sq-panel p-6 animate-pulse">
          <div className="h-6 bg-sq-hover rounded-xl w-48 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-sq-hover rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const todoProgress = dashData?.todayTodos;
  const todoPct = todoProgress && todoProgress.total > 0
    ? Math.round((todoProgress.completed / todoProgress.total) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* ─── Dashboard Widgets Grid ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Streak Widget */}
        <Link href="/stats" className="sq-panel p-4 hover:shadow-sq-card-hover transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-4 h-4 text-sq-accent" />
            <span className="text-[12px] font-semibold text-sq-muted uppercase tracking-wider">Streak</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[28px] font-bold text-sq-accent">{dashData?.streak ?? 0}</span>
            <span className="text-[14px] text-sq-muted font-medium">days</span>
          </div>
          {(dashData?.streakShields ?? 0) > 0 && (
            <div className="flex items-center gap-1 mt-1">
              <Shield className="w-3 h-3 text-sq-blue" />
              <span className="text-[11px] text-sq-blue font-medium">{dashData?.streakShields} shields</span>
            </div>
          )}
        </Link>

        {/* Today's Planner */}
        <Link href="/planner" className="sq-panel p-4 hover:shadow-sq-card-hover transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <CalendarCheck className="w-4 h-4 text-sq-green" />
            <span className="text-[12px] font-semibold text-sq-muted uppercase tracking-wider">Planner</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[28px] font-bold text-sq-text">
              {todoProgress?.completed ?? 0}/{todoProgress?.total ?? 0}
            </span>
          </div>
          <div className="h-1.5 bg-sq-hover rounded-full overflow-hidden mt-2">
            <motion.div
              className="h-full bg-sq-green rounded-full"
              initial={false}
              animate={{ width: `${todoPct}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </Link>

        {/* Weekly XP */}
        <Link href="/analytics" className="sq-panel p-4 hover:shadow-sq-card-hover transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-sq-purple" />
            <span className="text-[12px] font-semibold text-sq-muted uppercase tracking-wider">Week XP</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[28px] font-bold text-sq-purple">{(dashData?.weeklyStats?.xp ?? 0).toLocaleString()}</span>
          </div>
          <span className="text-[11px] text-sq-muted font-medium">{dashData?.weeklyStats?.quests ?? 0} quests done</span>
        </Link>

        {/* Achievements */}
        <Link href="/achievements" className="sq-panel p-4 hover:shadow-sq-card-hover transition-shadow">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-sq-gold" />
            <span className="text-[12px] font-semibold text-sq-muted uppercase tracking-wider">Badges</span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[28px] font-bold text-sq-gold">{dashData?.achievements?.unlocked ?? 0}</span>
            <span className="text-[14px] text-sq-muted font-medium">/ {dashData?.achievements?.total ?? 0}</span>
          </div>
        </Link>
      </div>

      {/* ─── Roadmap Progress Widget ─── */}
      {roadmapData?.hasRoadmap && roadmapData.roadmap && (
        <Link href="/roadmap" className="sq-panel p-5 hover:shadow-sq-card-hover transition-shadow block">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Map className="w-4 h-4 text-sq-purple" />
              <span className="text-[12px] font-bold text-sq-muted uppercase tracking-wider">Career Roadmap</span>
            </div>
            <div className="flex items-center gap-1 text-[12px] text-sq-accent font-semibold">
              View <ChevronRight className="w-3 h-3" />
            </div>
          </div>
          <h3 className="text-[17px] font-bold text-sq-text">{roadmapData.roadmap.targetRole}</h3>
          <div className="flex items-center gap-3 mt-2 text-[13px]">
            <span className="px-2 py-0.5 rounded bg-sq-hover text-sq-muted text-[11px] font-bold uppercase">
              {roadmapData.roadmap.experienceLevel}
            </span>
            <span className="text-sq-muted">{roadmapData.roadmap.timeline}</span>
            <span className="text-sq-accent font-semibold">{Math.round(roadmapData.progress?.overall ?? 0)}% complete</span>
          </div>
          <div className="h-2 bg-sq-hover rounded-full overflow-hidden mt-3">
            <motion.div
              className="h-full bg-sq-purple rounded-full"
              initial={false}
              animate={{ width: `${roadmapData.progress?.overall ?? 0}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          {roadmapData.milestones && roadmapData.milestones.length > 0 && (
            <div className="flex items-center gap-2 mt-2 text-[11px] text-sq-muted">
              <Target className="w-3 h-3" />
              Next: {roadmapData.milestones.find((m) => !m.isCompleted)?.title || "All milestones complete!"}
            </div>
          )}
        </Link>
      )}

      {/* ─── Active Dungeon + Weekly XP Chart Row ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Dungeon */}
        {dashData?.activeDungeon ? (
          <Link href="/dungeons" className="sq-panel p-5 hover:shadow-sq-card-hover transition-shadow">
            <div className="flex items-center gap-2 mb-3">
              <Swords className="w-4 h-4 text-red-500" />
              <span className="text-[12px] font-bold text-red-500 uppercase tracking-wider">Active Dungeon</span>
            </div>
            <h3 className="text-[17px] font-bold text-sq-text">{dashData.activeDungeon.title}</h3>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[14px] text-sq-accent font-semibold">
                Day {dashData.activeDungeon.dayNumber} / 7
              </span>
              {dashData.activeDungeon.deadline && (
                <span className="text-[12px] text-sq-muted">
                  Ends {new Date(dashData.activeDungeon.deadline).toLocaleDateString()}
                </span>
              )}
            </div>
            <div className="h-1.5 bg-sq-hover rounded-full overflow-hidden mt-3">
              <motion.div
                className="h-full bg-red-500 rounded-full"
                initial={false}
                animate={{ width: `${(dashData.activeDungeon.dayNumber / 7) * 100}%` }}
              />
            </div>
          </Link>
        ) : (
          <Link href="/dungeons" className="sq-panel p-5 hover:shadow-sq-card-hover transition-shadow border-dashed">
            <div className="flex items-center gap-2 mb-3">
              <Swords className="w-4 h-4 text-sq-muted" />
              <span className="text-[12px] font-bold text-sq-muted uppercase tracking-wider">No Active Dungeon</span>
            </div>
            <p className="text-[14px] text-sq-muted">Start a 7-day challenge to earn massive rewards.</p>
            <div className="flex items-center gap-1 text-[13px] text-sq-accent font-semibold mt-3 transition-all">
              Browse Dungeons <ChevronRight className="w-4 h-4" />
            </div>
          </Link>
        )}

        {/* Weekly XP Chart */}
        <div className="sq-panel p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sq-accent" />
              <span className="text-[12px] font-bold text-sq-muted uppercase tracking-wider">Weekly XP</span>
            </div>
            <span className="text-[13px] text-sq-accent font-semibold">
              {(dashData?.weeklyStats?.xp ?? 0).toLocaleString()} XP
            </span>
          </div>
          {dashData?.weeklyXPChart && dashData.weeklyXPChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={dashData.weeklyXPChart} barSize={24}>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "var(--sq-muted)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip
                  contentStyle={{
                    background: "var(--sq-panel)",
                    border: "1px solid var(--sq-border)",
                    borderRadius: "10px",
                    fontSize: "13px",
                  }}
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => [`${value} XP`, "XP Earned"]}
                />
                <Bar dataKey="xp" fill="var(--sq-accent)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[120px] flex items-center justify-center text-sq-muted text-[13px]">
              No data yet this week
            </div>
          )}
        </div>
      </div>

      {/* ─── Upcoming Goals ─── */}
      {dashData?.upcomingGoals && dashData.upcomingGoals.length > 0 && (
        <div className="sq-panel p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-sq-blue" />
              <span className="text-[12px] font-bold text-sq-muted uppercase tracking-wider">Upcoming Goals</span>
            </div>
            <Link href="/goals" className="text-[12px] text-sq-accent font-semibold hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-2">
            {dashData.upcomingGoals.slice(0, 3).map((goal) => (
              <div key={goal.id} className="flex items-center justify-between py-2 border-b border-sq-border last:border-0">
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-bold px-2 py-0.5 rounded bg-sq-hover text-sq-muted uppercase">
                    {goal.type}
                  </span>
                  <span className="text-[14px] text-sq-text font-medium">{goal.title}</span>
                </div>
                {goal.targetDate && (
                  <span className="text-[12px] text-sq-muted">
                    {new Date(goal.targetDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ─── Quick Actions Row ─── */}
      <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
        <Link
          href="/planner"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sq-green/10 border border-sq-green/20 text-sq-green text-[13px] font-semibold hover:bg-sq-green/20 transition-colors flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Add Task
        </Link>
        <Link
          href="/dungeons"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-[13px] font-semibold hover:bg-red-500/20 transition-colors flex-shrink-0"
        >
          <Swords className="w-4 h-4" /> Start Dungeon
        </Link>
        <Link
          href="/timer"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sq-purple/10 border border-sq-purple/20 text-sq-purple text-[13px] font-semibold hover:bg-sq-purple/20 transition-colors flex-shrink-0"
        >
          <Timer className="w-4 h-4" /> Focus Timer
        </Link>
      </div>

      {/* ─── Quest Board ─── */}
      <QuestBoard
        quests={quests}
        onComplete={handleCompleteQuest}
        onUndo={handleUndoQuest}
        onQuestCreated={fetchQuests}
        loadingQuestId={loadingQuestId}
      />

      <LevelUpModal
        isOpen={levelUpData !== null}
        onClose={() => setLevelUpData(null)}
        newLevel={levelUpData?.newLevel ?? 1}
        newRank={levelUpData?.newRank ?? "E"}
        isGateLocked={levelUpData?.isGateLocked ?? false}
        gateLevel={levelUpData?.gateLevel ?? null}
        levelsGained={levelUpData?.levelsGained}
        statPointsEarned={levelUpData?.statPointsEarned}
        goldBonus={levelUpData?.goldBonus}
      />
    </div>
  );
}
