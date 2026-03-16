"use client";

import { useEffect, useState, useCallback } from "react";
import { useHunter } from "@/contexts/HunterContext";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Trophy, Swords, CheckCircle, Undo2, ChevronDown, Shield, AlertTriangle, Calendar, Lightbulb, Target } from "lucide-react";
import { getDungeonDetail } from "@/lib/quest-details";
import type { DungeonDetail } from "@/lib/quest-details";
import { rankFromLevel, rankLevel as getRankLevel } from "@/lib/xp";

interface Dungeon {
  id: number;
  title: string;
  description: string;
  objectives: string;
  bonusXP: number;
  bonusGold: number;
  statReward: string;
  statAmount: number;
  isActive: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  activatedAt: string | null;
  deadline: string | null;
  minLevel: number;
  canActivate: boolean;
}

const statIcons: Record<string, string> = {
  vitality: "VIT", intel: "INT", hustle: "HUS", wealth: "WLT", focus: "FOC", agentIQ: "AIQ",
};

export default function DungeonsPage() {
  const { addToast } = useHunter();
  const [dungeons, setDungeons] = useState<Dungeon[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [showResult, setShowResult] = useState<{ bonusXP: number; bonusGold: number } | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const fetchDungeons = useCallback(async () => {
    const res = await fetch("/api/dungeons");
    setDungeons(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchDungeons(); }, [fetchDungeons]);

  const handleAction = async (action: string, dungeonId: number) => {
    setActionId(dungeonId);
    const res = await fetch("/api/dungeons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, dungeonId }),
    });
    const data = await res.json();
    if (data.success && action === "complete") {
      setShowResult({ bonusXP: data.bonusXP, bonusGold: data.bonusGold });
    }
    if (!data.success && data.error) {
      addToast({ type: "error", title: "Dungeon Error", description: data.error });
    }
    fetchDungeons();
    setActionId(null);
  };

  const activeDungeon = dungeons.find((d) => d.isActive);

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-sq-hover rounded w-48" />
        {[1, 2, 3].map((i) => <div key={i} className="sq-panel p-6 h-32" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] font-bold text-sq-text tracking-[-0.03em]">Dungeons</h1>
        <span className="text-[14px] text-sq-muted font-medium">
          {dungeons.filter(d => d.isCompleted).length}/{dungeons.length} cleared
        </span>
      </div>

      {/* Active Dungeon Banner */}
      {activeDungeon && <ActiveDungeonBanner dungeon={activeDungeon} actionId={actionId} onAction={handleAction} />}

      {/* Dungeon List */}
      <div className="grid gap-4 sm:grid-cols-2">
        {dungeons.filter((d) => !d.isActive).map((dungeon) => (
          <DungeonCard
            key={dungeon.id}
            dungeon={dungeon}
            actionId={actionId}
            activeDungeon={activeDungeon}
            expanded={expandedId === dungeon.id}
            onToggleExpand={() => setExpandedId(expandedId === dungeon.id ? null : dungeon.id)}
            onAction={handleAction}
          />
        ))}
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showResult && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowResult(null)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
              className="sq-panel p-8 max-w-sm mx-4 text-center border-2 border-sq-purple shadow-[0_2px_8px_rgba(168,85,247,0.3)]"
              onClick={(e) => e.stopPropagation()}
            >
              <Trophy className="w-12 h-12 text-sq-purple mx-auto mb-4" />
              <h2 className="font-bold text-2xl text-sq-purple mb-2">DUNGEON CLEARED!</h2>
              <p className="text-[15px] text-sq-gold">+{showResult.bonusXP} XP | +{showResult.bonusGold} Gold</p>
              <button onClick={() => setShowResult(null)} className="sq-button-gold mt-6 w-full">CLAIM REWARDS</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══ Active Dungeon Banner ═══ */
function ActiveDungeonBanner({ dungeon, actionId, onAction }: { dungeon: Dungeon; actionId: number | null; onAction: (a: string, id: number) => void }) {
  const detail = getDungeonDetail(dungeon.title);
  const [expanded, setExpanded] = useState(false);
  const objectives = JSON.parse(dungeon.objectives);
  const daysRemaining = dungeon.deadline ? Math.max(0, Math.ceil((new Date(dungeon.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;

  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
      className="sq-panel border-2 border-sq-purple/50 shadow-[0_2px_8px_rgba(168,85,247,0.3)] overflow-hidden"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Swords className="w-5 h-5 text-sq-purple" />
            <span className="font-bold text-[14px] text-sq-purple tracking-wide">ACTIVE DUNGEON</span>
          </div>
          {daysRemaining !== null && (
            <span className={`text-[13px] font-bold px-3 py-1 rounded-full ${daysRemaining <= 2 ? "bg-red-50 text-red-500" : "bg-sq-purple/10 text-sq-purple"}`}>
              {daysRemaining}d remaining
            </span>
          )}
        </div>

        <h3 className="font-bold text-[19px] text-sq-text">{dungeon.title}</h3>
        <p className="text-[14px] text-sq-muted mt-1">{dungeon.description}</p>

        {/* Rewards */}
        <div className="flex items-center gap-4 mt-3">
          <span className="text-[14px] font-semibold text-sq-accent">+{dungeon.bonusXP} XP</span>
          <span className="text-[14px] font-semibold text-sq-gold">+{dungeon.bonusGold} G</span>
          <span className="text-[14px] font-semibold text-sq-purple">+{dungeon.statAmount} {statIcons[dungeon.statReward]}</span>
        </div>

        {/* Objectives checklist */}
        <div className="mt-4 space-y-2">
          <span className="text-[13px] font-bold text-sq-text">Objectives</span>
          {objectives.map((obj: string, i: number) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-4 h-4 rounded border-2 border-sq-purple/40 flex-shrink-0" />
              <span className="text-[14px] text-sq-text">{obj}</span>
            </div>
          ))}
        </div>

        {/* Expand for strategy */}
        {detail && (
          <button onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 mt-4 text-[13px] font-semibold text-sq-purple hover:text-sq-purple/80 transition-colors"
          >
            <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
            {expanded ? "Hide Strategy Guide" : "View Strategy Guide"}
          </button>
        )}

        <div className="flex gap-2 mt-4">
          <button onClick={() => onAction("complete", dungeon.id)} disabled={actionId === dungeon.id} className="sq-button-gold text-[14px] flex-1">
            COMPLETE DUNGEON
          </button>
          <button onClick={() => onAction("abandon", dungeon.id)}
            className="px-4 py-2.5 border border-red-500/30 text-red-400 rounded-xl text-[14px] font-bold hover:bg-red-500/10 transition-colors"
          >
            ABANDON
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && detail && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <DungeonDetailPanel detail={detail} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══ Dungeon Card ═══ */
function DungeonCard({ dungeon, actionId, activeDungeon, expanded, onToggleExpand, onAction }: {
  dungeon: Dungeon; actionId: number | null; activeDungeon: Dungeon | undefined;
  expanded: boolean; onToggleExpand: () => void; onAction: (a: string, id: number) => void;
}) {
  const detail = getDungeonDetail(dungeon.title);
  const objectives = JSON.parse(dungeon.objectives);

  return (
    <motion.div layout
      className={`sq-panel overflow-hidden ${dungeon.isCompleted ? "opacity-60" : ""} ${dungeon.isFailed ? "border-red-500/30" : ""}`}
    >
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-[15px] text-sq-text">{dungeon.title}</h3>
          <div className="flex items-center gap-1.5">
            {dungeon.isCompleted && (
              <>
                <CheckCircle className="w-4 h-4 text-sq-green" />
                <button onClick={() => onAction("uncomplete", dungeon.id)} disabled={actionId === dungeon.id}
                  className="p-1 rounded-lg text-sq-muted hover:text-red-500 hover:bg-red-50 transition-colors" title="Undo completion"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
            {detail && (
              <button onClick={onToggleExpand}
                className={`p-1 rounded-lg transition-colors ${expanded ? "text-sq-accent bg-[#FFF3ED]" : "text-sq-muted hover:text-sq-accent"}`}
                title="View details"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
              </button>
            )}
          </div>
        </div>

        <p className="text-[13px] text-sq-muted leading-relaxed">{dungeon.description}</p>

        <div className="flex items-center gap-3 text-[13px]">
          <span className="text-sq-accent font-semibold">+{dungeon.bonusXP} XP</span>
          <span className="text-sq-gold font-semibold">+{dungeon.bonusGold} G</span>
          <span className="text-sq-purple font-semibold">+{dungeon.statAmount} {statIcons[dungeon.statReward] || dungeon.statReward}</span>
        </div>

        {dungeon.minLevel > 1 && !dungeon.isCompleted && (
          <div className="flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-sq-muted" />
            <span className="text-[12px] text-sq-muted font-medium">Requires {rankFromLevel(dungeon.minLevel)}-{getRankLevel(dungeon.minLevel)}</span>
          </div>
        )}

        <div className="space-y-1.5">
          {objectives.map((obj: string, i: number) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-sq-purple/40 mt-1.5 flex-shrink-0" />
              <span className="text-[13px] text-sq-muted">{obj}</span>
            </div>
          ))}
        </div>

        {detail && (
          <div className="flex items-center gap-1.5 text-[12px] text-sq-muted">
            <Clock className="w-3.5 h-3.5" />
            <span>{detail.estimatedHoursPerDay}/day for 7 days</span>
          </div>
        )}

        {!dungeon.isCompleted && !activeDungeon && (
          dungeon.canActivate ? (
            <button onClick={() => onAction("activate", dungeon.id)} disabled={actionId === dungeon.id} className="sq-button-blue w-full text-[14px]">
              {actionId === dungeon.id ? "ACTIVATING..." : "ENTER DUNGEON"}
            </button>
          ) : (
            <div className="w-full text-center py-2.5 rounded-xl bg-sq-hover text-sq-muted text-[14px] font-semibold">
              🔒 Requires {rankFromLevel(dungeon.minLevel)}-{getRankLevel(dungeon.minLevel)}
            </div>
          )
        )}
      </div>

      <AnimatePresence>
        {expanded && detail && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
            <DungeonDetailPanel detail={detail} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ═══ Shared Detail Panel ═══ */
function DungeonDetailPanel({ detail }: { detail: DungeonDetail }) {
  return (
    <div className="px-4 pb-5 pt-1 border-t border-sq-border/50 space-y-4">
      <div className="bg-[#F0FDF4] rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-green-600" />
          <span className="text-[14px] font-bold text-green-700">Success Criteria</span>
        </div>
        <p className="text-[14px] text-sq-text leading-relaxed">{detail.successCriteria}</p>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Swords className="w-4 h-4 text-sq-purple" />
          <span className="text-[14px] font-bold text-sq-text">Strategy</span>
        </div>
        <div className="space-y-2 ml-1">
          {detail.strategy.map((s, i) => (
            <div key={i} className="flex gap-2.5 items-start">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-sq-purple/10 flex items-center justify-center mt-0.5">
                <span className="text-[11px] font-bold text-sq-purple">{i + 1}</span>
              </div>
              <p className="text-[14px] text-sq-text leading-relaxed">{s}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="w-4 h-4 text-sq-accent" />
          <span className="text-[14px] font-bold text-sq-text">Day-by-Day Breakdown</span>
        </div>
        <div className="space-y-3 ml-1">
          {detail.dailyBreakdown.map((day, i) => (
            <div key={i} className="bg-sq-hover/50 rounded-xl p-3">
              <span className="text-[13px] font-bold text-sq-accent">{day.day}</span>
              <div className="mt-1.5 space-y-1">
                {day.tasks.map((task, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <div className="w-4 h-4 rounded border-[1.5px] border-sq-border flex-shrink-0 mt-0.5" />
                    <span className="text-[13px] text-sq-text">{task}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="w-4 h-4 text-yellow-500" />
          <span className="text-[14px] font-bold text-sq-text">Pro Tips</span>
        </div>
        <div className="space-y-2 ml-1">
          {detail.tips.map((tip, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-[13px] text-yellow-500 mt-0.5 flex-shrink-0">💡</span>
              <p className="text-[13px] text-sq-muted leading-relaxed">{tip}</p>
            </div>
          ))}
        </div>
      </div>

      {detail.prerequisiteSkills.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-sq-muted" />
            <span className="text-[14px] font-bold text-sq-text">Prerequisites</span>
          </div>
          <div className="flex flex-wrap gap-2 ml-1">
            {detail.prerequisiteSkills.map((skill, i) => (
              <span key={i} className="bg-sq-hover text-sq-muted px-3 py-1 rounded-full text-[13px] font-medium">{skill}</span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-red-50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span className="text-[14px] font-bold text-red-600">Fail Conditions</span>
        </div>
        <div className="space-y-1.5">
          {detail.failConditions.map((cond, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-red-400 text-[13px] mt-0.5 flex-shrink-0">✕</span>
              <p className="text-[13px] text-red-600">{cond}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
