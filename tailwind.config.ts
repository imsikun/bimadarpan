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
        /* Backgrounds */
        "bg-base":       "var(--bg-base)",
        "bg-surface":    "var(--bg-surface)",
        "bg-elevated":   "var(--bg-elevated)",
        "bg-data":       "var(--bg-data)",
        /* Accents */
        saffron:         "var(--saffron)",
        "saffron-dim":   "var(--saffron-dim)",
        teal:            "var(--teal)",
        "teal-dim":      "var(--teal-dim)",
        purple:          "var(--purple)",
        "purple-dim":    "var(--purple-dim)",
        "red-alert":     "var(--red-alert)",
        "red-dim":       "var(--red-dim)",
        /* Data signals */
        "data-excellent": "var(--data-excellent)",
        "data-good":      "var(--data-good)",
        "data-warning":   "var(--data-warning)",
        "data-poor":      "var(--data-poor)",
        /* Text */
        "text-primary":   "var(--text-primary)",
        "text-secondary": "var(--text-secondary)",
        "text-tertiary":  "var(--text-tertiary)",
        "text-muted":     "var(--text-muted)",
        "text-saffron":   "var(--text-saffron)",
        "text-teal":      "var(--text-teal)",
        "text-red":       "var(--text-red)",
      },
      borderColor: {
        subtle:   "var(--border-subtle)",
        default:  "var(--border-default)",
        strong:   "var(--border-strong)",
        saffron:  "var(--border-saffron)",
      },
      borderRadius: {
        sm:   "var(--radius-sm)",
        md:   "var(--radius-md)",
        lg:   "var(--radius-lg)",
        xl:   "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      fontFamily: {
        display: ["var(--font-display)"],
        body:    ["var(--font-body)"],
        mono:    ["var(--font-mono)"],
      },
      spacing: {
        "1":  "var(--space-1)",
        "2":  "var(--space-2)",
        "3":  "var(--space-3)",
        "4":  "var(--space-4)",
        "5":  "var(--space-5)",
        "6":  "var(--space-6)",
        "8":  "var(--space-8)",
        "10": "var(--space-10)",
        "12": "var(--space-12)",
        "16": "var(--space-16)",
        "20": "var(--space-20)",
      },
      transitionDuration: {
        fast:    "var(--dur-fast)",
        default: "var(--dur-default)",
        slow:    "var(--dur-slow)",
      },
      transitionTimingFunction: {
        default: "var(--ease-default)",
        spring:  "var(--ease-spring)",
        smooth:  "var(--ease-smooth)",
        sheet:   "var(--ease-sheet)",
      },
      animation: {
        aurora:       "aurora var(--dur-aurora) ease infinite",
        "pulse-live": "pulse-live 2s ease-in-out infinite",
        "fade-up":    "fade-up var(--dur-default) var(--ease-default) both",
        shimmer:      "shimmer 1.5s ease-in-out infinite",
        "page-fade":  "page-fade 300ms var(--ease-default) both",
        "toast-in":   "toast-in 200ms var(--ease-default) both",
        "toast-out":  "toast-out 150ms var(--ease-smooth) both",
        "slide-in-right": "slide-in-right var(--dur-default) var(--ease-default) both",
        "ticker-scroll":  "ticker-scroll var(--dur-ticker) linear infinite",
      },
      keyframes: {
        aurora: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%":       { backgroundPosition: "100% 50%" },
        },
        "pulse-live": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%":       { opacity: "0.4", transform: "scale(1.5)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
        "page-fade": {
          from: { opacity: "0", transform: "translateY(4px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateY(8px) scale(0.96)" },
          to:   { opacity: "1", transform: "translateY(0) scale(1)" },
        },
        "toast-out": {
          from: { opacity: "1", transform: "translateY(0) scale(1)" },
          to:   { opacity: "0", transform: "translateY(-4px) scale(0.98)" },
        },
        "slide-in-right": {
          from: { opacity: "0", transform: "translateX(16px)" },
          to:   { opacity: "1", transform: "translateX(0)" },
        },
        "ticker-scroll": {
          from: { transform: "translateX(0)" },
          to:   { transform: "translateX(-50%)" },
        },
      },
      maxWidth: {
        page: "1440px",
      },
      width: {
        sidebar: "320px",
      },
      height: {
        topnav: "64px",
        ticker: "36px",
      },
      zIndex: {
        topnav:  "100",
        sheet:   "200",
        "sheet-backdrop": "199",
        toast:   "500",
      },
    },
  },
  plugins: [],
};

export default config;
