import { supabase } from '../supabase.js';

// 认证服务
export const authService = {
  // 登录
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  },

  // 注册
  async register(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  },

  // 登出
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('登出失败:', error);
      throw error;
    }
  },

  // 获取当前用户
  async getCurrentUser() {
    const { data } = await supabase.auth.getUser();
    return data.user;
  },

  // 监听用户状态变化
  onAuthStateChange(callback) {
    return supabase.auth.onAuthStateChange(callback);
  }
};