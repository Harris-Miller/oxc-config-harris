const formatConfig = {
  arrowParens: "avoid",
  printWidth: 120,
  singleQuote: true,
  semi: true,
  trailingComma: "all",
  tabWidth: 2,
  useTabs: false,
  bracketSpacing: true,
  bracketSameLine: false,
  jsxSingleQuote: false,
  quoteProps: "as-needed",
  endOfLine: "lf",
  insertFinalNewline: true,
  sortPackageJson: false,
  sortImports: {
    newlinesBetween: false,
    groups: [
      ["value-builtin", "value-external"],
      ["value-internal", "value-parent", "value-sibling", "value-index"],
      { newlinesBetween: true },
      "type-import",
      "unknown",
    ],
    order: "asc",
    ignoreCase: true,
  },
};

export default formatConfig;
