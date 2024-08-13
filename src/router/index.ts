import { createWebHistory, createRouter } from 'vue-router'

const routes = [
  {
    name: 'Index',
    path: '/',
    component: () => import('@/view/index.vue'),
    meta: {
      title: '行程定制'
    }
  },
  {
    name: 'Notes',
    path: '/notes',
    component: () => import('@/view/notes.vue'),
    meta: {
      title: '简历定制'
    }
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes,
})

router.beforeEach((to, from) => {
  console.log(to, from)
  document.title = to.meta.title as string
})

export default router
