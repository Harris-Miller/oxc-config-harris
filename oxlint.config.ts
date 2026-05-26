import { defineConfig } from 'oxlint';

import coreConfig from './core/core.ts';

export default defineConfig({
  extends: [coreConfig],
  options: {
    typeAware: true,
  },
  env: {
    node: true,
  },
  overrides: [
    {
      files: ['**/*'],
      rules: {
        'sort-keys': 'off',
      },
    },
  ],
});
