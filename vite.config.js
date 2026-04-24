import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://puja-sridhar-github-io.vercel.app',
        changeOrigin: true,
        secure: true,
      },
    },
  },
});
