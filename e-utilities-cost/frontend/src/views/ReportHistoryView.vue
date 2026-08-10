<script setup>
import { ref, onMounted } from 'vue';
import api from '../services/api';

const currentYear = new Date().getFullYear();
const year1 = ref(currentYear - 1);
const year2 = ref(currentYear);
const result = ref(null);
const loading = ref(false);

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
  <div class="space-y-4">
    <h1 class="text-xl font-bold text-gray-800">รายงานย้อนหลัง / เปรียบเทียบปี</h1>

    <div class="bg-white rounded-xl shadow-sm p-4 flex flex-wrap items-end gap-3">
      <div>
        <label class="block text-xs text-gray-500 mb-1">ปีที่ 1</label>
        <input v-model.number="year1" type="number" class="border rounded-lg px-3 py-1.5 text-sm w-28" />
      </div>
      <div>
        <label class="block text-xs text-gray-500 mb-1">ปีที่ 2</label>
        <input v-model.number="year2" type="number" class="border rounded-lg px-3 py-1.5 text-sm w-28" />
      </div>
      <button @click="loadCompare" class="bg-primary-600 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-primary-700">
        เปรียบเทียบ
      </button>
    </div>

    <div v-if="result" class="bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-600">
          <tr>
            <th class="text-left px-4 py-2">เดือน</th>
            <th class="text-right px-4 py-2">ปี {{ result.year1 }}</th>
            <th class="text-right px-4 py-2">ปี {{ result.year2 }}</th>
            <th class="text-right px-4 py-2">ผลต่าง</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in result.monthly" :key="m.month" class="border-t">
            <td class="px-4 py-2">เดือน {{ m.month }}</td>
            <td class="px-4 py-2 text-right">฿{{ formatBaht(m[`year_${result.year1}`]) }}</td>
            <td class="px-4 py-2 text-right">฿{{ formatBaht(m[`year_${result.year2}`]) }}</td>
            <td
              class="px-4 py-2 text-right"
              :class="m[`year_${result.year2}`] - m[`year_${result.year1}`] > 0 ? 'text-red-600' : 'text-green-600'"
            >
              {{ (m[`year_${result.year2}`] - m[`year_${result.year1}`]) >= 0 ? '+' : '' }}฿{{ formatBaht(m[`year_${result.year2}`] - m[`year_${result.year1}`]) }}
            </td>
          </tr>
        </tbody>
        <tfoot class="bg-gray-50 font-medium">
          <tr>
            <td class="px-4 py-2">รวมทั้งปี</td>
            <td class="px-4 py-2 text-right">฿{{ formatBaht(result.totals[`year_${result.year1}`]) }}</td>
            <td class="px-4 py-2 text-right">฿{{ formatBaht(result.totals[`year_${result.year2}`]) }}</td>
            <td class="px-4 py-2 text-right">-</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <p v-if="loading" class="text-sm text-gray-400">กำลังโหลดข้อมูล...</p>
  </div>
</template>
