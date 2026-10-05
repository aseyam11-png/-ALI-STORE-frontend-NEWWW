module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment: "Circular dependencies can create runtime initialization problems.",
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    tsPreCompilationDeps: true,
    tsConfig: { fileName: "tsconfig.json" },
    doNotFollow: { path: ["^node_modules", "^\\.next", "^coverage", "^out"] },
    exclude: { path: ["\\.(test|spec)\\.(ts|tsx|js|mjs|cjs)$"] },
    progress: "performance",
    preserveSymlinks: false,
    validate: true,
  },
};
