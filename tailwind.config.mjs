/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        tatami: {
          bg: '#121212', surface: '#1b1b1b', card: '#1b1b1b', border: '#292826',
          text: '#e8e3d9', secondary: '#a9a69e', muted: '#98958e',
          red: '#ba433b', redHover: '#a63832',
        },
      },
      fontFamily: {
        sans: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
        display: ['IBM Plex Sans', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
