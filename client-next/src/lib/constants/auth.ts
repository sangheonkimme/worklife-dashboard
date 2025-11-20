export const ACCESS_TOKEN_COOKIE_NAME = "accessToken";
export const DEFAULT_ACCESS_TOKEN_MAX_AGE = 60 * 15; // 15 minutes

export const getAccessTokenCookieOptions = (maxAge = DEFAULT_ACCESS_TOKEN_MAX_AGE) => ({
  name: ACCESS_TOKEN_COOKIE_NAME,
  httpOnly: false,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge,
});
