import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      colors: {
        ink: {
          950: "#06070A",
          900: "#0B0D12",
          800: "#11141B",
          700: "#1A1E29",
          600: "#262B3A",
          500: "#3A4053",
        },
        accent: {
          DEFAULT: "#8B5CF6",
          soft: "#C4B5FD",
        },
      },
      backgroundImage: {
        "radial-fade":
          "radial-gradient(60% 60% at 50% 0%, rgba(139,92,246,0.18) 0%, rgba(11,13,18,0) 60%)",
      },
      boxShadow: {
        glass:
          "0 1px 0 0 rgba(255,255,255,0.06) inset, 0 30px 60px -20px rgba(0,0,0,0.5)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
