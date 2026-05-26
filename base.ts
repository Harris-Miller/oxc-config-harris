import { defineConfig } from 'oxlint';

import coreConfig from './core/core.js';
import typescriptConfig from './typescript/typescript.js';

const baseConfig = defineConfig({
  extends: [coreConfig, typescriptConfig],
});

export default baseConfig;
