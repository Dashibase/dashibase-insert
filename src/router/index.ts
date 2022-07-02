import { createWebHistory, createRouter } from 'vue-router'
import Main from '@/components/Main.vue'
import LogIn from '@/components/auth/LogIn.vue'
import SignUp from '@/components/auth/SignUp.vue'
import Edit from '@/components/Edit.vue'
import Create from '@/components/Create.vue'
import Form from '@/components/Form.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Main,
  }, {
    path: '/login',
    component: LogIn,
  }, {
    path: '/signup',
    component: SignUp,
  }, {
    path: '/f/:formId',
    component: Form,
    props: true,
  }, {
    path: '/edit/:formId',
    component: Edit,
    props: true,
  }, {
    path: '/new/:formId',
    component: Create,
    props: true,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
