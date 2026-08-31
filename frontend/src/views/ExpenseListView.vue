<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useExpenseStore } from '../stores/expense';
import { useCategoryStore } from '../stores/category';

const router = useRouter();
const expenseStore = useExpenseStore();
const categoryStore = useCategoryStore();

const filters = ref({ year: new Date().getFullYear(), month: '', expense_category_id: '', budget_category_id: '' });

const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

const budgetBadgeColors = {
  BUDGET_LV1: 'bg-blue-50 text-blue-700 ring-blue-200',
  BUDGET_LV2: 'bg-violet-50 text-violet-700 ring-violet-200',
  SCHOOL_INCOME: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
};

function formatBaht(n) {
  return Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatMonth(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return `${monthNames[d.getMonth()]} ${d.getFullYear() + 543}`;
}

function badgeClass(code) {
  return budgetBadgeColors[code] || 'bg-slate-100 text-slate-600 ring-slate-200';
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
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">รายการค่าใช้จ่าย</h1>
        <p class="text-sm text-slate-500 mt-0.5">บันทึกและจัดการค่าใช้จ่ายสาธารณูปโภคทั้งหมด</p>
      </div>
      <button @click="router.push({ name: 'expense-create' })" class="btn-primary">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        เพิ่มรายการ
      </button>
    </div>

    <!-- Filters -->
    <div class="card p-4 grid grid-cols-2 md:grid-cols-5 gap-3">
      <div>
        <label class="form-label">ปี</label>
        <input v-model.number="filters.year" type="number" class="input-field" />
      </div>
      <div>
        <label class="form-label">เดือน</label>
        <select v-model="filters.month" class="input-field">
          <option value="">ทุกเดือน</option>
          <option v-for="(name, i) in monthNames" :key="i" :value="i + 1">{{ name }}</option>
        </select>
      </div>
      <div>
        <label class="form-label">ประเภท</label>
        <select v-model="filters.expense_category_id" class="input-field">
          <option value="">ทุกประเภท</option>
          <option v-for="c in categoryStore.expenseCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
      <div>
        <label class="form-label">หมวดเงิน</label>
        <select v-model="filters.budget_category_id" class="input-field">
          <option value="">ทุกหมวดเงิน</option>
          <option v-for="b in categoryStore.budgetCategories" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
      </div>
      <div class="col-span-2 md:col-span-1 flex items-end">
        <button @click="load()" class="btn-secondary w-full">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          ค้นหา
        </button>
      </div>
    </div>

    <!-- Desktop table -->
    <div class="table-desktop card overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-slate-50 text-slate-500 text-xs uppercase tracking-wide">
          <tr>
            <th class="text-left px-5 py-3.5 font-semibold">เดือนบิล</th>
            <th class="text-left px-5 py-3.5 font-semibold">ประเภท</th>
            <th class="text-left px-5 py-3.5 font-semibold">หมวดเงิน</th>
            <th class="text-right px-5 py-3.5 font-semibold">จำนวนเงิน</th>
            <th class="text-left px-5 py-3.5 font-semibold">เลขที่ใบแจ้งหนี้</th>
            <th class="text-right px-5 py-3.5 font-semibold">จัดการ</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="e in expenseStore.items" :key="e.id" class="hover:bg-primary-50/40 transition-colors">
            <td class="px-5 py-3.5 whitespace-nowrap font-medium text-slate-700">{{ formatMonth(e.billing_month) }}</td>
            <td class="px-5 py-3.5">{{ e.expenseCategory?.name }}</td>
            <td class="px-5 py-3.5">
              <span :class="['badge ring-1', badgeClass(e.budgetCategory?.code)]">{{ e.budgetCategory?.name }}</span>
            </td>
            <td class="px-5 py-3.5 text-right font-bold text-slate-800 whitespace-nowrap">฿{{ formatBaht(e.amount) }}</td>
            <td class="px-5 py-3.5 text-slate-500 font-mono text-xs">{{ e.invoice_no || '-' }}</td>
            <td class="px-5 py-3.5 text-right whitespace-nowrap">
              <button @click="router.push({ name: 'expense-edit', params: { id: e.id } })" class="text-primary-600 hover:text-primary-800 font-medium text-xs px-2 py-1 rounded-lg hover:bg-primary-50">แก้ไข</button>
              <button @click="handleDelete(e.id)" class="text-red-500 hover:text-red-700 font-medium text-xs px-2 py-1 rounded-lg hover:bg-red-50">ลบ</button>
            </td>
          </tr>
          <tr v-if="!expenseStore.items.length">
            <td colspan="6" class="text-center text-slate-400 py-12">
              <p class="text-3xl mb-2">🗂️</p>
              ไม่มีข้อมูลรายการค่าใช้จ่าย
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Mobile card list -->
    <div class="card-mobile space-y-3">
      <div v-for="e in expenseStore.items" :key="e.id" class="card p-4">
        <div class="flex justify-between items-start">
          <div>
            <p class="font-semibold text-slate-800">{{ e.expenseCategory?.name }}</p>
            <p class="text-xs text-slate-500 mt-0.5">{{ formatMonth(e.billing_month) }} · {{ e.invoice_no || 'ไม่มีเลขที่ใบแจ้งหนี้' }}</p>
            <span :class="['badge ring-1 mt-2', badgeClass(e.budgetCategory?.code)]">{{ e.budgetCategory?.name }}</span>
          </div>
          <p class="font-bold text-primary-700">฿{{ formatBaht(e.amount) }}</p>
        </div>
        <div class="flex justify-end gap-2 mt-3 pt-3 border-t border-slate-100 text-sm">
          <button @click="router.push({ name: 'expense-edit', params: { id: e.id } })" class="text-primary-600 font-medium px-3 py-1 rounded-lg hover:bg-primary-50">แก้ไข</button>
          <button @click="handleDelete(e.id)" class="text-red-500 font-medium px-3 py-1 rounded-lg hover:bg-red-50">ลบ</button>
        </div>
      </div>
      <div v-if="!expenseStore.items.length" class="card p-10 text-center text-slate-400">
        <p class="text-3xl mb-2">🗂️</p>
        ไม่มีข้อมูลรายการค่าใช้จ่าย
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="expenseStore.pagination.totalPages > 1" class="flex justify-center items-center gap-1.5">
      <button
        @click="load(expenseStore.pagination.page - 1)"
        :disabled="expenseStore.pagination.page <= 1"
        class="px-3 py-1.5 rounded-lg text-sm bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
      >
        ←
      </button>
      <button
        v-for="p in expenseStore.pagination.totalPages"
        :key="p"
        @click="load(p)"
        :class="['px-3.5 py-1.5 rounded-lg text-sm font-medium transition', p === expenseStore.pagination.page ? 'bg-primary-600 text-white shadow-sm' : 'bg-white border border-slate-200 hover:bg-slate-50']"
      >
        {{ p }}
      </button>
      <button
        @click="load(expenseStore.pagination.page + 1)"
        :disabled="expenseStore.pagination.page >= expenseStore.pagination.totalPages"
        class="px-3 py-1.5 rounded-lg text-sm bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-50"
      >
        →
      </button>
    </div>
  </div>
</template>