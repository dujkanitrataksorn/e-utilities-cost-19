<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useCategoryStore } from '../stores/category';

const route = useRoute();
const auth = useAuthStore();
const store = useCategoryStore();

const isBudget = computed(() => route.name === 'budget-categories');
const title = computed(() => (isBudget.value ? 'จัดการหมวดเงิน' : 'จัดการประเภทค่าใช้จ่าย'));
const subtitle = computed(() =>
  isBudget.value ? 'กำหนดหมวดเงินสำหรับการเบิกจ่าย เช่น งบประมาณ เงินรายได้' : 'กำหนดประเภทของค่าใช้จ่ายสาธารณูปโภค เช่น ค่าไฟ ค่าน้ำ'
);
const items = computed(() => (isBudget.value ? store.budgetCategories : store.expenseCategories));

const form = ref({ id: null, name: '', code: '', unit: '', is_active: true });
const showForm = ref(false);

const typeIcons = {
  ELEC: '⚡',
  ENERGY: '🔋',
  WATER: '💧',
  INTERNET: '🌐',
  PHONE: '📞',
  POST: '📮',
  WASTE: '🗑️',
  BUDGET_LV1: '🏛️',
  BUDGET_LV2: '🎓',
  SCHOOL_INCOME: '💰',
};

function iconFor(item) {
  return typeIcons[item.code] || (isBudget.value ? '🗂️' : '🏷️');
}

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
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">{{ title }}</h1>
        <p class="text-sm text-slate-500 mt-0.5">{{ subtitle }}</p>
        <p v-if="!auth.isAdmin" class="text-xs text-amber-600 mt-2">
          💡 เฉพาะผู้ดูแลระบบเท่านั้นที่สามารถแก้ไขข้อมูลได้
        </p>
      </div>
      <button
        v-if="auth.isAdmin"
        @click="showForm = !showForm; form = { id: null, name: '', code: '', unit: '', is_active: true }"
        class="btn-primary"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        เพิ่มรายการ
      </button>
    </div>

    <!-- Form -->
    <form v-if="showForm && auth.isAdmin" @submit.prevent="handleSubmit" class="card p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
      <p class="md:col-span-2 text-sm font-semibold text-slate-700">{{ form.id ? '✏️ แก้ไขรายการ' : '➕ เพิ่มรายการใหม่' }}</p>
      <div>
        <label class="form-label">ชื่อ <span class="text-red-500">*</span></label>
        <input v-model="form.name" placeholder="เช่น ค่าไฟฟ้า" required class="input-field" />
      </div>
      <div>
        <label class="form-label">รหัส <span class="text-red-500">*</span></label>
        <input v-model="form.code" placeholder="เช่น ELEC" required class="input-field font-mono" />
      </div>
      <div v-if="!isBudget">
        <label class="form-label">หน่วย</label>
        <input v-model="form.unit" placeholder="เช่น บาท, หน่วย" class="input-field" />
      </div>
      <div class="flex items-end">
        <label class="flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer select-none">
          <input v-model="form.is_active" type="checkbox" class="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
          เปิดใช้งาน
        </label>
      </div>
      <div class="md:col-span-2 flex gap-2">
        <button type="submit" class="btn-primary">บันทึก</button>
        <button type="button" @click="resetForm" class="btn-secondary">ยกเลิก</button>
      </div>
    </form>

    <!-- Items grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="item in items" :key="item.id" class="card p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
        <div class="w-11 h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-xl shrink-0">
          {{ iconFor(item) }}
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <p class="font-bold text-slate-800">{{ item.name }}</p>
            <span :class="item.is_active ? 'badge-success' : 'badge-danger'" class="badge">
              {{ item.is_active ? 'ใช้งาน' : 'ปิดใช้งาน' }}
            </span>
          </div>
          <p class="text-xs text-slate-400 font-mono mt-0.5">{{ item.code }}<span v-if="item.unit"> · {{ item.unit }}</span></p>
          <div v-if="auth.isAdmin" class="flex gap-2 mt-3">
            <button @click="editItem(item)" class="text-primary-600 hover:text-primary-800 text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-primary-50">
              แก้ไข
            </button>
            <button @click="handleDelete(item.id)" class="text-red-500 hover:text-red-700 text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-red-50">
              ลบ
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!items.length" class="card p-10 text-center">
      <p class="text-4xl mb-3">{{ isBudget ? '🗂️' : '🏷️' }}</p>
      <p class="font-semibold text-slate-700">ยังไม่มีข้อมูล</p>
      <p class="text-sm text-slate-500 mt-1">กดปุ่ม "เพิ่มรายการ" เพื่อสร้าง{{ title }}รายการแรก</p>
    </div>
  </div>
</template>