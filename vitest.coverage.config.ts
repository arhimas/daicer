
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@daicer/engine': path.resolve(__dirname, 'src/api/game/src/engine/index.ts'),
      '@daicer/shared': path.resolve(__dirname, 'src/shared/index.ts'),
      '@daicer/llm-core': path.resolve(__dirname, 'src/libs/llm-core/src/index.ts'),
    },
    coverage: {
      provider: 'v8',
      reporter: ['json-summary', 'text'],
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      exclude: [
        '**/__tests__/**',
        '**/*.test.ts',
        '**/*.d.ts',
        'src/scripts/**',
      ],
      all: false,
    }
  },
});
