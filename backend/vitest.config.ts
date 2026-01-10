import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 10000,
    hookTimeout: 10000,
    alias: {
      '@': '/src',
      '@daicer/engine': '/src/engine/index.ts',
      '@daicer/shared': '/src/shared/index.ts',
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'json-summary', 'lcov'],
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
  },
});
