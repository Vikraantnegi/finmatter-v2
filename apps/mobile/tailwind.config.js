/**
 * FinMatter Design System — single source for styling (NativeWind/Tailwind).
 * Sourced from Figma Design System and docs/mobile-mvp/stitch-prompts.md.
 *
 * Use className in components; no separate theme package.
 */
/* eslint-disable @typescript-eslint/no-require-imports -- Tailwind config runs as CommonJS */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // FinMatter HTML/Figma Schema
        primary: "#00B14F",
        background: "#ffffff",
        "background-secondary": "#F8F9FA",
        text: "#1A1A1A",
        "text-secondary": "#4B5563",
        border: "#E5E7EB",
        error: "#DC2626",
        success: "#059669",
        // Precise Aliases matching HTML configuration
        "background-light": "#ffffff",
        "background-dark": "#0f2318", 
        "charcoal": "#1A1A1A",
        "charcoal-muted": "#4B5563",
      },
      fontFamily: {
        // Enforcing Manrope as the native base font
        display: ["Manrope_800ExtraBold", "sans-serif"],
        body: ["Manrope_500Medium", "sans-serif"],
        sans: ["Manrope_400Regular", "sans-serif"],
      },
      fontSize: {
        "display-large": ["38px", { lineHeight: "40px" }],
        "heading-large": ["24px", { lineHeight: "32px" }],
        "heading-medium": ["20px", { lineHeight: "28px" }],
        body: ["16px", { lineHeight: "24px" }],
        "body-large": ["18px", { lineHeight: "28px" }],
        "body-small": ["14px", { lineHeight: "20px" }],
        caption: ["13px", { lineHeight: "16px" }],
      },
      spacing: {
        0: 0,
        1: 4,
        2: 8,
        3: 12,
        4: 16,
        5: 20,
        6: 24,
        8: 32,
        10: 40,
        12: 48,
        16: 64,
      },
      borderRadius: {
        input: 8,
        card: 12,
        sm: 4,
        md: 8,
        lg: 12,
        xl: 16,
      },
      boxShadow: {
        // Card: soft drop shadow (white surfaces)
        card: "0 2px 8px rgba(26, 26, 26, 0.06)",
        // Subtle: raised buttons/inputs
        subtle: "0 1px 4px rgba(26, 26, 26, 0.04)",
      },
    },
  },
  plugins: [],
};
