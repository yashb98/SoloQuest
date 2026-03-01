import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "sq-bg": "#0A0E1A",
        "sq-panel": "#111827",
        "sq-border": "#1E3A5F",
        "sq-gold": "#E2B04A",
        "sq-blue": "#3B82F6",
        "sq-text": "#E2E8F0",
        "sq-muted": "#94A3B8",
        "sq-green": "#22C55E",
        "sq-purple": "#A855F7",
      },
      fontFamily: {
        display: ["Rajdhani", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        "sq-glow": "inset 0 0 20px rgba(30, 58, 95, 0.3)",
        "sq-gold-glow": "0 0 15px rgba(226, 176, 74, 0.4)",
        "sq-purple-glow": "0 0 20px rgba(168, 85, 247, 0.5)",
      },
      animation: {
        "pulse-gold": "pulse-gold 2s ease-in-out infinite",
        "glow-border": "glow-border 3s ease-in-out infinite",
      },
      keyframes: {
        "pulse-gold": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(226, 176, 74, 0.3)" },
          "50%": { boxShadow: "0 0 20px rgba(226, 176, 74, 0.6)" },
        },
        "glow-border": {
          "0%, 100%": { borderColor: "rgba(30, 58, 95, 0.5)" },
          "50%": { borderColor: "rgba(30, 58, 95, 1)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
