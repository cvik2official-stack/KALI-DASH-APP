import { createRouter, createWebHistory } from 'vue-router';
import AdminDashboard from '@/views/AdminDashboard.vue';
import TodoList from '@/components/TodoList.vue'; // Import the new TodoList component

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/', // Set AdminDashboard as the default route
      name: 'admin',
      component: AdminDashboard,
    },
    {
      path: '/todo', // New route for the To-Do List
      name: 'todo',
      component: TodoList,
    },
  ],
});

export default router;