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

type ApiEnvelope<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export class HttpClient {
  constructor(private readonly baseUrl: string) {}

  async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      credentials: "include",
      cache: "no-store",
      headers: {
        Accept: "application/json",
        ...(init.body && !(init.body instanceof FormData)
          ? { "Content-Type": "application/json" }
          : {}),
        ...init.headers,
      },
    });

    const raw = await response.text();
    let body: ApiEnvelope<T> | T | null = null;

    if (raw) {
      try {
        body = JSON.parse(raw) as ApiEnvelope<T> | T;
      } catch {
        body = null;
      }
    }

    if (!response.ok) {
      const envelope =
        body && typeof body === "object" && "success" in body
          ? (body as Partial<ApiEnvelope<T>>)
          : undefined;

      throw new HttpApiError({
        status: response.status,
        message:
          envelope?.message ??
          (body && typeof body === "object" && "message" in body
            ? String((body as { message?: unknown }).message ?? response.statusText)
            : response.statusText),
        correlationId:
          response.headers.get("X-Correlation-Id") ?? undefined,
      });
    }

    if (response.status === 204 || !raw) return undefined as T;

    if (
      body &&
      typeof body === "object" &&
      "success" in body &&
      "data" in body
    ) {
      return (body as ApiEnvelope<T>).data;
    }

    return body as T;
  }

  get<T>(path: string) {
    return this.request<T>(path);
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: "POST",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  put<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: "PUT",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>(path, {
      method: "PATCH",
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  }

  delete<T>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
  }
}

export const apiClient = new HttpClient(
  typeof window === "undefined"
    ? process.env.BACKEND_INTERNAL_URL
      ? `${process.env.BACKEND_INTERNAL_URL}/api/v1`
      : "http://localhost:8080/api/v1"
    : process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/backend",
);
