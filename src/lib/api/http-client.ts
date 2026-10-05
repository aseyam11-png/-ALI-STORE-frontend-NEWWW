export type ApiError = {
  status: number;
  message: string;
  code?: string;
  correlationId?: string;
  fieldErrors?: Record<string, string>;
};

export class HttpApiError extends Error implements ApiError {
  status: number;
  code?: string;
  correlationId?: string;
  fieldErrors?: Record<string, string>;

  constructor(init: ApiError) {
    super(init.message);
    this.name = "HttpApiError";
    this.status = init.status;
    this.code = init.code;
    this.correlationId = init.correlationId;
    this.fieldErrors = init.fieldErrors;
  }
}

const configuredServerApiBase =
  process.env.BACKEND_INTERNAL_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
  null;

if (
  typeof window === "undefined" &&
  process.env.NODE_ENV === "production" &&
  !configuredServerApiBase
) {
  throw new Error(
    "Missing BACKEND_INTERNAL_URL or NEXT_PUBLIC_API_BASE_URL for production server rendering.",
  );
}

const SERVER_API_BASE_URL =
  configuredServerApiBase ?? "http://localhost:8080";

const BROWSER_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export const API_BASE_URL =
  typeof window === "undefined"
    ? SERVER_API_BASE_URL.replace(/\/$/, "")
    : BROWSER_API_BASE_URL.replace(/\/$/, "");

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const prefix = encodeURIComponent(name) + "=";
  const part = document.cookie
    .split("; ")
    .find((value) => value.startsWith(prefix));
  return part ? decodeURIComponent(part.slice(prefix.length)) : undefined;
}

export type ApiEnvelope<T> = {
  success?: boolean;
  message?: string;
  data: T;
};

function unwrapApiEnvelope<T>(payload: T | ApiEnvelope<T>): T {
  if (typeof payload === "object" && payload !== null && "data" in payload) {
    const envelope = payload as ApiEnvelope<T>;
    if (envelope.success === false) {
      throw new Error(envelope.message || "API request failed");
    }
    return envelope.data;
  }

  return payload as T;
}

export class HttpClient {
  constructor(private readonly baseUrl: string) {}

  async requestData<T>(path: string, init?: RequestInit): Promise<T> {
    const payload = await this.request<T | ApiEnvelope<T>>(path, init);
    return unwrapApiEnvelope<T>(payload);
  }

  async request<T>(path: string, init?: RequestInit): Promise<T> {
    const method = (init?.method ?? "GET").toUpperCase();
    const unsafeMethod = !["GET", "HEAD", "OPTIONS"].includes(method);

    const csrfExemptMutationPaths = new Set([
      "/api/v1/auth/login",
      "/api/v1/auth/register",
      "/api/v1/auth/email/verify",
      "/api/v1/auth/email/resend",
    ]);

    const shouldPrepareCsrf =
      unsafeMethod &&
      typeof window !== "undefined" &&
      !csrfExemptMutationPaths.has(path);

    if (shouldPrepareCsrf) {
      let csrfToken = readCookie("XSRF-TOKEN");

      if (!csrfToken) {
        try {
          await fetch(this.baseUrl + "/api/v1/auth/csrf", {
            credentials: "include",
            headers: { Accept: "application/json" },
          });
        } catch {
          // The actual mutation below is the source of truth. A missing CSRF
          // bootstrap must not prevent the client from reaching the backend.
        }
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

    const headers = new Headers(init?.headers);
    headers.set("Accept", "application/json");

    const body = init?.body;
    const isFormData =
      typeof FormData !== "undefined" && body instanceof FormData;
    const isBlob =
      typeof Blob !== "undefined" && body instanceof Blob;
    const isUrlSearchParams =
      typeof URLSearchParams !== "undefined" &&
      body instanceof URLSearchParams;
    const isArrayBuffer =
      typeof ArrayBuffer !== "undefined" &&
      (body instanceof ArrayBuffer ||
        ArrayBuffer.isView(body));

    if (
      body &&
      !headers.has("Content-Type") &&
      !isFormData &&
      !isBlob &&
      !isUrlSearchParams &&
      !isArrayBuffer
    ) {
      headers.set("Content-Type", "application/json");
    }

    const response = await fetch(this.baseUrl + path, {
      ...init,
      credentials: "include",
      headers,
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null) as {
        message?: string;
        code?: string;
        errors?: Record<string, string>;
      } | null;

      const fieldErrors = body?.errors;
      const fieldMessages = fieldErrors
        ? Object.values(fieldErrors).filter(
            (message): message is string => Boolean(message),
          )
        : [];

      throw new HttpApiError({
        status: response.status,
        message:
          fieldMessages.length > 0
            ? fieldMessages.join(" ")
            : body?.message ?? response.statusText,
        code: body?.code,
        fieldErrors,
        correlationId: response.headers.get("X-Correlation-Id") ?? undefined,
      });
    }

    if (response.status === 204) return undefined as T;
    return response.json() as Promise<T>;
  }
}

export const apiClient = new HttpClient(API_BASE_URL);
