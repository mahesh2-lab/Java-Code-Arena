import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Dark theme
        dark: {
          "0": "#0F0F0F",
          "1": "#171717",
          "2": "#1F1F1F",
          "3": "#262626",
          "4": "#2E2E2E",
        },
        // Light theme
        light: {
          "0": "#FFFFFF",
          "1": "#F9FAFB",
          "2": "#F3F4F6",
          "3": "#E5E7EB",
          "4": "#D1D5DB",
        },
        // Blue theme
        blue: {
          "0": "#0A0E1A",
          "1": "#111827",
          "2": "#1E293B",
          "3": "#334155",
          "4": "#475569",
        },
        text: {
          primary: "#E5E7EB",
          secondary: "#9CA3AF",
          muted: "#6B7280",
        },
        accent: {
          blue: "#3B82F6",
          green: "#22C55E",
          orange: "#F59E0B",
          red: "#EF4444",
          yellow: "#FBBF24",
          purple: "#A855F7",
        },
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
      borderRadius: {
        button: "8px",
        card: "12px",
        tag: "6px",
      },
      fontSize: {
        title: ["22px", { fontWeight: "600", lineHeight: "1.6" }],
        header: ["18px", { fontWeight: "600", lineHeight: "1.6" }],
        body: ["14px", { fontWeight: "400", lineHeight: "1.6" }],
        button: ["14px", { fontWeight: "500", lineHeight: "1.6" }],
      },
      transitionDuration: {
        ui: "200ms",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
