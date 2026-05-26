import { defineConfig } from "oxlint";

import importConfig from "./import.js";
import personalConfig from "./personal.js";
import recommendedConfig from "./recommended.js";
import sortKeysConfig from "./sortKeys.js";

const coreConfig = defineConfig({
  extends: [recommendedConfig, personalConfig, importConfig, sortKeysConfig],
  plugins: ["unicorn", "typescript", "oxc", "import"],
  categories: {
    correctness: "off",
  },
});

export default coreConfig;
