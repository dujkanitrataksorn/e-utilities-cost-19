<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <div class="max-w-7xl mx-auto">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p class="mt-2 text-gray-600">จัดการผู้ใช้งานและดูสถิติระบบ</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-600">ผู้ใช้ทั้งหมด</div>
          <div class="mt-2 text-3xl font-bold text-gray-900">{{ stats.totalUsers }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-600">ผู้ดูแลระบบ</div>
          <div class="mt-2 text-3xl font-bold text-blue-600">{{ stats.adminCount }}</div>
        </div>
        <div class="bg-white rounded-lg shadow p-6">
          <div class="text-sm font-medium text-gray-600">พนักงาน</div>
          <div class="mt-2 text-3xl font-bold text-green-600">{{ stats.staffCount }}</div>
        </div>
      </div>

      <!-- Users Management -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-bold text-gray-900">จัดการผู้ใช้</h2>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="px-6 py-8 text-center">
          <div class="inline-block">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
          <p class="mt-4 text-gray-600">กำลังโหลด...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="px-6 py-4 bg-red-50 border-t border-red-200">
          <p class="text-red-700">{{ error }}</p>
          <button
            @click="loadUsers"
            class="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            ลองใหม่
          </button>
        </div>

        <!-- Users Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead class="bg-gray-50 border-b border-gray-200">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  ID
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  ชื่อผู้ใช้
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  ชื่อจริง
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  บทบาท
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  การกระทำ
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr v-for="user in users" :key="user.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ user.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ user.username }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {{ user.full_name || '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <select
                    :value="user.role"
                    @change="(e) => changeRole(user.id, e.target.value)"
                    class="text-sm border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    :disabled="updatingUserId === user.id"
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                  <button
                    @click="deleteUserConfirm(user.id, user.username)"
                    class="text-red-600 hover:text-red-900 font-medium disabled:opacity-50"
                    :disabled="updatingUserId === user.id"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';

const authStore = useAuthStore();
const users = ref([]);
const stats = ref({
  totalUsers: 0,
  adminCount: 0,
  staffCount: 0,
});
const loading = ref(false);
const error = ref('');
const updatingUserId = ref(null);

const loadUsers = async () => {
  try {
    loading.value = true;
    error.value = '';
    users.value = await authStore.getAllUsers();
  } catch (err) {
    error.value = 'ไม่สามารถโหลดรายชื่อผู้ใช้ได้';
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const loadStats = async () => {
  try {
    stats.value = await authStore.getAdminStats();
  } catch (err) {
    console.error('Failed to load stats:', err);
  }
};

const changeRole = async (userId, newRole) => {
  try {
    updatingUserId.value = userId;
    await authStore.updateUserRole(userId, newRole);
    const userIndex = users.value.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      users.value[userIndex].role = newRole;
    }
    await loadStats();
  } catch (err) {
    error.value = 'ไม่สามารถเปลี่ยนบทบาทได้ ' + (err.response?.data?.message || err.message);
    // Reload users to reflect the actual state
    await loadUsers();
  } finally {
    updatingUserId.value = null;
  }
};

const deleteUserConfirm = async (userId, username) => {
  if (confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบผู้ใช้ "${username}"?`)) {
    try {
      updatingUserId.value = userId;
      await authStore.deleteUser(userId);
      users.value = users.value.filter((u) => u.id !== userId);
      await loadStats();
    } catch (err) {
      error.value = 'ไม่สามารถลบผู้ใช้ได้ ' + (err.response?.data?.message || err.message);
    } finally {
      updatingUserId.value = null;
    }
  }
};

onMounted(() => {
  loadUsers();
  loadStats();
});
</script>
