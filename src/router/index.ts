import { createWebHistory, createRouter } from 'vue-router'

const routes = [
  {
    name: 'Index',
    path: '/',
    component: () => import('@/view/index.vue'),
    meta: {
      title: '行程定制',
    },
  },
  {
    name: 'Notes',
    path: '/notes',
    component: () => import('@/view/notes.vue'),
    meta: {
      title: '',
    },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes,
})

router.beforeEach((to, _from) => {
  document.title = to.meta.title as string
})

export default router
