import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  DEFAULT_ACCESS_TOKEN_MAX_AGE,
} from "@/lib/constants/auth";

const PROTECTED_PATHS = [
  "/dashboard",
  "/transactions",
  "/expense",
  "/notes",
  "/settings",
  "/profile",
  "/finance-tools",
  "/salary",
];


const isProtectedRoute = (pathname: string) =>
  PROTECTED_PATHS.some((path) =>
    pathname === path || pathname.startsWith(`${path}/`)
  );

const redirectToLogin = (request: NextRequest) => {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
  const response = NextResponse.redirect(loginUrl);
  response.cookies.delete(ACCESS_TOKEN_COOKIE_NAME);
  return response;
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

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
      },
    });

    if (refreshResponse.ok) {
      const payload = await refreshResponse.json();
      const newAccessToken = payload?.accessToken ?? payload?.data?.accessToken;

      if (newAccessToken) {
        const response = NextResponse.next();
        response.cookies.set({
          name: ACCESS_TOKEN_COOKIE_NAME,
          value: newAccessToken,
          httpOnly: false,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          path: "/",
          maxAge: DEFAULT_ACCESS_TOKEN_MAX_AGE,
        });
        return response;
      }
    }
  } catch (error) {
    console.error("Failed to refresh access token in middleware", error);
  }

  return redirectToLogin(request);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/expense/:path*",
    "/notes/:path*",
    "/settings/:path*",
    "/profile/:path*",
    "/finance-tools/:path*",
    "/salary/:path*",
  ],
};
