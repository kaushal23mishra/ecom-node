module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  parserOptions: {
    ecmaVersion: 2021,
    sourceType: 'module',
  },
  rules: {
    /* --- Logic rules (ESLint owns these) --- */
    'no-irregular-whitespace': [
      'error',
      {
        skipStrings: true,
        skipComments: true,
        skipRegExps: true,
        skipTemplates: true,
      },
    ],
    'multiline-comment-style': ['error', 'starred-block'],
    'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0 }],
    'no-param-reassign': 'off',
    'no-underscore-dangle': 'off',
    'class-methods-use-this': 'off',
    'max-len': [2, { code: 1000, ignorePattern: '^import .*' }],
    'linebreak-style': ['error', process.platform === 'win32' ? 'windows' : 'unix'],
    'space-infix-ops': ['error', { int32Hint: false }],
    'keyword-spacing': ['error', { before: true, after: true }],

    /* --- Formatting rules (Prettier owns these — all OFF) --- */
    semi: 'off',
    indent: 'off',
    quotes: 'off',
    'space-before-function-paren': 'off',
    'object-curly-spacing': 'off',
    'object-curly-newline': 'off',
    'object-property-newline': 'off',
  },
};
