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
        playfair: ["'Playfair Display'", "serif"],
        sen: ["'Sen'", "sans-serif"],
        ebGaramond: ["'EB Garamond'", "serif"],
      },
    },
  },
  plugins: [],
}

