export const ACCESS_TOKEN_COOKIE_NAME = "accessToken";
export const DEFAULT_ACCESS_TOKEN_MAX_AGE = 60 * 15; // 15 minutes
export const ACCESS_TOKEN_COOKIE_DOMAIN =
  process.env.NEXT_PUBLIC_COOKIE_DOMAIN ||
  process.env.COOKIE_DOMAIN ||
  undefined;

export const getAccessTokenCookieOptions = (maxAge = DEFAULT_ACCESS_TOKEN_MAX_AGE) => ({
  name: ACCESS_TOKEN_COOKIE_NAME,
  httpOnly: true, // XSS 방어: JavaScript에서 접근 불가
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge,
  ...(ACCESS_TOKEN_COOKIE_DOMAIN ? { domain: ACCESS_TOKEN_COOKIE_DOMAIN } : {}),
});

// refreshToken 쿠키 설정 (path=/api/auth로 갱신 요청에만 전송)
export const REFRESH_TOKEN_COOKIE_NAME = "refreshToken";
export const DEFAULT_REFRESH_TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export const getRefreshTokenCookieOptions = (maxAge = DEFAULT_REFRESH_TOKEN_MAX_AGE) => ({
  name: REFRESH_TOKEN_COOKIE_NAME,
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/api/auth", // 갱신 엔드포인트에서만 전송
  maxAge,
  ...(ACCESS_TOKEN_COOKIE_DOMAIN ? { domain: ACCESS_TOKEN_COOKIE_DOMAIN } : {}),
});
