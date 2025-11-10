// 路由配置
import { createRouter, createWebHistory } from 'vue-router';
import authService from '../services/auth.js';

// 懒加载组件
const Login = () => import('../views/Login.vue');
const Register = () => import('../views/Register.vue');
const Home = () => import('../views/Home.vue');

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true } // 需要登录才能访问
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false } // 不需要登录就能访问
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false } // 不需要登录就能访问
  },
  // 捕获所有未匹配的路由，重定向到登录页
  {
    path: '/:pathMatch(.*)*',
    redirect: '/login'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫，检查用户是否已登录
router.beforeEach(async (to, from, next) => {
  // 检查该路由是否需要登录
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  
  if (requiresAuth) {
    // 需要登录，检查用户是否已登录
    const user = await authService.getCurrentUser();
    if (user) {
      // 已登录，继续访问
      next();
    } else {
      // 未登录，重定向到登录页
      next({
        path: '/login',
        query: { redirect: to.fullPath } // 保存用户想要访问的页面
      });
    }
  } else {
    // 不需要登录的页面，直接访问
    next();
  }
});

export default router;