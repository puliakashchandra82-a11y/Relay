/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          950: "#0b0f1f",
          900: "#0f1428",
          800: "#161c36",
          700: "#1e2645",
          600: "#2a3358",
        },
        accent: {
          500: "#6366f1",
          400: "#818cf8",
          600: "#4f46e5",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 8px 30px rgba(99,102,241,0.25)",
      },
    },
  },
  plugins: [],
}

