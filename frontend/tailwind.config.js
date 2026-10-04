/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        brand: ['"DM Serif Display"', 'serif'],
        serif: ['"DM Serif Display"', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        forest: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#0f5132',
          950: '#064e3b',
        },
        brand: {
          50: '#f2f9f4',
          100: '#dfefcf',
          200: '#bfdfa2',
          300: '#9acf72',
          400: '#75bb44',
          500: '#54a029',
          600: '#3e801e',
          700: '#31631b',
          800: '#294f1b',
          900: '#23431a',
          950: '#0e240b',
        }
      }
    },
  },
  plugins: [],
}
