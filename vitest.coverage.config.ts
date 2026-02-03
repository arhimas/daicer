import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 10000,
    hookTimeout: 10000,
    root: path.resolve(__dirname), // Explicit root
    setupFiles: ['dotenv/config'], // Load env vars for integration tests
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@daicer/engine': path.resolve(__dirname, 'src/api/game/src/engine'),
      '@daicer/shared': path.resolve(__dirname, 'src/shared'),
      '@daicer/llm-core': path.resolve(__dirname, 'src/libs/llm-core/src'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['json-summary', 'text'],
      reportsDirectory: './coverage', // Explicit directory
      include: [
        path.resolve(__dirname, 'src/api/**/*.ts'),
        path.resolve(__dirname, 'src/plugins/**/*.ts'),
        path.resolve(__dirname, 'src/shared/**/*.ts'),
      ],
      thresholds: {
        lines: 0,
        functions: 0,
        branches: 0,
        statements: 0,
      },
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/__tests__/**',
        'src/cli/**', // Exclude CLI (flaky headless tests)
        // Note: API integration tests are INCLUDED now that dotenv is loaded
      ],
    },
  },
});
