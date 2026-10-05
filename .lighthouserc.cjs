module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm start -- --hostname 127.0.0.1 --port 3000",
      startServerReadyPattern: "Ready in|started server|Local:",
      startServerReadyTimeout: 120000,
      numberOfRuns: 3,
      url: ["http://127.0.0.1:3000/"],
    },
    assert: {
      preset: "lighthouse:recommended",
      assertions: {
        "categories:performance": ["warn", { minScore: 0.75 }],
        "categories:accessibility": ["error", { minScore: 0.90 }],
        "categories:seo": ["warn", { minScore: 0.90 }],
        "first-contentful-paint": ["warn", { maxNumericValue: 2500 }],
        "largest-contentful-paint": ["warn", { maxNumericValue: 4000 }],
        interactive: ["warn", { maxNumericValue: 5000 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
