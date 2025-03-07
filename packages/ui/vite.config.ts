import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/client',
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.url, './src'),
    },
  },
});
