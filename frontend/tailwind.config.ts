import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#FAF9F6",
        "surface-pure": "#FFFFFF",
        "surface-subtle": "#F8FAFC",
        "surface-variant": "#F1F5F9",
        "outline-variant": "#E2E8F0",
        primary: {
          DEFAULT: "#059669",
          hover: "#047857",
        },
        "on-surface": "#0F172A",
        "on-surface-variant": "#475569",
        "ink-muted": "#64748B",
        amber: {
          tint: "#FEF3C7",
          ink: "#B45309",
        },
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      fontFamily: {
        headline: ["Newsreader", "serif"],
        display: ["Newsreader", "serif"],
        body: ["Be Vietnam Pro", "sans-serif"],
        label: ["Be Vietnam Pro", "sans-serif"],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;

