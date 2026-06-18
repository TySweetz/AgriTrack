/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f7f9f5',
          100: '#ecf0e8',
          200: '#d4e0cc',
          300: '#9eba6a',
          400: '#7da54f',
          500: '#6b9541',
          600: '#5a8236',
          700: '#4a6a2c',
          800: '#3d5623',
          900: '#32461b',
        },
      },
    },
  },
  plugins: [],
}
