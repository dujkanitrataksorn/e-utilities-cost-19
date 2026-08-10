<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useCategoryStore } from '../stores/category';

const route = useRoute();
const store = useCategoryStore();

const isBudget = computed(() => route.name === 'budget-categories');
const title = computed(() => (isBudget.value ? 'จัดการหมวดเงิน' : 'จัดการประเภทค่าใช้จ่าย'));
const items = computed(() => (isBudget.value ? store.budgetCategories : store.expenseCategories));

const form = ref({ id: null, name: '', code: '', unit: '', is_active: true });
const showForm = ref(false);

function resetForm() {
  form.value = { id: null, name: '', code: '', unit: '', is_active: true };
  showForm.value = false;
}

function editItem(item) {
  form.value = { ...item };
  showForm.value = true;
}

async function handleSubmit() {
  if (isBudget.value) {
    if (form.value.id) {
      await store.updateBudgetCategory(form.value.id, form.value);
    } else {
      await store.createBudgetCategory(form.value);
    }
  } else {
    if (form.value.id) {
      await store.updateExpenseCategory(form.value.id, form.value);
    } else {
      await store.createExpenseCategory(form.value);
    }
  }
  resetForm();
}

async function handleDelete(id) {
  if (!confirm('ยืนยันการลบ?')) return;
  if (isBudget.value) {
    await store.removeBudgetCategory(id);
  } else {
    await store.removeExpenseCategory(id);
  }
}

async function load() {
  if (isBudget.value) {
    await store.fetchBudgetCategories();
  } else {
    await store.fetchExpenseCategories();
  }
}

onMounted(load);
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between">
      <h1 class="text-xl font-bold text-gray-800">{{ title }}</h1>
      <button @click="showForm = !showForm; form = { id: null, name: '', code: '', unit: '', is_active: true }" class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700">
        + เพิ่มรายการ
      </button>
    </div>

    <form v-if="showForm" @submit.prevent="handleSubmit" class="bg-white rounded-xl shadow-sm p-4 grid grid-cols-2 gap-3">
      <input v-model="form.name" placeholder="ชื่อ" required class="border rounded-lg px-3 py-2 col-span-2 md:col-span-1" />
      <input v-model="form.code" placeholder="รหัส" required class="border rounded-lg px-3 py-2 col-span-2 md:col-span-1" />
      <input v-if="!isBudget" v-model="form.unit" placeholder="หน่วย (เช่น บาท)" class="border rounded-lg px-3 py-2 col-span-2" />
      <label class="flex items-center gap-2 text-sm col-span-2">
        <input v-model="form.is_active" type="checkbox" /> เปิดใช้งาน
      </label>
      <div class="col-span-2 flex gap-2">
        <button type="submit" class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm">บันทึก</button>
        <button type="button" @click="resetForm" class="bg-gray-100 px-4 py-2 rounded-lg text-sm">ยกเลิก</button>
      </div>
    </form>

    <div class="bg-white rounded-xl shadow-sm divide-y">
      <div v-for="item in items" :key="item.id" class="flex justify-between items-center p-4">
        <div>
          <p class="font-medium">{{ item.name }}</p>
          <p class="text-xs text-gray-500">{{ item.code }} <span v-if="item.unit">· {{ item.unit }}</span> · {{ item.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน' }}</p>
        </div>
        <div class="space-x-3 text-sm">
          <button @click="editItem(item)" class="text-primary-600">แก้ไข</button>
          <button @click="handleDelete(item.id)" class="text-red-600">ลบ</button>
        </div>
      </div>
      <p v-if="!items.length" class="text-center text-gray-400 py-6">ไม่มีข้อมูล</p>
    </div>
  </div>
</template>
