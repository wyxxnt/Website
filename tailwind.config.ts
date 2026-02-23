import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      /* ───────────────────────────────────────────────
       *  Pastel / Milk Color Palette
       * ─────────────────────────────────────────────── */
      colors: {
        /* Semantic surface & text tokens (CSS-variable driven) */
        background: "var(--background)",
        foreground: "var(--foreground)",
        surface: "var(--surface)",
        "surface-hover": "var(--surface-hover)",
        border: "var(--border)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",

        /* Primary accent – soft lavender */
        lavender: {
          50: "#F3EFFE",
          100: "#E8DFFC",
          200: "#D4C4F7",
          300: "#C1AAF2",
          400: "#B8A9E8",
          500: "#A48DDE",
          600: "#8B6FCC",
          700: "#7254B5",
          800: "#5A3F94",
          900: "#432E73",
          DEFAULT: "#B8A9E8",
        },

        /* Secondary – mint green */
        mint: {
          50: "#EEFBF3",
          100: "#D6F5E3",
          200: "#B5EDCF",
          300: "#A8E6CF",
          400: "#82D9B3",
          500: "#5CC99A",
          600: "#3FB882",
          700: "#2E9A69",
          800: "#237A52",
          900: "#1A5C3E",
          DEFAULT: "#A8E6CF",
        },

        /* Tertiary – soft pink */
        pink: {
          50: "#FFF0F2",
          100: "#FFE0E4",
          200: "#FFCDD3",
          300: "#FFB3BA",
          400: "#FF99A3",
          500: "#FF7A87",
          600: "#F25D6B",
          700: "#D94453",
          800: "#B8303E",
          900: "#8C1F2D",
          DEFAULT: "#FFB3BA",
        },

        /* Cream / warm white */
        cream: {
          50: "#FEFEFE",
          100: "#FDFDFB",
          200: "#FAFAF8",
          300: "#F5F5F0",
          400: "#EDEDE5",
          500: "#E0E0D6",
          600: "#C8C8BC",
          700: "#A8A89E",
          800: "#88887E",
          900: "#686860",
          DEFAULT: "#FAFAF8",
        },

        /* Soft blue */
        "soft-blue": {
          50: "#EFF6FF",
          100: "#DBEAFE",
          200: "#BDD7F9",
          300: "#A0C4F4",
          400: "#89B5EE",
          500: "#6FA1E5",
          600: "#558DD9",
          700: "#3E73C0",
          800: "#2E5A9A",
          900: "#1F4074",
          DEFAULT: "#A0C4F4",
        },

        /* Warm yellow / peach */
        peach: {
          50: "#FFF8F0",
          100: "#FFEFD9",
          200: "#FFE1B8",
          300: "#FFD1A0",
          400: "#FFC488",
          500: "#FFB36E",
          600: "#F09A4A",
          700: "#D47F30",
          800: "#AA6420",
          900: "#804B14",
          DEFAULT: "#FFD1A0",
        },

        /* Dark mode surface palette */
        dark: {
          bg: "#1A1A2E",
          surface: "#22223A",
          "surface-hover": "#2C2C48",
          border: "#3A3A56",
          muted: "#4A4A66",
        },
      },

      /* ───────────────────────────────────────────────
       *  Typography
       * ─────────────────────────────────────────────── */
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },

      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },

      /* ───────────────────────────────────────────────
       *  Spacing & Sizing
       * ─────────────────────────────────────────────── */
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },

      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.04)",
        "soft-md": "0 4px 16px rgba(0, 0, 0, 0.06)",
        "soft-lg": "0 8px 32px rgba(0, 0, 0, 0.08)",
        "soft-xl": "0 12px 48px rgba(0, 0, 0, 0.10)",
        glow: "0 0 20px rgba(184, 169, 232, 0.3)",
        "glow-mint": "0 0 20px rgba(168, 230, 207, 0.3)",
        "glow-pink": "0 0 20px rgba(255, 179, 186, 0.3)",
      },

      /* ───────────────────────────────────────────────
       *  Keyframes & Animations
       * ─────────────────────────────────────────────── */
      keyframes: {
        /* Card entrance */
        "card-enter": {
          "0%": {
            opacity: "0",
            transform: "translateY(12px) scale(0.97)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1)",
          },
        },

        /* Card hover lift */
        "card-lift": {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-4px)" },
        },

        /* Modal entrance – scale + fade */
        "modal-enter": {
          "0%": {
            opacity: "0",
            transform: "scale(0.95) translateY(8px)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1) translateY(0)",
          },
        },

        /* Modal exit */
        "modal-exit": {
          "0%": {
            opacity: "1",
            transform: "scale(1) translateY(0)",
          },
          "100%": {
            opacity: "0",
            transform: "scale(0.95) translateY(8px)",
          },
        },

        /* Modal backdrop fade */
        "backdrop-enter": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },

        /* Toast slide in from right */
        "toast-enter": {
          "0%": {
            opacity: "0",
            transform: "translateX(100%) scale(0.95)",
          },
          "100%": {
            opacity: "1",
            transform: "translateX(0) scale(1)",
          },
        },

        /* Toast slide out to right */
        "toast-exit": {
          "0%": {
            opacity: "1",
            transform: "translateX(0) scale(1)",
          },
          "100%": {
            opacity: "0",
            transform: "translateX(100%) scale(0.95)",
          },
        },

        /* Gentle float – for decorative elements */
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },

        /* Pulse glow – for active/focus states */
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 8px rgba(184, 169, 232, 0.2)" },
          "50%": { boxShadow: "0 0 20px rgba(184, 169, 232, 0.45)" },
        },

        /* Skeleton shimmer */
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },

        /* Fade in generic */
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },

        /* Slide up generic */
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },

        /* Slide down – for dropdown menus */
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },

        /* Spin – loading spinner */
        spin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },

        /* Bounce subtle */
        "bounce-subtle": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-3px)" },
        },

        /* Scale pop – for button clicks, checkmarks */
        "scale-pop": {
          "0%": { transform: "scale(0.85)", opacity: "0" },
          "60%": { transform: "scale(1.05)" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },

        /* Progress bar fill */
        "progress-fill": {
          "0%": { width: "0%" },
          "100%": { width: "var(--progress-width, 100%)" },
        },

        /* Confetti burst – celebratory feedback */
        confetti: {
          "0%": { transform: "scale(0) rotate(0deg)", opacity: "1" },
          "50%": { transform: "scale(1.2) rotate(180deg)", opacity: "0.8" },
          "100%": { transform: "scale(0) rotate(360deg)", opacity: "0" },
        },
      },

      animation: {
        "card-enter": "card-enter 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
        "card-lift": "card-lift 0.2s ease-out forwards",
        "modal-enter":
          "modal-enter 0.3s cubic-bezier(0.22, 1, 0.36, 1) both",
        "modal-exit": "modal-exit 0.2s ease-in both",
        "backdrop-enter": "backdrop-enter 0.25s ease-out both",
        "toast-enter":
          "toast-enter 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
        "toast-exit": "toast-exit 0.3s ease-in both",
        float: "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2.5s ease-in-out infinite",
        shimmer: "shimmer 1.8s ease-in-out infinite",
        "fade-in": "fade-in 0.3s ease-out both",
        "slide-up": "slide-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-down": "slide-down 0.25s cubic-bezier(0.22, 1, 0.36, 1) both",
        "bounce-subtle": "bounce-subtle 0.6s ease-in-out",
        "scale-pop": "scale-pop 0.35s cubic-bezier(0.22, 1, 0.36, 1) both",
        "progress-fill": "progress-fill 0.8s ease-out both",
        confetti: "confetti 0.6s ease-out both",
      },

      /* ───────────────────────────────────────────────
       *  Transition timing functions
       * ─────────────────────────────────────────────── */
      transitionTimingFunction: {
        smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
        bounce: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      },

      transitionDuration: {
        "250": "250ms",
        "350": "350ms",
        "400": "400ms",
      },
    },
  },
  plugins: [],
};

export default config;
