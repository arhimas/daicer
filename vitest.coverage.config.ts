import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    root: path.resolve(__dirname), // Explicit root
    setupFiles: ['dotenv/config'], // Load env vars for integration tests
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@daicer/engine': path.resolve(__dirname, 'src/api/game/src/engine/index.ts'),
      '@daicer/shared': path.resolve(__dirname, 'src/shared/index.ts'),
      '@daicer/llm-core': path.resolve(__dirname, 'src/libs/llm-core/src/index.ts'),
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
