import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#EAF0FF",
        muted: "#9AA6C4",
        violet: "#7C5CFF",
        cyan: "#22D3EE",
        teal: "#2DD4BF",
        gold: "#F5C97B",
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "system-ui", "sans-serif"],
        display: ["var(--font-sora)", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
