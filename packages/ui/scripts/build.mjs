import { loadConfigFromFile, build, mergeConfig } from 'vite';

async function buildUIComponent() {
  const config = await loadConfigFromFile({ mode: 'production', command: 'build' });

  await build(
    mergeConfig(config, {
      build: {
        outDir: 'es',
        copyPublicDir: false,
        lib: {
          entry: './src/index',
          name: 'api-editor',
          fileName: () => 'api-editor.mjs',
          cssFileName: 'api-editor',
          formats: ['es'],
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'antd'],
          output: {
            // 在 UMD 构建模式下为这些外部化的依赖
            // 提供一个全局变量
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              antd: 'Antd',
            },
          },
        },
      },
    }),
  );
}

buildUIComponent();
