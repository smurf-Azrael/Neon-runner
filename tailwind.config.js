/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        neonBlue: "#11FFEE",
        neonPink: "#FF10F0",
        primary: "#111111",
        lightGray: "#424242"
      },
      fontFamily: {
        sans: ["Orbitron", "sans-serif"]
      }
    },
  },
  plugins: [],
}

