import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  DEFAULT_ACCESS_TOKEN_MAX_AGE,
  getAccessTokenCookieOptions,
} from "@/lib/constants/auth";

const PROTECTED_PATHS = ["/dashboard"];
const PUBLIC_DASHBOARD_PATHS = ["/dashboard", "/dashboard/"];

const isProtectedRoute = (pathname: string) =>
  PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

const isPublicDashboardRoute = (pathname: string) =>
  PUBLIC_DASHBOARD_PATHS.includes(pathname);

const redirectToLogin = (request: NextRequest) => {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.set({
    ...getAccessTokenCookieOptions(0),
    value: "",
    maxAge: 0,
  });
  return response;
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicDashboard = isPublicDashboardRoute(pathname);

  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get(ACCESS_TOKEN_COOKIE_NAME)?.value;

  if (accessToken) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get("refreshToken")?.value;

  if (!refreshToken) {
    return redirectToLogin(request);
  }

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
      const newAccessToken = payload?.accessToken ?? payload?.data?.accessToken;

      if (newAccessToken) {
        const response = NextResponse.next();
        response.cookies.set({
          ...getAccessTokenCookieOptions(DEFAULT_ACCESS_TOKEN_MAX_AGE),
          value: newAccessToken,
        });
        return response;
      }
    }
  } catch (error) {
    console.error("Failed to refresh access token in middleware", error);
  }

  if (isPublicDashboard) {
    return NextResponse.next();
  }

  return redirectToLogin(request);
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
