<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';
import MonthlyBarChart from '../components/charts/MonthlyBarChart.vue';
import CategoryPieChart from '../components/charts/CategoryPieChart.vue';

const year = ref(new Date().getFullYear());
const summary = ref({ monthlyTotals: [], cards: {} });
const byCategory = ref([]);
const loading = ref(false);

function formatBaht(n) {
  return Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function loadData() {
  loading.value = true;
  try {
    const [summaryRes, categoryRes] = await Promise.all([
      api.get('/dashboard/summary', { params: { year: year.value } }),
      api.get('/dashboard/by-category', { params: { year: year.value } }),
    ]);
    summary.value = summaryRes.data;
    byCategory.value = categoryRes.data.data;
  } finally {
    loading.value = false;
  }
}

onMounted(loadData);
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <h1 class="text-xl font-bold text-gray-800">Dashboard</h1>
      <select v-model.number="year" @change="loadData" class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm">
        <option v-for="y in [year - 1, year, year + 1]" :key="y" :value="y">ปี {{ y }}</option>
      </select>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl shadow-sm p-4">
        <p class="text-xs text-gray-500">ยอดรวมเดือนนี้</p>
        <p class="text-lg font-bold text-primary-700">฿{{ formatBaht(summary.cards.currentMonthTotal) }}</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4">
        <p class="text-xs text-gray-500">ยอดรวมเดือนก่อน</p>
        <p class="text-lg font-bold text-gray-700">฿{{ formatBaht(summary.cards.prevMonthTotal) }}</p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4">
        <p class="text-xs text-gray-500">เปลี่ยนแปลง</p>
        <p
          class="text-lg font-bold"
          :class="summary.cards.changePercent > 0 ? 'text-red-600' : 'text-green-600'"
        >
          {{ summary.cards.changePercent !== null ? summary.cards.changePercent + '%' : '-' }}
        </p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4">
        <p class="text-xs text-gray-500">ยอดรวมปีนี้</p>
        <p class="text-lg font-bold text-gray-700">฿{{ formatBaht(summary.cards.yearTotal) }}</p>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 bg-white rounded-xl shadow-sm p-4">
        <h2 class="text-sm font-semibold text-gray-700 mb-2">ยอดรายเดือน ({{ year }})</h2>
        <MonthlyBarChart :monthly-totals="summary.monthlyTotals" />
      </div>
      <div class="bg-white rounded-xl shadow-sm p-4">
        <h2 class="text-sm font-semibold text-gray-700 mb-2">สัดส่วนแยกตามประเภท</h2>
        <CategoryPieChart :data="byCategory" />
      </div>
    </div>

    <p v-if="loading" class="text-sm text-gray-400">กำลังโหลดข้อมูล...</p>
  </div>
</template>
