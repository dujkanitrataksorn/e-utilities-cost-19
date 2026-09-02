<template>
  <div class="register-shell min-h-screen flex items-center justify-center px-4 py-10">
    <div class="w-full max-w-md rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-[0_25px_80px_rgba(37,99,235,0.18)] backdrop-blur-md sm:p-8">
      <!-- Header -->
      <div class="mb-8 text-center">
        <div class="mx-auto mb-4 flex justify-center">
          <Logo size="md" />
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-blue-700 sm:text-[2rem]">สมัครสมาชิก</h1>
        <p class="mt-2 text-sm text-slate-500">สร้างบัญชีผู้ใช้งานใหม่เพื่อจัดการค่าใช้จ่าย</p>
      </div>

      <form class="space-y-5" @submit.prevent="handleSubmit">
        <!-- Username Field -->
        <div>
          <label for="username" class="mb-2 block text-sm font-medium text-slate-700">ชื่อผู้ใช้งาน</label>
          <div class="relative">
            <svg class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <input
              id="username"
              v-model.trim="form.username"
              type="text"
              placeholder="somchai.j"
              class="w-full pl-11 pr-4 py-3 text-base text-slate-800 placeholder:text-slate-400 rounded-xl border border-slate-200 bg-slate-50 transition duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              @input="errors.username = ''"
            />
          </div>
          <p class="mt-2 text-xs text-slate-500">ใช้ตัวอักษรภาษาอังกฤษหรือตัวเลข ความยาว 3-50 ตัวอักษร</p>
          <p v-if="errors.username" class="mt-1.5 text-xs text-red-600 font-medium">⚠️ {{ errors.username }}</p>
        </div>

        <!-- Full Name Field -->
        <div>
          <label for="fullname" class="mb-2 block text-sm font-medium text-slate-700">ชื่อ-นามสกุล</label>
          <div class="relative">
            <svg class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
            </svg>
            <input
              id="fullname"
              v-model.trim="form.fullName"
              type="text"
              placeholder="สมชาย ใจดี"
              class="w-full pl-11 pr-4 py-3 text-base text-slate-800 placeholder:text-slate-400 rounded-xl border border-slate-200 bg-slate-50 transition duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              @input="errors.fullName = ''"
            />
          </div>
          <p v-if="errors.fullName" class="mt-1.5 text-xs text-red-600 font-medium">⚠️ {{ errors.fullName }}</p>
        </div>

        <!-- Password Field -->
        <div>
          <label for="password" class="mb-2 block text-sm font-medium text-slate-700">รหัสผ่าน</label>
          <div class="relative">
            <svg class="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="5" y="11" width="14" height="9" rx="2" />
              <path d="M8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            <input
              id="password"
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="อย่างน้อย 8 ตัวอักษร"
              class="w-full pl-11 pr-11 py-3 text-base text-slate-800 placeholder:text-slate-400 rounded-xl border border-slate-200 bg-slate-50 transition duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              @input="errors.password = ''"
            />
            <button
              type="button"
              class="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition"
              :aria-label="showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'"
              @click="showPassword = !showPassword"
            >
              <svg v-if="!showPassword" class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <svg v-else class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 19c-7 0-11-7-11-7a21.4 21.4 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 5c7 0 11 7 11 7a21.4 21.4 0 0 1-2.16 3.19M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            </button>
          </div>
          
          <!-- Password Strength Indicator -->
          <div class="mt-3 space-y-2">
            <div class="flex gap-2">
              <div
                v-for="i in 3"
                :key="i"
                class="h-1.5 flex-1 rounded-full transition-all duration-300"
                :class="i <= strengthScore ? strengthColor : 'bg-slate-200'"
              />
            </div>
            <p class="text-xs text-slate-500">
              <span v-if="strengthScore === 0">ป้อนรหัสผ่าน</span>
              <span v-else-if="strengthScore === 1" class="text-red-600 font-medium">ความแข็งแรง: อ่อน</span>
              <span v-else-if="strengthScore === 2" class="text-amber-600 font-medium">ความแข็งแรง: ปานกลาง</span>
              <span v-else class="text-green-600 font-medium">ความแข็งแรง: แข็งแรง</span>
            </p>
          </div>
          <p v-if="errors.password" class="mt-1.5 text-xs text-red-600 font-medium">⚠️ {{ errors.password }}</p>
        </div>

        <!-- Server Error -->
        <p v-if="serverError" class="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600 font-medium">
          ⚠️ {{ serverError }}
        </p>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="submitting"
          class="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-60 disabled:hover:translate-y-0 disabled:hover:shadow-none text-white font-semibold py-3 rounded-xl transition-all duration-200"
        >
          <span v-if="submitting" class="inline-flex items-center gap-2">
            <svg class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" opacity="0.3"/>
              <path d="M22 12a10 10 0 0 1-10 10"/>
            </svg>
            กำลังสมัครสมาชิก...
          </span>
          <span v-else>สมัครสมาชิก</span>
        </button>

        <!-- Back to Login Link -->
        <router-link
          to="/login"
          class="block text-center w-full border border-blue-100 bg-blue-50 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-100 hover:shadow-sm text-blue-700 font-medium py-3 rounded-xl transition-all duration-200"
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
import Logo from '../components/Logo.vue';

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
    router.push({ name: 'login', query: { registered: form.username } });
  } catch (err) {
    serverError.value =
      err.response?.data?.message ||
      (err.response
        ? 'สมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'
        : 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่');
  } finally {
    submitting.value = false;
  }
}
</script>