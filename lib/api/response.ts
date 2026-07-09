// Purpose: Standardizes JSON API responses.
import { NextResponse } from "next/server";

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message: string;
};

export type ApiFailure = {
  success: false;
  error: {
    code: string;
    message: string;
  };
};

export function apiSuccess<T>(data: T, message = "OK", init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>(
    {
      success: true,
      data,
      message,
    },
    init,
  );
}

export function apiError(code: string, message: string, status = 400) {
  return NextResponse.json<ApiFailure>(
    {
      success: false,
      error: {
        code,
        message,
      },
    },
    {
      status,
    },
  );
}
