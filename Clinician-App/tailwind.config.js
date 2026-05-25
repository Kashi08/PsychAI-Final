/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}','./components/**/*.{js,ts,jsx,tsx}','./app/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        teal:    { 50:'#E6FAF9', 100:'#9FE1CB', 400:'#1D9E75', 500:'#0DA99E', 600:'#0F6E56', 700:'#087A72' },
        primary: { 50:'#EBF2FF', 500:'#1A56DB', 600:'#1644B0' },
        psych:   {
          50: 'var(--psych-50)',
          100: 'var(--psych-100)',
          200: 'var(--psych-200)',
          300: 'var(--psych-300)',
          400: 'var(--psych-400)',
          500: 'var(--psych-500)',
          600: 'var(--psych-600)',
          700: 'var(--psych-700)'
        },
      },
      fontFamily: { display:['Nunito','sans-serif'], body:['DM Sans','sans-serif'] },
    },
  },
  plugins: [],
};
