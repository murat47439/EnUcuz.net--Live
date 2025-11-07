import axios, { AxiosRequestConfig } from "axios";
import { refreshToken } from "./user/useAccess";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
});

// === REFRESH TOKEN MEKANİZMASI ===
let isRefreshing = false;
type QueueItem = { resolve: (value?: unknown) => void; reject: (reason?: unknown) => void };
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: unknown = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfigWithRetry;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // refresh işlemi sürüyorsa, sıraya ekle
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => api(originalRequest))
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const response = await refreshToken();

        if (!response?.success) throw new Error("Refresh failed");

        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // Refresh başarısız → kullanıcıyı login sayfasına at
        if (typeof window !== "undefined") {
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
