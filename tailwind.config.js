/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  // Hover styles only on devices that really hover (mouse/trackpad), like the original CSS
  future: { hoverOnlyWhenSupported: true },
  theme: {
    extend: {
      colors: {
        navy: '#1b2437',
        danger: '#a00000', // alert red
        card: '#eeeeed',
        live: '#2ecc40', // status dot
        gold: '#f5b800',
        err: '#b42318',
        ok: '#067647',
        muted: '#5b6479',
      },
      fontFamily: {
        sans: ['"Source Sans 3"', '"Segoe UI"', 'Arial', 'sans-serif'],
      },
      screens: {
        // original layout switches at 760px (desktop-first), so "mob:" = 761px and up
        mob: '761px',
      },
      keyframes: {
        pop: {
          from: { opacity: '0', transform: 'translateY(8px) scale(.98)' },
          to: { opacity: '1', transform: 'none' },
        },
      },
      animation: { pop: 'pop .18s ease-out' },
    },
  },
  plugins: [],
};
