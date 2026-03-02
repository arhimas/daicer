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
      reporter: ['json', 'text'],
      reportsDirectory: './coverage', // Explicit directory
      include: [
        'src/api/**/*.{ts,js}',
        'src/plugins/**/server/src/**/*.{ts,js}',
        'src/shared/**/*.{ts,js}',
        'src/features/**/*.{ts,js}',
      ],
      thresholds: {
        global: {
          statements: 85,
          branches: 77,
          functions: 83,
          lines: 85,
        },
      },
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.d.ts',
        '**/*.test.ts',
        '**/__tests__/**',
        'src/**/scripts/**', // Exclude scripts
        'src/plugins/**/admin/**', // Exclude Admin UI
        'src/admin/**', // Exclude root Admin UI
        '**/*/routes/**', // Exclude Strapi Routes (Config)
        '**/*/policies/**', // Exclude Strapi Policies (Config)
        '**/*/middlewares/**', // Exclude Strapi Middlewares (Config)
        '**/*/content-types/**', // Exclude Strapi Schemas (JSON/Config)
        'src/api/**/index.ts', // Exclude API entry points (barrel/register)
        'src/plugins/**/server/index.ts', // Exclude Plugin entry points (register/bootstrap)
      ],
    },
  },
});
