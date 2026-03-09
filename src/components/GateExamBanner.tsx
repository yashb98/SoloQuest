"use client";

import { useHunter } from "@/contexts/HunterContext";
import { isGateLevel } from "@/lib/xp";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function GateExamBanner() {
  const { hunter, loading } = useHunter();
  const pathname = usePathname();

  // Don't show on the exam page itself
  if (pathname === "/exam") return null;
  if (loading || !hunter) return null;

  const isGateLocked =
    hunter.xp >= hunter.xpToNext && isGateLevel(hunter.level + 1);

  if (!isGateLocked) return null;

  const gateLevel = hunter.level + 1;

  return (
    <Link href="/exam">
      <div className="mx-6 mt-4 p-3 rounded-xl border-2 border-sq-gold/60 bg-gradient-to-r from-sq-gold/10 to-sq-gold/5 flex items-center gap-3 cursor-pointer hover:border-sq-gold hover:from-sq-gold/15 hover:to-sq-gold/10 transition-all group">
        <AlertTriangle className="w-5 h-5 text-sq-gold animate-pulse flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-sq-gold">
            GATE {gateLevel} EXAM REQUIRED
          </span>
          <span className="text-xs text-sq-muted ml-2">
            XP is capped — pass the exam to level up
          </span>
        </div>
        <span className="text-xs font-semibold text-sq-gold group-hover:translate-x-0.5 transition-transform">
          TAKE EXAM →
        </span>
      </div>
    </Link>
  );
}
