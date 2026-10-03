export type ApiError = {
  status: number;
  message: string;
  code?: string;
  correlationId?: string;
};

export class HttpApiError extends Error implements ApiError {
  status: number;
  code?: string;
  correlationId?: string;

  constructor(init: ApiError) {
    super(init.message);
    this.name = "HttpApiError";
    this.status = init.status;
    this.code = init.code;
    this.correlationId = init.correlationId;
  }
}

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080";

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const prefix = encodeURIComponent(name) + "=";
  const part = document.cookie
    .split("; ")
    .find((value) => value.startsWith(prefix));
  return part ? decodeURIComponent(part.slice(prefix.length)) : undefined;
}

export class HttpClient {
  constructor(private readonly baseUrl: string) {}

  async request<T>(path: string, init?: RequestInit): Promise<T> {
    const method = (init?.method ?? "GET").toUpperCase();
    const unsafeMethod = !["GET", "HEAD", "OPTIONS"].includes(method);

    if (unsafeMethod && typeof window !== "undefined") {
      let csrfToken = readCookie("XSRF-TOKEN");

      if (!csrfToken) {
        await fetch(this.baseUrl + "/api/v1/auth/csrf", {
          credentials: "include",
          headers: { Accept: "application/json" },
        });
        csrfToken = readCookie("XSRF-TOKEN");
      }

      if (csrfToken) {
        init = {
          ...init,
          headers: {
            "X-XSRF-TOKEN": csrfToken,
            ...(init?.headers ?? {}),
          },
        };
      }
    }

    const response = await fetch(this.baseUrl + path, {
      ...init,
      credentials: "include",
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null) as {
        message?: string;
        code?: string;
      } | null;

      throw new HttpApiError({
        status: response.status,
        message: body?.message ?? response.statusText,
        code: body?.code,
        correlationId: response.headers.get("X-Correlation-Id") ?? undefined,
      });
    }

    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }
}

export const apiClient = new HttpClient(API_BASE_URL);
