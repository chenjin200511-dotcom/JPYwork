// Purpose: Validates incoming API payloads with Zod and returns consistent errors.
import type { ZodType } from "zod";
import { ApiError } from "./errors";

export async function parseJsonBody<T>(request: Request, schema: ZodType<T>) {
  let payload: unknown;

  try {
    const text = await request.text();
    payload = text.trim() ? JSON.parse(text) : {};
  } catch {
    throw new ApiError("VALIDATION_ERROR", "请求内容不是有效的 JSON", 400);
  }

  const result = schema.safeParse(payload);

  if (!result.success) {
    throw new ApiError("VALIDATION_ERROR", "请求参数不正确", 400);
  }

  return result.data;
}

export function parseSearchParams<T>(url: string, schema: ZodType<T>) {
  const params = Object.fromEntries(new URL(url).searchParams.entries());
  const result = schema.safeParse(params);

  if (!result.success) {
    throw new ApiError("VALIDATION_ERROR", "请求参数不正确", 400);
  }

  return result.data;
}
