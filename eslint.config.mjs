import tseslint from "@typescript-eslint/eslint-plugin";

export default [
  {
    ignores: ["node_modules/", "main.js"],
  },
  ...tseslint.configs["flat/recommended"],
  {
    rules: {
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["error", { args: "none" }],
      "@typescript-eslint/ban-ts-comment": "off",
      "no-prototype-builtins": "off",
      "@typescript-eslint/no-empty-function": "off",
    },
  },
];