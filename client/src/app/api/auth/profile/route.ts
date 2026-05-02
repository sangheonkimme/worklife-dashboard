import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { signProxyJwt } from "@/lib/server/proxyJwt";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";

const forward = async (request: NextRequest, method: "PUT" | "GET") => {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, message: "인증이 필요합니다" },
      { status: 401 }
    );
  }

  const token = await signProxyJwt({
    userId: session.user.id,
    email: session.user.email ?? undefined,
  });

  const upstream = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    method,
    headers: {
      "content-type":
        request.headers.get("content-type") ?? "application/json",
      authorization: `Bearer ${token}`,
    },
    body: method === "GET" ? undefined : await request.text(),
  });

  const data = await upstream.json().catch(() => ({}));
  return NextResponse.json(data, { status: upstream.status });
};

export const PUT = (request: NextRequest) => forward(request, "PUT");
export const GET = (request: NextRequest) => forward(request, "GET");
