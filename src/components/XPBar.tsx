"use client";

import { motion } from "framer-motion";

interface XPBarProps {
  currentXP: number;
  xpToNext: number;
  level: number;
}

export default function XPBar({ currentXP, xpToNext, level }: XPBarProps) {
  const percentage = Math.min((currentXP / xpToNext) * 100, 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="font-mono text-xs text-sq-muted">
          LV.{level}
        </span>
        <span className="font-mono text-xs text-sq-gold">
          {currentXP.toLocaleString()} / {xpToNext.toLocaleString()} XP
        </span>
      </div>
      <div className="h-3 bg-sq-bg rounded-full border border-sq-border overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-sq-gold/80 to-sq-gold rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            boxShadow: "0 0 10px rgba(226, 176, 74, 0.5)",
          }}
        />
      </div>
    </div>
  );
}
