/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0a",
        card: "#1a1a2e",
        "card-hover": "#16213e",
        accent: "#e94560",
        "accent-glow": "#e94560",
        gold: "#ffd700",
        "xp-blue": "#00d4ff",
        "stat-vitality": "#ef4444",
        "stat-intel": "#3b82f6",
        "stat-hustle": "#f59e0b",
        "stat-wealth": "#10b981",
        "stat-focus": "#8b5cf6",
        "stat-agentiq": "#06b6d4",
      },
    },
  },
  plugins: [],
};
