import { defineConfig } from 'oxlint';

export const jsxA11yRules = defineConfig({
  overrides: [
    {
      files: ['**/*.jsx', '**/*.tsx'],
      plugins: ['jsx-a11y'],
      settings: {
        'jsx-a11y': {
          components: {
            Link: 'a',
          },
        },
      },
      rules: {},
    },
  ],
});
