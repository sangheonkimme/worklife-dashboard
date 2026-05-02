import axios, {
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import NProgress from "nprogress";

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

// 모든 요청은 Next.js Route Handler 프록시 (/api/*) 경유
// 프록시가 NextAuth 세션 → PROXY_JWT 변환해서 Express 로 전달
export const api = axios.create({
  baseURL: "",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

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

api.interceptors.response.use(
  (response) => {
    stopProgress();
    return response;
  },
  (error: AxiosError) => {
    stopProgress();
    if (error.response?.status === 401) {
      redirectToLogin();
    }
    return Promise.reject(error);
  }
);

export default api;
