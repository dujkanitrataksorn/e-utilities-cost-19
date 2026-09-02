import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const routes = [
  { path: '/login', name: 'login', component: () => import('../views/LoginView.vue'), meta: { public: true } },
  { path: '/register', name: 'register', component: () => import('../views/RegisterView.vue'), meta: { public: true } },
  { path: '/forgot-password', name: 'forgot-password', component: () => import('../views/ForgotPasswordView.vue'), meta: { public: true } },
  { path: '/reset-password', name: 'reset-password', component: () => import('../views/ResetPasswordView.vue'), meta: { public: true } },
  { path: '/', name: 'dashboard', component: () => import('../views/DashboardView.vue') },
  { path: '/expenses', name: 'expense-list', component: () => import('../views/ExpenseListView.vue') },
  { path: '/expenses/create', name: 'expense-create', component: () => import('../views/ExpenseFormView.vue') },
  { path: '/expenses/:id/edit', name: 'expense-edit', component: () => import('../views/ExpenseFormView.vue'), props: true },
  { path: '/settings/expense-categories', name: 'expense-categories', component: () => import('../views/CategoryManageView.vue') },
  { path: '/settings/budget-categories', name: 'budget-categories', component: () => import('../views/CategoryManageView.vue') },
  { path: '/budget-control', name: 'budget-control', component: () => import('../views/BudgetControlView.vue') },
  { path: '/reports', name: 'reports', component: () => import('../views/ReportHistoryView.vue') },
  { path: '/admin', name: 'admin-panel', component: () => import('../views/AdminPanelView.vue'), meta: { adminOnly: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Route guard: redirect ไปหน้า login หาก token หมดอายุ/ไม่มี
// และป้องกัน admin-only routes จากผู้ใช้ที่ไม่ใช่ admin
router.beforeEach(async (to) => {
  const auth = useAuthStore();

  if (to.meta.public) return true;

  if (!auth.isAuthenticated) {
    const refreshed = await auth.refreshAccessToken();
    if (!refreshed) {
      return { name: 'login', query: { redirect: to.fullPath } };
    }
  }

  // ป้องกัน admin-only routes
  if (to.meta.adminOnly && !auth.isAdmin) {
    return { name: 'dashboard' };
  }

  return true;
});

export default router;
