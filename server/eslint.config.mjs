// @ts-check

import eslint from '@eslint/js';
import * as importPlugin from 'eslint-plugin-import';
import prettier from 'eslint-plugin-prettier';
import tseslint from 'typescript-eslint';

export default tseslint.config(eslint.configs.recommended, tseslint.configs.recommended, {
  plugins: {
    prettier,
    import: importPlugin,
  },
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { args: 'all', argsIgnorePattern: '^_' }],
    'import/no-cycle': 'error',
    'import/no-duplicates': 'error',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        'newlines-between': 'always',
        alphabetize: { order: 'asc', caseInsensitive: true },
      },
    ],
    'comma-dangle': ['error', 'ignore'], // Allow trailing commas but don't require them
    'max-len': ['error', { code: 120 }],
    'prettier/prettier': [
      'error',
      {
        endOfLine: 'auto',
        printWidth: 120,
        singleQuote: true,
        trailingComma: 'es5',
        bracketSpacing: true,
        arrowParens: 'avoid',
      },
    ],

    // disable standard no-unused-vars, enable typescript-eslint one
    'no-unused-vars': 'off',
  },
  settings: {
    // 'import/resolver': {
    //   typescript: {
    //     alwaysTryTypes: true
    //   }
    // }
  },
});

/*

module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
    ecmaVersion: 2018,
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
    "eslint-plugin-prettier"
  ],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended",
    "eslint-config-prettier"
  ],
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      'max-len': ['error', {'code': 120}],
      'prettier/prettier': ['error', {
          'endOfLine': 'auto',
          'printWidth': 120,
          'singleQuote': true,
          'trailingComma': 'es5',
          'bracketSpacing': true,
          'arrowParens': 'avoid',
          'trailingComma': 'all',
        
      }],
      // disable standard no-unused-vars, enable typescript-eslint one
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", {"args": "all", "argsIgnorePattern": "^_"}],
  },
  overrides: [
    {
      files: ["*.spec.ts", "*.test.ts"],
      rules: {
        'max-len': 'off' // disables line length check
      }
    }
  ]
};
*/
