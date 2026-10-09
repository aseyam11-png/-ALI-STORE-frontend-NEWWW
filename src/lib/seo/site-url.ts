export function getSiteUrl(): string | undefined {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  const vercelHost = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  let candidate = configured;
  if (!candidate && vercelHost) {
    const withoutScheme = vercelHost.startsWith("https://")
      ? vercelHost.slice(8)
      : vercelHost.startsWith("http://")
        ? vercelHost.slice(7)
        : vercelHost;
    const hostname = withoutScheme.split("/")[0]?.trim();
    if (hostname) candidate = "https://" + hostname;
  }

  if (!candidate) return undefined;

  try {
    const url = new URL(candidate);
    if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
      return undefined;
    }
    return url.origin;
  } catch {
    return undefined;
  }
}
