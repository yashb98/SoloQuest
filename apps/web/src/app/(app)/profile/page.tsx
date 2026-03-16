"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, Coins, Calendar, Clock, Award, Swords, BookOpen, Gem, HeartPulse, X } from "lucide-react";
import StatBadge from "@/components/StatBadge";
import XPBar from "@/components/XPBar";

interface Hunter {
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
  statPoints: number;
  vitality: number;
  intel: number;
  hustle: number;
  wealth: number;
  focus: number;
  agentIQ: number;
  goldToMoneyRatio: number;
  prestigeCount: number;
  createdAt: string;
  wakeUpTime: string;
}

const CLASS_CONFIG: Record<string, { icon: React.ReactNode; color: string; label: string; buff: string }> = {
  warrior: { icon: <Swords className="w-5 h-5" />, color: "text-red-500", label: "Warrior", buff: "+10% Hustle XP" },
  scholar: { icon: <BookOpen className="w-5 h-5" />, color: "text-blue-500", label: "Scholar", buff: "+10% Intel XP" },
  rogue: { icon: <Gem className="w-5 h-5" />, color: "text-amber-500", label: "Rogue", buff: "+10% Wealth XP" },
  paladin: { icon: <HeartPulse className="w-5 h-5" />, color: "text-emerald-500", label: "Paladin", buff: "+10% Vitality XP" },
};

export default function ProfilePage() {
  const [hunter, setHunter] = useState<Hunter | null>(null);
  const [showClassPicker, setShowClassPicker] = useState(false);

  const fetchHunter = useCallback(async () => {
    const res = await fetch("/api/hunter");
    setHunter(await res.json());
  }, []);

  useEffect(() => { fetchHunter(); }, [fetchHunter]);

  const handleClassSelect = async (cls: string) => {
    await fetch("/api/hunter/class", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hunterClass: cls }),
    });
    setShowClassPicker(false);
    fetchHunter();
  };

  const handleAllocateStat = async (stat: string) => {
    await fetch("/api/hunter/stats", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stat }),
    });
    fetchHunter();
  };

  if (!hunter) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-sq-hover rounded-xl w-48" />
        <div className="sq-panel p-6 h-64" />
      </div>
    );
  }

  const classConfig = CLASS_CONFIG[hunter.class];
  const joinDate = new Date(hunter.createdAt).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });

  const stats = [
    { key: "vitality", label: "Vitality", icon: "❤️", value: hunter.vitality, color: "text-red-500" },
    { key: "intel", label: "Intel", icon: "🧠", value: hunter.intel, color: "text-blue-500" },
    { key: "hustle", label: "Hustle", icon: "🔥", value: hunter.hustle, color: "text-orange-500" },
    { key: "wealth", label: "Wealth", icon: "💰", value: hunter.wealth, color: "text-yellow-500" },
    { key: "focus", label: "Focus", icon: "🎯", value: hunter.focus, color: "text-cyan-500" },
    { key: "agentIQ", label: "AgentIQ", icon: "🤖", value: hunter.agentIQ, color: "text-purple-500" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-[32px] font-bold text-sq-text tracking-[-0.03em]">Hunter Profile</h1>

      {/* Hunter Card */}
      <div className="sq-panel p-6 space-y-4 border-2 border-sq-accent/30">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-sq-accent to-sq-accent-light flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
            {hunter.hunterName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-bold text-xl text-sq-text">{hunter.hunterName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <StatBadge rank={hunter.rank} level={hunter.rankLevel} />
              {classConfig && <span className={`text-xs font-medium ${classConfig.color}`}>{classConfig.label}</span>}
            </div>
            {hunter.title !== "Newcomer" && (
              <span className="text-xs text-sq-purple mt-0.5 block">&ldquo;{hunter.title}&rdquo;</span>
            )}
          </div>
        </div>

        {hunter.class === "none" && (
          <button onClick={() => setShowClassPicker(true)} className="sq-button-accent w-full text-sm">
            CHOOSE YOUR CLASS
          </button>
        )}

        <XPBar currentXP={hunter.xp} xpToNext={hunter.xpToNext} level={hunter.rankLevel} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="sq-panel p-4 text-center">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-orange-500">{hunter.streak}</p>
          <p className="text-[12px] text-sq-muted font-medium uppercase">Streak</p>
          <p className="text-[11px] text-sq-muted">Best: {hunter.bestStreak}</p>
        </div>
        <div className="sq-panel p-4 text-center">
          <Coins className="w-5 h-5 text-sq-gold mx-auto mb-1" />
          <p className="text-lg font-bold text-sq-gold">{hunter.gold.toLocaleString()}</p>
          <p className="text-[12px] text-sq-muted font-medium uppercase">Gold</p>
          <p className="text-[11px] text-sq-muted">${(hunter.gold * hunter.goldToMoneyRatio).toFixed(0)} saved</p>
        </div>
        <div className="sq-panel p-4 text-center">
          <Award className="w-5 h-5 text-sq-blue mx-auto mb-1" />
          <p className="text-lg font-bold text-sq-blue">{hunter.statPoints}</p>
          <p className="text-[12px] text-sq-muted font-medium uppercase">Stat Pts</p>
          <p className="text-[11px] text-sq-muted">{hunter.streakShields} shields</p>
        </div>
      </div>

      {/* 6 Core Stats */}
      <div className="sq-panel p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[15px] text-sq-text">Hunter Stats</h3>
          {hunter.statPoints > 0 && (
            <span className="text-[13px] text-sq-accent font-medium animate-pulse">{hunter.statPoints} pts to allocate</span>
          )}
        </div>
        {stats.map((s) => (
          <div key={s.key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">{s.icon}</span>
              <span className="text-sm text-sq-muted">{s.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold ${s.color}`}>{s.value}</span>
              {hunter.statPoints > 0 && (
                <button onClick={() => handleAllocateStat(s.key)} className="w-6 h-6 rounded-lg border border-sq-accent/40 text-sq-accent text-xs font-bold hover:bg-sq-accent/10">+</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* System Info */}
      <div className="sq-panel p-5 space-y-2">
        <h3 className="font-semibold text-[15px] text-sq-text">System Info</h3>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-sq-muted" />
          <span className="text-sq-muted">Joined: {joinDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-sq-muted" />
          <span className="text-sq-muted">Wake-up: {hunter.wakeUpTime}</span>
        </div>
        {hunter.prestigeCount > 0 && (
          <p className="text-sm text-sq-accent font-medium">{"★".repeat(hunter.prestigeCount)} Prestige {hunter.prestigeCount}</p>
        )}
        {classConfig && (
          <p className="text-xs text-sq-muted">Class buff: {classConfig.buff}</p>
        )}
      </div>

      {/* Class Picker Modal */}
      <AnimatePresence>
        {showClassPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowClassPicker(false)}
          >
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              className="bg-white rounded-2xl p-6 max-w-md mx-4 border-2 border-sq-accent/50 shadow-sq-accent-glow"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-xl text-sq-accent">Choose Your Class</h2>
                <button onClick={() => setShowClassPicker(false)}><X className="w-5 h-5 text-sq-muted" /></button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(CLASS_CONFIG).map(([key, cfg]) => (
                  <button key={key} onClick={() => handleClassSelect(key)}
                    className="p-4 rounded-xl border border-sq-border hover:border-sq-accent/30 transition-all text-left space-y-1"
                  >
                    <div className={`flex items-center gap-2 ${cfg.color}`}>{cfg.icon}<span className="font-bold text-sm">{cfg.label}</span></div>
                    <p className="text-[12px] text-sq-muted">{cfg.buff}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
