import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const forElectron = process.env.VITE_ELECTRON === 'true';

export default defineConfig({
  plugins: [react()],
  base: forElectron ? './' : '/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
      },
    },
  },
});
