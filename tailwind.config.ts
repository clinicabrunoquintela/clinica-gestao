import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // Usar variáveis CSS do theme.css
        border: "var(--color-border)",
        input: "var(--color-border)",
        ring: "var(--color-primary)",
        background: "var(--color-bg)",
        foreground: "#F9F6F2",
        primary: {
          DEFAULT: "var(--color-primary)",
          light: "#F6A94A",
          dark: "#D67511",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "var(--color-muted)",
          foreground: "var(--color-text)",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "var(--color-muted)",
          foreground: "#666666",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          foreground: "var(--color-text)",
        },
        popover: {
          DEFAULT: "var(--color-bg)",
          foreground: "var(--color-text)",
        },
        card: {
          DEFAULT: "var(--color-bg)",
          foreground: "var(--color-text)",
        },
        text: {
          dark: "var(--color-text)",
          light: "#666666",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config


