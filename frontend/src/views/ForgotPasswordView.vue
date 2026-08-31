<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-sm bg-white border border-gray-200 rounded-xl p-6">
      <div class="flex items-center gap-3 mb-1">
        <div class="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
          <svg class="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 7a4 4 0 1 1-4 4" />
            <path d="M10.5 10.5 3 18v3h3l7.5-7.5" />
          </svg>
        </div>
        <div>
          <h1 class="text-lg font-medium text-gray-900">ลืมรหัสผ่าน</h1>
          <p class="text-sm text-gray-500">กรอกชื่อผู้ใช้งานเพื่อขอรีเซ็ตรหัสผ่านใหม่</p>
        </div>
      </div>

      <form class="mt-5 space-y-4" @submit.prevent="handleSubmit">
        <div>
          <label for="username" class="block text-sm text-gray-600 mb-1.5">ชื่อผู้ใช้งาน</label>
          <div class="relative">
            <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              id="username"
              v-model.trim="username"
              type="text"
              placeholder="somchai.j"
              :disabled="sent"
              class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
              @input="error = ''"
            />
          </div>
          <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
        </div>

        <div v-if="sent" class="bg-green-50 rounded-lg p-3 flex items-start gap-2">
          <svg class="w-4 h-4 text-green-700 mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16v16H4z" opacity="0" />
            <path d="M22 6 12 13 2 6" />
            <path d="M2 6h20v12H2z" />
            <path d="m4 18 6-6" />
          </svg>
          <p class="text-sm text-green-700">
            หากมีชื่อผู้ใช้งานนี้ในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านให้แล้ว ตรวจสอบกับผู้ดูแลระบบหากไม่ได้รับ
          </p>
        </div>

        <button
          v-if="!sent"
          type="submit"
          :disabled="submitting"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          {{ submitting ? 'กำลังส่งคำขอ...' : 'ส่งคำขอรีเซ็ตรหัสผ่าน' }}
        </button>

        <router-link
          to="/login"
          class="block text-center w-full border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm py-2 rounded-lg transition-colors"
        >
          กลับไปหน้าเข้าสู่ระบบ
        </router-link>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../services/api';

const username = ref('');
const error = ref('');
const submitting = ref(false);
const sent = ref(false);

async function handleSubmit() {
  error.value = '';

  if (!username.value) {
    error.value = 'กรอกชื่อผู้ใช้งาน';
    return;
  }

  submitting.value = true;
  try {
    // backend ตอบ 200 พร้อมข้อความเดียวกันเสมอ ไม่ว่า username จะมีจริงหรือไม่
    // (กันคนสุ่มเช็คว่า username ไหนมีอยู่ในระบบ) จึงไม่ต้องแยก branch success/fail ที่นี่
    await api.post('/auth/forgot-password', { username: username.value });
    sent.value = true;
  } catch (err) {
    error.value = err.response?.data?.message || 'ส่งคำขอไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
  } finally {
    submitting.value = false;
  }
}
</script>