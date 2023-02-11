module.exports = {
    parser: '@typescript-eslint/parser',
    parserOptions: {
        project: 'tsconfig.json',
        sourceType: 'module',
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
    root: true,
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
        'max-len': ['error', {'code': 140}],
        'prettier/prettier': ['error', {
            'endOfLine': 'auto',
            'printWidth': 140
        }],
        // disable standard no-unused-vars, enable typescript-eslint one
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars": ["warn", {"args": "all", "argsIgnorePattern": "^_"}],
    },
};
