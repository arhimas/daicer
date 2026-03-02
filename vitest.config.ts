import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  plugins: [
    {
      name: 'fix-lodash-fp',
      resolveId(source) {
        if (source === 'lodash/fp') {
          return { id: require.resolve('lodash/fp.js') };
        }
      },
    },
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@daicer/engine': path.resolve(__dirname, 'src/api/game/src/engine'),
      '@daicer/shared': path.resolve(__dirname, 'src/shared'),
      '@daicer/llm-core': path.resolve(__dirname, 'src/libs/llm-core/src'),
    },
  },
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 10000,
    hookTimeout: 10000,
    coverage: {
      reporter: ['text', 'json'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/[.]**',
        'packages/*/test?(s)/**',
        '**/*.d.ts',
        '**/virtual:*',
        '**/__x00__*',
        '**/\x00*',
        'cypress/**',
        'test?(s)/**',
        'test?(-*).?(c|m)js',
        '**/*{.,-}{test,spec}?(-d).?(c|m)js',
        '**/__tests__/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*',
        '**/vitest.{workspace,projects}.[jt]s?(on)',
        '**/.{eslint,mocha,prettier}rc.{?(c|m)js,yml}',
      ],
      thresholds: {
        global: {
          statements: 85,
          branches: 77,
          functions: 83,
          lines: 85,
        },
      },
    },
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/.test-results-*.json',
      '**/.idea/**',
      '**/.git/**',
      '**/.cache/**',
    ],
    server: {
      deps: {
        inline: [/@strapi\/.*/],
      },
    },
  },
});
