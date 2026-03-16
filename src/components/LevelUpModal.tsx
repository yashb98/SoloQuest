"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { rankLevel } from "@/lib/xp";

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  newRank: string;
  isGateLocked: boolean;
  gateLevel: number | null;
  levelsGained?: number;
  statPointsEarned?: number;
  goldBonus?: number;
}

export default function LevelUpModal({
  isOpen,
  onClose,
  newLevel,
  newRank,
  isGateLocked,
  gateLevel,
  levelsGained = 1,
  statPointsEarned = 0,
  goldBonus = 0,
}: LevelUpModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="relative bg-white rounded-2xl p-8 max-w-sm mx-4 text-center border-2 border-sq-accent shadow-sq-accent-glow"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-sq-muted hover:text-sq-text"
            >
              <X className="w-5 h-5" />
            </button>

            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 300 }}
              className="mb-4"
            >
              <span className="text-6xl">⚔️</span>
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="font-bold text-3xl text-sq-accent mb-2"
            >
              LEVEL UP!
            </motion.h2>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <p className="text-lg text-sq-text">
                {levelsGained > 1 ? `+${levelsGained} Levels! ` : ""}You have reached{" "}
                <span className="text-sq-accent font-bold">
                  {newRank}-{rankLevel(newLevel)}
                </span>
              </p>
              <p className="text-sm text-sq-muted">
                The System acknowledges your progress.
              </p>
              {(statPointsEarned > 0 || goldBonus > 0) && (
                <div className="mt-3 space-y-1">
                  {statPointsEarned > 0 && (
                    <p className="text-xs text-sq-blue font-medium">
                      +{statPointsEarned} Stat Point{statPointsEarned > 1 ? "s" : ""} earned
                    </p>
                  )}
                  {goldBonus > 0 && (
                    <p className="text-xs text-sq-gold font-medium">
                      +{goldBonus} Gold bonus
                    </p>
                  )}
                </div>
              )}
            </motion.div>

            {isGateLocked && gateLevel && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 p-3 bg-red-50 border border-red-200 rounded-xl"
              >
                <p className="font-bold text-red-600 text-sm">
                  GATE {gateLevel} DETECTED
                </p>
                <p className="text-xs text-sq-muted mt-1">
                  An examination is required to advance beyond this point.
                </p>
              </motion.div>
            )}

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              onClick={onClose}
              className="sq-button-accent mt-6 w-full"
            >
              CONTINUE
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
