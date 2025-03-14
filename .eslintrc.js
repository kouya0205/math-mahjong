module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
  },
  parser: "@typescript-eslint/parser",
  // plugins: ['@typescript-eslint'],
  // , 'simple-import-sort', 'unused-imports'
  extends: [
    // 'eslint:recommended',
    // 'plugin:react/recommended',
    "plugin:prettier/recommended",
    //     'next',
    //     'next/core-web-vitals'
  ],
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2017,
    sourceType: "module",
  },
  rules: {
    // 'prettier/prettier': 'error',
    // '@next/next/no-img-element': 0,
    // 'no-unused-vars': 'off',
    // '@typescript-eslint/no-unused-vars': ['error'],
    // 'react/no-unknown-property': ['error', { ignore: ['css'] }],
    // 'simple-import-sort/imports': 'error',
    // 'simple-import-sort/exports': 'error',
    // 'import/first': 'error',
    // 'import/newline-after-import': 'error',
    // 'import/no-duplicates': 'error',
    // 'unused-imports/no-unused-imports': 'error'
  },
};
