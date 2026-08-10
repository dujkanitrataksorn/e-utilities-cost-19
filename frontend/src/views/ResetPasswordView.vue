<script setup>
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import api from '../services/api';

const route = useRoute();
const router = useRouter();
const token = ref(route.query.token || '');
const newPassword = ref('');
const confirmPassword = ref('');
const message = ref('');
const error = ref('');
const loading = ref(false);

async function handleSubmit() {
  error.value = '';
  message.value = '';

  if (!token.value) {
    error.value = 'ไม่มี token สำหรับรีเซ็ตรหัสผ่าน';
    return;
  }

  if (newPassword.value.length < 8) {
    error.value = 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร';
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'ยืนยันรหัสผ่านไม่ตรงกัน';
    return;
  }

  loading.value = true;

  try {
    const res = await api.post('/auth/reset-password', {
      token: token.value,
      newPassword: newPassword.value,
    });
    message.value = res.data.message;
    newPassword.value = '';
    confirmPassword.value = '';
    setTimeout(() => router.push({ name: 'login' }), 1500);
  } catch (e) {
    error.value = e.response?.data?.message || 'ไม่สามารถตั้งรหัสผ่านใหม่ได้';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
      <h1 class="text-xl font-bold text-center text-primary-700 mb-2">ตั้งรหัสผ่านใหม่</h1>
      <p class="text-center text-sm text-gray-500 mb-6">กรอกรหัสผ่านใหม่สำหรับบัญชีของคุณ</p>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านใหม่</label>
          <input
            v-model="newPassword"
            type="password"
            required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="อย่างน้อย 8 ตัวอักษร"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="พิมพ์อีกครั้ง"
          />
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <p v-if="message" class="text-sm text-green-600">{{ message }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary-600 text-white rounded-lg py-2 font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {{ loading ? 'กำลังอัปเดต...' : 'ยืนยันตั้งรหัสผ่านใหม่' }}
        </button>
      </form>
    </div>
  </div>
</template>
