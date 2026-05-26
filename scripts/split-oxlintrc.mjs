import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { toTsObject } from './toTsObject.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const full = JSON.parse(fs.readFileSync(path.join(root, '.oxlintrc.json'), 'utf8'));

const importRuleKeys = new Set(Object.keys(full.rules).filter(k => k.startsWith('import/')));

const topRules = { ...full.rules };
delete topRules['prettier/prettier'];
delete topRules['sort-keys-fix/sort-keys-fix'];
topRules['sort-keys'] = 'error';
delete topRules['typescript/consistent-return'];
delete topRules['typescript/dot-notation'];

const personalRules = {};
const importRules = {};
for (const [key, value] of Object.entries(topRules)) {
  if (importRuleKeys.has(key)) {
    importRules[key] = value;
  } else {
    personalRules[key] = value;
  }
}

const recommendedOverride = full.overrides.find(o => o.files?.includes('**/*.js'));
const typescriptOverride = full.overrides.find(o => o.files?.includes('**/*.ts') && !o.files?.includes('**/*.jsx'));
const reactOverride = full.overrides.find(o => o.files?.includes('**/*.jsx'));
const jestOverride = full.overrides.find(o => o.files?.includes('**/*.test.*'));

const writeJs = (rel, content) => {
  const file = path.join(root, rel);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, content);
};

writeJs(
  'core/personal.js',
  `import { defineConfig } from 'oxlint';

const personalRules = ${toTsObject(personalRules)};

const personalConfig = defineConfig({
  rules: personalRules,
});

export default personalConfig;
`,
);

writeJs(
  'core/recommended.js',
  `import { defineConfig } from 'oxlint';

const recommendedRules = ${toTsObject(recommendedOverride.rules)};

const recommendedConfig = defineConfig({
  rules: recommendedRules,
  env: {
    es2026: true,
  },
});

export default recommendedConfig;
`,
);

writeJs(
  'core/import.js',
  `import { defineConfig } from 'oxlint';

const importRules = ${toTsObject(importRules)};

const importConfig = defineConfig({
  plugins: ['import'],
  jsPlugins: [{ name: 'import-js', specifier: 'eslint-plugin-import' }],
  rules: {
    ...importRules,
    'import-js/no-unused-modules': 'error',
  },
});

export default importConfig;
`,
);

writeJs(
  'jest/jest.js',
  `import { defineConfig } from 'oxlint';

const jestRules = ${toTsObject(jestOverride.rules)};

const jestConfig = defineConfig({
  overrides: [
    {
      files: ['**/*.test.*', '**/*spec.*'],
      plugins: ['jest'],
      env: {
        jest: true,
      },
      rules: jestRules,
    },
  ],
});

export default jestConfig;
`,
);

// react-hooks rules are maintained separately (not in migrate output)
const reactHooksPath = path.join(root, 'react/react-hooks.rules.json');
let reactHooksRules = {};
if (fs.existsSync(reactHooksPath)) {
  reactHooksRules = JSON.parse(fs.readFileSync(reactHooksPath, 'utf8'));
} else {
  reactHooksRules = {
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
}

writeJs(
  'react/react.js',
  `import { defineConfig } from 'oxlint';

const reactRules = ${toTsObject(reactOverride.rules)};

const reactHooksRules = ${toTsObject(reactHooksRules)};

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
`,
);

writeJs(
  'typescript/typescript.js',
  `import { defineConfig } from 'oxlint';

const typescriptRules = ${toTsObject(typescriptOverride.rules)};

/**
 * Type-aware rules require \`oxlint-tsgolint\` and \`options.typeAware: true\` on the
 * consumer's root \`oxlint.config.js\` (not on this export alone).
 */
const typescriptConfig = defineConfig({
  overrides: [
    {
      files: ['**/*.ts', '**/*.mts', '**/*.tsx'],
      plugins: ['typescript'],
      jsPlugins: ['eslint-plugin-typescript-sort-keys'],
      rules: {
        ...typescriptRules,
        'consistent-return': 'off',
        'typescript/consistent-return': 'error',
        'default-param-last': 'off',
        'typescript/default-param-last': 'error',
        'no-loop-func': 'off',
        'typescript/no-loop-func': 'error',
        'no-invalid-this': 'off',
        'typescript/no-invalid-this': 'error',
        'no-shadow': 'off',
        'typescript/no-shadow': 'error',
        'no-unused-expressions': 'off',
        'typescript/no-unused-expressions': 'error',
        'no-use-before-define': 'off',
        'typescript/no-use-before-define': 'error',
        'no-dupe-class-members': 'off',
        'typescript/no-dupe-class-members': 'error',
        'dot-notation': 'off',
        'typescript/dot-notation': 'error',
      },
    },
  ],
});

export default typescriptConfig;
`,
);

console.log('Wrote rule config .js files');
