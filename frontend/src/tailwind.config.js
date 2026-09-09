/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'icspp-blue': '#123AAE',
        'icspp-yellow': '#F9D416',
        'icspp-dark': '#08122a',
        'icspp-bg': '#f4f7fb',
      },
    },
  },
  plugins: [],
}