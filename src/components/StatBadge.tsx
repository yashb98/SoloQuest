"use client";

import { motion } from "framer-motion";

interface StatBadgeProps {
  rank: string;
  level: number;
}

const rankColors: Record<string, string> = {
  E: "from-gray-500 to-gray-600",
  D: "from-green-500 to-green-600",
  C: "from-blue-500 to-blue-600",
  B: "from-purple-500 to-purple-600",
  A: "from-orange-500 to-orange-600",
  S: "from-sq-gold to-yellow-500",
};

const rankGlows: Record<string, string> = {
  E: "shadow-none",
  D: "shadow-[0_0_10px_rgba(34,197,94,0.3)]",
  C: "shadow-[0_0_10px_rgba(59,130,246,0.3)]",
  B: "shadow-[0_0_12px_rgba(168,85,247,0.4)]",
  A: "shadow-[0_0_15px_rgba(249,115,22,0.4)]",
  S: "shadow-sq-gold-glow",
};

export default function StatBadge({ rank, level }: StatBadgeProps) {
  return (
    <motion.div
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-md border border-sq-border
        bg-gradient-to-r ${rankColors[rank] || rankColors.E} ${rankGlows[rank] || rankGlows.E}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <span className="font-display font-bold text-white text-sm">
        {rank}-{level}
      </span>
    </motion.div>
  );
}
