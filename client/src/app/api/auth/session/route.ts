import { NextRequest, NextResponse } from "next/server";
import {
  DEFAULT_ACCESS_TOKEN_MAX_AGE,
  getAccessTokenCookieOptions,
} from "@/lib/constants/auth";

const SESSION_SUCCESS = { success: true };

const createResponseWithToken = (token: string, maxAge: number) => {
  const response = NextResponse.json(SESSION_SUCCESS);
  response.cookies.set({
    ...getAccessTokenCookieOptions(maxAge),
    value: token,
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
  response.cookies.set({
    ...getAccessTokenCookieOptions(0),
    value: "",
    maxAge: 0,
  });
  return response;
}
