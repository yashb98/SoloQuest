"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Volume2 } from "lucide-react";

export default function MorningBriefing() {
  const [briefing, setBriefing] = useState<string | null>(null);
  const [displayedText, setDisplayedText] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const fetchBriefing = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    const dismissedDate = localStorage.getItem("sq-briefing-dismissed");
    if (dismissedDate === today) {
      setIsDismissed(true);
      return;
    }

    try {
      const res = await fetch("/api/ai/briefing");
      const data = await res.json();
      if (data.briefing) {
        setBriefing(data.briefing);
        setIsOpen(true);
      }
    } catch {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    if (!isDismissed) {
      fetchBriefing();
    }
  }, [fetchBriefing, isDismissed]);

  // Typewriter effect
  useEffect(() => {
    if (!briefing || !isOpen) return;

    let index = 0;
    setDisplayedText("");

    const interval = setInterval(() => {
      if (index < briefing.length) {
        setDisplayedText(briefing.slice(0, index + 1));
        index++;
      } else {
        clearInterval(interval);
      }
    }, 30);

    return () => clearInterval(interval);
  }, [briefing, isOpen]);

  const handleDismiss = () => {
    setIsOpen(false);
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem("sq-briefing-dismissed", today);
  };

  if (isDismissed || !briefing) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="relative max-w-lg mx-4 p-8 bg-white rounded-2xl border border-sq-accent/30 shadow-sq-accent-glow"
          >
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 text-sq-muted hover:text-sq-text"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Volume2 className="w-4 h-4 text-sq-accent animate-pulse" />
              <span className="font-bold text-xs text-sq-accent uppercase tracking-widest">
                System Briefing
              </span>
            </div>

            <div className="text-sm text-sq-text leading-relaxed min-h-[120px]">
              {displayedText}
              {displayedText.length < (briefing?.length ?? 0) && (
                <span className="inline-block w-2 h-4 bg-sq-accent ml-0.5 animate-pulse" />
              )}
            </div>

            {displayedText.length >= (briefing?.length ?? 0) && (
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleDismiss}
                className="sq-button-accent mt-6 w-full text-sm"
              >
                ACKNOWLEDGED
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
