import { createWebHashHistory } from 'vue-router'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHashHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/flow/index.vue'),
    },
  ],
})

export default router
