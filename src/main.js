import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

// 临时调试：检查 Vite 环境变量是否被注入（不打印具体值）
console.info('VITE_SUPABASE_URL set?', !!import.meta.env.VITE_SUPABASE_URL);
console.info('VITE_SUPABASE_ANON_KEY set?', !!import.meta.env.VITE_SUPABASE_ANON_KEY);

createApp(App).mount('#app')
