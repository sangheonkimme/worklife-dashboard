import { NextResponse } from "next/server";
import { fetchWithAuth, FetchWithAuthError } from "@/lib/server/fetchWithAuth";

export async function GET() {
  try {
    const apiResponse = await fetchWithAuth("/api/auth/me");
    const payload = await apiResponse.json();
    return NextResponse.json(payload, { status: apiResponse.status });
  } catch (error) {
    if (error instanceof FetchWithAuthError) {
      return NextResponse.json(
        {
          success: false,
          message: error.message,
        },
        { status: error.status ?? 500 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Failed to load profile",
      },
      { status: 500 }
    );
  }
}
