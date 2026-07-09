// Purpose: Provides a tiny typed fetch wrapper for workspace client components.
export type ApiSuccess<T> = {
  data: T;
  message: string;
  success: true;
};

export type ApiFailure = {
  error: {
    code: string;
    message: string;
  };
  success: false;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly code = "REQUEST_FAILED",
    public readonly status = 500,
  ) {
    super(message);
  }
}

type SendOptions = {
  body?: unknown;
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
};

export async function apiRequest<T>(url: string, options: SendOptions = {}) {
  const response = await fetch(url, {
    body: options.body ? JSON.stringify(options.body) : undefined,
    credentials: "include",
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
    method: options.method ?? "GET",
  });
  const result = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !result.success) {
    const error = result.success
      ? { code: "REQUEST_FAILED", message: "请求失败" }
      : result.error;
    throw new ApiClientError(error.message, error.code, response.status);
  }

  return result.data;
}

export async function apiDownload(url: string) {
  const response = await fetch(url, {
    credentials: "include",
  });

  if (!response.ok) {
    throw new ApiClientError("下载失败", "DOWNLOAD_FAILED", response.status);
  }

  return response.text();
}
