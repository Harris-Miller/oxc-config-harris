import { defineConfig } from 'oxlint';

import coreConfig from './core/core.js';

export default defineConfig({
  extends: [coreConfig],
  env: {
    node: true,
  },
  ignorePatterns: ['scripts/**'],
  overrides: [
    {
      files: ['**/*'],
      rules: {
        'sort-keys': 'off',
      },
    },
  ],
});
