// 认证服务
import supabase from '../config/supabase';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
  }

  // 注册用户
  async register(email, password, username) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('注册失败:', error);
        throw error;
      }

      // 如果需要存储用户名等额外信息
      if (data.user && username) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          username,
          email: data.user.email,
        });
      }

      return data;
    } catch (error) {
      console.error('注册过程中出现错误:', error);
      throw error;
    }
  }

  // 用户登录
  async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('登录失败:', error);
        throw error;
      }

      this.currentUser = data.user;
      return data;
    } catch (error) {
      console.error('登录过程中出现错误:', error);
      throw error;
    }
  }

  // 用户登出
  async logout() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('登出失败:', error);
        throw error;
      }

      this.currentUser = null;
      return true;
    } catch (error) {
      console.error('登出过程中出现错误:', error);
      throw error;
    }
  }

  // 获取当前登录用户
  async getCurrentUser() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        this.currentUser = session.user;
        return session.user;
      }
      
      this.currentUser = null;
      return null;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      return null;
    }
  }

  // 监听认证状态变化
  onAuthStateChange(callback) {
    // 添加回调到监听器列表
    this.listeners.push(callback);

    // 设置Supabase认证状态监听
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser = session?.user || null;
      
      // 调用所有监听器
      this.listeners.forEach(listener => {
        try {
          listener(event, session);
        } catch (error) {
          console.error('认证状态监听回调出错:', error);
        }
      });
    });

    // 返回清理函数
    return () => {
      data.subscription.unsubscribe();
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  // 检查用户是否已登录
  isAuthenticated() {
    return !!this.currentUser;
  }
}

// 导出单例实例
export default new AuthService();