import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: {
        title: 'Статистика сотрудников Bitrix24',
      },
    },
    {
      path: '/about',
      name: 'about',
      meta: {
        title: 'О приложении',
      },
      component: () => import('../views/AboutView.vue'),
    },
  ],
})

router.beforeEach((to, from, next) => {
  document.title = (to.meta.title as string) || 'Статистика сотрудников Bitrix24'
  next()
})

export default router
