import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { signProxyJwt } from "@/lib/server/proxyJwt";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

const HOP_BY_HOP = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailers",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

const buildForwardHeaders = (request: NextRequest, bearer?: string) => {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return;
    if (key.toLowerCase() === "cookie") return;
    if (key.toLowerCase() === "authorization") return;
    headers.set(key, value);
  });
  if (bearer) headers.set("authorization", `Bearer ${bearer}`);
  return headers;
};

const proxy = async (
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) => {
  const { path } = await context.params;
  const session = await auth();

  // 인증 없는 요청은 그대로 (Bearer 없이) 전달 — Express 가 401 결정
  let bearer: string | undefined;
  if (session?.user?.id) {
    bearer = await signProxyJwt({
      userId: session.user.id,
      email: session.user.email ?? undefined,
    });
  }

  const targetUrl = `${API_BASE_URL}/api/${path.join("/")}${request.nextUrl.search}`;

  const init: RequestInit = {
    method: request.method,
    headers: buildForwardHeaders(request, bearer),
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    init.body = await request.arrayBuffer();
    (init as { duplex?: string }).duplex = "half";
  }

  const upstream = await fetch(targetUrl, init);

  const responseHeaders = new Headers();
  upstream.headers.forEach((value, key) => {
    if (HOP_BY_HOP.has(key.toLowerCase())) return;
    responseHeaders.append(key, value);
  });

  return new NextResponse(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders,
  });
};

export const GET = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
