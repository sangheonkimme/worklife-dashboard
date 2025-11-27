import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  DEFAULT_ACCESS_TOKEN_MAX_AGE,
} from "@/lib/constants/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

const createErrorResponse = (status: number, message: string) => {
  const response = NextResponse.json({ success: false, message }, { status });
  if (status === 401) {
    response.cookies.delete(ACCESS_TOKEN_COOKIE_NAME);
  }
  return response;
};

export async function POST(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const origin = request.headers.get("origin") ?? request.nextUrl.origin;

  try {
    const apiResponse = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: {
        cookie: cookieHeader,
        origin,
      },
      credentials: "include",
    });

    if (!apiResponse.ok) {
      return createErrorResponse(
        apiResponse.status,
        "Failed to refresh access token"
      );
    }

    const payload = await apiResponse.json();
    const accessToken = payload?.data?.accessToken ?? payload?.accessToken;

    if (!accessToken) {
      return createErrorResponse(500, "Access token missing in response");
    }

    const response = NextResponse.json({ success: true, accessToken });
    response.cookies.set({
      name: ACCESS_TOKEN_COOKIE_NAME,
      value: accessToken,
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: DEFAULT_ACCESS_TOKEN_MAX_AGE,
    });
    return response;
  } catch (error) {
    return createErrorResponse(500, (error as Error).message);
  }
}
