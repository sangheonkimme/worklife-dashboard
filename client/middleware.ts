import { auth } from "@/auth";
import { NextResponse } from "next/server";

const STRICTLY_PROTECTED_PATHS = ["/dashboard/profile"];

const isStrictlyProtectedRoute = (pathname: string) =>
  STRICTLY_PROTECTED_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthed = Boolean(req.auth);

  if (isStrictlyProtectedRoute(pathname) && !isAuthed) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*"],
};
