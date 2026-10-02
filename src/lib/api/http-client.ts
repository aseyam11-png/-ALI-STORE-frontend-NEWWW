export type ApiError = {
  status: number;
  message: string;
  code?: string;
  correlationId?: string;
};

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
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

function joinBaseUrl(baseUrl: string, path: string) {
  const base = baseUrl.replace(/\/+$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

export class HttpClient {
  constructor(private readonly baseUrl: string) {}

  async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(joinBaseUrl(this.baseUrl, path), {
      ...init,
      credentials: "include",
      cache: init?.cache ?? "no-store",
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null) as
        | { message?: string; code?: string }
        | null;

      throw new HttpApiError({
        status: response.status,
        message: body?.message ?? response.statusText,
        code: body?.code,
        correlationId: response.headers.get("X-Correlation-Id") ?? undefined,
      });
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const payload = await response.json() as ApiEnvelope<T> | T;

    if (
      typeof payload === "object" &&
      payload !== null &&
      "success" in payload &&
      "data" in payload
    ) {
      const envelope = payload as ApiEnvelope<T>;
      if (!envelope.success) {
        throw new HttpApiError({
          status: response.status,
          message: envelope.message,
        });
      }
      return envelope.data;
    }

    return payload as T;
  }
}

export const apiClient = new HttpClient(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
);
