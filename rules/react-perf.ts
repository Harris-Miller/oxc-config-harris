import { defineConfig } from 'oxlint';

export const reactPerfRules = defineConfig({
  overrides: [
    {
      files: ['**/*.jsx', '**/*.tsx'],
      plugins: ['react-perf'],
      rules: {},
    },
  ],
});
