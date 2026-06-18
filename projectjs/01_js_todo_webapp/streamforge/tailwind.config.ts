import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm near-black base — not a pure gray scale
        ink: {
          DEFAULT: "#0E0E11",
          surface: "#18171C",
          raised: "#1F1E24",
          border: "#2A292F",
          borderStrong: "#3A383F",
        },
        // Warm off-white text — not pure white
        paper: {
          DEFAULT: "#F5F3EE",
          dim: "#C9C6BD",
          faint: "#8C8983",
        },
        // Single accent: coral-orange. "record / live / play" energy.
        flare: {
          DEFAULT: "#FF5A36",
          dim: "#E14B2A",
          muted: "#7A2F1C",
          tint: "#3A211B",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-sans)", "sans-serif"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
    },
  },
  plugins: [],
};

export default config;
