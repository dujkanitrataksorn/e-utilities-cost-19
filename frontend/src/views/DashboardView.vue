<script setup>
import { ref, computed, onMounted } from 'vue';
import api from '../services/api';
import { useBudgetStore } from '../stores/budget';
import MonthlyBarChart from '../components/charts/MonthlyBarChart.vue';
import CategoryPieChart from '../components/charts/CategoryPieChart.vue';

const budgetStore = useBudgetStore();
const year = ref(new Date().getFullYear());
const summary = ref({ monthlyTotals: [], cards: {} });
const byCategory = ref([]);
const loading = ref(false);

const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

const cards = computed(() => {
  const c = summary.value.cards || {};
  return [
    {
      label: 'ยอดรวมเดือนนี้',
      value: `฿${formatBaht(c.currentMonthTotal)}`,
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      bg: 'bg-primary-50 text-primary-600',
      valueClass: 'text-primary-700',
    },
    {
      label: 'ยอดรวมเดือนก่อน',
      value: `฿${formatBaht(c.prevMonthTotal)}`,
      icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4',
      bg: 'bg-violet-50 text-violet-600',
      valueClass: 'text-slate-700',
    },
    {
      label: 'เปลี่ยนแปลง',
      value: c.changePercent !== null && c.changePercent !== undefined ? `${c.changePercent}%` : '-',
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      bg: c.changePercent > 0 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-600',
      valueClass: c.changePercent > 0 ? 'text-red-600' : 'text-emerald-600',
      trend: c.changePercent > 0 ? '📈' : c.changePercent < 0 ? '📉' : '',
    },
    {
      label: 'ยอดรวมปีนี้',
      value: `฿${formatBaht(c.yearTotal)}`,
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      bg: 'bg-amber-50 text-amber-600',
      valueClass: 'text-slate-800',
    },
  ];
});

const budgetAlerts = computed(() => budgetStore.status?.alerts || []);
const budgetSummary = computed(() => budgetStore.status?.summary || []);

