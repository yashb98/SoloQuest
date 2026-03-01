"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Scroll, ShoppingBag, Swords, Trophy, Target,
  Briefcase, GraduationCap, BarChart3, User, Bot, CalendarDays,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home", emoji: "🏠" },
  { href: "/quests", icon: Scroll, label: "Quests", emoji: "⚔️" },
  { href: "/dungeons", icon: Swords, label: "Dungeons", emoji: "🏰" },
  { href: "/planner", icon: CalendarDays, label: "Planner", emoji: "📋" },
  { href: "/goals", icon: Target, label: "Goals", emoji: "🎯" },
  { href: "/applications", icon: Briefcase, label: "Jobs", emoji: "💼" },
  { href: "/achievements", icon: Trophy, label: "Badges", emoji: "🏅" },
  { href: "/certs", icon: GraduationCap, label: "Certs", emoji: "📜" },
  { href: "/shop", icon: ShoppingBag, label: "Shop", emoji: "🛒" },
  { href: "/mentor", icon: Bot, label: "Mentor", emoji: "🧙" },
  { href: "/stats", icon: BarChart3, label: "Stats", emoji: "📊" },
  { href: "/profile", icon: User, label: "Profile", emoji: "👤" },
];

const mobileItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/quests", icon: Scroll, label: "Quests" },
  { href: "/dungeons", icon: Swords, label: "Dungeons" },
  { href: "/mentor", icon: Bot, label: "Mentor" },
  { href: "/profile", icon: User, label: "Profile" },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-sq-border md:hidden">
        <div className="flex items-center justify-around py-2">
          {mobileItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg transition-colors
                  ${isActive ? "text-sq-accent" : "text-sq-subtle hover:text-sq-text"}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[260px] flex-col bg-white border-r border-sq-border z-50">
        <div className="px-7 pt-8 pb-6">
          <h1 className="text-[26px] font-bold text-sq-accent tracking-[-0.02em]">
            Solo Quest
          </h1>
          <p className="text-[13px] text-sq-muted font-medium tracking-[0.05em] uppercase mt-1">
            Full Gamification v2.0
          </p>
        </div>
        <nav className="flex-1 px-4 space-y-[2px] overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-[14px] px-4 py-3 rounded-xl transition-all w-full
                  ${isActive
                    ? "bg-[#FFF3ED] text-sq-accent font-semibold"
                    : "text-sq-subtle hover:bg-sq-hover font-[450]"
                  }`}
              >
                <span className="text-[20px] w-7 text-center">{item.emoji}</span>
                <span className="text-[16px]">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
