import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { parseConfigFromMd } from './lib/oxlint-rule-defaults.mjs';

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

const rules = JSON.parse(execSync('pnpm exec oxlint --rules -f json . 2>/dev/null', { encoding: 'utf8' }))
  .filter(r => r.scope === scope)
  .sort((a, b) => a.value.localeCompare(b.value));

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
  const options = parseConfigFromMd(md, rule.value, scope);
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
