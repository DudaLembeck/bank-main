import { createRouter, createWebHistory } from '@ionic/vue-router'
import { RouteRecordRaw } from 'vue-router'
import { useUsuarioStore } from '../stores/usuario'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/LoginPage.vue'),
    meta: { somenteVisitante: true }
  },
  {
    path: '/cadastro',
    name: 'cadastro',
    component: () => import('../views/CadastroPage.vue'),
    meta: { somenteVisitante: true }
  },
  {
    path: '/home',
    name: 'home',
    component: () => import('../views/HomePage.vue'),
    meta: { requerLogin: true }
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const usuario = useUsuarioStore()

  if (to.meta.requerLogin && !usuario.logado) {
    next({ path: '/login', query: { redirecionar: to.path } })
    return
  }

  if (to.meta.somenteVisitante && usuario.logado) {
    next('/home')
    return
  }

  next()
})

export default router
