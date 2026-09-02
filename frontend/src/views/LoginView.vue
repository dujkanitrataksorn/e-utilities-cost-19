<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import Logo from '../components/Logo.vue';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const registeredUsername = computed(() => route.query.registered || '');

if (registeredUsername.value) {
  username.value = String(registeredUsername.value);
}

async function handleSubmit() {
  error.value = '';
  loading.value = true;
  try {
    await auth.login(username.value, password.value);
    router.push(route.query.redirect || { name: 'dashboard' });
  } catch (e) {
    error.value =
      e.response?.data?.message ||
      (e.response
        ? 'เข้าสู่ระบบไม่สำเร็จ'
        : 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่');
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-shell min-h-screen flex items-center justify-center px-4 py-10">
    <div class="login-card w-full max-w-md rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-[0_25px_80px_rgba(37,99,235,0.18)] backdrop-blur-md sm:p-8">
      <div class="mb-7 text-center">
        <div class="mx-auto mb-4 flex justify-center">
          <Logo size="md" />
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-blue-700 sm:text-[2rem]">ระบบควบคุมค่าใช้จ่าย</h1>
        <p class="mt-2 text-sm text-slate-500">เข้าสู่ระบบเพื่อใช้งาน</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-5">
        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">Username</label>
          <input
            v-model="username"
            type="text"
            required
            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 transition duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
            placeholder="กรอกชื่อผู้ใช้งาน"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm font-medium text-slate-700">Password</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 transition duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
            placeholder="กรอกรหัสผ่าน"
          />
        </div>

        <p
          v-if="registeredUsername && !error"
          class="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
        >
          สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบด้วยบัญชี {{ registeredUsername }}
        </p>

        <p v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {{ error }}
        </p>

        <div class="flex items-center justify-between gap-3 pt-2">
          <router-link
            :to="{ name: 'register' }"
            class="group relative flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/40 focus:outline-none focus:ring-4 focus:ring-emerald-200 active:translate-y-0"
          >
            <svg class="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            สมัครสมาชิก
          </router-link>
          <router-link
            :to="{ name: 'forgot-password' }"
            class="group relative flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-4 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-amber-500/40 focus:outline-none focus:ring-4 focus:ring-amber-200 active:translate-y-0"
          >
            <svg class="w-5 h-5 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.291-1.093.591h2.127v.001h7.171a1 1 0 001-1V9a1 1 0 00-1-1h-3.467c.529-1.403.701-2.907.671-3.734-.003-.052-.006-.10-.009-.157A6 6 0 0012 3c-3.59 0-6.761 2.646-7.331 6.093C4.63 9.36 4.4 10.21 4.4 11.5c0 1.891.771 3.644 2.02 4.904.24.254.521.495.84.708M16 17v2m0 0v2m0-2h2m-2 0h-2" />
            </svg>
            ลืมรหัสผ่าน?
          </router-link>
        </div>
        <div class="mt-6 rounded-xl border border-blue-200/50 bg-gradient-to-br from-blue-50/80 to-indigo-50/80 p-4 backdrop-blur-sm">
          <div class="flex items-start gap-3">
            <svg class="w-5 h-5 mt-0.5 text-blue-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0zM8 7a1 1 0 000 2h6a1 1 0 000-2H8zm0 4a1 1 0 000 2h3a1 1 0 000-2H8z" clip-rule="evenodd" />
            </svg>
            <div class="flex-1">
              <p class="text-xs font-bold text-blue-900 uppercase tracking-wide mb-2">💡 Demo Account</p>
              <div class="space-y-1.5">
                <p class="text-sm text-blue-800 font-semibold">
                  <span class="font-mono bg-blue-100/60 px-2.5 py-1 rounded-lg text-blue-900">user: admin</span>
                </p>
                <p class="text-sm text-blue-800 font-semibold">
                  <span class="font-mono bg-blue-100/60 px-2.5 py-1 rounded-lg text-blue-900">password: admin1234</span>
                </p>
              </div>
            </div>
          </div>
        </div>
        <button
          type="submit"
          :disabled="loading"
          class="group relative w-full overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 px-4 py-3.5 font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(37,99,235,0.45)] focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-75"
        >
          <span class="absolute inset-0 bg-gradient-to-r from-white/20 via-white/0 to-white/10 opacity-70 transition-opacity duration-300 group-hover:opacity-100"></span>
          <span class="relative inline-flex items-center justify-center gap-2">
            <span>{{ loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}</span>
            <span class="inline-flex h-5 w-5 items-center justify-center rounded-full border border-white/30 bg-white/10 text-xs transition-transform duration-300 group-hover:translate-x-1">→</span>
          </span>
        </button>
      </form>
    </div>
  </div>
</template>
