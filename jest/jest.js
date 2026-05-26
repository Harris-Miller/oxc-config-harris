import { defineConfig } from "oxlint";

const jestRules = {
  "jest/expect-expect": "warn",
  "jest/no-alias-methods": "error",
  "jest/no-commented-out-tests": "warn",
  "jest/no-conditional-expect": "error",
  "jest/no-deprecated-functions": "error",
  "jest/no-disabled-tests": "off",
  "jest/no-done-callback": "error",
  "jest/no-export": "error",
  "jest/no-focused-tests": "error",
  "jest/no-identical-title": "error",
  "jest/no-interpolation-in-snapshots": "error",
  "jest/no-jasmine-globals": "error",
  "jest/no-mocks-import": "error",
  "jest/no-standalone-expect": "error",
  "jest/no-test-prefixes": "error",
  "jest/valid-describe-callback": "error",
  "jest/valid-expect": "error",
  "jest/valid-expect-in-promise": "error",
  "jest/valid-title": "error",
  "jest/prefer-to-be": "error",
  "jest/prefer-to-contain": "error",
  "jest/prefer-to-have-length": "error",
  "jest/consistent-test-it": [
    "error",
    {
      fn: "it",
    },
  ],
  "jest/max-nested-describe": [
    "warn",
    {
      max: 3,
    },
  ],
  "jest/no-duplicate-hooks": "warn",
  "jest/no-large-snapshots": "error",
  "jest/no-test-return-statement": "warn",
  "jest/prefer-comparison-matcher": "error",
  "jest/prefer-equality-matcher": "error",
  "jest/prefer-expect-resolves": "warn",
  "jest/prefer-hooks-on-top": "error",
  "jest/prefer-spy-on": "warn",
  "jest/prefer-todo": "error",
  "jest/require-top-level-describe": "error",
};

const jestConfig = defineConfig({
  overrides: [
    {
      files: ["**/*.test.*", "**/*spec.*"],
      plugins: ["jest"],
      env: {
        jest: true,
      },
      rules: jestRules,
    },
  ],
});

export default jestConfig;
