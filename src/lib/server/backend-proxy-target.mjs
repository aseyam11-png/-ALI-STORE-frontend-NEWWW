export function buildBackendTarget(backend, incoming) {
  const target = new URL(`${incoming.pathname}${incoming.search}`, backend);
  return target.origin === backend.origin ? target : null;
}
