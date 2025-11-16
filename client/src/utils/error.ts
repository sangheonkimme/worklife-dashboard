import { isAxiosError } from "axios";

type ErrorPayload = {
  message?: string;
};

/**
 * Extracts a human-readable error message from various error objects.
 * Falls back to the provided default when no specific message is available.
 */
export const getApiErrorMessage = (
  error: unknown,
  fallback: string
): string => {
  if (isAxiosError<ErrorPayload>(error)) {
    const data = error.response?.data;
    if (data && typeof data === "object" && "message" in data && data.message) {
      return data.message;
    }
    if (typeof data === "string" && data.trim().length > 0) {
      return data;
    }
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};
