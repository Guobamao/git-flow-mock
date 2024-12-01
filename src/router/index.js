import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/index/index.vue'),
    },
    {
      path: '/area',
      name: 'area',
      component: () => import('@/views/area/index.vue'),
    },
    {
      path: '/flow',
      name: 'flow',
      component: () => import('@/views/flow/index.vue'),
    },
  ],
})

export default router
