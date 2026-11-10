/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        cream: "#FBF4E8",
        ink: "#2B1E16",
        muted: "#6B5647",
        tomato: { DEFAULT: "#C2391B", dark: "#9E2C12" },
        basil: "#2F6B3A",
        crust: "#E7B46A",
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
