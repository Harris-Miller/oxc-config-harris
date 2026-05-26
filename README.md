# oxlint-config-harris

Personal [Oxlint](https://oxc.rs/docs/guide/usage/linter/) and [Oxfmt](https://oxc.rs/docs/guide/usage/formatter/) configs, split into composable subsets (formerly `eslint-config-harris`).

## TODO
- Turn this into a mono repo with separate `oxlint-config-harris` and `oxfmt-config-harris` packages
- Simplify the lint definitions
- Update all README files
- remove ai agent create scripts and the `.agents` skills folder which has oxc migration skills
- remove extraneous `package.json` dependencies from the migration
- Keep UNMIGRATED.md, but remove the stuff that doesn't matter. Only keep the things that I want to eventually add in once oxc implements them
  - Keep notes about which rules I _had_ but oxc does not plan to implement

## Install

```bash
pnpm add -D oxlint oxfmt oxlint-config-harris
# TypeScript type-aware rules (when using ./typescript or ./base / ".")
pnpm add -D oxlint-tsgolint
```

## Exports

| Import                            | Contents                                              |
| --------------------------------- | ----------------------------------------------------- |
| `oxlint-config-harris`            | Core + TypeScript + React                             |
| `oxlint-config-harris/base`       | Core + TypeScript                                     |
| `oxlint-config-harris/core`       | JS recommended, personal, import, sort-keys           |
| `oxlint-config-harris/format`     | Oxfmt options (Prettier-equivalent + import sorting)  |
| `oxlint-config-harris/typescript` | TypeScript / TSX overrides                            |
| `oxlint-config-harris/react`      | React, hooks (compiler rules via JS plugin), jsx-a11y |
| `oxlint-config-harris/jest`       | Jest test file overrides                              |
| `oxlint-config-harris/globals`    | Re-exports the `globals` package                      |
| `oxlint-config-harris/unmigrated` | Rules without Oxlint equivalents                      |

## Usage

### Lint (`oxlint.config.ts`)

```ts
import { defineConfig } from "oxlint";
import harris from "oxlint-config-harris";

export default defineConfig({
  extends: [harris],
  options: {
    typeAware: true,
  },
});
```

Compose subsets:

```ts
import { defineConfig } from "oxlint";
import core from "oxlint-config-harris/core";
import typescript from "oxlint-config-harris/typescript";
import react from "oxlint-config-harris/react";
import jest from "oxlint-config-harris/jest";

export default defineConfig({
  extends: [core, typescript, react, jest],
  options: { typeAware: true },
});
```

`options.typeAware` must be set on the **root** config (not only on `./typescript`). Install `oxlint-tsgolint`.

### Format (`oxfmt.config.ts`)

Oxfmt does not support `extends`; spread the shared config:

```ts
import format from "oxlint-config-harris/format";

export default {
  ...format,
};
```

Run `oxfmt` / `oxfmt --check` alongside `oxlint` in CI.

## Scripts (this repo)

```bash
pnpm lint          # oxlint
pnpm format        # oxfmt --check
pnpm format:fix    # oxfmt
```

## Regenerating from ESLint

A one-off ESLint merge config is kept for `@oxlint/migrate`:

```bash
npx @oxlint/migrate --type-aware --details eslint.config.migrate.js
node scripts/split-oxlintrc.mjs
```

See [UNMIGRATED.md](./UNMIGRATED.md) for rules that have no native Oxlint equivalent.

## Migrating from eslint-config-harris v5

1. Replace `eslint` + `eslint-config-harris` with `oxlint`, `oxfmt`, and `oxlint-config-harris`.
2. Add `oxlint.config.ts` / `oxfmt.config.ts` as above.
3. Enable `sortImports` via `./format` (replaces `import/order` and `prettier/prettier`).
4. Review [UNMIGRATED.md](./UNMIGRATED.md) for dropped or JS-plugin rules.
