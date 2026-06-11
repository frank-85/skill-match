/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          deep: "#0A1F44",
          medium: "#1E3A8A",
        },
        gold: {
          DEFAULT: "#C9A961",
          soft: "#F5E6C8",
        },
        bg: "#FAFAF7",
        ink: "#1A1A1A",
        warn: "#F97316",
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
