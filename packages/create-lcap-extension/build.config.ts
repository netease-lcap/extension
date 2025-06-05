import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['src/index'],
  clean: true,
  externals: ['package-json', 'semver'],
  rollup: {
    inlineDependencies: true,
    esbuild: {
      target: 'node18',
      minify: false,
    },
  },
  alias: {
    // we can always use non-transpiled code since we support node 18+
    prompts: 'prompts/lib/index.js',
  },
  hooks: {
    'rollup:options'(_ctx, options) {
      options.plugins = [
        options.plugins,
      ]
    },
  },
})
