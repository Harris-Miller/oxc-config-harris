import { defineConfig } from 'oxlint';

import { jsxA11yRules } from './jsx-a11y.js';
import { reactPerfRules } from './react-perf.js';

const reactRules = defineConfig({
  extends: [jsxA11yRules, reactPerfRules],
  overrides: [
    {
      files: ['**/*.jsx', '**/*.tsx'],
      plugins: ['react'],
      settings: {
        react: {
          version: 'detect',
        },
      },
      rules: {
        // TODO: I don't think the migration worked correctly as what got left here were rules that were not react specific
        // I need to re-migrate from eslint-config-harris
      },
    },
  ],
});

export default reactRules;
