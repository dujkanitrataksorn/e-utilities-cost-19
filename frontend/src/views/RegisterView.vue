<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-sm bg-white border border-gray-200 rounded-xl p-6">
      <div class="flex items-center gap-3 mb-1">
        <div class="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
          <svg class="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <line x1="19" y1="8" x2="19" y2="14" />
            <line x1="16" y1="11" x2="22" y2="11" />
          </svg>
        </div>
        <div>
          <h1 class="text-lg font-medium text-gray-900">สมัครสมาชิก</h1>
          <p class="text-sm text-gray-500">สร้างบัญชีผู้ใช้งานใหม่</p>
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
              v-model.trim="form.username"
              type="text"
              placeholder="somchai.j"
              class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @input="errors.username = ''"
            />
          </div>
          <p class="mt-1.5 text-xs text-gray-400">ใช้ตัวอักษรภาษาอังกฤษหรือตัวเลข ไม่เว้นวรรค</p>
          <p v-if="errors.username" class="mt-1 text-xs text-red-600">{{ errors.username }}</p>
        </div>

        <div>
          <label for="fullname" class="block text-sm text-gray-600 mb-1.5">ชื่อ-นามสกุล</label>
          <div class="relative">
            <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <circle cx="9" cy="10" r="2" />
              <line x1="15" y1="8" x2="17" y2="8" />
              <line x1="15" y1="12" x2="17" y2="12" />
              <line x1="7" y1="16" x2="17" y2="16" />
            </svg>
            <input
              id="fullname"
              v-model.trim="form.fullName"
              type="text"
              placeholder="สมชาย ใจดี"
              class="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @input="errors.fullName = ''"
            />
          </div>
          <p v-if="errors.fullName" class="mt-1 text-xs text-red-600">{{ errors.fullName }}</p>
        </div>

        <div>
          <label for="password" class="block text-sm text-gray-600 mb-1.5">รหัสผ่าน</label>
          <div class="relative">
            <svg class="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="อย่างน้อย 8 ตัวอักษร"
              class="w-full pl-9 pr-9 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              @input="errors.password = ''"
            />
            <button
              type="button"
              class="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              :aria-label="showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'"
              @click="showPassword = !showPassword"
            >
              <svg v-if="!showPassword" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.4 21.4 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 5c7 0 11 7 11 7a21.4 21.4 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </div>
          <div class="flex gap-1 mt-2">
            <div
              v-for="i in 3"
              :key="i"
              class="h-1 flex-1 rounded-full transition-colors"
              :class="i <= strengthScore ? strengthColor : 'bg-gray-200'"
            />
          </div>
          <p v-if="errors.password" class="mt-1 text-xs text-red-600">{{ errors.password }}</p>
        </div>

        <p v-if="serverError" class="text-xs text-red-600">{{ serverError }}</p>

        <button
          type="submit"
          :disabled="submitting"
          class="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium py-2 rounded-lg transition-colors"
        >
          {{ submitting ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก' }}
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
import { reactive, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();

const form = reactive({
  username: '',
  fullName: '',
  password: '',
});

const errors = reactive({
  username: '',
  fullName: '',
  password: '',
});

const serverError = ref('');
const showPassword = ref(false);
const submitting = ref(false);

const strengthScore = computed(() => {
  const v = form.password;
  let score = 0;
  if (v.length >= 8) score++;
  if (/[0-9]/.test(v) && /[a-zA-Z]/.test(v)) score++;
  if (/[^a-zA-Z0-9]/.test(v) || v.length >= 12) score++;
  return score;
});

const strengthColor = computed(() => {
  return ['bg-red-500', 'bg-amber-500', 'bg-green-500'][strengthScore.value - 1] || 'bg-gray-200';
});

function validate() {
  let valid = true;
  const usernameRegex = /^[a-zA-Z0-9._-]{3,50}$/;

  if (!form.username) {
    errors.username = 'กรอกชื่อผู้ใช้งาน';
    valid = false;
  } else if (!usernameRegex.test(form.username)) {
    errors.username = 'ใช้ตัวอักษรภาษาอังกฤษหรือตัวเลข ความยาว 3-50 ตัวอักษร ไม่เว้นวรรค';
    valid = false;
  }

  if (!form.fullName) {
    errors.fullName = 'กรอกชื่อ-นามสกุล';
    valid = false;
  }

  if (form.password.length < 8) {
    errors.password = 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร';
    valid = false;
  }

  return valid;
}

async function handleSubmit() {
  serverError.value = '';
  if (!validate()) return;

  submitting.value = true;
  try {
    await api.post('/auth/register', {
      username: form.username,
      full_name: form.fullName,
      password: form.password,
    });
    router.push('/login');
  } catch (err) {
    serverError.value = err.response?.data?.message || 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง';
  } finally {
    submitting.value = false;
  }
}
</script>