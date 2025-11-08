import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import NProgress from "nprogress";
import "@/styles/nprogress.css";

NProgress.configure({ showSpinner: false, trickleSpeed: 100 });

let activeRequests = 0;

const startProgress = () => {
  activeRequests += 1;
  if (activeRequests === 1) {
    NProgress.start();
  }
};

const stopProgress = () => {
  activeRequests = Math.max(activeRequests - 1, 0);
  if (activeRequests === 0) {
    NProgress.done();
  }
};

// Axios 인스턴스 생성
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5001",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 쿠키 전송을 위해 필요
});

// 요청 인터셉터: 토큰 자동 추가
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    startProgress();

    const token = localStorage.getItem("accessToken");

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    stopProgress();
    return Promise.reject(error);
  }
);

// 토큰 갱신 상태 관리
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// 응답 인터셉터: 에러 처리 및 토큰 갱신
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

    // 401 에러이고 재시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      // refresh 요청 자체가 실패한 경우 로그아웃
      if (originalRequest.url?.includes("/api/auth/refresh")) {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // 이미 토큰 갱신 중이면 대기
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      startProgress();
      try {
        // 리프레시 토큰으로 새 액세스 토큰 요청
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { data } = response.data || {};
        const accessToken = data?.accessToken;

        if (!accessToken) {
          throw new Error(
            "Failed to retrieve access token from refresh response"
          );
        }
        localStorage.setItem("accessToken", accessToken);

        // 대기 중인 요청들 처리
        processQueue(null, accessToken);

        // 원래 요청에 새 토큰 추가
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        // 원래 요청 재시도
        return api(originalRequest);
      } catch (refreshError) {
        // 리프레시 토큰도 만료된 경우 로그아웃 처리
        processQueue(refreshError, null);
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
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
