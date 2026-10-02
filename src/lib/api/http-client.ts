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

function isApiEnvelope<T>(value: unknown): value is ApiEnvelope<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "success" in value &&
    "data" in value
  );
}

export class HttpClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, "");
  }

  async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      credentials: init?.credentials ?? "include",
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

    return response.json() as Promise<T>;
  }

  async requestApi<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await this.request<ApiEnvelope<T>>(path, init);

    if (!isApiEnvelope<T>(response)) {
      return response as T;
    }

    if (!response.success) {
      throw new HttpApiError({
        status: 500,
        message: response.message || "API operation failed",
      });
    }

    return response.data;
  }
}

export const apiClient = new HttpClient(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
);
