/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        apoio: "#000000",
        principal: "#000000",
        secundaria: "#E5E7EB",
        complementar: "#FFFFFF",
        "info-bg": "#F3E8FF",
        "info-dark": "#6B21A8",
      },
      fontFamily: {
        docade: ["'Docade'", "sans-serif"],
        sen: ["'Sen'", "sans-serif"],
        arboria: ["'Arboria'", "sans-serif"],
      },
    },
  },
  plugins: [],
}
