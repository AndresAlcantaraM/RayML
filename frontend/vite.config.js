import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://52.91.212.251:8001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
