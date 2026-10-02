export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
};

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

export class HttpClient {
  constructor(private readonly baseUrl: string) {}

  async request<T>(
    path: string,
    init?: RequestInit,
  ): Promise<T> {
    const response = await fetch(
      `${this.baseUrl}${path}`,
      {
        ...init,
        credentials: "include",
        cache: init?.cache ?? "no-store",
        headers: {
          Accept: "application/json",
          ...(init?.body
            ? {
                "Content-Type":
                  "application/json",
              }
            : {}),
          ...init?.headers,
        },
      },
    );

    const rawBody = await response
      .text()
      .catch(() => "");

    let parsed: unknown = null;

    if (rawBody) {
      try {
        parsed = JSON.parse(rawBody);
      } catch {
        parsed = null;
      }
    }

    if (!response.ok) {
      const body =
        parsed as
          | {
              message?: string;
              code?: string;
            }
          | null;

      throw new HttpApiError({
        status: response.status,
        message:
          body?.message ??
          response.statusText ??
          "Request failed",
        code: body?.code,
        correlationId:
          response.headers.get(
            "X-Correlation-Id",
          ) ?? undefined,
      });
    }

    if (
      response.status === 204 ||
      !rawBody
    ) {
      return undefined as T;
    }

    const envelope =
      parsed as
        | ApiEnvelope<T>
        | null;

    if (
      envelope &&
      typeof envelope === "object" &&
      "success" in envelope &&
      "data" in envelope
    ) {
      if (!envelope.success) {
        throw new HttpApiError({
          status: response.status,
          message:
            envelope.message ??
            "API request failed",
        });
      }

      return envelope.data;
    }

    return parsed as T;
  }
}

export const apiClient =
  new HttpClient(
    (
      process.env
        .NEXT_PUBLIC_API_BASE_URL ??
      "http://localhost:8080"
    ).replace(/\/$/, ""),
  );
