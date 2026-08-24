import axios from 'axios';
import { useAuthStore } from '../stores/auth';

const defaultApiBaseUrl = (() => {
  const { hostname, port } = window.location;

  if (hostname === 'localhost' && port === '5173') {
    return 'http://localhost:3000/api';
  }

  if (hostname === 'localhost' && (port === '8080' || port === '30049')) {
    return 'http://localhost:30050/api';
  }

  return 'http://localhost:30050/api';
})();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl,
  withCredentials: true, // ส่ง httpOnly cookie (refresh token) ไปด้วย
});

// แนบ accessToken ทุก request
api.interceptors.request.use((config) => {
  const auth = useAuthStore();
  if (auth.accessToken) {
    config.headers.Authorization = `Bearer ${auth.accessToken}`;
  }
  return config;
});

// ถ้า accessToken หมดอายุ (401) -> ลอง refresh อัตโนมัติ 1 ครั้ง
let isRefreshing = false;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const auth = useAuthStore();
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshing) {
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshed = await auth.refreshAccessToken();
        isRefreshing = false;
        if (refreshed) {
          originalRequest.headers.Authorization = `Bearer ${auth.accessToken}`;
          return api(originalRequest);
        }
      } catch (e) {
        isRefreshing = false;
      }
      auth.logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
