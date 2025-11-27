import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import type { User } from "@/types";
import { fetchWithAuth, FetchWithAuthError } from "@/lib/server/fetchWithAuth";

const AUTH_ME_ENDPOINT = "/api/auth/me";

export const getCurrentUser = cache(async (): Promise<User> => {
  const response = await fetchWithAuth(AUTH_ME_ENDPOINT, {
    target: "proxy",
  });
  const payload = await response.json();
  return payload?.data ?? payload;
});

export const requireAuthenticatedUser = async (): Promise<User> => {
  try {
    return await getCurrentUser();
  } catch (error) {
    if (
      error instanceof FetchWithAuthError &&
      error.message === "UNAUTHORIZED"
    ) {
      redirect("/login");
    }
    throw error;
  }
};
