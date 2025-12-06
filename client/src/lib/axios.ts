import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import NProgress from "nprogress";
import { clearAccessTokenCookie } from "@/lib/session";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5001";
const isBrowser = typeof window !== "undefined";

if (isBrowser) {
  NProgress.configure({ showSpinner: false, trickleSpeed: 100 });
}

let activeRequests = 0;

const startProgress = () => {
  if (!isBrowser) return;
  activeRequests += 1;
  if (activeRequests === 1) {
    NProgress.start();
  }
};

const stopProgress = () => {
  if (!isBrowser) return;
  activeRequests = Math.max(activeRequests - 1, 0);
  if (activeRequests === 0) {
    NProgress.done();
  }
};

const redirectToLogin = () => {
  if (!isBrowser) return;
  window.location.href = "/login";
};

const requestAccessToken = async () => {
  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to refresh access token");
  }

  // Route Handler가 Set-Cookie로 accessToken을 설정하므로
  // 응답 body는 확인용으로만 사용
  const payload = await response.json();
  const token = payload?.accessToken ?? payload?.data?.accessToken;

  if (!token) {
    throw new Error("Access token missing from refresh response");
  }

  return token as string;
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 쿠키 자동 전송 (accessToken httpOnly 쿠키)
});

// 요청 인터셉터: httpOnly 쿠키는 withCredentials: true로 자동 전송됨
// Authorization 헤더 설정 불필요
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    startProgress();
    return config;
  },
  (error: AxiosError) => {
    stopProgress();
    return Promise.reject(error);
  }
);

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    stopProgress();
    return response;
  },
  async (error: AxiosError) => {
    stopProgress();

    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes("/api/auth/refresh")) {
        void clearAccessTokenCookie();
        redirectToLogin();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // 토큰 갱신 완료 후 쿠키가 자동 전송되므로 헤더 설정 불필요
            return api(originalRequest);
          })
          .catch((queueError) => Promise.reject(queueError));
      }

      isRefreshing = true;
      startProgress();
      try {
        await requestAccessToken();
        processQueue(null);

        // 토큰 갱신 완료 - 쿠키가 자동 전송되므로 헤더 설정 불필요
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        void clearAccessTokenCookie();
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        stopProgress();
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
