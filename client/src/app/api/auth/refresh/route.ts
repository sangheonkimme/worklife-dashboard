import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_ACCESS_TOKEN_MAX_AGE,
  getAccessTokenCookieOptions,
} from "@/lib/constants/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

const createErrorResponse = (status: number, message: string) => {
  const response = NextResponse.json({ success: false, message }, { status });
  if (status === 401) {
    response.cookies.set({
      ...getAccessTokenCookieOptions(0),
      value: "",
      maxAge: 0,
    });
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
      ...getAccessTokenCookieOptions(DEFAULT_ACCESS_TOKEN_MAX_AGE),
      value: accessToken,
    });
    return response;
  } catch (error) {
    return createErrorResponse(500, (error as Error).message);
  }
}
