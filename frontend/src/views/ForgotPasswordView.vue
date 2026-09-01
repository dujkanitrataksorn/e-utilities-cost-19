<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const username = ref('');
const message = ref('');
const error = ref('');
const loading = ref(false);
const token = ref('');
const router = useRouter();

async function handleSubmit() {
  error.value = '';
  message.value = '';
  token.value = '';
  loading.value = true;

  try {
    const res = await api.post('/auth/forgot-password', { username: username.value });
    message.value = res.data.message;
    token.value = res.data.token || '';
    username.value = '';
  } catch (e) {
    error.value = e.response?.data?.message || 'ไม่สามารถส่งคำขอได้';
  } finally {
    loading.value = false;
  }
}

function goToResetPage() {
  if (!token.value) return;
  router.push({ name: 'reset-password', query: { token: token.value } });
}
</script>





<template>
  <div class="login-shell min-h-screen flex items-center justify-center px-4 py-10">
    <div class="login-card w-full max-w-md rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-[0_25px_80px_rgba(37,99,235,0.18)] backdrop-blur-md sm:p-8">
      <div class="mb-7 text-center">
        <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 text-xl font-bold text-white shadow-lg shadow-blue-500/30">
          ?
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-blue-700 sm:text-[2rem]">ลืมรหัสผ่าน</h1>
        <p class="mt-2 text-sm text-slate-500">กรอกชื่อผู้ใช้งานเพื่อรับลิงก์ตั้งรหัสผ่านใหม่</p>
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

        <p v-if="error" class="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {{ error }}
        </p>
        <p v-if="message" class="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-600">
          {{ message }}
        </p>

        <button
          type="submit"
          :disabled="loading"
          class="group relative w-full overflow-hidden rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 px-4 py-3.5 font-semibold text-white shadow-[0_12px_30px_rgba(37,99,235,0.35)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(37,99,235,0.45)] focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-75"
        >
          <span class="absolute inset-0 bg-gradient-to-r from-white/20 via-white/0 to-white/10 opacity-70 transition-opacity duration-300 group-hover:opacity-100"></span>
          <span class="relative inline-flex items-center justify-center gap-2">
            {{ loading ? 'กำลังส่ง...' : 'ส่งลิงก์รีเซ็ต' }}
          </span>
        </button>

        <div class="flex items-center justify-center">
          <router-link :to="{ name: 'login' }" class="text-sm font-medium text-blue-600 transition hover:text-blue-700 hover:underline">
            กลับไปเข้าสู่ระบบ
          </router-link>
        </div>
      </form>

      <div v-if="token" class="mt-8 border-t border-slate-200 pt-6">
        <p class="mb-4 text-sm font-semibold text-slate-700">ขั้นตอนที่ 2: ตั้งรหัสผ่านใหม่</p>
        <button
          @click="goToResetPage"
          class="inline-flex items-center justify-center rounded-xl border border-blue-200 bg-blue-50 px-3 py-2 font-medium text-blue-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:bg-blue-100 hover:text-blue-800 hover:shadow-sm"
        >
          ไปหน้าตั้งรหัสผ่านใหม่
        </button>
      </div>
    </div>
  </div>
</template>
