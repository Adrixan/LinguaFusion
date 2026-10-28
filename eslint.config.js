import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

const files = ['**/*.{ts,tsx}'];

export default [
  { ignores: ['dist/', '.scratch/', 'test-results/', 'playwright-report/', 'public/sw.js'] },
  { files, ...js.configs.recommended },
  ...tseslint.configs['flat/recommended'].map(config => ({ files, ...config })),
  {
    files,
    plugins: { 'react-hooks': reactHooks },
    // The rule set of the former `plugin:react-hooks/recommended` (v4); the React Compiler rules
    // added to the v7 preset are not enabled yet (see .agents/session-handoff.md, 2026-10-28).
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
  {
    files,
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    plugins: { 'react-refresh': reactRefresh },
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
];
