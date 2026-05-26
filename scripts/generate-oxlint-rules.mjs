import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const scope = process.argv[2];
const outputArg = process.argv[3];

if (!scope) {
  console.error('Usage: node scripts/generate-oxlint-rules.mjs <scope> [output.jsonc]');
  process.exit(1);
}

const PLUGIN_BY_SCOPE = {
  jsx_a11y: 'jsx-a11y',
  react_perf: 'react-perf',
};

const outputPath =
  outputArg != null
    ? outputArg.startsWith('/')
      ? outputArg
      : new URL(outputArg, new URL('../', import.meta.url))
    : new URL(`../rules/${PLUGIN_BY_SCOPE[scope] ?? scope}.jsonc`, import.meta.url);

const pluginName = PLUGIN_BY_SCOPE[scope] ?? scope;

const rules = JSON.parse(
  execSync('pnpm exec oxlint --rules -f json . 2>/dev/null', { encoding: 'utf8' }),
)
  .filter((r) => r.scope === scope)
  .sort((a, b) => a.value.localeCompare(b.value));

/** Per-scope defaults from oxlint Rust sources when docs are ambiguous or incomplete. */
const MANUAL_DEFAULTS_BY_SCOPE = {
  eslint: {
    'arrow-body-style': ['as-needed', { requireReturnForObjectLiteral: false }],
    curly: ['all'],
    'capitalized-comments': [
      'always',
      {
        ignoreConsecutiveComments: false,
        ignoreInlineComments: false,
        line: { ignoreConsecutiveComments: false, ignoreInlineComments: false },
        block: { ignoreConsecutiveComments: false, ignoreInlineComments: false },
      },
    ],
    'default-case': [{ commentPattern: 'no default' }],
    eqeqeq: ['always', { null: 'always' }],
    'func-name-matching': ['always'],
    'func-names': ['always'],
    'func-style': ['expression'],
    'logical-assignment-operators': ['always'],
    'no-cond-assign': ['except-parens'],
    'no-empty-function': [{ allow: [] }],
    'no-inline-comments': [{ ignorePattern: '' }],
    'no-inner-declarations': ['functions', { blockScopedFunctions: 'allow' }],
    'no-restricted-exports': {
      restrictedNamedExports: [],
      restrictDefaultExports: {
        defaultFrom: false,
        direct: false,
        named: false,
        namedFrom: false,
        namespaceFrom: false,
      },
    },
    'no-restricted-properties': [],
    'no-return-assign': ['except-parens'],
    'object-shorthand': ['always'],
    'operator-assignment': ['always'],
    radix: ['always'],
    'sort-keys': [
      'asc',
      { allowLineSeparatedGroups: false, caseSensitive: true, minKeys: 2, natural: false },
    ],
    'unicode-bom': ['never'],
    yoda: ['never', { exceptRange: false, onlyEquality: false }],
  },
  import: {
    'consistent-type-specifier-style': ['prefer-top-level'],
    first: ['absolute-first'],
    'no-nodejs-modules': [{ allow: [] }],
  },
  node: {
    'handle-callback-err': ['err'],
  },
  unicorn: {
    'prefer-ternary': ['always'],
    'relative-url-style': ['never'],
    'switch-case-braces': ['always'],
  },
  jsx_a11y: {
    'no-distracting-elements': [{ elements: ['marquee', 'blink'] }],
    'no-interactive-element-to-noninteractive-role': [{}],
    'no-noninteractive-element-interactions': [
      {
        handlers: [
          'onClick',
          'onError',
          'onLoad',
          'onMouseDown',
          'onMouseUp',
          'onKeyPress',
          'onKeyDown',
          'onKeyUp',
        ],
        alert: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
        body: ['onError', 'onLoad'],
        dialog: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
        iframe: ['onError', 'onLoad'],
        img: ['onError', 'onLoad'],
      },
    ],
    'no-noninteractive-element-to-interactive-role': [
      {
        ul: ['menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
        ol: ['menu', 'menubar', 'radiogroup', 'tablist', 'tree', 'treegrid'],
        li: ['menuitem', 'menuitemcheckbox', 'menuitemradio', 'row', 'tab', 'treeitem'],
        fieldset: ['radiogroup', 'presentation'],
      },
    ],
  },
  react: {
    'forbid-component-props': [{ forbid: ['className', 'style'] }],
    'forbid-dom-props': [{ forbid: [] }],
    'forbid-elements': [{ forbid: [] }],
    'jsx-boolean-value': [
      'never',
      { always: [], assumeUndefinedIsFalse: false, never: [] },
    ],
    'jsx-fragments': ['syntax'],
    'no-did-mount-set-state': ['allowed'],
    'no-did-update-set-state': ['allowed'],
    'no-will-update-set-state': ['allowed'],
    'prefer-es6-class': ['always'],
    'state-in-constructor': ['always'],
  },
};

const MANUAL_DEFAULTS = MANUAL_DEFAULTS_BY_SCOPE[scope] ?? {};

function coerceDefault(raw) {
  if (raw == null) return undefined;
  let v = String(raw).trim();
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null') return null;
  if (v === 'Infinity') return null;
  if (/^-?\d+$/.test(v)) return Number(v);
  if (v === '[]') return [];
  if (v.startsWith('[') || v.startsWith('{')) {
    try {
      return JSON.parse(v);
    } catch {
      /* fall through */
    }
  }
  while (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  return v;
}

function setNested(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!(key in cur)) cur[key] = {};
    cur = cur[key];
  }
  cur[parts.at(-1)] = value;
}

