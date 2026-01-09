import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ['dist/**', 'build/**', '.strapi/**', 'public/**', 'config/**', 'types/generated/**', 'script/**'],
  },
  {
    // TypeScript files
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/ban-ts-comment': 'warn',
      'no-console': 'off',
      'prefer-const': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-require-imports': 'warn',
      'no-empty': 'warn',
      'no-useless-catch': 'warn',
    },
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
    },
  },
  {
    // JavaScript files - allow require/commonjs
    files: ['**/*.js'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      'no-undef': 'off', // heavily relaxed for loose JS scripts
      '@typescript-eslint/no-var-requires': 'off',
    },
    languageOptions: {
      sourceType: 'commonjs',
    },
  },
  {
    // CLI files - allow console
    files: ['src/cli/**', 'src/scripts/**', '**/__tests__/**', '**/*.test.ts', '**/*.spec.ts'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  }
);
