import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_ACCESS_TOKEN_MAX_AGE,
  DEFAULT_REFRESH_TOKEN_MAX_AGE,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "@/lib/constants/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

const createErrorResponse = (status: number, message: string) => {
  const response = NextResponse.json({ success: false, message }, { status });
  if (status === 401) {
    // 인증 실패 시 accessToken 쿠키 삭제
    response.cookies.set({
      ...getAccessTokenCookieOptions(0),
      value: "",
      maxAge: 0,
    });
    // refreshToken 쿠키도 삭제
    response.cookies.set({
      ...getRefreshTokenCookieOptions(0),
      value: "",
      maxAge: 0,
    });
  }
  return response;
};

/**
 * 서버 응답의 Set-Cookie 헤더에서 refreshToken 값을 추출
 */
const extractRefreshTokenFromSetCookie = (
  setCookieHeader: string | null
): string | null => {
  if (!setCookieHeader) return null;

  // Set-Cookie 헤더는 여러 쿠키가 쉼표로 구분될 수 있음
  // 또는 여러 Set-Cookie 헤더가 있을 수 있음 (getAll 사용 권장)
  const cookies = setCookieHeader.split(/,(?=\s*\w+=)/);

  for (const cookie of cookies) {
    const match = cookie.match(/refreshToken=([^;]+)/);
    if (match) {
      return match[1];
    }
  }

  return null;
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

    // accessToken 쿠키 설정 (httpOnly)
    response.cookies.set({
      ...getAccessTokenCookieOptions(DEFAULT_ACCESS_TOKEN_MAX_AGE),
      value: accessToken,
    });

    // 서버 응답의 Set-Cookie에서 refreshToken 추출하여 클라이언트로 전파
    // (refreshToken rotation 지원)
    const setCookieHeader = apiResponse.headers.get("set-cookie");
    const newRefreshToken = extractRefreshTokenFromSetCookie(setCookieHeader);

    if (newRefreshToken) {
      response.cookies.set({
        ...getRefreshTokenCookieOptions(DEFAULT_REFRESH_TOKEN_MAX_AGE),
        value: newRefreshToken,
      });
    }

    return response;
  } catch (error) {
    return createErrorResponse(500, (error as Error).message);
  }
}