function parseObjectDefaults(section) {
  const obj = {};
  const blocks = section.split(/^### /m).slice(1);
  for (const block of blocks) {
    const title = block.split('\n')[0].trim();
    if (/^The \d/.test(title)) continue;

    const defMatch =
      block.match(/\*\*default:\*\*\s*`([^`]*)`/i) ??
      block.match(/\*\*default:\*\*\s*(true|false)/i) ??
      block.match(/^default:\s*`([^`]*)`/im) ??
      block.match(/^default:\s*(true|false|\d+)/im) ??
      block.match(/Default value:\s*`([^`]*)`/i) ??
      block.match(/^Default:\s*`([^`]*)`/im) ??
      block.match(/Defaults to an empty array/i);

    if (!defMatch) continue;

    if (defMatch[0] === 'Defaults to an empty array') {
      const value = [];
      if (title.includes('.')) setNested(obj, title, value);
      else obj[title] = value;
      continue;
    }

    const value = coerceDefault(defMatch[1]);
    if (value === null && title.includes('.')) continue;

    if (title.includes('.')) {
      setNested(obj, title, value);
    } else if (value !== null) {
      obj[title] = value;
    }
  }
  return obj;
}

function parseConfigFromMd(md, ruleName) {
  if (!md?.includes('## Configuration')) return undefined;
  if (MANUAL_DEFAULTS[ruleName] !== undefined) return MANUAL_DEFAULTS[ruleName];

  const section = md.split('## Configuration')[1]?.split(/\n## /)[0] ?? '';

  const obj = parseObjectDefaults(section);
  if (Object.keys(obj).length > 0) return [obj];

  const defaultEnum =
    section.match(/#### `?"([^`"]+)"`[^\n]*\(default\)/i) ??
    section.match(/#### `?"([^`"]+)"`[\s\S]{0,200}?This is the default/i) ??
    section.match(/- `\[?"([^`"]+)"\]?`[^\n]*\(default\)/i) ??
    section.match(/defaults to `?"([^`"]+)"`?/i);
  if (defaultEnum) return [defaultEnum[1]];

  const defaultWord = section.match(/default `([^`]+)` option/i);
  if (defaultWord) return [defaultWord[1]];

  const firstOptDefault = section.match(
    /### The 1st option[\s\S]*?#### `?"([^`"]+)"`[\s\S]{0,120}?(?:\(default\)|This is the default)/i,
  );
  if (firstOptDefault) {
    const opts = [firstOptDefault[1]];
    const secondSection = section.split('### The 2nd option')[1];
    if (secondSection) {
      const secondObj = parseObjectDefaults(secondSection);
      if (Object.keys(secondObj).length) opts.push(secondObj);
    }
    return opts;
  }

  if (/accepts an array/i.test(section)) return [];

  return undefined;
}

function omitNulls(value) {
  if (Array.isArray(value)) return value.map(omitNulls);
  if (value && typeof value === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === null) continue;
      out[k] = omitNulls(v);
    }
    return out;
  }
  return value;
}

function isEmptyObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).length === 0;
}

function buildRuleValue(severity, options) {
  if (options === undefined) return severity;
  const normalized = omitNulls(options);
  if (Array.isArray(normalized)) {
    if (normalized.length === 0) return [severity];
    const tail = normalized.at(-1);
    if (normalized.length === 1 && isEmptyObject(tail)) return [severity];
    return [severity, ...normalized];
  }
  if (isEmptyObject(normalized)) return severity;
  return [severity, normalized];
}

const configRules = {};
const missing = [];

for (const rule of rules) {
  const severity = rule.default ? 'error' : 'off';
  const url = `https://oxc.rs/docs/guide/usage/linter/rules/${scope}/${rule.value}.md`;
  const res = await fetch(url);
  const md = res.ok ? await res.text() : '';
  const options = parseConfigFromMd(md, rule.value);
  if (md.includes('## Configuration') && options === undefined) {
    missing.push(rule.value);
  }
  configRules[rule.value] = buildRuleValue(severity, options);
}

const config = {
  $schema: './node_modules/oxlint/configuration_schema.json',
  rules: configRules,
};

if (scope !== 'eslint') {
  config.plugins = [pluginName];
}

writeFileSync(outputPath, `${JSON.stringify(config, null, 2)}\n`);

console.log(`Wrote ${rules.length} ${scope} rules to ${outputPath}`);
if (missing.length) console.log('No config extracted (severity only):', missing);
