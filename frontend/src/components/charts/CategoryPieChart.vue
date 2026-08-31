<script setup>
import { computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const props = defineProps({
  data: { type: Array, required: true }, // [{name, total}]
});

const colors = ['#2563eb', '#f97316', '#10b981', '#eab308', '#a855f7', '#ef4444', '#06b6d4', '#ec4899', '#84cc16'];

function baht(n) {
  return Number(n || 0).toLocaleString('th-TH', { maximumFractionDigits: 0 });
}

const total = computed(() => props.data.reduce((sum, d) => sum + Number(d.total || 0), 0));

const chartData = computed(() => ({
  labels: props.data.map((d) => d.name),
  datasets: [
    {
      backgroundColor: colors,
      borderWidth: 3,
      borderColor: '#ffffff',
      hoverOffset: 8,
      data: props.data.map((d) => d.total),
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '62%',
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        usePointStyle: true,
        pointStyle: 'circle',
        padding: 14,
        color: '#475569',
        font: { size: 11 },
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      padding: 12,
      cornerRadius: 10,
      callbacks: {
        label: (ctx) => {
          const pct = total.value ? ((ctx.parsed / total.value) * 100).toFixed(1) : 0;
          return ` ฿${baht(ctx.parsed)} (${pct}%)`;
        },
      },
    },
  },
};
</script>

<template>
  <div class="h-72">
    <Doughnut :data="chartData" :options="chartOptions" />
  </div>
</template>