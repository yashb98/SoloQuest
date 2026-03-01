"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Scroll, ShoppingBag, Swords, Trophy, Target,
  Briefcase, GraduationCap, BarChart3, User, Bot,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Home" },
  { href: "/quests", icon: Scroll, label: "Quests" },
  { href: "/dungeons", icon: Swords, label: "Dungeons" },
  { href: "/goals", icon: Target, label: "Goals" },
  { href: "/applications", icon: Briefcase, label: "Jobs" },
  { href: "/achievements", icon: Trophy, label: "Badges" },
  { href: "/certs", icon: GraduationCap, label: "Certs" },
  { href: "/shop", icon: ShoppingBag, label: "Shop" },
  { href: "/mentor", icon: Bot, label: "Mentor" },
  { href: "/stats", icon: BarChart3, label: "Stats" },
  { href: "/profile", icon: User, label: "Profile" },
];

// Mobile nav shows a subset
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
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-sq-panel border-t border-sq-border md:hidden">
        <div className="flex items-center justify-around py-2">
          {mobileItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-md transition-colors
                  ${isActive ? "text-sq-gold" : "text-sq-muted hover:text-sq-text"}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-[10px] font-display font-semibold">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-56 flex-col bg-sq-panel border-r border-sq-border z-50">
        <div className="p-4 border-b border-sq-border">
          <h1 className="font-display font-bold text-xl text-sq-gold tracking-wide">SOLO QUEST</h1>
          <p className="text-xs text-sq-muted font-mono mt-1">Full Gamification v2.0</p>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-all
                  ${isActive
                    ? "bg-sq-border/30 text-sq-gold border border-sq-border"
                    : "text-sq-muted hover:text-sq-text hover:bg-sq-bg"
                  }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="font-display font-semibold text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
