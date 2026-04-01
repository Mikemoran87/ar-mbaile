/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        green: { deep: '#1F3A32' },
        sage: '#A9C1A9',
        cream: '#F7F3EB',
        gold: '#C9A86A',
        charcoal: '#3A3A3C',
        burgundy: '#6A1E2C',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
