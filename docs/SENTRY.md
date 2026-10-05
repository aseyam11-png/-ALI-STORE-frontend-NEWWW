# Sentry integration

Sentry is the production observability layer for runtime errors, hydration failures, and frontend performance.

Activation should be done only after the Sentry project is created:

1. Add the Sentry Next.js SDK as a normal project dependency and regenerate package-lock.json.
2. Configure the browser/server initialization files using the official Next.js setup.
3. Set NEXT_PUBLIC_SENTRY_DSN in Vercel/production environment variables.
4. Keep SENTRY_AUTH_TOKEN, organization and project identifiers in CI/Vercel secrets.
5. Enable source-map uploads and release identifiers so production errors map back to the exact commit.

The current repository intentionally documents the integration without adding an untracked runtime dependency. This keeps npm ci reproducible until the dependency installation is performed and the lockfile is regenerated.
