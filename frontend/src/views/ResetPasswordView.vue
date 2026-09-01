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
    <div class="login-shell min-h-screen flex items-center justify-center px-4 py-10">
      <div class="login-card w-full max-w-md rounded-[28px] border border-white/60 bg-white/85 p-6 shadow-[0_25px_80px_rgba(37,99,235,0.18)] backdrop-blur-md sm:p-8">
        <div class="mb-7 text-center">
          <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-600 to-teal-500 text-xl font-bold text-white shadow-lg shadow-green-500/30">
            ✓
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-slate-800 sm:text-[2rem]">ตั้งรหัสผ่านใหม่</h1>
          <p class="mt-2 text-sm text-slate-500">สร้างรหัสผ่านใหม่ที่ปลอดภัยสำหรับบัญชีของคุณ</p>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">รหัสผ่านใหม่</label>
            <input
              v-model="newPassword"
              type="password"
              required
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 transition duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              placeholder="อย่างน้อย 8 ตัวอักษร"
            />
          </div>

          <div>
            <label class="mb-2 block text-sm font-medium text-slate-700">ยืนยันรหัสผ่านใหม่</label>
            <input
              v-model="confirmPassword"
              type="password"
              required
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-800 placeholder:text-slate-400 transition duration-200 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-100"
              placeholder="พิมพ์รหัสผ่านอีกครั้ง"
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
              {{ loading ? 'กำลังตั้ง...' : 'ยืนยันตั้งรหัสผ่านใหม่' }}
            </span>
          </button>
        </form>
      </div>
    </div>
  </template>
