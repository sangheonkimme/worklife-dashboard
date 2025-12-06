import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  DEFAULT_ACCESS_TOKEN_MAX_AGE,
  DEFAULT_REFRESH_TOKEN_MAX_AGE,
  getAccessTokenCookieOptions,
  getRefreshTokenCookieOptions,
} from "@/lib/constants/auth";

// 비로그인 시에도 접근 가능한 대시보드 경로
// 로그인 필요 영역은 각 페이지에서 UI로 블록
const PUBLIC_DASHBOARD_PATHS = [
  "/dashboard",
  "/dashboard/",
  "/dashboard/notes",
  "/dashboard/transactions",
  "/dashboard/salary",
  "/dashboard/settings",
];

// 완전히 로그인이 필요한 경로 (민감한 데이터)
const STRICTLY_PROTECTED_PATHS = ["/dashboard/profile"];

const isPublicDashboardRoute = (pathname: string) =>
  PUBLIC_DASHBOARD_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

const isStrictlyProtectedRoute = (pathname: string) =>
  STRICTLY_PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

const isDashboardRoute = (pathname: string) =>
  pathname === "/dashboard" || pathname.startsWith("/dashboard/");

const redirectToLogin = (request: NextRequest) => {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.set({
    ...getAccessTokenCookieOptions(0),
    value: "",
    maxAge: 0,
  });
  response.cookies.set({
    ...getRefreshTokenCookieOptions(0),
    value: "",
    maxAge: 0,
  });
  return response;
};

/**
 * Set-Cookie 헤더에서 refreshToken 값을 추출
 */
const extractRefreshTokenFromSetCookie = (
  setCookieHeader: string | null
): string | null => {
  if (!setCookieHeader) return null;

  // Set-Cookie 헤더는 여러 쿠키가 쉼표로 구분될 수 있음
  const cookies = setCookieHeader.split(/,(?=\s*\w+=)/);

  for (const cookie of cookies) {
    const match = cookie.match(/refreshToken=([^;]+)/);
    if (match) {
      return match[1];
    }
  }

  return null;
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 대시보드 외 경로는 통과
  if (!isDashboardRoute(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

  // 로그인된 사용자는 모든 대시보드 접근 허용
  if (accessToken) {
    return NextResponse.next();
  }

  // 토큰 갱신 시도
  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (refreshToken) {
    try {
      const refreshUrl = new URL("/api/auth/refresh", request.url);
      const refreshResponse = await fetch(refreshUrl, {
        method: "POST",
        headers: {
          cookie: request.headers.get("cookie") ?? "",
          origin: request.nextUrl.origin,
        },
      });

      if (refreshResponse.ok) {
        const payload = await refreshResponse.json();
        const newAccessToken =
          payload?.accessToken ?? payload?.data?.accessToken;

        if (newAccessToken) {
          const response = NextResponse.next();

          // accessToken 쿠키 설정 (httpOnly)
          response.cookies.set({
            ...getAccessTokenCookieOptions(DEFAULT_ACCESS_TOKEN_MAX_AGE),
            value: newAccessToken,
          });

          // refreshToken 쿠키 전파 (rotation 지원)
          // Route Handler 응답의 Set-Cookie에서 새 refreshToken 추출
          const setCookieHeader = refreshResponse.headers.get("set-cookie");
          const newRefreshToken =
            extractRefreshTokenFromSetCookie(setCookieHeader);

          if (newRefreshToken) {
            response.cookies.set({
              ...getRefreshTokenCookieOptions(DEFAULT_REFRESH_TOKEN_MAX_AGE),
              value: newRefreshToken,
            });
          }

          return response;
        }
      }
    } catch (error) {
      console.error("Failed to refresh access token in middleware", error);
    }
  }

  // 비로그인 사용자: 공개 경로는 허용
  if (isPublicDashboardRoute(pathname)) {
    return NextResponse.next();
  }

  // 비로그인 사용자: 엄격히 보호되는 경로는 로그인으로 리다이렉트
  if (isStrictlyProtectedRoute(pathname)) {
    return redirectToLogin(request);
  }

  // 그 외 대시보드 경로도 허용 (각 페이지에서 UI로 블록)
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
