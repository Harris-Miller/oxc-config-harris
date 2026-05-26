import { defineConfig } from 'oxlint';

import { importRules } from '../rules/import.js';
import { eslintRules } from '../rules/eslint.js';
import { oxcRules } from '../rules/oxc.js';
import { unicornRules } from '../rules/unicorn.js';

export const coreConfig = defineConfig({
  extends: [eslintRules, importRules, unicornRules, oxcRules],
  plugins: [],
  categories: {
    correctness: 'off',
  },
  env: {
    es2026: true,
  },
});
