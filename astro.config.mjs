import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://deyzaneck.github.io',
  base: '/tatami-site',
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  image: {
    service: {
      entrypoint: 'astro/assets/services/sharp',
    },
  },
});
