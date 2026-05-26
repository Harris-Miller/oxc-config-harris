import { defineConfig } from 'oxlint';

const importConfig = defineConfig({
  plugins: ['import'],
  rules: {
    'import/no-empty-named-blocks': 'error',
    'import/no-mutable-exports': 'error',
    'import/no-amd': 'error',
    'import/unambiguous': 'error',
    'import/no-absolute-path': 'error',
    'import/no-dynamic-require': 'error',
    'import/no-self-import': 'error',
    'import/no-webpack-loader-syntax': 'error',
    'import/consistent-type-specifier-style': ['error', 'prefer-top-level'],
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/no-anonymous-default-export': 'error',
    'import/no-duplicates': 'error',
    'import/no-named-default': 'error',
  },
});

export default importConfig;
