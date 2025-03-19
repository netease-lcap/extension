import { defineConfig, PluginOption } from 'vite';
import path from 'path';
import fs from 'fs';
import react from '@vitejs/plugin-react';
import { spawnSync } from 'child_process';

function copyDist() {
  const copyConfigPath = path.resolve('./.copy.json');
  if (!fs.existsSync(copyConfigPath)) {
    return;
  }

  const copyConfig = JSON.parse(fs.readFileSync(copyConfigPath, 'utf-8'));
  const { src, dist } = copyConfig;
  let watchCopy = false;
  return {
    configResolved(config) {
      watchCopy = !!config.build?.watch;
    },
    closeBundle() {
      if (!watchCopy) {
        return;
      }
      const command = [
        'cp', '-r',
        src,
        dist,
      ].join(' ');
      spawnSync(command, { shell: true, stdio: 'inherit' });
    },
  } as PluginOption;
}


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    copyDist(),
  ],
  base: './',
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      '@': path.resolve(import.meta.url, './src'),
    },
  },
});
