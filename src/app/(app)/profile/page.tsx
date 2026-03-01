"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Flame, Coins, Calendar, Clock, Award, Swords, BookOpen, Gem, HeartPulse, X } from "lucide-react";
import StatBadge from "@/components/StatBadge";
import XPBar from "@/components/XPBar";

interface Hunter {
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
  warrior: { icon: <Swords className="w-5 h-5" />, color: "text-red-400", label: "Warrior", buff: "+10% Hustle XP" },
  scholar: { icon: <BookOpen className="w-5 h-5" />, color: "text-blue-400", label: "Scholar", buff: "+10% Intel XP" },
  rogue: { icon: <Gem className="w-5 h-5" />, color: "text-amber-400", label: "Rogue", buff: "+10% Wealth XP" },
  paladin: { icon: <HeartPulse className="w-5 h-5" />, color: "text-emerald-400", label: "Paladin", buff: "+10% Vitality XP" },
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
        <div className="h-8 bg-sq-border/30 rounded w-48" />
        <div className="sq-panel p-6 h-64" />
      </div>
    );
  }

  const classConfig = CLASS_CONFIG[hunter.class];
  const joinDate = new Date(hunter.createdAt).toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });

  const stats = [
    { key: "vitality", label: "Vitality", icon: "❤️", value: hunter.vitality, color: "text-red-400" },
    { key: "intel", label: "Intel", icon: "🧠", value: hunter.intel, color: "text-sq-blue" },
    { key: "hustle", label: "Hustle", icon: "🔥", value: hunter.hustle, color: "text-orange-400" },
    { key: "wealth", label: "Wealth", icon: "💰", value: hunter.wealth, color: "text-sq-gold" },
    { key: "focus", label: "Focus", icon: "🎯", value: hunter.focus, color: "text-cyan-400" },
    { key: "agentIQ", label: "AgentIQ", icon: "🤖", value: hunter.agentIQ, color: "text-sq-purple" },
  ];

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl text-sq-gold">HUNTER PROFILE</h1>

      {/* Hunter Card */}
      <div className="sq-panel p-6 space-y-4 border-2 border-sq-gold/30">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-lg bg-sq-bg border border-sq-border flex items-center justify-center">
            {classConfig ? (
              <span className={classConfig.color}>{classConfig.icon}</span>
            ) : (
              <Shield className="w-8 h-8 text-sq-gold" />
            )}
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-sq-text">{hunter.hunterName}</h2>
            <div className="flex items-center gap-2 mt-1">
              <StatBadge rank={hunter.rank} level={hunter.level} />
              {classConfig && <span className={`font-mono text-xs ${classConfig.color}`}>{classConfig.label}</span>}
            </div>
            {hunter.title !== "Newcomer" && (
              <span className="font-mono text-xs text-sq-purple mt-0.5 block">&ldquo;{hunter.title}&rdquo;</span>
            )}
          </div>
        </div>

        {hunter.class === "none" && (
          <button onClick={() => setShowClassPicker(true)} className="sq-button-gold w-full text-sm">
            CHOOSE YOUR CLASS
          </button>
        )}

        <XPBar currentXP={hunter.xp} xpToNext={hunter.xpToNext} level={hunter.level} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="sq-panel p-3 text-center">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-1" />
          <p className="font-mono text-lg font-bold text-orange-400">{hunter.streak}</p>
          <p className="font-mono text-[10px] text-sq-muted">STREAK</p>
          <p className="font-mono text-[9px] text-sq-muted">Best: {hunter.bestStreak}</p>
        </div>
        <div className="sq-panel p-3 text-center">
          <Coins className="w-5 h-5 text-sq-gold mx-auto mb-1" />
          <p className="font-mono text-lg font-bold text-sq-gold">{hunter.gold.toLocaleString()}</p>
          <p className="font-mono text-[10px] text-sq-muted">GOLD</p>
          <p className="font-mono text-[9px] text-sq-muted">${(hunter.gold * hunter.goldToMoneyRatio).toFixed(0)} saved</p>
        </div>
        <div className="sq-panel p-3 text-center">
          <Award className="w-5 h-5 text-sq-blue mx-auto mb-1" />
          <p className="font-mono text-lg font-bold text-sq-blue">{hunter.statPoints}</p>
          <p className="font-mono text-[10px] text-sq-muted">STAT PTS</p>
          <p className="font-mono text-[9px] text-sq-muted">{hunter.streakShields} shields</p>
        </div>
      </div>

      {/* 6 Core Stats */}
      <div className="sq-panel p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-sm text-sq-text">HUNTER STATS</h3>
          {hunter.statPoints > 0 && (
            <span className="font-mono text-xs text-sq-gold animate-pulse">{hunter.statPoints} pts to allocate</span>
          )}
        </div>
        {stats.map((s) => (
          <div key={s.key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">{s.icon}</span>
              <span className="font-mono text-sm text-sq-muted">{s.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-mono text-sm font-bold ${s.color}`}>{s.value}</span>
              {hunter.statPoints > 0 && (
                <button onClick={() => handleAllocateStat(s.key)} className="w-6 h-6 rounded border border-sq-gold/40 text-sq-gold text-xs font-bold hover:bg-sq-gold/10">+</button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* System Info */}
      <div className="sq-panel p-4 space-y-2">
        <h3 className="font-display font-semibold text-sm text-sq-text">SYSTEM INFO</h3>
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-sq-muted" />
          <span className="font-mono text-sq-muted">Joined: {joinDate}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-sq-muted" />
          <span className="font-mono text-sq-muted">Wake-up: {hunter.wakeUpTime}</span>
        </div>
        {hunter.prestigeCount > 0 && (
          <p className="font-mono text-sm text-sq-gold">{"★".repeat(hunter.prestigeCount)} Prestige {hunter.prestigeCount}</p>
        )}
        {classConfig && (
          <p className="font-mono text-xs text-sq-muted">Class buff: {classConfig.buff}</p>
        )}
      </div>

      {/* Class Picker Modal */}
      <AnimatePresence>
        {showClassPicker && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setShowClassPicker(false)}
          >
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              className="sq-panel p-6 max-w-md mx-4 border-2 border-sq-gold/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-xl text-sq-gold">CHOOSE YOUR CLASS</h2>
                <button onClick={() => setShowClassPicker(false)}><X className="w-5 h-5 text-sq-muted" /></button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.entries(CLASS_CONFIG).map(([key, cfg]) => (
                  <button key={key} onClick={() => handleClassSelect(key)}
                    className="p-4 rounded-lg border border-sq-border hover:border-sq-gold/30 transition-all text-left space-y-1"
                  >
                    <div className={`flex items-center gap-2 ${cfg.color}`}>{cfg.icon}<span className="font-display font-bold text-sm">{cfg.label}</span></div>
                    <p className="font-mono text-[10px] text-sq-muted">{cfg.buff}</p>
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
