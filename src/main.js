import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import authService from './services/auth.js';

// 创建Vue应用实例
const app = createApp(App)

// 使用路由
app.use(router)

// 提供全局认证状态
app.config.globalProperties.$auth = authService

// 挂载应用
app.mount('#app')
