import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.{js,mjs,cjs}'],
    plugins: { js },
    extends: ['js/recommended'],
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    rules: {
      // Enforce single quotes
      'quotes': ['error', 'single', { 
        avoidEscape: true,
        allowTemplateLiterals: false, 
      }],
      
      // Enforce 80 character line limit
      'max-len': ['error', {
        code: 100,
        tabWidth: 2,
        ignoreUrls: true,
        ignoreStrings: false,
        ignoreTemplateLiterals: false,
        ignoreRegExpLiterals: true,
        ignoreComments: false,
      }],
      
      // No single character variable names (with exceptions)
      'id-length': ['error', {
        min: 2,
        exceptions: ['i', 'j', 'k', 'x', 'y', 'z', '_'],
        properties: 'never',
      }],
      
      // Additional recommended rules
      'no-var': 'error',
      'prefer-const': 'error',
      'no-console': 'warn',
      'semi': ['error', 'always'],
      'comma-dangle': ['error', 'always-multiline'],
      'indent': ['error', 2],
      'no-unused-vars': ['error', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_', 
      }],
    },
  },
]);
