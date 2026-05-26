/** Per-scope defaults from oxlint Rust sources when docs are ambiguous or incomplete. */
export const MANUAL_DEFAULTS_BY_SCOPE = {
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
    'sort-keys': ['asc', { allowLineSeparatedGroups: false, caseSensitive: true, minKeys: 2, natural: false }],
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
        handlers: ['onClick', 'onError', 'onLoad', 'onMouseDown', 'onMouseUp', 'onKeyPress', 'onKeyDown', 'onKeyUp'],
        alert: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
        body: ['onError', 'onLoad'],
        dialog: ['onKeyUp', 'onKeyDown', 'onKeyPress'],
        iframe: ['onError', 'onLoad'],
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
    'jsx-boolean-value': ['never', { always: [], assumeUndefinedIsFalse: false, never: [] }],
    'jsx-fragments': ['syntax'],
    'no-did-mount-set-state': ['allowed'],
    'no-did-update-set-state': ['allowed'],
    'no-will-update-set-state': ['allowed'],
    'prefer-es6-class': ['always'],
    'state-in-constructor': ['always'],
  },
};

export const SCOPE_BY_RULES_FILE = {
  'eslint.jsonc': 'eslint',
  'import.jsonc': 'import',
  'jsdoc.jsonc': 'jsdoc',
  'jsx-a11y.jsonc': 'jsx_a11y',
  'node.jsonc': 'node',
  'oxc.jsonc': 'oxc',
  'promise.jsonc': 'promise',
  'react.jsonc': 'react',
  'unicorn.jsonc': 'unicorn',
};

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
  while ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
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

export function parseConfigFromMd(md, ruleName, scope) {
  const manualDefaults = MANUAL_DEFAULTS_BY_SCOPE[scope] ?? {};
  if (!md?.includes('## Configuration')) return undefined;
  if (manualDefaults[ruleName] !== undefined) return manualDefaults[ruleName];

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

export function omitNulls(value) {
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

function sortKeys(value) {
  if (Array.isArray(value)) return value.map(sortKeys);
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .map(k => [k, sortKeys(value[k])]),
    );
  }
  return value;
}

export function deepEqual(a, b) {
  return JSON.stringify(sortKeys(a)) === JSON.stringify(sortKeys(b));
}

function normalizeDefaultOptions(defaultOptions) {
  if (defaultOptions === undefined) return undefined;
  const normalized = omitNulls(defaultOptions);
  return Array.isArray(normalized) ? normalized : [normalized];
}

/** Drop rule options when they match documented oxlint defaults. */
export function pruneRuleValue(ruleValue, defaultOptions) {
  if (!Array.isArray(ruleValue) || ruleValue.length < 2) return ruleValue;

  const defaults = normalizeDefaultOptions(defaultOptions);
  if (defaults === undefined) return ruleValue;

  const actual = omitNulls(ruleValue.slice(1));
  if (deepEqual(actual, defaults)) return ruleValue[0];

  return ruleValue;
}

export function parseJsonc(text) {
  const stripped = text
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
    .replace(/,\s*([\]}])/g, '$1');
  return JSON.parse(stripped);
}

const mdCache = new Map();

export async function fetchRuleMd(scope, ruleName) {
  const key = `${scope}/${ruleName}`;
  if (mdCache.has(key)) return mdCache.get(key);
  const url = `https://oxc.rs/docs/guide/usage/linter/rules/${scope}/${ruleName}.md`;
  const res = await fetch(url);
  const md = res.ok ? await res.text() : '';
  mdCache.set(key, md);
  return md;
}

export async function getDefaultOptions(scope, ruleName) {
  const md = await fetchRuleMd(scope, ruleName);
  return parseConfigFromMd(md, ruleName, scope);
}
