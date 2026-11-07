import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        foreground: "#f4f4f5",
        card: {
          DEFAULT: "#121215",
          foreground: "#f4f4f5",
        },
        popover: {
          DEFAULT: "#121215",
          foreground: "#f4f4f5",
        },
        primary: {
          DEFAULT: "#ec4899", // Vivid rose/pink accent
          foreground: "#ffffff",
          dark: "#be185d",
        },
        secondary: {
          DEFAULT: "#27272a",
          foreground: "#f4f4f5",
        },
        muted: {
          DEFAULT: "#1f1f23",
          foreground: "#a1a1aa",
        },
        accent: {
          DEFAULT: "#831843",
          foreground: "#fdf2f8",
        },
        destructive: {
          DEFAULT: "#ef4444",
          foreground: "#ffffff",
        },
        border: "#27272a",
        input: "#27272a",
        ring: "#ec4899",
      },
      borderRadius: {
        lg: "0.5rem",
        md: "calc(0.5rem - 2px)",
        sm: "calc(0.5rem - 4px)",
      },
    },
  },
  plugins: [],
};

export default config;

