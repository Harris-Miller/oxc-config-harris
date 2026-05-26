import { defineConfig } from 'oxlint';

import baseConfig from './base.js';
import reactRules from './rules/react.js';

const config = defineConfig({
  extends: [baseConfig, reactRules],
});

export default config;
