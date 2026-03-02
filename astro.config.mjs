import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import path from 'node:path';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react()],
  server: {
    host: true, // Enable access from local network
    port: 4321,
    watch: {
      ignored: ['**/server/**'],
    },
  },
  vite: {
    resolve: {
      alias: {
        '@': path.resolve('./src')
      },
    },
  },
  output: 'server', // Enable SSR for authentication
  devToolbar: {
    enabled: false,
  },
});