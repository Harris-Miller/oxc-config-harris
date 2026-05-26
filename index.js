import { defineConfig } from 'oxlint';

import baseConfig from './base.js';
import reactConfig from './react/react.js';

const config = defineConfig({
  extends: [baseConfig, reactConfig],
});

export default config;
