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
        "sq-bg": "#FAF9F6",
        "sq-panel": "#FFFFFF",
        "sq-border": "#E8E4DE",
        "sq-accent": "#C4653A",
        "sq-accent-light": "#E08A5E",
        "sq-gold": "#D4A017",
        "sq-blue": "#3B82F6",
        "sq-text": "#1A1A1A",
        "sq-muted": "#9C8E82",
        "sq-subtle": "#6B5F56",
        "sq-green": "#22C55E",
        "sq-purple": "#A855F7",
        "sq-hover": "#F0EBE5",
        "sq-warm": "#FFF8F0",
        "sq-warm-border": "#F0E0D0",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        "sq-card": "0 1px 3px rgba(0,0,0,0.04)",
        "sq-card-hover": "0 4px 12px rgba(0,0,0,0.06)",
        "sq-accent-glow": "0 2px 8px rgba(196,101,58,0.3)",
        "sq-sidebar": "4px 0 24px rgba(0,0,0,0.08)",
      },
      animation: {
        "pulse-accent": "pulse-accent 2s ease-in-out infinite",
      },
      keyframes: {
        "pulse-accent": {
          "0%, 100%": { boxShadow: "0 0 5px rgba(196,101,58,0.2)" },
          "50%": { boxShadow: "0 0 15px rgba(196,101,58,0.4)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
