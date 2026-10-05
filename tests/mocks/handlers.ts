import { http } from "msw";

export const handlers = [
  // Add feature-specific handlers here.
  // Keep handlers deterministic and close to the API contract they model.
  http.get("/__quality__/health", () => {
    return Response.json({ ok: true });
  }),
];
