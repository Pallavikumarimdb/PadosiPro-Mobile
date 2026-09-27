/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        ink: '#101E2C',
        muted: '#64748B',
        faint: '#94A3B8',
        line: '#E2E8F0',
        canvas: '#FAF9F6',
        card: '#FFFFFF',
        primary: '#0C5B40',
        primaryDark: '#084530',
        sage: '#9DBEAF',
        mint: '#EAF5EF',
        mintBorder: '#0C5B40',
        gold: '#C2912A',
        goldSoft: '#FEF6E0',
        danger: '#B91C1C',
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
};
