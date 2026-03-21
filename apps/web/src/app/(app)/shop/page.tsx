"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Lock, Check, X, Gift, ArrowRight, Receipt, Clock } from "lucide-react";
import { useHunter } from "@/contexts/HunterContext";

interface Reward {
  id: number;
  title: string;
  tier: string;
  costGold: number;
  realCost: number;
  isRedeemed: boolean;
}

interface Hunter {
  gold: number;
  rank: string;
  goldToMoneyRatio: number;
}

const tierOrder = ["E", "D", "C", "B", "A", "S"];
const tierColors: Record<string, string> = {
  E: "border-gray-500/50 text-gray-400",
  D: "border-sq-green/50 text-sq-green",
  C: "border-sq-blue/50 text-sq-blue",
  B: "border-sq-purple/50 text-sq-purple",
  A: "border-orange-500/50 text-orange-400",
  S: "border-sq-gold/50 text-sq-gold shadow-sq-accent-glow",
};

const QUICK_AMOUNTS = [50, 100, 250, 500];

export default function ShopPage() {
  const { hunter: hunterCtx, refreshHunter } = useHunter();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [hunter, setHunter] = useState<Hunter | null>(null);
  const [redeemingId, setRedeemingId] = useState<number | null>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemedReward, setRedeemedReward] = useState<string | null>(null);

  // Custom redeem state
  const [customAmount, setCustomAmount] = useState<string>("");
  const [redeemReason, setRedeemReason] = useState<string>("");
  const [isCustomRedeeming, setIsCustomRedeeming] = useState(false);
  const [inputMode, setInputMode] = useState<"gold" | "pounds">("pounds");

  // Transactions
  const [activeTab, setActiveTab] = useState<"shop" | "transactions">("shop");
  const [transactions, setTransactions] = useState<Array<{
    id: number;
    goldLost: number;
    description: string;
    createdAt: string;
  }>>([]);

  // Keep local hunter in sync with context
  useEffect(() => {
    if (hunterCtx) {
      setHunter({
        gold: hunterCtx.gold,
        rank: hunterCtx.rank,
        goldToMoneyRatio: 0.10,
      });
    }
  }, [hunterCtx]);

  const fetchData = useCallback(async () => {
    const [rewardsRes, hunterRes, txRes] = await Promise.all([
      fetch("/api/rewards"),
      fetch("/api/hunter"),
      fetch("/api/rewards?transactions=true"),
    ]);
    setRewards(await rewardsRes.json());
    const h = await hunterRes.json();
    setHunter({ gold: h.gold, rank: h.rank, goldToMoneyRatio: h.goldToMoneyRatio ?? 0.10 });
    setTransactions(await txRes.json());
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRedeem = async (rewardId: number) => {
    setRedeemingId(rewardId);
    const res = await fetch("/api/rewards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rewardId }),
    });
    const data = await res.json();
    if (data.success) {
      setRedeemedReward(data.reward);
      setShowRedeemModal(true);
      fetchData();
      refreshHunter(); // sync TopBar gold
    }
    setRedeemingId(null);
  };

  const ratio = hunter?.goldToMoneyRatio ?? 0.10;

  // Compute gold amount from either mode (always rounds to nearest integer)
  const goldAmount = inputMode === "gold"
    ? Math.round(parseFloat(customAmount) || 0)
    : Math.round((parseFloat(customAmount) || 0) / ratio);
  const realEquivalent = (goldAmount * ratio).toFixed(2);
  const canCustomRedeem = goldAmount > 0 && (hunter?.gold ?? 0) >= goldAmount;

  const handleCustomRedeem = async () => {
    if (!canCustomRedeem || !hunter) return;

    setIsCustomRedeeming(true);
    const res = await fetch("/api/rewards", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goldAmount, reason: redeemReason }),
    });
    const data = await res.json();
    if (data.success) {
      const rv = (goldAmount * (hunter.goldToMoneyRatio ?? 0.10)).toFixed(2);
      const reasonLabel = redeemReason.trim() ? ` — ${redeemReason.trim()}` : "";
      setRedeemedReward(`${goldAmount}G (£${rv})${reasonLabel}`);
      setShowRedeemModal(true);
      setCustomAmount("");
      setRedeemReason("");
      fetchData();
      refreshHunter();
    }
    setIsCustomRedeeming(false);
  };

  const handleModeSwitch = (mode: "gold" | "pounds") => {
    if (mode === inputMode) return;
    // Convert current value to the other mode
    if (customAmount) {
      if (mode === "pounds") {
        // gold → pounds
        const g = parseInt(customAmount) || 0;
        setCustomAmount(g > 0 ? (g * ratio).toFixed(2) : "");
      } else {
        // pounds → gold
        const p = parseFloat(customAmount) || 0;
        setCustomAmount(p > 0 ? String(Math.round(p / ratio)) : "");
      }
    }
    setInputMode(mode);
  };

  const groupedRewards = tierOrder
    .map((tier) => ({
      tier,
      rewards: rewards.filter((r) => r.tier === tier),
    }))
    .filter((g) => g.rewards.length > 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] font-bold text-sq-text tracking-[-0.03em]">
          Reward Shop
        </h1>
        {hunter && (
          <div className="flex items-center gap-1.5">
            <Coins className="w-5 h-5 text-sq-gold" />
            <span className="text-lg text-sq-gold font-bold">
              {hunter.gold.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Tab switcher */}
      <div className="flex bg-sq-hover rounded-xl p-1 gap-1">
        <button
          onClick={() => setActiveTab("shop")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-bold transition-all ${
            activeTab === "shop"
              ? "bg-sq-panel text-sq-gold shadow-sm"
              : "text-sq-muted hover:text-sq-text"
          }`}
        >
          <Gift className="w-4 h-4" />
          Shop
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[13px] font-bold transition-all ${
            activeTab === "transactions"
              ? "bg-sq-panel text-sq-gold shadow-sm"
              : "text-sq-muted hover:text-sq-text"
          }`}
        >
          <Receipt className="w-4 h-4" />
          Transactions
          {transactions.length > 0 && (
            <span className="bg-sq-gold/20 text-sq-gold text-[11px] px-1.5 py-0.5 rounded-full font-bold">
              {transactions.length}
            </span>
          )}
        </button>
      </div>

      {activeTab === "transactions" && (
        <div className="space-y-3">
          {transactions.length === 0 ? (
            <div className="sq-panel p-8 text-center">
              <Receipt className="w-10 h-10 text-sq-muted mx-auto mb-3" />
              <p className="text-sq-muted text-sm">No redemptions yet. Earn gold and redeem it!</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-sm text-sq-muted">
                <span>{transactions.length} transaction{transactions.length !== 1 ? "s" : ""}</span>
                <span>Total: {transactions.reduce((sum, t) => sum + t.goldLost, 0).toLocaleString()}G</span>
              </div>
              {transactions.map((tx) => {
                // Parse description: "Reason — 500G (£50.00)" or "Custom Redeem: 500G (£50.00)"
                const parts = tx.description.split(" — ");
                const reason = parts.length > 1 ? parts[0] : tx.description.split(":").length > 1 ? tx.description.split(": ")[0] : "Custom Redeem";
                const amountPart = parts.length > 1 ? parts[1] : tx.description.includes(":") ? tx.description.split(": ")[1] : tx.description;
                const poundsMatch = amountPart.match(/£([\d.]+)/);
                const pounds = poundsMatch ? poundsMatch[1] : (tx.goldLost * 0.10).toFixed(2);
                const date = new Date(tx.createdAt);
                const dateStr = date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
                const timeStr = date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

                return (
                  <motion.div
                    key={tx.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="sq-panel p-4 flex items-center justify-between"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-sq-gold/10 flex items-center justify-center shrink-0">
                        <Coins className="w-4 h-4 text-sq-gold" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-semibold text-sq-text truncate">{reason}</p>
                        <div className="flex items-center gap-2 text-[12px] text-sq-muted">
                          <Clock className="w-3 h-3" />
                          <span>{dateStr} at {timeStr}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-3">
                      <p className="text-[14px] font-bold text-sq-gold">-{tx.goldLost.toLocaleString()}G</p>
                      <p className="text-[12px] text-sq-muted">£{pounds}</p>
                    </div>
                  </motion.div>
                );
              })}
            </>
          )}
        </div>
      )}

      {activeTab === "shop" && <>
      {/* Custom Redeem Card */}
      <div className="sq-panel p-5 border-2 border-sq-gold/30 space-y-4">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-sq-gold" />
          <h2 className="font-bold text-lg text-sq-text">Custom Redeem</h2>
        </div>
        <p className="text-xs text-sq-muted -mt-2">
          Redeem any amount of gold you want
        </p>

        {/* Mode toggle + Quick-select buttons */}
        <div className="flex items-center gap-2">
          <div className="flex bg-sq-hover rounded-lg p-0.5 shrink-0">
            <button
              onClick={() => handleModeSwitch("gold")}
              className={`px-3 py-1.5 rounded-md text-[12px] font-bold transition-all ${
                inputMode === "gold"
                  ? "bg-sq-gold/20 text-sq-gold"
                  : "text-sq-muted hover:text-sq-text"
              }`}
            >
              Gold
            </button>
            <button
              onClick={() => handleModeSwitch("pounds")}
              className={`px-3 py-1.5 rounded-md text-[12px] font-bold transition-all ${
                inputMode === "pounds"
                  ? "bg-sq-green/20 text-sq-green"
                  : "text-sq-muted hover:text-sq-text"
              }`}
            >
              £
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {QUICK_AMOUNTS.filter((a) => (hunter?.gold ?? 0) >= a).map((amount) => (
              <button
                key={amount}
                onClick={() =>
                  setCustomAmount(
                    inputMode === "gold" ? String(amount) : (amount * ratio).toFixed(2)
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all border ${
                  goldAmount === amount
                    ? "border-sq-gold bg-sq-gold/10 text-sq-gold"
                    : "border-sq-border text-sq-muted hover:border-sq-gold/50 hover:text-sq-text"
                }`}
              >
                {inputMode === "gold" ? `${amount}G` : `£${(amount * ratio).toFixed(2)}`}
              </button>
            ))}
            {hunter && hunter.gold > 0 && (
              <button
                onClick={() =>
                  setCustomAmount(
                    inputMode === "gold"
                      ? String(hunter.gold)
                      : (hunter.gold * ratio).toFixed(2)
                  )
                }
                className={`px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all border ${
                  goldAmount === hunter.gold
                    ? "border-sq-gold bg-sq-gold/10 text-sq-gold"
                    : "border-sq-border text-sq-muted hover:border-sq-gold/50 hover:text-sq-text"
                }`}
              >
                ALL ({inputMode === "gold" ? `${hunter.gold}G` : `£${(hunter.gold * ratio).toFixed(2)}`})
              </button>
            )}
          </div>
        </div>

        {/* Input + preview */}
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="number"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder={inputMode === "gold" ? "Enter gold amount..." : "Enter £ amount..."}
              min="0.01"
              step="0.01"
              className="w-full bg-sq-hover border border-sq-border rounded-xl px-4 py-2.5 pr-8 text-sm text-sq-text placeholder-sq-muted focus:outline-none focus:border-sq-gold/50 transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            />
            <span className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold ${
              inputMode === "gold" ? "text-sq-gold" : "text-sq-green"
            }`}>
              {inputMode === "gold" ? "G" : "£"}
            </span>
          </div>
          {goldAmount > 0 && (
            <div className="flex items-center gap-1.5 text-sm shrink-0">
              <ArrowRight className="w-4 h-4 text-sq-muted" />
              {inputMode === "gold" ? (
                <span className="text-sq-green font-bold">£{realEquivalent}</span>
              ) : (
                <span className="text-sq-gold font-bold">{goldAmount}G</span>
              )}
            </div>
          )}
        </div>

        {/* Reason input */}
        <input
          type="text"
          value={redeemReason}
          onChange={(e) => setRedeemReason(e.target.value)}
          placeholder="What's this for? (e.g. Coffee, Movie, Treat...)"
          className="w-full bg-sq-hover border border-sq-border rounded-xl px-4 py-2.5 text-sm text-sq-text placeholder-sq-muted focus:outline-none focus:border-sq-gold/50 transition-colors"
        />

        {/* Redeem button */}
        <button
          onClick={handleCustomRedeem}
          disabled={!canCustomRedeem || isCustomRedeeming}
          className={`w-full py-2.5 rounded-xl text-[14px] font-bold transition-all ${
            canCustomRedeem
              ? "sq-button-gold"
              : "bg-sq-border text-sq-muted cursor-not-allowed"
          } ${isCustomRedeeming ? "animate-pulse" : ""}`}
        >
          {isCustomRedeeming
            ? "REDEEMING..."
            : goldAmount > 0
            ? `REDEEM ${goldAmount}G (£${realEquivalent})`
            : "REDEEM"}
        </button>
      </div>

      {groupedRewards.map(({ tier, rewards: tierRewards }) => (
        <div key={tier} className="space-y-3">
          <h2
            className={`font-bold text-lg ${
              tierColors[tier]?.split(" ").pop() || "text-sq-muted"
            }`}
          >
            {tier}-RANK REWARDS
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {tierRewards.map((reward) => {
              const canAfford = (hunter?.gold ?? 0) >= reward.costGold;
              const rankIndex = tierOrder.indexOf(tier);
              const hunterRankIndex = tierOrder.indexOf(hunter?.rank ?? "E");
              const isLocked = rankIndex > hunterRankIndex + 1;

              return (
                <motion.div
                  key={reward.id}
                  layout
                  className={`sq-panel p-4 border ${
                    tierColors[tier] || "border-sq-border"
                  } ${reward.isRedeemed ? "opacity-50" : ""}`}
                >
                  <div className="space-y-2">
                    <h3 className="font-semibold text-[15px] text-sq-text">
                      {reward.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] text-sq-gold font-medium">
                          {reward.costGold} G
                        </span>
                        <span className="text-[12px] text-sq-muted">
                          (£{reward.realCost.toFixed(2)})
                        </span>
                      </div>
                      {reward.isRedeemed ? (
                        <span className="flex items-center gap-1 text-sq-green text-[13px] font-medium">
                          <Check className="w-3.5 h-3.5" /> Redeemed
                        </span>
                      ) : isLocked ? (
                        <span className="flex items-center gap-1 text-sq-muted text-[13px] font-medium">
                          <Lock className="w-3.5 h-3.5" /> Locked
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRedeem(reward.id)}
                          disabled={!canAfford || redeemingId === reward.id}
                          className={`px-3 py-1.5 rounded-lg text-[13px] font-bold transition-all
                            ${
                              canAfford
                                ? "sq-button-gold"
                                : "bg-sq-border text-sq-muted cursor-not-allowed"
                            }
                            ${redeemingId === reward.id ? "animate-pulse" : ""}
                          `}
                        >
                          REDEEM
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      </>}

      {/* Redeem Success Modal */}
      <AnimatePresence>
        {showRedeemModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setShowRedeemModal(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="sq-panel p-8 max-w-sm mx-4 text-center border-2 border-sq-gold shadow-sq-accent-glow"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowRedeemModal(false)}
                className="absolute top-3 right-3 text-sq-muted hover:text-sq-text"
              >
                <X className="w-5 h-5" />
              </button>
              <Gift className="w-12 h-12 text-sq-gold mx-auto mb-4" />
              <h2 className="font-bold text-2xl text-sq-gold mb-2">
                REWARD UNLOCKED!
              </h2>
              <p className="text-sm text-sq-text">
                {redeemedReward}
              </p>
              <button
                onClick={() => setShowRedeemModal(false)}
                className="sq-button-gold mt-6 w-full"
              >
                CLAIM
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
