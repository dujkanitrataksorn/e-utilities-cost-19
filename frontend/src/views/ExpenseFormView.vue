<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useExpenseStore } from '../stores/expense';
import { useCategoryStore } from '../stores/category';
import api from '../services/api';

const route = useRoute();
const router = useRouter();
const expenseStore = useExpenseStore();
const categoryStore = useCategoryStore();

const isEdit = !!route.params.id;
const form = ref({
  expense_category_id: '',
  budget_category_id: '',
  amount: '',
  billing_month: '',
  paid_date: '',
  invoice_no: '',
  note: '',
});
const error = ref('');
const loading = ref(false);

onMounted(async () => {
  await Promise.all([categoryStore.fetchExpenseCategories(), categoryStore.fetchBudgetCategories()]);
  if (isEdit) {
    const res = await api.get(`/expenses/${route.params.id}`);
    const e = res.data;
    form.value = {
      expense_category_id: e.expense_category_id,
      budget_category_id: e.budget_category_id,
      amount: e.amount,
      billing_month: e.billing_month?.slice(0, 10),
      paid_date: e.paid_date?.slice(0, 10) || '',
      invoice_no: e.invoice_no || '',
      note: e.note || '',
    };
  }
});

async function handleSubmit() {
  error.value = '';
  loading.value = true;
  try {
    if (isEdit) {
      await expenseStore.update(route.params.id, form.value);
    } else {
      await expenseStore.create(form.value);
    }
    router.push({ name: 'expense-list' });
  } catch (e) {
    error.value = e.response?.data?.message || 'บันทึกไม่สำเร็จ';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="max-w-xl mx-auto">
    <h1 class="text-xl font-bold text-gray-800 mb-4">{{ isEdit ? 'แก้ไขรายการค่าใช้จ่าย' : 'เพิ่มรายการค่าใช้จ่าย' }}</h1>

    <form @submit.prevent="handleSubmit" class="bg-white rounded-xl shadow-sm p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">ประเภทค่าใช้จ่าย</label>
        <select v-model="form.expense_category_id" required class="w-full border rounded-lg px-3 py-2">
          <option value="" disabled>เลือกประเภท</option>
          <option v-for="c in categoryStore.expenseCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">หมวดเงินที่เบิกจ่าย</label>
        <select v-model="form.budget_category_id" required class="w-full border rounded-lg px-3 py-2">
          <option value="" disabled>เลือกหมวดเงิน</option>
          <option v-for="b in categoryStore.budgetCategories" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">จำนวนเงิน (บาท)</label>
        <input v-model="form.amount" type="number" step="0.01" required class="w-full border rounded-lg px-3 py-2" />
      </div>

      <div class="grid grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">เดือนของบิล</label>
          <input v-model="form.billing_month" type="date" required class="w-full border rounded-lg px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">วันที่ชำระจริง</label>
          <input v-model="form.paid_date" type="date" class="w-full border rounded-lg px-3 py-2" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">เลขที่ใบแจ้งหนี้</label>
        <input v-model="form.invoice_no" type="text" class="w-full border rounded-lg px-3 py-2" />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
        <textarea v-model="form.note" rows="3" class="w-full border rounded-lg px-3 py-2"></textarea>
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <div class="flex gap-3">
        <button type="submit" :disabled="loading" class="flex-1 bg-primary-600 text-white rounded-lg py-2 font-medium hover:bg-primary-700 disabled:opacity-50">
          {{ loading ? 'กำลังบันทึก...' : 'บันทึก' }}
        </button>
        <button type="button" @click="router.back()" class="flex-1 bg-gray-100 rounded-lg py-2 font-medium hover:bg-gray-200">
          ยกเลิก
        </button>
      </div>
    </form>
  </div>
</template>
