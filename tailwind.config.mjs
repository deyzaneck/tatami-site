/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tatami: {
          bg: '#0e0e0f', surface: '#171615', card: '#1f1e1c', border: '#2a2826',
          text: '#ece7de', secondary: '#b3aea5', muted: '#9b968d',
          red: '#ba433b', redHover: '#a63832',
        },
      },
      fontFamily: {
        sans: ['Golos Text', 'system-ui', 'sans-serif'],
        display: ['Unbounded', 'Golos Text', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
