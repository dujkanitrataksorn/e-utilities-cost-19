<script setup>
import { ref, computed, onMounted } from 'vue';
import { useBudgetStore } from '../stores/budget';
import { useCategoryStore } from '../stores/category';

const budgetStore = useBudgetStore();
const categoryStore = useCategoryStore();

const year = ref(new Date().getFullYear());
const showForm = ref(false);
const error = ref('');
const saving = ref(false);

const form = ref({ id: null, budget_category_id: '', monthly_limit: '', yearly_limit: '', note: '' });

const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];

const availableCategories = computed(() => {
  const usedIds = new Set(budgetStore.plans.map((p) => p.budget_category_id));
  return categoryStore.budgetCategories.filter((c) => !usedIds.has(c.id) || c.id === form.value.budget_category_id);
});

function formatBaht(n) {
  return Number(n || 0).toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function usageClass(percent) {
  if (percent == null) return 'bg-gray-300';
  if (percent >= 100) return 'bg-red-500';
  if (percent >= 80) return 'bg-amber-500';
  return 'bg-emerald-500';
}

function usageTextClass(percent) {
  if (percent == null) return 'text-gray-400';
  if (percent >= 100) return 'text-red-600';
  if (percent >= 80) return 'text-amber-600';
  return 'text-emerald-600';
}

function resetForm() {
  form.value = { id: null, budget_category_id: '', monthly_limit: '', yearly_limit: '', note: '' };
  showForm.value = false;
  error.value = '';
}

function editPlan(plan) {
  form.value = {
    id: plan.id,
    budget_category_id: plan.budget_category_id,
    monthly_limit: plan.monthly_limit ?? '',
    yearly_limit: plan.yearly_limit ?? '',
    note: plan.note || '',
  };
  showForm.value = true;
}

async function handleSubmit() {
  error.value = '';
  saving.value = true;
  try {
    const payload = {
      budget_category_id: Number(form.value.budget_category_id),
      year: year.value,
      monthly_limit: form.value.monthly_limit === '' ? null : Number(form.value.monthly_limit),
      yearly_limit: form.value.yearly_limit === '' ? null : Number(form.value.yearly_limit),
      note: form.value.note || null,
    };
    if (form.value.id) {
      await budgetStore.update(form.value.id, payload);
    } else {
      await budgetStore.create(payload);
    }
    resetForm();
    await budgetStore.fetchPlans(year.value);
  } catch (e) {
    error.value = e.response?.data?.message || 'บันทึกไม่สำเร็จ';
  } finally {
    saving.value = false;
  }
}

async function handleDelete(id) {
  if (!confirm('ยืนยันการลบแผนงบประมาณนี้?')) return;
  await budgetStore.remove(id);
  await budgetStore.fetchPlans(year.value);
}

async function load() {
  await Promise.all([budgetStore.fetchPlans(year.value), categoryStore.fetchBudgetCategories()]);
}

onMounted(load);
</script>

<template>
  <div class="space-y-5">
    <!-- Header -->
    <div class="flex items-center justify-between flex-wrap gap-3">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">ควบคุมค่าใช้จ่าย</h1>
        <p class="text-sm text-slate-500 mt-0.5">กำหนดวงเงินงบประมาณและติดตามการใช้จ่ายเทียบกับวงเงินที่ตั้งไว้</p>
      </div>
      <div class="flex items-center gap-2">
        <select v-model.number="year" @change="load" class="input-field !w-32">
          <option v-for="y in [year - 1, year, year + 1]" :key="y" :value="y">ปี {{ y }}</option>
        </select>
        <button @click="showForm = !showForm" class="btn-primary">+ ตั้งวงเงิน</button>
      </div>
    </div>

    <!-- Form -->
    <form v-if="showForm" @submit.prevent="handleSubmit" class="card p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
      <p class="md:col-span-2 text-sm font-semibold text-slate-700">
        {{ form.id ? '✏️ แก้ไขวงเงิน' : '➕ ตั้งวงเงินใหม่' }} (ปี {{ year }})
      </p>
      <div>
        <label class="form-label">หมวดเงิน</label>
        <select v-model="form.budget_category_id" required :disabled="!!form.id" class="input-field">
          <option value="" disabled>เลือกหมวดเงิน</option>
          <option v-for="c in availableCategories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>
      </div>
      <div>
        <label class="form-label">หมายเหตุ</label>
        <input v-model="form.note" type="text" placeholder="เช่น งบหมวด A ประจำปี" class="input-field" />
      </div>
      <div>
        <label class="form-label">วงเงินต่อเดือน (บาท)</label>
        <input v-model="form.monthly_limit" type="number" step="0.01" min="0" placeholder="เช่น 50000" class="input-field" />
      </div>
      <div>
        <label class="form-label">วงเงินต่อปี (บาท)</label>
        <input v-model="form.yearly_limit" type="number" step="0.01" min="0" placeholder="เช่น 600000" class="input-field" />
      </div>
      <p v-if="error" class="md:col-span-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{{ error }}</p>
      <div class="md:col-span-2 flex gap-2">
        <button type="submit" :disabled="saving" class="btn-primary disabled:opacity-50">{{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}</button>
        <button type="button" @click="resetForm" class="btn-secondary">ยกเลิก</button>
      </div>
    </form>

    <!-- Empty state -->
    <div v-if="!budgetStore.plans.length && !budgetStore.loading" class="card p-10 text-center">
      <p class="text-4xl mb-3">🎯</p>
      <p class="font-semibold text-slate-700">ยังไม่มีการตั้งวงเงินสำหรับปี {{ year }}</p>
      <p class="text-sm text-slate-500 mt-1">กดปุ่ม "+ ตั้งวงเงิน" เพื่อเริ่มควบคุมงบประมาณแต่ละหมวดเงิน</p>
    </div>

    <!-- Plan cards -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div v-for="plan in budgetStore.plans" :key="plan.id" class="card p-5 space-y-4">
        <div class="flex items-start justify-between">
          <div>
            <p class="font-bold text-slate-800">{{ plan.category_name }}</p>
            <p class="text-xs text-slate-400 font-mono">{{ plan.category_code }} · ปี {{ plan.year }}</p>
          </div>
          <div class="flex gap-2 text-sm">
            <button @click="editPlan(plan)" class="text-primary-600 hover:underline">แก้ไข</button>
            <button @click="handleDelete(plan.id)" class="text-red-500 hover:underline">ลบ</button>
          </div>
        </div>

        <!-- Yearly usage -->
        <div v-if="plan.yearly_limit">
          <div class="flex justify-between text-sm mb-1">
            <span class="text-slate-600">ใช้ต่อปี: <b>฿{{ formatBaht(plan.used_yearly) }}</b> / ฿{{ formatBaht(plan.yearly_limit) }}</span>
            <span :class="usageTextClass(plan.yearly_usage_percent)" class="font-bold">{{ plan.yearly_usage_percent }}%</span>
          </div>
          <div class="progress-track">
            <div class="progress-fill" :class="usageClass(plan.yearly_usage_percent)" :style="{ width: Math.min(plan.yearly_usage_percent, 100) + '%' }"></div>
          </div>
          <p class="text-xs mt-1" :class="plan.yearly_remaining < 0 ? 'text-red-600 font-semibold' : 'text-slate-500'">
            {{ plan.yearly_remaining < 0 ? `เกินวงเงิน ฿${formatBaht(Math.abs(plan.yearly_remaining))}` : `คงเหลือ ฿${formatBaht(plan.yearly_remaining)}` }}
          </p>
        </div>
        <p v-else class="text-xs text-slate-400">ไม่ได้ตั้งวงเงินรายปี</p>

        <!-- Monthly usage -->
        <div v-if="plan.monthly_limit">
          <p class="text-xs text-slate-500 mb-2">วงเงินรายเดือน ฿{{ formatBaht(plan.monthly_limit) }}/เดือน</p>
          <div class="grid grid-cols-6 sm:grid-cols-12 gap-1.5">
            <div v-for="(used, i) in plan.monthly_used" :key="i" class="text-center">
              <div class="h-16 flex items-end justify-center">
                <div
                  class="w-full rounded-t-md transition-all"
                  :class="usageClass(plan.monthly_limit ? (used / plan.monthly_limit) * 100 : 0)"
                  :style="{ height: Math.min(plan.monthly_limit ? (used / plan.monthly_limit) * 100 : 0, 100) + '%' }"
                  :title="`${monthNames[i]}: ฿${formatBaht(used)}`"
                ></div>
              </div>
              <p class="text-[9px] text-slate-400 mt-0.5">{{ monthNames[i] }}</p>
            </div>
          </div>
        </div>
        <p v-else class="text-xs text-slate-400">ไม่ได้ตั้งวงเงินรายเดือน</p>

        <!-- Over months alert -->
        <div v-if="plan.months_over.length" class="bg-red-50 border border-red-100 text-red-700 text-xs rounded-lg px-3 py-2">
          ⚠️ เกินวงเงินเดือน: {{ plan.months_over.map((m) => monthNames[m.month - 1]).join(', ') }}
        </div>
      </div>
    </div>

    <p v-if="budgetStore.loading" class="text-sm text-slate-400">กำลังโหลดข้อมูล...</p>
  </div>
</template>