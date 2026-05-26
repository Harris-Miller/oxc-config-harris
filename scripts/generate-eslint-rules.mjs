import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const result = spawnSync(
  process.execPath,
  [fileURLToPath(new URL('./generate-oxlint-rules.mjs', import.meta.url)), 'eslint'],
  { stdio: 'inherit' },
);

process.exit(result.status ?? 1);
