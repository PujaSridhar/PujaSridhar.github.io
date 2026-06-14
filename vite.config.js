import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    // Proxies /api calls to the production Vercel deployment during local dev,
    // since the chat API has no local equivalent. Requests hit the live backend.
    proxy: {
      '/api': {
        target: 'https://puja-sridhar-github-io.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
