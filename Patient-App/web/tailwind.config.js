/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          50:  'var(--theme-50, #E6FAF9)',
          100: 'var(--theme-100, #9FE1CB)',
          400: 'var(--theme-400, #1D9E75)',
          500: 'var(--theme-500, #0DA99E)',
          600: 'var(--theme-600, #0F6E56)',
          700: 'var(--theme-700, #087A72)',
          900: 'var(--theme-900, #04342C)',
        },
        primary: {
          50:  '#EBF2FF',
          500: '#1A56DB',
          600: '#1644B0',
        },
      },
      fontFamily: {
        display: ['Nunito', 'sans-serif'],
        body:    ['DM Sans', 'sans-serif'],
      },
      borderRadius: {
        xl:  '16px',
        '2xl': '20px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
