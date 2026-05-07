import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "ui-sans-serif", "system-ui"],
        display: ["var(--font-space)", "Space Grotesk", "Inter", "ui-sans-serif"]
      },
      colors: {
        background: "#0B1020",
        panel: "rgba(255,255,255,0.08)",
        borderGlass: "rgba(255,255,255,0.12)",
        primary: "#6C63FF",
        secondary: "#00D1FF",
        accent: "#A855F7"
      },
      boxShadow: {
        glow: "0 0 40px rgba(108,99,255,0.35)",
        cyan: "0 0 36px rgba(0,209,255,0.25)"
      },
      animation: {
        float: "float 7s ease-in-out infinite",
        pulseGlow: "pulseGlow 5s ease-in-out infinite"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-16px)" }
        },
        pulseGlow: {
          "0%, 100%": { opacity: "0.45", transform: "scale(1)" },
          "50%": { opacity: "0.85", transform: "scale(1.08)" }
        }
      }
    }
  },
  plugins: []
};

export default config;

