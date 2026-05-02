import "server-only";
import { auth } from "@/auth";
import { signProxyJwt } from "@/lib/server/proxyJwt";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

interface FetchWithAuthOptions extends RequestInit {
  cache?: RequestCache;
}

const UNAUTHORIZED_ERROR = "UNAUTHORIZED";

export class FetchWithAuthError extends Error {
  constructor(
    message: string,
    public status?: number
  ) {
    super(message);
  }
}

/**
 * Server Component / Route Handler 에서 Express 호출 시 사용.
 * NextAuth 세션 → PROXY_JWT → Bearer 헤더로 전달.
 */
export const fetchWithAuth = async (
  path: string,
  options: FetchWithAuthOptions = {}
) => {
  const session = await auth();

  const requestHeaders = new Headers(options.headers);

  if (session?.user?.id) {
    const token = await signProxyJwt({
      userId: session.user.id,
      email: session.user.email ?? undefined,
    });
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: requestHeaders,
    cache: options.cache ?? "no-store",
  });

  if (response.status === 401) {
    throw new FetchWithAuthError(UNAUTHORIZED_ERROR, 401);
  }

  if (!response.ok) {
    throw new FetchWithAuthError(
      `Failed to fetch ${path}: ${response.statusText}`,
      response.status
    );
  }

  return response;
};
