<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const currentYear = new Date().getFullYear();
const year1 = ref(currentYear - 1);
const year2 = ref(currentYear);
const result = ref(null);
const loading = ref(false);

const monthShort = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

const chartData = computed(() => {
  if (!result.value) return null;
  return {
    labels: monthShort,
    datasets: [
      {
        label: `ปี ${result.value.year1}`,
        backgroundColor: '#93c5fd',
        borderRadius: 4,
        data: result.value.monthly.map((m) => m[`year_${result.value.year1}`]),
      },
      {
        label: `ปี ${result.value.year2}`,
        backgroundColor: '#2563eb',
        borderRadius: 4,
        data: result.value.monthly.map((m) => m[`year_${result.value.year2}`]),
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' } },
  scales: { y: { beginAtZero: true } },
};

const diffTotal = computed(() => {
  if (!result.value) return 0;
  return result.value.totals[`year_${result.value.year2}`] - result.value.totals[`year_${result.value.year1}`];
});

function formatBaht(n) {
  return Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function loadCompare() {
  loading.value = true;
  try {
    const res = await api.get('/dashboard/compare', { params: { year1: year1.value, year2: year2.value } });
    result.value = res.data;
  } finally {
    loading.value = false;
  }
}

onMounted(loadCompare);
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-800">รายงานย้อนหลัง / เปรียบเทียบปี</h1>
      <p class="text-sm text-slate-500 mt-0.5">เปรียบเทียบยอดค่าใช้จ่ายรายเดือนระหว่างสองปี</p>
    </div>

    <!-- Filter -->
    <div class="card p-4 flex flex-wrap items-end gap-3">
      <div>
        <label class="form-label">ปีที่ 1</label>
        <input v-model.number="year1" type="number" class="input-field !w-32" />
      </div>
      <div>
        <label class="form-label">ปีที่ 2</label>
        <input v-model.number="year2" type="number" class="input-field !w-32" />
      </div>
      <button @click="loadCompare" class="btn-primary">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
        </svg>
        เปรียบเทียบ
      </button>
    </div>

    <template v-if="result">
      <!-- Summary -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="card p-5">
          <p class="text-xs text-slate-500 font-medium">รวมปี {{ result.year1 }}</p>
          <p class="text-xl font-bold text-slate-600 mt-1">฿{{ formatBaht(result.totals[`year_${result.year1}`]) }}</p>
        </div>
        <div class="card p-5">
          <p class="text-xs text-slate-500 font-medium">รวมปี {{ result.year2 }}</p>
          <p class="text-xl font-bold text-primary-700 mt-1">฿{{ formatBaht(result.totals[`year_${result.year2}`]) }}</p>
        </div>
        <div class="card p-5">
          <p class="text-xs text-slate-500 font-medium">ผลต่างรวม ({{ result.year2 }} vs {{ result.year1 }})</p>
          <p :class="diffTotal > 0 ? 'text-red-600' : diffTotal < 0 ? 'text-emerald-600' : 'text-slate-600'" class="text-xl font-bold mt-1">
            {{ diffTotal >= 0 ? '+' : '' }}฿{{ formatBaht(diffTotal) }}
          </p>
        </div>
      </div>

      <!-- Comparison chart -->
      <div class="card p-5">
        <h2 class="text-sm font-bold text-slate-700 mb-4">กราฟเปรียบเทียบรายเดือน</h2>
        <div class="h-72">
          <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
        </div>
      </div>

      <!-- Table -->
      <div class="card overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
            <tr>
              <th class="text-left px-5 py-3.5 font-semibold">เดือน</th>
              <th class="text-right px-5 py-3.5 font-semibold">ปี {{ result.year1 }}</th>
              <th class="text-right px-5 py-3.5 font-semibold">ปี {{ result.year2 }}</th>
              <th class="text-right px-5 py-3.5 font-semibold">ผลต่าง</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="m in result.monthly" :key="m.month" class="hover:bg-primary-50/40 transition-colors">
              <td class="px-5 py-3 font-medium text-slate-700">{{ monthShort[m.month - 1] }}</td>
              <td class="px-5 py-3 text-right text-slate-600">฿{{ formatBaht(m[`year_${result.year1}`]) }}</td>
              <td class="px-5 py-3 text-right text-slate-600">฿{{ formatBaht(m[`year_${result.year2}`]) }}</td>
              <td
                class="px-5 py-3 text-right font-semibold"
                :class="m[`year_${result.year2}`] - m[`year_${result.year1}`] > 0 ? 'text-red-600' : m[`year_${result.year2}`] - m[`year_${result.year1}`] < 0 ? 'text-emerald-600' : 'text-slate-400'"
              >
                {{ (m[`year_${result.year2}`] - m[`year_${result.year1}`]) >= 0 ? '+' : '' }}฿{{ formatBaht(m[`year_${result.year2}`] - m[`year_${result.year1}`]) }}
              </td>
            </tr>
          </tbody>
          <tfoot class="bg-slate-50 font-bold">
            <tr>
              <td class="px-5 py-3.5 text-slate-700">รวมทั้งปี</td>
              <td class="px-5 py-3.5 text-right text-slate-700">฿{{ formatBaht(result.totals[`year_${result.year1}`]) }}</td>
              <td class="px-5 py-3.5 text-right text-primary-700">฿{{ formatBaht(result.totals[`year_${result.year2}`]) }}</td>
              <td class="px-5 py-3.5 text-right" :class="diffTotal > 0 ? 'text-red-600' : diffTotal < 0 ? 'text-emerald-600' : 'text-slate-400'">
                {{ diffTotal >= 0 ? '+' : '' }}฿{{ formatBaht(diffTotal) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </template>

    <p v-if="loading" class="text-sm text-slate-400">กำลังโหลดข้อมูล...</p>
  </div>
</template>