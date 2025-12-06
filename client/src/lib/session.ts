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

// httpOnly 쿠키로 변경되어 JavaScript에서 접근 불가
// 인증 상태 확인은 서버 API (/api/auth/me) 호출로 대체
// 이 함수는 하위 호환을 위해 유지하되 항상 null 반환
/** @deprecated httpOnly 쿠키로 변경되어 더 이상 사용되지 않음 */
export const getClientAccessToken = (): string | null => {
  return null;
};
