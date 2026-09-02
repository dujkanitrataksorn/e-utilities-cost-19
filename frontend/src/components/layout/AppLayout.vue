<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import Logo from '../Logo.vue';

const router = useRouter();
const auth = useAuthStore();
const sidebarCollapsed = ref(false);
const mobileMenuOpen = ref(false);

const navItems = [
  { name: 'dashboard', label: 'Dashboard', icon: 'M3 12l9-9 9 9M5 10v10a1 1 0 001 1h3m10-11v10a1 1 0 01-1 1h-3m-6 0h6' },
  { name: 'expense-list', label: 'รายการค่าใช้จ่าย', icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { name: 'budget-control', label: 'ควบคุมค่าใช้จ่าย', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { name: 'reports', label: 'รายงานย้อนหลัง', icon: 'M9 17v-2m3 3v-6m3 3v-8M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z' },
];

const settingItems = [
  { name: 'expense-categories', label: 'ประเภทค่าใช้จ่าย', icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z' },
  { name: 'budget-categories', label: 'หมวดเงิน', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
];

const adminItems = [
  { name: 'admin-panel', label: 'Admin Panel', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M12 15a3 3 0 100-6 3 3 0 000 6z' },
];

async function handleLogout() {
  await auth.logout();
  router.push({ name: 'login' });
}
</script>

<template>
  <div class="min-h-screen flex bg-slate-100">
    <!-- Sidebar: Desktop / Tablet (collapsible) -->
    <aside
      :class="[
        'hidden md:flex flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-primary-900 text-white transition-all duration-300 shrink-0',
        sidebarCollapsed ? 'md:w-[68px]' : 'md:w-64',
      ]"
    >
      <!-- Brand -->
      <div class="px-4 py-5 flex items-center gap-3 border-b border-white/10">
        <Logo size="sm" />
        <div v-if="!sidebarCollapsed" class="leading-tight overflow-hidden whitespace-nowrap">
          <p class="font-bold text-sm">e-Utilities Cost</p>
          <p class="text-[10px] text-slate-400">ระบบควบคุมค่าใช้จ่าย</p>
        </div>
        <button
          @click="sidebarCollapsed = !sidebarCollapsed"
          class="ml-auto text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10"
          :class="{ '!ml-0': sidebarCollapsed }"
        >
          <svg class="w-4 h-4 transition-transform" :class="sidebarCollapsed ? 'rotate-180' : ''" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <!-- Main nav -->
      <nav class="flex-1 px-3 pt-4 space-y-1 overflow-y-auto">
        <p v-if="!sidebarCollapsed" class="px-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">เมนูหลัก</p>
        <RouterLink
          v-for="item in navItems"
          :key="item.name"
          :to="{ name: item.name }"
          class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-all"
          active-class="!bg-primary-600 !text-white font-semibold shadow-lg shadow-primary-600/30"
        >
          <svg class="w-5 h-5 shrink-0 opacity-80 group-hover:opacity-100" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
          </svg>
          <span v-if="!sidebarCollapsed" class="whitespace-nowrap">{{ item.label }}</span>
        </RouterLink>

        <p v-if="!sidebarCollapsed" class="px-3 pt-5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">ตั้งค่า</p>
        <template v-if="!sidebarCollapsed">
          <RouterLink
            v-for="item in settingItems"
            :key="item.name"
            :to="{ name: item.name }"
            class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            active-class="!bg-primary-600 !text-white font-semibold shadow-lg shadow-primary-600/30"
          >
            <svg class="w-5 h-5 shrink-0 opacity-80 group-hover:opacity-100" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
            </svg>
            <span class="whitespace-nowrap">{{ item.label }}</span>
          </RouterLink>
        </template>
        <template v-else>
          <RouterLink
            v-for="item in settingItems"
            :key="item.name"
            :to="{ name: item.name }"
            class="group flex items-center justify-center px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-all"
            active-class="!bg-primary-600 !text-white"
          >
            <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
            </svg>
          </RouterLink>
        </template>

        <!-- Admin section (only for admin users) -->
        <template v-if="auth.isAdmin">
          <p v-if="!sidebarCollapsed" class="px-3 pt-5 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">ผู้ดูแลระบบ</p>
          <template v-if="!sidebarCollapsed">
            <RouterLink
              v-for="item in adminItems"
              :key="item.name"
              :to="{ name: item.name }"
              class="group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-yellow-500/20 hover:text-yellow-300 transition-all"
              active-class="!bg-yellow-600 !text-white font-semibold shadow-lg shadow-yellow-600/30"
            >
              <svg class="w-5 h-5 shrink-0 opacity-80 group-hover:opacity-100" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
              </svg>
              <span class="whitespace-nowrap">{{ item.label }}</span>
            </RouterLink>
          </template>
          <template v-else>
            <RouterLink
              v-for="item in adminItems"
              :key="item.name"
              :to="{ name: item.name }"
              class="group flex items-center justify-center px-3 py-2.5 rounded-xl text-sm text-slate-300 hover:bg-yellow-500/20 hover:text-yellow-300 transition-all"
              active-class="!bg-yellow-600 !text-white"
            >
              <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
              </svg>
            </RouterLink>
          </template>
        </template>
      </nav>

      <!-- User + logout -->
      <div class="p-3 border-t border-white/10">
        <div v-if="!sidebarCollapsed && auth.user" class="flex items-center gap-3 px-3 py-2 mb-1">
          <div class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-primary-200">
            {{ (auth.user.full_name || auth.user.username || '?').charAt(0) }}
          </div>
          <div class="leading-tight overflow-hidden">
            <p class="text-xs font-semibold truncate">{{ auth.user.full_name || auth.user.username }}</p>
            <p class="text-[10px] text-slate-400">{{ auth.user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ผู้ใช้งาน' }}</p>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-300 hover:bg-red-500/20 hover:text-red-200 rounded-xl transition"
        >
          <svg class="w-5 h-5 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span v-if="!sidebarCollapsed">ออกจากระบบ</span>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-h-screen min-w-0">
      <!-- Mobile top bar -->
      <header class="md:hidden flex items-center justify-between bg-gradient-to-r from-slate-900 to-primary-800 text-white px-4 py-3 sticky top-0 z-10 shadow-md">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span class="font-bold text-sm">e-Utilities Cost</span>
        </div>
        <button @click="mobileMenuOpen = true" class="p-2 rounded-lg hover:bg-white/10">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </header>

      <main class="flex-1 p-4 md:p-6 pb-24 md:pb-6 max-w-[1400px] w-full mx-auto">
        <slot />
      </main>

      <!-- Mobile bottom nav -->
      <nav class="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-slate-200 flex justify-around py-1.5 z-10 shadow-[0_-4px_16px_rgba(0,0,0,0.05)]">
        <RouterLink
          v-for="item in navItems.slice(0, 4)"
          :key="item.name"
          :to="{ name: item.name }"
          class="flex flex-col items-center gap-0.5 text-[10px] text-slate-500 py-1 px-2 rounded-lg"
          active-class="text-primary-600 font-semibold bg-primary-50"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
          </svg>
          {{ item.label }}
        </RouterLink>
      </nav>

      <!-- Mobile drawer menu (extra items) -->
      <div v-if="mobileMenuOpen" class="fixed inset-0 z-20 md:hidden">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="mobileMenuOpen = false"></div>
        <div class="absolute right-0 top-0 bottom-0 w-72 bg-white p-5 shadow-2xl rounded-l-2xl">
          <div class="flex items-center justify-between mb-5">
            <span class="font-bold text-primary-700">เมนูทั้งหมด</span>
            <button @click="mobileMenuOpen = false" class="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav class="space-y-1">
            <RouterLink
              v-for="item in [...navItems, ...settingItems, ...(auth.isAdmin ? adminItems : [])]"
              :key="item.name"
              :to="{ name: item.name }"
              @click="mobileMenuOpen = false"
              class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-primary-50 hover:text-primary-700"
              active-class="bg-primary-100 text-primary-700 font-semibold"
            >
              <svg class="w-5 h-5 opacity-70" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" :d="item.icon" />
              </svg>
              {{ item.label }}
            </RouterLink>
            <hr class="my-3 border-slate-100" />
            <button
              @click="handleLogout"
              class="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 rounded-xl"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              ออกจากระบบ
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>