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
        <span className="text-[13px] font-medium text-sq-muted">
          Lv. {level}
        </span>
          
        <span className="text-[13px] font-medium text-sq-muted">
           - ({currentXP.toLocaleString()} / {xpToNext.toLocaleString()} XP)
        </span>
      </div>
      <div className="h-2 bg-sq-hover rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-sq-accent to-sq-accent-light rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
