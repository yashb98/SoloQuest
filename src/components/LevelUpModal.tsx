"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface LevelUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  newLevel: number;
  newRank: string;
  isGateLocked: boolean;
  gateLevel: number | null;
}

export default function LevelUpModal({
  isOpen,
  onClose,
  newLevel,
  newRank,
  isGateLocked,
  gateLevel,
}: LevelUpModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200 }}
            className="relative sq-panel p-8 max-w-sm mx-4 text-center border-2 border-sq-gold shadow-sq-gold-glow"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-sq-muted hover:text-sq-text"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Level-up content */}
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
              className="font-display font-bold text-3xl text-sq-gold mb-2"
            >
              LEVEL UP!
            </motion.h2>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <p className="font-mono text-lg text-sq-text">
                You have reached{" "}
                <span className="text-sq-gold font-bold">
                  {newRank}-{newLevel}
                </span>
              </p>
              <p className="font-mono text-sm text-sq-muted">
                The System acknowledges your progress.
              </p>
            </motion.div>

            {isGateLocked && gateLevel && (
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
                <p className="font-display font-bold text-red-400 text-sm">
                  GATE {gateLevel} DETECTED
                </p>
                <p className="font-mono text-xs text-sq-muted mt-1">
                  An examination is required to advance beyond this point.
                </p>
              </motion.div>
            )}

            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.7 }}
              onClick={onClose}
              className="sq-button-gold mt-6 w-full"
            >
              CONTINUE
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
