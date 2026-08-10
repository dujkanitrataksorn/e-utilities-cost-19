import { defineStore } from 'pinia';
import api from '../services/api';

export const useExpenseStore = defineStore('expense', {
  state: () => ({
    items: [],
    pagination: { total: 0, page: 1, limit: 20, totalPages: 1 },
    loading: false,
  }),
  actions: {
    async fetchAll(params = {}) {
      this.loading = true;
      try {
        const res = await api.get('/expenses', { params });
        this.items = res.data.data;
        this.pagination = res.data.pagination;
      } finally {
        this.loading = false;
      }
    },
    async create(payload) {
      const res = await api.post('/expenses', payload);
      return res.data;
    },
    async update(id, payload) {
      const res = await api.put(`/expenses/${id}`, payload);
      return res.data;
    },
    async remove(id) {
      await api.delete(`/expenses/${id}`);
    },
  },
});
