import { defineStore } from 'pinia';
import api from '../services/api';

export const useBudgetStore = defineStore('budget', {
  state: () => ({
    plans: [],
    status: { summary: [], alerts: [] },
    loading: false,
  }),
  actions: {
    async fetchPlans(year) {
      this.loading = true;
      try {
        const res = await api.get('/budget-plans', { params: { year } });
        this.plans = res.data.data;
      } finally {
        this.loading = false;
      }
    },
    async fetchStatus(year, month) {
      const res = await api.get('/budget-plans/status', { params: { year, month } });
      this.status = res.data;
      return res.data;
    },
    async create(payload) {
      const res = await api.post('/budget-plans', payload);
      return res.data;
    },
    async update(id, payload) {
      const res = await api.put(`/budget-plans/${id}`, payload);
      return res.data;
    },
    async remove(id) {
      await api.delete(`/budget-plans/${id}`);
    },
  },
});