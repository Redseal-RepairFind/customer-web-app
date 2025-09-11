module.exports = {
  // ...
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    // optional: keep noise down during refactor
    "@typescript-eslint/no-unused-vars": [
      "warn",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
  },
};
