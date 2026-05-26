import { defineConfig } from 'oxlint';

const reactRules = {
  'constructor-super': 'error',
  'for-direction': 'error',
  'getter-return': 'error',
  'no-async-promise-executor': 'error',
  'no-case-declarations': 'error',
  'no-class-assign': 'error',
  'no-compare-neg-zero': 'error',
  'no-cond-assign': 'error',
  'no-const-assign': 'error',
  'no-control-regex': 'error',
  'no-debugger': 'error',
  'no-delete-var': 'error',
  'no-dupe-class-members': 'error',
  'no-dupe-else-if': 'error',
  'no-dupe-keys': 'error',
  'no-duplicate-case': 'error',
  'no-empty': 'error',
  'no-empty-character-class': 'error',
  'no-empty-pattern': 'error',
  'no-ex-assign': 'error',
  'no-extra-boolean-cast': 'error',
  'no-fallthrough': 'error',
  'no-func-assign': 'error',
  'no-global-assign': 'error',
  'no-import-assign': 'error',
  'no-invalid-regexp': 'error',
  'no-irregular-whitespace': 'error',
  'no-loss-of-precision': 'error',
  'no-misleading-character-class': 'error',
  'no-nonoctal-decimal-escape': 'error',
  'no-obj-calls': 'error',
  'no-prototype-builtins': 'error',
  'no-regex-spaces': 'error',
  'no-self-assign': 'error',
  'no-setter-return': 'error',
  'no-shadow-restricted-names': 'error',
  'no-sparse-arrays': 'error',
  'no-this-before-super': 'error',
  'no-unreachable': 'error',
  'no-unsafe-finally': 'error',
  'no-unsafe-negation': 'error',
  'no-unsafe-optional-chaining': 'error',
  'no-unused-vars': 'error',
  'no-useless-backreference': 'error',
  'no-useless-catch': 'error',
  'no-useless-escape': 'error',
  'no-with': 'error',
  'require-yield': 'error',
  'use-isnan': 'error',
  'valid-typeof': 'error',
};

const reactHooksRules = {
  'react-hooks-js/component-hook-factories': 'error',
  'react-hooks-js/config': 'error',
  'react-hooks-js/error-boundaries': 'error',
  'react-hooks-js/gating': 'error',
  'react-hooks-js/globals': 'error',
  'react-hooks-js/immutability': 'error',
  'react-hooks-js/incompatible-library': 'error',
  'react-hooks-js/preserve-manual-memoization': 'error',
  'react-hooks-js/purity': 'error',
  'react-hooks-js/refs': 'error',
  'react-hooks-js/set-state-in-effect': 'error',
  'react-hooks-js/set-state-in-render': 'error',
  'react-hooks-js/static-components': 'error',
  'react-hooks-js/unsupported-syntax': 'error',
  'react-hooks-js/use-memo': 'error',
};

const reactConfig = defineConfig({
  overrides: [
    {
      files: ['**/*.jsx', '**/*.tsx'],
      plugins: ['react', 'jsx-a11y'],
      jsPlugins: [
        {
          name: 'react-hooks-js',
          specifier: 'eslint-plugin-react-hooks',
        },
      ],
      settings: {
        react: {
          version: 'detect',
        },
        'jsx-a11y': {
          components: {
            Link: 'a',
          },
        },
      },
      rules: {
        ...reactRules,
        ...reactHooksRules,
      },
    },
  ],
});

export default reactConfig;
