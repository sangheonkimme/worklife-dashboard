const SESSION_ENDPOINT = "/api/auth/session";

const setCookie = async (accessToken: string, rememberMe?: boolean) => {
  await fetch(SESSION_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ accessToken, rememberMe }),
    credentials: "include",
  });
};

const deleteCookie = async () => {
  await fetch(SESSION_ENDPOINT, {
    method: "DELETE",
    credentials: "include",
  });
};

export const persistAccessToken = async (
  accessToken: string,
  rememberMe?: boolean
) => {
  return setCookie(accessToken, rememberMe);
};

export const clearAccessTokenCookie = async () => {
  return deleteCookie();
};

export const getClientAccessToken = (): string | null => {
  if (typeof document === "undefined") {
    return null;
  }

  const match = document.cookie.match(/(?:^|; )accessToken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
};
