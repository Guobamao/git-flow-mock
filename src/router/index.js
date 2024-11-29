import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/App.vue'),
    },
    {
      path: '/area',
      name: 'area',
      component: () => import('@/views/area/index.vue'),
    },
  ],
})

export default router
