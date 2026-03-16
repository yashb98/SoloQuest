"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useHunter } from "@/contexts/HunterContext";

const typeStyles: Record<string, { bg: string; border: string; icon: string }> = {
  xp: { bg: "bg-orange-50 dark:bg-orange-950/40", border: "border-sq-accent/40", icon: "⚡" },
  gold: { bg: "bg-yellow-50 dark:bg-yellow-950/40", border: "border-sq-gold/40", icon: "🪙" },
  level: { bg: "bg-purple-50 dark:bg-purple-950/40", border: "border-sq-purple/40", icon: "⬆️" },
  achievement: { bg: "bg-amber-50 dark:bg-amber-950/40", border: "border-amber-400/40", icon: "🏆" },
  stat: { bg: "bg-blue-50 dark:bg-blue-950/40", border: "border-sq-blue/40", icon: "📊" },
  info: { bg: "bg-white dark:bg-gray-800", border: "border-sq-border dark:border-gray-600", icon: "ℹ️" },
  error: { bg: "bg-red-50 dark:bg-red-950/40", border: "border-red-300", icon: "❌" },
};

export default function ToastContainer() {
  const { toasts, removeToast } = useHunter();

  return (
    <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2 max-w-[360px] pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const style = typeStyles[toast.type] || typeStyles.info;
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, x: 80, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: "spring", damping: 20, stiffness: 300 }}
              className={`pointer-events-auto ${style.bg} border ${style.border} rounded-xl px-4 py-3 shadow-lg flex items-start gap-3 min-w-[280px]`}
            >
              <span className="text-xl flex-shrink-0 mt-0.5">{toast.icon || style.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[14px] text-sq-text dark:text-gray-100">{toast.title}</p>
                {toast.description && (
                  <p className="text-[12px] text-sq-muted dark:text-gray-400 mt-0.5">{toast.description}</p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 text-sq-muted hover:text-sq-text dark:text-gray-500 dark:hover:text-gray-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
