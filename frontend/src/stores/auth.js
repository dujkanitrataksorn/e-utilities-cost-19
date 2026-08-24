import { defineStore } from 'pinia';
import axios from 'axios';

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

const baseURL = import.meta.env.VITE_API_BASE_URL || defaultApiBaseUrl;

export const useAuthStore = defineStore('auth', {
  state: () => ({
    accessToken: null, // เก็บใน memory เท่านั้น ไม่ใช้ localStorage เพื่อลดความเสี่ยง XSS
    user: null,
  }),
  getters: {
    isAuthenticated: (state) => !!state.accessToken,
  },
  actions: {
    async login(username, password) {
      const res = await axios.post(
        `${baseURL}/auth/login`,
        { username, password },
        { withCredentials: true }
      );
      this.accessToken = res.data.accessToken;
      this.user = res.data.user;
      return res.data;
    },

    async refreshAccessToken() {
      try {
        const res = await axios.post(
          `${baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        this.accessToken = res.data.accessToken;
        return true;
      } catch (e) {
        this.accessToken = null;
        this.user = null;
        return false;
      }
    },

    async fetchMe() {
      const res = await axios.get(`${baseURL}/auth/me`, {
        headers: { Authorization: `Bearer ${this.accessToken}` },
      });
      this.user = res.data;
      return res.data;
    },

    async logout() {
      try {
        await axios.post(`${baseURL}/auth/logout`, {}, { withCredentials: true });
      } catch (e) {
        // ignore
      }
      this.accessToken = null;
      this.user = null;
    },
  },
});
