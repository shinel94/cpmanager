export type ApiSuccessResponse<T> = {
  ok: true;
} & T;

export type ApiErrorResponse = {
  ok: false;
  error: {
    code: string;
    message: string;
  };
};

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export class ApiClientError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code = "NETWORK_ERROR", status = 500) {
    super(message);
    this.name = "ApiClientError";
    this.code = code;
    this.status = status;
  }
}

type RequestOptions = {
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

async function request<T>(
  path: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
    ...options?.headers,
  };

  if (body !== undefined && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  let response: Response;
  try {
    response = await fetch(path, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: options?.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }
    throw new ApiClientError(
      "서버와 통신할 수 없습니다. 네트워크 연결을 확인하세요.",
      "NETWORK_DISCONNECTED",
      0,
    );
  }

  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ApiClientError(
      `서버 응답 형식이 올바르지 않습니다. (HTTP ${response.status})`,
      "INVALID_JSON",
      response.status,
    );
  }

  const payload = data as ApiResponse<T>;
  if (!response.ok || !payload || payload.ok === false) {
    const errorInfo = (payload as ApiErrorResponse)?.error;
    const code = errorInfo?.code ?? `HTTP_${response.status}`;
    const message = errorInfo?.message ?? `요청 처리에 실패했습니다. (HTTP ${response.status})`;
    throw new ApiClientError(message, code, response.status);
  }

  return payload as T;
}

export const apiClient = {
  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, "GET", undefined, options);
  },
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, "POST", body, options);
  },
  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return request<T>(path, "PUT", body, options);
  },
  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return request<T>(path, "DELETE", undefined, options);
  },
};
