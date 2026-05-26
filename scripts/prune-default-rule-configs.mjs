import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { SCOPE_BY_RULES_FILE, getDefaultOptions, parseJsonc, pruneRuleValue } from './lib/oxlint-rule-defaults.mjs';

const rulesDir = fileURLToPath(new URL('../rules/', import.meta.url));

const files = readdirSync(rulesDir).filter(name => name.endsWith('.jsonc'));

let prunedTotal = 0;
const prunedByFile = {};

for (const file of files) {
  const scope = SCOPE_BY_RULES_FILE[file];
  if (!scope) {
    console.warn(`Skipping ${file}: no scope mapping`);
    continue;
  }

  const path = join(rulesDir, file);
  const config = parseJsonc(readFileSync(path, 'utf8'));
  const prunedRules = [];

  for (const [ruleName, ruleValue] of Object.entries(config.rules ?? {})) {
    if (!Array.isArray(ruleValue) || ruleValue.length < 2) continue;

    const defaults = await getDefaultOptions(scope, ruleName);
    const pruned = pruneRuleValue(ruleValue, defaults);
    if (pruned !== ruleValue) {
      config.rules[ruleName] = pruned;
      prunedRules.push(ruleName);
    }
  }

  if (prunedRules.length > 0) {
    writeFileSync(path, `${JSON.stringify(config, null, 2)}\n`);
    prunedByFile[file] = prunedRules;
    prunedTotal += prunedRules.length;
  }
}

console.log(`Pruned ${prunedTotal} default-matching rule configs.`);
for (const [file, rules] of Object.entries(prunedByFile)) {
  console.log(`  ${file}: ${rules.length}`);
}
