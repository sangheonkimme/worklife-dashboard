import { NextRequest, NextResponse } from "next/server";
import {
  ACCESS_TOKEN_COOKIE_NAME,
  DEFAULT_ACCESS_TOKEN_MAX_AGE,
} from "@/lib/constants/auth";

const SESSION_SUCCESS = { success: true };

const createResponseWithToken = (token: string, maxAge: number) => {
  const response = NextResponse.json(SESSION_SUCCESS);
  response.cookies.set({
    name: ACCESS_TOKEN_COOKIE_NAME,
    value: token,
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
  return response;
};

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.accessToken) {
    return NextResponse.json(
      { success: false, message: "Missing access token" },
      { status: 400 }
    );
  }

  const rememberMe = Boolean(body.rememberMe);
  const maxAge = rememberMe
    ? 7 * 24 * 60 * 60
    : DEFAULT_ACCESS_TOKEN_MAX_AGE;

  return createResponseWithToken(body.accessToken, maxAge);
}

export async function DELETE() {
  const response = NextResponse.json(SESSION_SUCCESS);
  response.cookies.delete(ACCESS_TOKEN_COOKIE_NAME);
  return response;
}
