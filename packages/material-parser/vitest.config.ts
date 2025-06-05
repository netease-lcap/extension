import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    testTimeout: 30000,
    environment: 'node',
		exclude: ['**/node_modules/**', '**/lib/**', '**/dist/**'],
  },
})
