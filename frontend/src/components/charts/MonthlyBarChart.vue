<script setup>
import { computed } from 'vue';
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

const props = defineProps({
  monthlyTotals: { type: Array, required: true }, // [{month, total}]
});

const monthLabels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

function baht(n) {
  return Number(n || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 });
}

const chartData = computed(() => ({
  labels: monthLabels,
  datasets: [
    {
      label: 'ยอดรวมรายเดือน (บาท)',
      backgroundColor: (ctx) => {
        const { chart } = ctx;
        if (!chart.chartArea) return '#3b82f6';
        const gradient = chart.ctx.createLinearGradient(0, chart.chartArea.bottom, 0, chart.chartArea.top);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
        gradient.addColorStop(1, '#2563eb');
        return gradient;
      },
      borderRadius: 8,
      borderSkipped: false,
      maxBarThickness: 42,
      data: props.monthlyTotals.map((m) => m.total),
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      padding: 12,
      cornerRadius: 10,
      titleFont: { size: 13 },
      bodyFont: { size: 13, weight: 'bold' },
      callbacks: {
        label: (ctx) => ` ฿${baht(ctx.parsed.y)}`,
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      border: { display: false },
      grid: { color: 'rgba(148, 163, 184, 0.15)' },
      ticks: {
        callback: (v) => (v >= 1000 ? `${v / 1000}k` : v),
        color: '#94a3b8',
        font: { size: 11 },
      },
    },
    x: {
      border: { display: false },
      grid: { display: false },
      ticks: { color: '#64748b', font: { size: 11 } },
    },
  },
};
</script>

<template>
  <div class="h-72">
    <Bar :data="chartData" :options="chartOptions" />
  </div>
</template>