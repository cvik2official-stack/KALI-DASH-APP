import { createRouter, createWebHistory } from 'vue-router';
import AdminDashboard from '@/views/AdminDashboard.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/', // Set AdminDashboard as the default route
      name: 'admin',
      component: AdminDashboard,
    },
  ],
});

export default router;