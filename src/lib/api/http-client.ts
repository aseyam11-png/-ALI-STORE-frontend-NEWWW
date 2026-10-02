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

export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
};

export class HttpClient {
  constructor(private readonly baseUrl: string) {}

  async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(this.baseUrl + path, {
      ...init,
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...init?.headers,
      },
    });

    const payload = await response.json().catch(() => null) as
      | ApiEnvelope<T>
      | { message?: string; code?: string }
      | null;

    if (!response.ok) {
      throw new HttpApiError({
        status: response.status,
        message:
          payload && "message" in payload && payload.message
            ? payload.message
            : response.statusText || "Request failed",
        code:
          payload && "code" in payload ? payload.code : undefined,
        correlationId:
          response.headers.get("X-Correlation-Id") ?? undefined,
      });
    }

    if (response.status === 204) {
      return undefined as T;
    }

    if (payload && "success" in payload && "data" in payload) {
      if (!payload.success) {
        throw new HttpApiError({
          status: response.status,
          message: payload.message || "Request failed",
        });
      }
      return payload.data;
    }

    return payload as T;
  }
}

export const apiClient = new HttpClient(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/backend",
);
