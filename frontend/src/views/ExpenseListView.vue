<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useExpenseStore } from '../stores/expense';
import { useCategoryStore } from '../stores/category';

const router = useRouter();
const expenseStore = useExpenseStore();
const categoryStore = useCategoryStore();

const filters = ref({ year: new Date().getFullYear(), month: '', expense_category_id: '', budget_category_id: '' });

function formatBaht(n) {
  return Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

async function load(page = 1) {
  await expenseStore.fetchAll({ ...filters.value, page });
}

async function handleDelete(id) {
  if (!confirm('ยืนยันการลบรายการนี้?')) return;
  await expenseStore.remove(id);
  load(expenseStore.pagination.page);
}

onMounted(async () => {
  await Promise.all([categoryStore.fetchExpenseCategories(), categoryStore.fetchBudgetCategories()]);
  load();
});
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-between flex-wrap gap-3">
      <h1 class="text-xl font-bold text-gray-800">รายการค่าใช้จ่าย</h1>
      <button
        @click="router.push({ name: 'expense-create' })"
        class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700"
      >
        + เพิ่มรายการ
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-xl shadow-sm p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
      <input v-model.number="filters.year" type="number" placeholder="ปี" class="border rounded-lg px-3 py-1.5 text-sm" />
      <select v-model="filters.month" class="border rounded-lg px-3 py-1.5 text-sm">
        <option value="">ทุกเดือน</option>
        <option v-for="m in 12" :key="m" :value="m">เดือน {{ m }}</option>
      </select>
      <select v-model="filters.expense_category_id" class="border rounded-lg px-3 py-1.5 text-sm">
        <option value="">ทุกประเภท</option>
        <option v-for="c in categoryStore.expenseCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>
      <select v-model="filters.budget_category_id" class="border rounded-lg px-3 py-1.5 text-sm">
        <option value="">ทุกหมวดเงิน</option>
        <option v-for="b in categoryStore.budgetCategories" :key="b.id" :value="b.id">{{ b.name }}</option>
      </select>
      <button
        @click="load()"
        class="col-span-2 md:col-span-1 bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium"
      >
        🔍 ค้นหา
      </button>
    </div>

    <!-- Desktop table -->
    <div class="table-desktop w-full bg-white rounded-xl shadow-sm overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-600">
          <tr>
            <th class="text-left px-4 py-2">เดือนบิล</th>
            <th class="text-left px-4 py-2">ประเภท</th>
            <th class="text-left px-4 py-2">หมวดเงิน</th>
            <th class="text-right px-4 py-2">จำนวนเงิน</th>
            <th class="text-left px-4 py-2">เลขที่ใบแจ้งหนี้</th>
            <th class="text-right px-4 py-2">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in expenseStore.items" :key="e.id" class="border-t">
            <td class="px-4 py-2">{{ e.billing_month }}</td>
            <td class="px-4 py-2">{{ e.expenseCategory?.name }}</td>
            <td class="px-4 py-2">{{ e.budgetCategory?.name }}</td>
            <td class="px-4 py-2 text-right">฿{{ formatBaht(e.amount) }}</td>
            <td class="px-4 py-2">{{ e.invoice_no || '-' }}</td>
            <td class="px-4 py-2 text-right space-x-2">
              <button @click="router.push({ name: 'expense-edit', params: { id: e.id } })" class="text-primary-600 hover:underline">แก้ไข</button>
              <button @click="handleDelete(e.id)" class="text-red-600 hover:underline">ลบ</button>
            </td>
          </tr>
          <tr v-if="!expenseStore.items.length">
            <td colspan="6" class="text-center text-gray-400 py-6">ไม่มีข้อมูล</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile card list -->
    <div class="card-mobile space-y-3">
      <div v-for="e in expenseStore.items" :key="e.id" class="bg-white rounded-xl shadow-sm p-4">
        <div class="flex justify-between items-start">
          <div>
            <p class="font-medium">{{ e.expenseCategory?.name }}</p>
            <p class="text-xs text-gray-500">{{ e.billing_month }} · {{ e.budgetCategory?.name }}</p>
          </div>
          <p class="font-bold text-primary-700">฿{{ formatBaht(e.amount) }}</p>
        </div>
        <div class="flex justify-end gap-3 mt-2 text-sm">
          <button @click="router.push({ name: 'expense-edit', params: { id: e.id } })" class="text-primary-600">แก้ไข</button>
          <button @click="handleDelete(e.id)" class="text-red-600">ลบ</button>
        </div>
      </div>
      <p v-if="!expenseStore.items.length" class="text-center text-gray-400 py-6">ไม่มีข้อมูล</p>
    </div>

    <!-- Pagination -->
    <div v-if="expenseStore.pagination.totalPages > 1" class="flex justify-center gap-2">
      <button
        v-for="p in expenseStore.pagination.totalPages"
        :key="p"
        @click="load(p)"
        :class="['px-3 py-1 rounded-lg text-sm', p === expenseStore.pagination.page ? 'bg-primary-600 text-white' : 'bg-white border']"
      >
        {{ p }}
      </button>
    </div>
  </div>
</template>
