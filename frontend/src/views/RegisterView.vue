<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const username = ref('');
const password = ref('');
const fullName = ref('');
const error = ref('');
const success = ref('');
const loading = ref(false);

async function handleSubmit() {
  error.value = '';
  success.value = '';

  if (password.value.length < 8) {
    error.value = 'รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร';
    return;
  }

  loading.value = true;

  try {
    const res = await api.post('/auth/register', {
      username: username.value,
      password: password.value,
      full_name: fullName.value,
    });

    success.value = `${res.data.message} กรุณาเข้าสู่ระบบ`;
    username.value = '';
    password.value = '';
    fullName.value = '';

    setTimeout(() => router.push({ name: 'login' }), 1200);
  } catch (e) {
    error.value = e.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-md p-8">
      <h1 class="text-xl font-bold text-center text-primary-700 mb-2">สมัครสมาชิก</h1>
      <p class="text-center text-sm text-gray-500 mb-6">สร้างบัญชีผู้ใช้งานใหม่</p>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Username</label>
          <input
            v-model="username"
            type="text"
            required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อ-นามสกุล</label>
          <input
            v-model="fullName"
            type="text"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
        <p v-if="success" class="text-sm text-green-600">{{ success }}</p>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary-600 text-white rounded-lg py-2 font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {{ loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก' }}
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
