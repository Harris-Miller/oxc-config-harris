# Rules not migrated to Oxlint

Generated from `npx @oxlint/migrate --type-aware --details eslint.config.migrate.js` plus manual review.

## Intentionally replaced (not gaps)

| ESLint rule                                  | Replacement                                                                                             |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| `prettier/prettier`                          | [Oxfmt](./core/format.js) — run `oxfmt` / `oxfmt --check`                                               |
| `import/order`                               | Oxfmt `sortImports` (see `./format`)                                                                    |
| `sort-imports`                               | Oxfmt `sortImports` for declarations; optional `sort-imports` in oxlint for member order inside imports |
| `sort-keys-fix/sort-keys-fix`                | Native `sort-keys` (autofix; comment-moving behavior may differ)                                        |
| `react-refresh/only-export-components`       | `react/only-export-components`                                                                          |
| React JSX layout rules (managed by Prettier) | Oxfmt                                                                                                   |

## jsPlugins (kept via ESLint plugins)

| Rule                                                                     | Plugin                                          | Notes                                                        |
| ------------------------------------------------------------------------ | ----------------------------------------------- | ------------------------------------------------------------ |
| `import/no-unused-modules`                                               | `eslint-plugin-import`                          | No native Oxlint rule                                        |
| `typescript-sort-keys/interface`                                         | `eslint-plugin-typescript-sort-keys`            | TypeScript override only                                     |
| React Compiler hooks (`component-hook-factories`, `gating`, `purity`, …) | `eslint-plugin-react-hooks` as `react-hooks-js` | Native: `react/rules-of-hooks`, `react/exhaustive-deps` only |

## Nursery (not enabled by default)

- `no-undef` — use TypeScript / project references
- `no-restricted-exports`
- `import/export`, `import/named`
- `@typescript-eslint/prefer-optional-chain`
- `@typescript-eslint/no-unnecessary-condition`
- `react/require-render-return`

## Not implemented in Oxlint

- `no-unreachable-loop`
- `require-atomic-updates`
- `consistent-this`
- `no-restricted-syntax` (including TSEnumDeclaration, jest.clearAllMocks selectors)
- `one-var`
- `strict`
- `import/no-import-module-exports`
- `import/no-relative-packages`
- `import/no-useless-path-segments`
- `@typescript-eslint/naming-convention`
- `@typescript-eslint/prefer-destructuring`
- `react/function-component-definition`
- `react/jsx-no-leaked-render`
- `react/no-arrow-function-lifecycle`
- `react/no-invalid-html-attribute`
- `react/no-typos`
- `react/prefer-stateless-function`
- `react/require-default-props`

## Unsupported / deprecated (dropped or alternate)

- `no-dupe-args`, `no-octal`, `no-octal-escape` — strict mode
- `no-invalid-this`, `@typescript-eslint/no-invalid-this` — TypeScript `noImplicitThis`
- `no-undef-init` — use `unicorn/no-useless-undefined` if needed
- `import/no-unresolved` — false positives; not enabled
- `@typescript-eslint/sort-type-constituents` — deprecated
- `@typescript-eslint/typedef` — deprecated
- Legacy React class / PropTypes rules — see migrate output

## Settings not migrated

Oxlint does not support ESLint `settings` in overrides:

- `import/parsers`, `import/extensions`, `import/resolver`
- `import/external-module-folders` (typescript override)
- `react.version` — use `settings.react` at root if needed

## Consumer requirements

- **Type-aware TypeScript rules**: install `oxlint-tsgolint`, set `options.typeAware: true` on the **root** `oxlint.config.js` (not on `./typescript` export alone).