function formatBaht(n) {
  return Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function percentColor(p) {
  if (p == null) return 'text-slate-400';
  if (p >= 100) return 'text-red-600';
  if (p >= 80) return 'text-amber-600';
  return 'text-emerald-600';
}
function percentBar(p) {
  if (p == null) return 'bg-slate-300';
  if (p >= 100) return 'bg-red-500';
  if (p >= 80) return 'bg-amber-500';
  return 'bg-emerald-500';
}

async function loadData() {
  loading.value = true;
  try {
    const [summaryRes, categoryRes] = await Promise.all([
      api.get('/dashboard/summary', { params: { year: year.value } }),
      api.get('/dashboard/by-category', { params: { year: year.value } }),
      budgetStore.fetchStatus(year.value),
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
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Dashboard</h1>
        <p class="text-sm text-slate-500 mt-0.5">ภาพรวมค่าใช้จ่ายสาธารณูปโภค ปี {{ year }}</p>
      </div>
      <select v-model.number="year" @change="loadData" class="input-field !w-36">
        <option v-for="y in [year - 1, year, year + 1]" :key="y" :value="y">ปี {{ y }}</option>
      </select>
    </div>

    <!-- Budget alerts -->
    <div v-if="budgetAlerts.length" class="space-y-2">
      <div
        v-for="a in budgetAlerts"
        :key="a.budget_plan_id"
        :class="a.level === 'danger' ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'"
        class="flex items-center gap-3 border rounded-xl px-4 py-3 text-sm"
      >
        <span class="text-lg">{{ a.level === 'danger' ? '🚨' : '⚠️' }}</span>
        <p>
          <b>{{ a.category_name }}</b>
          <template v-if="a.month_percent != null"> — ใช้งบเดือนนี้ {{ a.month_percent }}%</template>
          <template v-if="a.year_percent != null"> · ใช้งบทั้งปี {{ a.year_percent }}%</template>
          {{ a.level === 'danger' ? '(เกินวงเงินที่กำหนด!)' : '(ใกล้ถึงวงเงินที่กำหนด)' }}
        </p>
        <RouterLink :to="{ name: 'budget-control' }" class="ml-auto underline whitespace-nowrap text-xs font-semibold">ดูรายละเอียด</RouterLink>
      </div>
    </div>

    <!-- Summary cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="card in cards" :key="card.label" class="card p-5 relative overflow-hidden">
        <div class="flex items-start justify-between">
          <p class="text-xs text-slate-500 font-medium">{{ card.label }}</p>
          <div :class="card.bg" class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" :d="card.icon" />
            </svg>
          </div>
        </div>
        <p :class="card.valueClass" class="text-xl font-bold mt-2 tracking-tight">
          {{ card.value }} <span v-if="card.trend" class="text-sm">{{ card.trend }}</span>
        </p>
      </div>
    </div>

    <!-- Charts -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div class="lg:col-span-2 card p-5">
        <h2 class="text-sm font-bold text-slate-700 mb-4">ยอดรายเดือน ({{ year }})</h2>
        <MonthlyBarChart v-if="summary.monthlyTotals?.length" :monthly-totals="summary.monthlyTotals" />
        <div v-else class="h-72 flex items-center justify-center text-slate-400 text-sm">ยังไม่มีข้อมูล</div>
      </div>
      <div class="card p-5">
        <h2 class="text-sm font-bold text-slate-700 mb-4">สัดส่วนแยกตามประเภท</h2>
        <CategoryPieChart v-if="byCategory.length" :data="byCategory" />
        <div v-else class="h-72 flex items-center justify-center text-slate-400 text-sm">ยังไม่มีข้อมูล</div>
      </div>
    </div>

    <!-- Budget usage overview -->
    <div v-if="budgetSummary.length" class="card p-5">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-sm font-bold text-slate-700">สถานะการใช้งบประมาณ</h2>
        <RouterLink :to="{ name: 'budget-control' }" class="text-xs font-semibold text-primary-600 hover:underline">จัดการวงเงิน →</RouterLink>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div v-for="s in budgetSummary" :key="s.budget_plan_id" class="border border-slate-100 rounded-xl p-4 space-y-2">
          <div class="flex items-center justify-between">
            <p class="text-sm font-semibold text-slate-700">{{ s.category_name }}</p>
            <span :class="['badge', s.level === 'danger' ? 'badge-danger' : s.level === 'warning' ? 'badge-warning' : 'badge-success']">
              {{ s.level === 'danger' ? 'เกินวงเงิน' : s.level === 'warning' ? 'ใกล้เกิน' : 'ปกติ' }}
            </span>
          </div>
          <div v-if="s.month_percent != null">
            <div class="flex justify-between text-xs text-slate-500 mb-1">
              <span>เดือนนี้ ฿{{ formatBaht(s.used_month) }} / ฿{{ formatBaht(s.monthly_limit) }}</span>
              <span :class="percentColor(s.month_percent)" class="font-bold">{{ s.month_percent }}%</span>
            </div>
            <div class="progress-track !h-2">
              <div class="progress-fill" :class="percentBar(s.month_percent)" :style="{ width: Math.min(s.month_percent, 100) + '%' }"></div>
            </div>
          </div>
          <div v-if="s.year_percent != null">
            <div class="flex justify-between text-xs text-slate-500 mb-1">
              <span>ทั้งปี ฿{{ formatBaht(s.used_year) }} / ฿{{ formatBaht(s.yearly_limit) }}</span>
              <span :class="percentColor(s.year_percent)" class="font-bold">{{ s.year_percent }}%</span>
            </div>
            <div class="progress-track !h-2">
              <div class="progress-fill" :class="percentBar(s.year_percent)" :style="{ width: Math.min(s.year_percent, 100) + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <p v-if="loading" class="text-sm text-slate-400">กำลังโหลดข้อมูล...</p>
  </div>
</template>