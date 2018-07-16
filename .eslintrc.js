module.exports = {
  root: true,
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: 'module',
    ecmaFeatures: {
      experimentalObjectRestSpread: true
    }
  },
  plugins: [
    'ember'
  ],
  globals: {
    'chrome': true,
  },
  extends: [
    'eslint:recommended',
    'plugin:ember/recommended'
  ],
  env: {
    browser: true
  },
  rules: {
  },
  overrides: [{
    files: [
      'ember-cli-build.js',
      'testem.js',
      'blueprints/*/index.js',
      'config/**/*.js',
      'lib/*/index.js'
    ],
    parserOptions: {
      sourceType: 'script',
      ecmaVersion: 2015
    },
    env: {
      browser: false,
      node: true
    }
  }]
};
