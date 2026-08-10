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
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
      <h1 class="text-xl font-bold text-center text-primary-700 mb-2">ลืมรหัสผ่าน</h1>
      <p class="text-center text-sm text-gray-500 mb-6">กรอก username เพื่อขอรีเซ็ตรหัสผ่านใหม่</p>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            v-model="username"
            type="text"
            required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            placeholder="username"
          />
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <p v-if="message" class="text-sm text-green-600">{{ message }}</p>

        <div v-if="token" class="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-700 break-all">
          Token: {{ token }}
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary-600 text-white rounded-lg py-2 font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {{ loading ? 'กำลังส่ง...' : 'ส่งคำขอรีเซ็ตรหัสผ่าน' }}
        </button>

        <button
          v-if="token"
          type="button"
          @click="goToResetPage"
          class="w-full bg-green-600 text-white rounded-lg py-2 font-medium hover:bg-green-700"
        >
          ไปหน้าตั้งรหัสผ่านใหม่
        </button>

        <button
          type="button"
          @click="router.push({ name: 'login' })"
          class="w-full border border-gray-300 text-gray-700 rounded-lg py-2 font-medium hover:bg-gray-50"
        >
          กลับไปหน้าเข้าสู่ระบบ
        </button>
      </form>
    </div>
  </div>
</template>
