import { defineConfig } from "oxlint";

const sortKeysConfig = defineConfig({
  rules: {
    "sort-keys": "error",
  },
});

export default sortKeysConfig;
