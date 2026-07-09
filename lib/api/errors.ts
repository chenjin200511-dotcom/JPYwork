// Purpose: Defines reusable API error types and safe error responses.
import { apiError } from "./response";

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return apiError(error.code, error.message, error.status);
  }

  console.error(error);
  return apiError("INTERNAL_ERROR", "请求失败", 500);
}

export const unauthorizedError = () =>
  new ApiError("UNAUTHORIZED", "请先登录", 401);

export const forbiddenError = () =>
  new ApiError("FORBIDDEN", "当前账号没有权限执行此操作", 403);
