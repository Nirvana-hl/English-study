import { createClient } from '@supabase/supabase-js';

// 从环境变量获取Supabase配置
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// 创建Supabase客户端
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Supabase配置缺失，请检查环境变量');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);