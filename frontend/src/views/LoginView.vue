<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const auth = useAuthStore();

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function handleSubmit() {
  error.value = '';
  loading.value = true;
  try {
    await auth.login(username.value, password.value);
    router.push(route.query.redirect || { name: 'dashboard' });
  } catch (e) {
    error.value = e.response?.data?.message || 'เข้าสู่ระบบไม่สำเร็จ';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="login-shell min-h-screen flex items-center justify-center px-4 py-10">
    <div class="login-card w-full max-w-md rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-[0_25px_80px_rgba(37,99,235,0.18)] backdrop-blur-md sm:p-8">
      <div class="mb-7 text-center">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 text-xl font-bold text-white shadow-lg shadow-blue-500/30">
          E
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

        <p v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {{ error }}
        </p>

        <div class="flex items-center justify-between gap-3 pt-1 text-sm">
          <router-link
            :to="{ name: 'register' }"
            class="inline-flex items-center justify-center rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 font-medium text-blue-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-100 hover:shadow-sm"
          >
            สมัครสมาชิก
          </router-link>
          <router-link
            :to="{ name: 'forgot-password' }"
            class="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-medium text-slate-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800"
          >
            ลืมรหัสผ่าน?
          </router-link>
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
