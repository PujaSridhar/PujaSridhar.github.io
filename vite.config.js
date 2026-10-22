import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { cogsworthLocal } from './cogsworth/vite-plugin.js';

export default defineConfig(({ mode }) => ({
  base: '/',
  // `npm run dev:local` (mode "cogsworth") answers /api/chat with the from-scratch
  // engine in cogsworth/ instead of the production Gemini backend.
  plugins: [react(), tailwindcss(), ...(mode === 'cogsworth' ? [cogsworthLocal()] : [])],
  server: {
    // Proxies /api calls to the production Vercel deployment during local dev.
    // In cogsworth mode the local plugin answers /api/chat before this proxy runs.
    proxy: {
      '/api': {
        target: 'https://puja-sridhar-github-io.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  test: {
    environment: 'node',
  },
}));
