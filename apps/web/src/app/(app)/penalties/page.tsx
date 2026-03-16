"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Skull, Swords, CreditCard, TrendingDown, TrendingUp, AlertTriangle, ArrowUpCircle, Gift } from "lucide-react";

const GAIN_REASONS = ["level_up_bonus"];

interface Penalty {
  id: number;
  questId: number | null;
  questTitle: string;
  goldLost: number;
  reason: string;
  description: string;
  createdAt: string;
}

interface PenaltyData {
  recent: Penalty[];
  todayPenalties: Penalty[];
  todayGains: Penalty[];
  todayTotal: number;
  todayGainTotal: number;
  weeklyTotal: number;
  weeklyGainTotal: number;
  monthlyTotal: number;
  monthlyGainTotal: number;
  monthlyFromQuests: number;
  monthlyFromSpending: number;
  monthlyFromRedeems: number;
  currentGold: number;
  isInDebt: boolean;
  debtAmount: number;
}

export default function PenaltiesPage() {
  const [data, setData] = useState<PenaltyData | null>(null);

  const fetchData = useCallback(async () => {
    const res = await fetch("/api/penalties");
    setData(await res.json());
  }, []);

  useEffect(() => {
    fetchData();
    const onDayChange = () => fetchData();
    window.addEventListener("sq-day-changed", onDayChange);
    return () => window.removeEventListener("sq-day-changed", onDayChange);
  }, [fetchData]);

  if (!data) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-8 bg-sq-hover rounded w-48" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="sq-panel p-6 h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] font-bold text-sq-text tracking-[-0.03em]">
          Gold Ledger
        </h1>
        <div className="flex items-center gap-1.5">
          <Skull className={`w-5 h-5 ${data.isInDebt ? "text-red-500" : "text-sq-muted"}`} />
          <span className={`text-lg font-bold ${data.isInDebt ? "text-red-500" : "text-sq-gold"}`}>
            {data.currentGold.toLocaleString()}G
          </span>
        </div>
      </div>

      {/* Debt Warning */}
      {data.isInDebt && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-center gap-3"
        >
          <AlertTriangle className="w-6 h-6 text-red-500 shrink-0" />
          <div>
            <p className="font-bold text-red-500 text-sm">IN DEBT</p>
            <p className="text-xs text-red-400">
              You owe {data.debtAmount.toLocaleString()}G. Complete quests to clear your debt.
            </p>
          </div>
        </motion.div>
      )}

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="sq-panel p-4 space-y-1">
          <p className="text-xs text-sq-muted font-medium uppercase tracking-wide">Today</p>
          <div className="flex items-baseline gap-3">
            <p className="text-2xl font-bold text-red-500">
              -{data.todayTotal.toLocaleString()}G
            </p>
            {data.todayGainTotal > 0 && (
              <p className="text-lg font-bold text-emerald-500">
                +{data.todayGainTotal.toLocaleString()}G
              </p>
            )}
          </div>
        </div>
        <div className="sq-panel p-4 space-y-1">
          <p className="text-xs text-sq-muted font-medium uppercase tracking-wide">This Week</p>
          <div className="flex items-baseline gap-3">
            <p className="text-2xl font-bold text-red-500">
              -{data.weeklyTotal.toLocaleString()}G
            </p>
            {data.weeklyGainTotal > 0 && (
              <p className="text-lg font-bold text-emerald-500">
                +{data.weeklyGainTotal.toLocaleString()}G
              </p>
            )}
          </div>
        </div>
        <div className="sq-panel p-4 space-y-1">
          <p className="text-xs text-sq-muted font-medium uppercase tracking-wide">This Month</p>
          <div className="flex items-baseline gap-3">
            <p className="text-2xl font-bold text-red-500">
              -{data.monthlyTotal.toLocaleString()}G
            </p>
            {data.monthlyGainTotal > 0 && (
              <p className="text-lg font-bold text-emerald-500">
                +{data.monthlyGainTotal.toLocaleString()}G
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Breakdown */}
      <div className="sq-panel p-4 space-y-3">
        <h3 className="font-semibold text-sm text-sq-text flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-red-500" />
          Monthly Breakdown
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-sq-muted">
              <Swords className="w-3.5 h-3.5" />
              Failed Quests
            </span>
            <span className="text-red-500 font-medium">
              -{data.monthlyFromQuests.toLocaleString()}G
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-sq-muted">
              <CreditCard className="w-3.5 h-3.5" />
              Spending
            </span>
            <span className="text-red-500 font-medium">
              -{data.monthlyFromSpending.toLocaleString()}G
            </span>
          </div>
          {data.monthlyFromRedeems > 0 && (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2 text-sq-muted">
                <Gift className="w-3.5 h-3.5" />
                Redeemed
              </span>
              <span className="text-red-500 font-medium">
                -{data.monthlyFromRedeems.toLocaleString()}G
              </span>
            </div>
          )}
          {data.monthlyGainTotal > 0 && (
            <div className="flex items-center justify-between text-sm border-t border-sq-border/30 pt-2">
              <span className="flex items-center gap-2 text-sq-muted">
                <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-500" />
                Bonuses Earned
              </span>
              <span className="text-emerald-500 font-medium">
                +{data.monthlyGainTotal.toLocaleString()}G
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Today's Gold Gains */}
      {data.todayGains.length > 0 && (
        <div className="sq-panel p-4 space-y-3">
          <h3 className="font-semibold text-sm text-sq-text flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            Today&apos;s Gold Gains
          </h3>
          <div className="space-y-2">
            {data.todayGains.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-xs border-b border-sq-border/30 pb-2"
              >
                <div className="flex items-center gap-2">
                  <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-sq-text">{p.description}</span>
                </div>
                <span className="text-emerald-500 font-medium shrink-0">
                  +{p.goldLost}G
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Today's Penalties */}
      {data.todayPenalties.length > 0 && (
        <div className="sq-panel p-4 space-y-3">
          <h3 className="font-semibold text-sm text-sq-text">
            Today&apos;s Penalties
          </h3>
          <div className="space-y-2">
            {data.todayPenalties.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-xs border-b border-sq-border/30 pb-2"
              >
                <div className="flex items-center gap-2">
                  {p.reason === "quest_failed" ? (
                    <Swords className="w-3.5 h-3.5 text-red-500" />
                  ) : p.reason === "custom_redeem" ? (
                    <Gift className="w-3.5 h-3.5 text-sq-gold" />
                  ) : (
                    <CreditCard className="w-3.5 h-3.5 text-orange-400" />
                  )}
                  <span className="text-sq-text">{p.description}</span>
                </div>
                <span className="text-red-500 font-medium shrink-0">
                  -{p.goldLost}G
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full History (gains + penalties) */}
      <div className="sq-panel p-4 space-y-3">
        <h3 className="font-semibold text-sm text-sq-text">
          History
        </h3>
        {data.recent.length > 0 ? (
          <div className="space-y-2">
            {data.recent.map((p) => {
              const isGain = GAIN_REASONS.includes(p.reason);
              return (
                <div
                  key={p.id}
                  className="flex items-center justify-between text-xs border-b border-sq-border/30 pb-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {isGain ? (
                        <ArrowUpCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      ) : p.reason === "quest_failed" ? (
                        <Swords className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      ) : p.reason === "custom_redeem" ? (
                        <Gift className="w-3.5 h-3.5 text-sq-gold shrink-0" />
                      ) : (
                        <CreditCard className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                      )}
                      <span className="text-sq-text truncate">{p.description}</span>
                    </div>
                    <span className="text-sq-muted text-[10px] ml-5">
                      {new Date(p.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <span className={`font-medium shrink-0 ml-2 ${isGain ? "text-emerald-500" : "text-red-500"}`}>
                    {isGain ? "+" : "-"}{p.goldLost}G
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sq-muted text-xs">No entries yet.</p>
        )}
      </div>
    </div>
  );
}
