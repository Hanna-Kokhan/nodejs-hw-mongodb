import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import pluginImport from 'eslint-plugin-import';

export default defineConfig([
  {
    files: ['src/**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    plugins: {
      js,
      import: pluginImport,
    },
    extends: [js.configs.recommended, pluginImport.configs.recommended],
    rules: {
      indent: ['error', 2],
      'linebreak-style': ['error', 'unix'],
      quotes: ['error', 'single'],
      semi: ['error', 'always'],
      'no-unused-vars': ['warn', { args: 'none' }],
      'import/no-unresolved': 'off',
      'import/extensions': 'off',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
    },
  },
]);
