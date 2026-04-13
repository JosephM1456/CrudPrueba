/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef8f3',
          100: '#d9efe3',
          200: '#b9dec9',
          300: '#91cdae',
          400: '#63ba90',
          500: '#3aa574',
          600: '#2e8b62',
          700: '#267252',
          800: '#1f5b43',
          900: '#1b4937',
        },
        surface: {
          0: '#fffdf8',
          50: '#f8f4ea',
          100: '#f1e9da',
          200: '#e6dbc7',
          300: '#d7c7ab',
          400: '#c3ae8d',
          500: '#a88f6f',
          600: '#8a7358',
          700: '#6f5c47',
          800: '#584738',
          900: '#3f3329',
        },
      },
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
