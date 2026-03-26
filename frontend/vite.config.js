import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        // In Docker: traffic goes through nginx gateway
        // For local dev outside Docker: hits localhost:80
        target: 'http://localhost:80',
        changeOrigin: true,
      },
    },
  },
});
