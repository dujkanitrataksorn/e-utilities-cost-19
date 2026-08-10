<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from './components/layout/AppLayout.vue';

const route = useRoute();
const isPublicPage = computed(() => route.meta.public);
</script>

<template>
  <div id="app-root">
    <RouterView v-if="isPublicPage" />
    <AppLayout v-else>
      <RouterView />
    </AppLayout>
  </div>
</template>
