import { defineConfig } from "eslint/config";
import globals from "globals";

import indexConfig from "./index.js";
import jestConfig from "./jest/jest.js";

/**
 * Merges every published subset for @oxlint/migrate. Not shipped in the package.
 */
export default defineConfig([
  ...indexConfig,
  ...jestConfig,
  { languageOptions: { globals: globals.nodeBuiltin } },
]);
