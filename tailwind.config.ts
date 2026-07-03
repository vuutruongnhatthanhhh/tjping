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
        primary: {
          DEFAULT: "#2563EB",
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BFDBFE",
          300: "#93C5FD",
          400: "#60A5FA",
          500: "#2563EB",
          600: "#1D4ED8",
          700: "#1E40AF",
          800: "#1E3A8A",
          900: "#172554",
          950: "#0B1224"
        },
        dark: {
          bg: "#06111F",
          card: "#0B1B30",
          border: "#183B68",
          surface: "#10243D"
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-playfair)", "Georgia", "serif"]
      },
      backgroundImage: {
        "mystic-dark":
          "radial-gradient(ellipse at top left, #0B2A55 0%, #06111F 50%, #030914 100%)",
        "mystic-light":
          "radial-gradient(ellipse at top left, #EFF6FF 0%, #FFFFFF 52%, #F8FBFF 100%)"
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "pulse-glow": "pulseGlow 3s ease-in-out infinite"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        pulseGlow: {
          "0%, 100%": { boxShadow: "0 0 20px rgba(37, 99, 235, 0.3)" },
          "50%": { boxShadow: "0 0 40px rgba(37, 99, 235, 0.55)" }
        }
      }
    }
  },
  plugins: []
};

export default config;
