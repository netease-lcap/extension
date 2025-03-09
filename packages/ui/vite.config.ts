import { defineConfig, PluginOption } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import { spawnSync } from 'child_process';

function copyDist() {
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
        '/Users/liuyuyang/Documents/projects/codewave/extension/packages/ui/dist/*',
        '/Users/liuyuyang/Documents/test_element_plus/play',
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
