<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useExpenseStore } from '../stores/expense';
import { useCategoryStore } from '../stores/category';
import { useBudgetStore } from '../stores/budget';
import api from '../services/api';

const route = useRoute();
const router = useRouter();
const expenseStore = useExpenseStore();
const categoryStore = useCategoryStore();
const budgetStore = useBudgetStore();

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

const monthNames = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];

// ---- Budget warning ----
const billingMonth = computed(() => {
  if (!form.value.billing_month) return null;
  const d = new Date(form.value.billing_month);
  return { year: d.getFullYear(), month: d.getMonth() + 1 };
});

// หา plan ของหมวดเงินที่เลือก (เทียบด้วยชื่อหมวด เพราะ status ไม่ส่ง id หมวดกลับมา)
const selectedPlan = computed(() => {
  if (!billingMonth.value || !form.value.budget_category_id) return null;
  const cat = categoryStore.budgetCategories.find((c) => c.id === Number(form.value.budget_category_id));
  if (!cat) return null;
  return budgetStore.status.summary.find((s) => s.category_name === cat.name) || null;
});

const budgetWarning = computed(() => {
  const plan = selectedPlan.value;
  const amount = Number(form.value.amount);
  if (!plan || !amount || !billingMonth.value) return null;
  if (billingMonth.value.year !== Number(budgetStore.status.year)) return null;

  const messages = [];
  if (plan.monthly_limit != null) {
    const after = plan.used_month + amount;
    const percent = ((after / plan.monthly_limit) * 100).toFixed(1);
    if (after > plan.monthly_limit) {
      messages.push(`เดือน${monthNames[billingMonth.value.month - 1]} จะเกินวงเงินรายเดือน (ใช้รวม ฿${after.toLocaleString('th-TH')} จากวงเงิน ฿${Number(plan.monthly_limit).toLocaleString('th-TH')} = ${percent}%)`);
    } else if (percent >= 80) {
      messages.push(`เดือน${monthNames[billingMonth.value.month - 1]} จะใช้งบถึง ${percent}% ของวงเงินรายเดือน`);
    }
  }
  if (plan.yearly_limit != null) {
    const after = plan.used_year + amount;
    const percent = ((after / plan.yearly_limit) * 100).toFixed(1);
    if (after > plan.yearly_limit) {
      messages.push(`ปี ${billingMonth.value.year} จะเกินวงเงินรายปี (ใช้รวม ฿${after.toLocaleString('th-TH')} = ${percent}%)`);
    } else if (percent >= 80) {
      messages.push(`ปี ${billingMonth.value.year} จะใช้งบถึง ${percent}% ของวงเงินรายปี`);
    }
  }
  if (!messages.length) return null;
  const isOver = messages.some((m) => m.includes('เกินวงเงิน'));
  return { isOver, messages };
});

// โหลดสถานะงบประมาณเมื่อเปลี่ยนเดือนบิล
watch(billingMonth, async (val) => {
  if (val) {
    try {
      await budgetStore.fetchStatus(val.year, val.month);
    } catch (e) {
      /* ignore */
    }
  }
});

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
  <div class="max-w-2xl mx-auto">
    <h1 class="text-2xl font-bold text-slate-800 mb-1">{{ isEdit ? 'แก้ไขรายการค่าใช้จ่าย' : 'เพิ่มรายการค่าใช้จ่าย' }}</h1>
    <p class="text-sm text-slate-500 mb-5">กรอกข้อมูลใบแจ้งหนี้และจำนวนเงินที่ใช้จริง</p>

    <form @submit.prevent="handleSubmit" class="card p-6 space-y-5">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="form-label">ประเภทค่าใช้จ่าย <span class="text-red-500">*</span></label>
          <select v-model="form.expense_category_id" required class="input-field">
            <option value="" disabled>เลือกประเภท</option>
            <option v-for="c in categoryStore.expenseCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
          </select>
        </div>

        <div>
          <label class="form-label">หมวดเงินที่เบิกจ่าย <span class="text-red-500">*</span></label>
          <select v-model="form.budget_category_id" required class="input-field">
            <option value="" disabled>เลือกหมวดเงิน</option>
            <option v-for="b in categoryStore.budgetCategories" :key="b.id" :value="b.id">{{ b.name }}</option>
          </select>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="form-label">จำนวนเงิน (บาท) <span class="text-red-500">*</span></label>
          <div class="relative">
            <input v-model="form.amount" type="number" step="0.01" min="0" required placeholder="0.00" class="input-field pr-10" />
            <span class="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm">฿</span>
          </div>
        </div>

        <div>
          <label class="form-label">เลขที่ใบแจ้งหนี้</label>
          <input v-model="form.invoice_no" type="text" placeholder="เช่น INV-2567-001" class="input-field" />
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="form-label">เดือนของบิล <span class="text-red-500">*</span></label>
          <input v-model="form.billing_month" type="date" required class="input-field" />
        </div>
        <div>
          <label class="form-label">วันที่ชำระจริง</label>
          <input v-model="form.paid_date" type="date" class="input-field" />
        </div>
      </div>

      <div>
        <label class="form-label">หมายเหตุ</label>
        <textarea v-model="form.note" rows="3" placeholder="บันทึกเพิ่มเติม (ถ้ามี)" class="input-field resize-none"></textarea>
      </div>

      <!-- Budget warning -->
      <div v-if="budgetWarning" class="space-y-2">
        <div
          :class="budgetWarning.isOver ? 'bg-red-50 border-red-200 text-red-700' : 'bg-amber-50 border-amber-200 text-amber-700'"
          class="border rounded-xl px-4 py-3 text-sm space-y-1"
        >
          <p class="font-bold">{{ budgetWarning.isOver ? '🚨 คำเตือน: รายการนี้จะทำให้เกินวงเงิน!' : '⚠️ แจ้งเตือนการใช้งบประมาณ' }}</p>
          <p v-for="(m, i) in budgetWarning.messages" :key="i">• {{ m }}</p>
        </div>
      </div>

      <p v-if="error" class="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">{{ error }}</p>

      <div class="flex gap-3 pt-2">
        <button type="submit" :disabled="loading" class="btn-primary flex-1 disabled:opacity-50">
          {{ loading ? 'กำลังบันทึก...' : 'บันทึกรายการ' }}
        </button>
        <button type="button" @click="router.back()" class="btn-secondary flex-1">ยกเลิก</button>
      </div>
    </form>
  </div>
</template>