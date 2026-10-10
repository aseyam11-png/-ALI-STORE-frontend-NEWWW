export default {
  source: ["tokens/**/*.json"],
  platforms: {
    css: {
      transformGroup: "css",
      buildPath: "artifacts/design-system/",
      files: [{ destination: "tokens.css", format: "css/variables" }],
    },
  },
};
