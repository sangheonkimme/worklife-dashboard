import "server-only";
import { cookies, headers } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

interface FetchWithAuthOptions extends RequestInit {
  cache?: RequestCache;
  target?: "backend" | "proxy";
}

const UNAUTHORIZED_ERROR = "UNAUTHORIZED";

export class FetchWithAuthError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

export const fetchWithAuth = async (
  path: string,
  options: FetchWithAuthOptions = {}
) => {
  const cookieStore = await cookies();
  const incomingHeaders = await headers();

  const requestHeaders = new Headers(options.headers);
  const token = cookieStore.get("accessToken")?.value;
  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  const forwardedCookies = incomingHeaders.get("cookie");
  if (forwardedCookies) {
    requestHeaders.set("Cookie", forwardedCookies);
  }

  const target = options.target ?? "backend";
  const protocol = incomingHeaders.get("x-forwarded-proto") ?? "http";
  const host = incomingHeaders.get("host");
  const proxyBase = host ? `${protocol}://${host}` : "";
  const baseUrl = target === "proxy" ? proxyBase : API_BASE_URL;

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: requestHeaders,
    cache: options.cache ?? "no-store",
    credentials: "include",
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
