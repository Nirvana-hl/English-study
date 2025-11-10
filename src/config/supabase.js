// Supabase配置文件
import { createClient } from '@supabase/supabase-js';

// 创建Supabase客户端实例
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://vzklixhtzjwblqbyudmp.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ6a2xpeGh0emp3YmxxYnl1ZG1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NTA4ODUsImV4cCI6MjA3MzMyNjg4NX0.YwbEGafz0T3f2bpfd-VFWGBpDyxCaqSGieDctBg5xL0';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;