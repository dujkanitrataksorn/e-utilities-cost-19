<script setup>
import { computed } from 'vue';
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const props = defineProps({
  data: { type: Array, required: true }, // [{name, total}]
});

const colors = ['#3b82f6', '#f97316', '#22c55e', '#eab308', '#a855f7', '#ef4444', '#06b6d4'];

const chartData = computed(() => ({
  labels: props.data.map((d) => d.name),
  datasets: [
    {
      backgroundColor: colors,
      data: props.data.map((d) => d.total),
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom' } },
};
</script>

<template>
  <div class="h-72">
    <Pie :data="chartData" :options="chartOptions" />
  </div>
</template>
