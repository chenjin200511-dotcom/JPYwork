// Purpose: Tells Tailwind which App Router and component files contain class names.
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        jpy: {
          background: "#F6F4EF",
          text: "#111111",
          muted: "#6F6F6F",
          dark: "#1E1E1E",
          border: "#D8D4CC",
          block: "#ECE8DF",
          card: "#FFFFFF",
          accent: "#B8945E",
        },
      },
      borderRadius: {
        jpy: "22px",
        "jpy-sm": "20px",
        "jpy-lg": "24px",
      },
      boxShadow: {
        jpy: "0 18px 55px rgb(30 30 30 / 0.05)",
      },
      fontFamily: {
        sans: [
          "Geist",
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "PingFang SC",
          "Microsoft YaHei",
          "Noto Sans SC",
          "sans-serif",
        ],
        mono: [
          "SFMono-Regular",
          "Cascadia Code",
          "Roboto Mono",
          "Consolas",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
