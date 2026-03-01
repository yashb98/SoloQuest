"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Lock, Check, X, Gift } from "lucide-react";

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
}

const tierOrder = ["E", "D", "C", "B", "A", "S"];
const tierColors: Record<string, string> = {
  E: "border-gray-500/50 text-gray-400",
  D: "border-sq-green/50 text-sq-green",
  C: "border-sq-blue/50 text-sq-blue",
  B: "border-sq-purple/50 text-sq-purple",
  A: "border-orange-500/50 text-orange-400",
  S: "border-sq-gold/50 text-sq-gold shadow-sq-gold-glow",
};

export default function ShopPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [hunter, setHunter] = useState<Hunter | null>(null);
  const [redeemingId, setRedeemingId] = useState<number | null>(null);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemedReward, setRedeemedReward] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    const [rewardsRes, hunterRes] = await Promise.all([
      fetch("/api/rewards"),
      fetch("/api/hunter"),
    ]);
    setRewards(await rewardsRes.json());
    setHunter(await hunterRes.json());
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
    }
    setRedeemingId(null);
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
        <h1 className="font-display font-bold text-2xl text-sq-gold">
          REWARD SHOP
        </h1>
        {hunter && (
          <div className="flex items-center gap-1.5">
            <Coins className="w-5 h-5 text-sq-gold" />
            <span className="font-mono text-lg text-sq-gold font-bold">
              {hunter.gold.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {groupedRewards.map(({ tier, rewards: tierRewards }) => (
        <div key={tier} className="space-y-3">
          <h2
            className={`font-display font-bold text-lg ${
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
                    <h3 className="font-display font-semibold text-sm text-sq-text">
                      {reward.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs text-sq-gold">
                          {reward.costGold} G
                        </span>
                        <span className="font-mono text-[10px] text-sq-muted">
                          (£{reward.realCost.toFixed(2)})
                        </span>
                      </div>
                      {reward.isRedeemed ? (
                        <span className="flex items-center gap-1 text-sq-green text-xs font-mono">
                          <Check className="w-3 h-3" /> Redeemed
                        </span>
                      ) : isLocked ? (
                        <span className="flex items-center gap-1 text-sq-muted text-xs font-mono">
                          <Lock className="w-3 h-3" /> Locked
                        </span>
                      ) : (
                        <button
                          onClick={() => handleRedeem(reward.id)}
                          disabled={!canAfford || redeemingId === reward.id}
                          className={`px-3 py-1 rounded text-xs font-display font-bold transition-all
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

      {/* Redeem Success Modal */}
      <AnimatePresence>
        {showRedeemModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
            onClick={() => setShowRedeemModal(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 15 }}
              className="sq-panel p-8 max-w-sm mx-4 text-center border-2 border-sq-gold shadow-sq-gold-glow"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowRedeemModal(false)}
                className="absolute top-3 right-3 text-sq-muted hover:text-sq-text"
              >
                <X className="w-5 h-5" />
              </button>
              <Gift className="w-12 h-12 text-sq-gold mx-auto mb-4" />
              <h2 className="font-display font-bold text-2xl text-sq-gold mb-2">
                REWARD UNLOCKED!
              </h2>
              <p className="font-mono text-sm text-sq-text">
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
