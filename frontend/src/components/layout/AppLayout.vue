<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';

const router = useRouter();
const auth = useAuthStore();
const sidebarCollapsed = ref(false);
const mobileMenuOpen = ref(false);

const navItems = [
  { name: 'dashboard', label: 'Dashboard', icon: '📊' },
  { name: 'expense-list', label: 'รายการค่าใช้จ่าย', icon: '💰' },
  { name: 'reports', label: 'รายงานย้อนหลัง', icon: '📈' },
  { name: 'expense-categories', label: 'ประเภทค่าใช้จ่าย', icon: '🏷️' },
  { name: 'budget-categories', label: 'หมวดเงิน', icon: '🗂️' },
];

async function handleLogout() {
  await auth.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="min-h-screen flex">
    <!-- Sidebar: Desktop / Tablet (collapsible) -->
    <aside
      :class="[
        'hidden md:flex flex-col bg-white border-r border-gray-200 transition-all duration-200',
        sidebarCollapsed ? 'md:w-16' : 'md:w-60',
      ]"
    >
      <div class="p-4 flex items-center justify-between">
        <span v-if="!sidebarCollapsed" class="font-bold text-primary-700 text-sm">e-Utilities Cost</span>
        <button @click="sidebarCollapsed = !sidebarCollapsed" class="text-gray-500">☰</button>
      </div>
      <nav class="flex-1 px-2 space-y-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="{ name: item.name }"
          class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-700"
          active-class="bg-primary-100 text-primary-700 font-medium"
        >
          <span>{{ item.icon }}</span>
          <span v-if="!sidebarCollapsed">{{ item.label }}</span>
        </RouterLink>
      </nav>
      <div class="p-3">
        <button
          @click="handleLogout"
          class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
        >
          🚪 <span v-if="!sidebarCollapsed">ออกจากระบบ</span>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-h-screen">
      <!-- Mobile top bar -->
      <header class="md:hidden flex items-center justify-between bg-white border-b px-4 py-3 sticky top-0 z-10">
        <span class="font-bold text-primary-700">e-Utilities Cost</span>
        <button @click="mobileMenuOpen = true" class="text-2xl">☰</button>
      </header>

      <main class="flex-1 p-4 pb-20 md:pb-4">
        <slot />
      </main>

      <!-- Mobile bottom nav -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2 z-10">
        <RouterLink
          v-for="item in navItems.slice(0, 4)"
          :key="item.name"
          :to="{ name: item.name }"
          class="flex flex-col items-center text-xs text-gray-500"
          active-class="text-primary-600 font-medium"
        >
          <span class="text-lg">{{ item.icon }}</span>
          {{ item.label }}
        </RouterLink>
      </nav>

      <!-- Mobile drawer menu (extra items) -->
      <div v-if="mobileMenuOpen" class="fixed inset-0 z-20 md:hidden">
        <div class="absolute inset-0 bg-black/40" @click="mobileMenuOpen = false"></div>
        <div class="absolute right-0 top-0 bottom-0 w-64 bg-white p-4 shadow-xl">
          <button @click="mobileMenuOpen = false" class="mb-4 text-gray-500">✕ ปิด</button>
          <nav class="space-y-1">
            <RouterLink
              v-for="item in navItems"
              :key="item.name"
              :to="{ name: item.name }"
              @click="mobileMenuOpen = false"
              class="block px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-primary-50"
              active-class="bg-primary-100 text-primary-700 font-medium"
            >
              {{ item.icon }} {{ item.label }}
            </RouterLink>
            <button
              @click="handleLogout"
              class="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              🚪 ออกจากระบบ
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>
