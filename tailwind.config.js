/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          50: "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          300: "#a5b4fc",
          400: "#818cf8",
          500: "#6574ff",
          600: "#4e53f8",
          700: "#402fdf",
          800: "#2d23b5",
          900: "#1f1a85",
          950: "#0e0b45",
        },
      },
      boxShadow: {
        glass:
          "0 4px 30px rgba(31, 24, 68, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.08)",
      },
      backgroundImage: {
        "glass-panel":
          "linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(59, 130, 246, 0.25))",
        "brand-gradient":
          "linear-gradient(135deg, rgba(99, 102, 241, 0.95), rgba(59, 130, 246, 0.9))",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: 0, transform: "translateY(16px) scale(0.97)" },
          "100%": { opacity: 1, transform: "translateY(0) scale(1)" },
        },
        "fade-in": {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease-out forwards",
        "fade-in-delayed": "fade-in 0.5s ease-out forwards",
      },
    },
  },
  plugins: [],
};
