/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true, // APIs like expect, describe, it are global
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/types/**', 'src/**/index.ts', 'coverage/**', '**/*.d.ts'],
    },
    exclude: ['**/node_modules/**', '**/dist/**', '**/coverage/**', '**/.test-results-*.json'],
    include: ['src/**/*.{test,spec}.ts', 'test/**/*.{test,spec}.ts'],
  },
});
