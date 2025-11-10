// 认证服务
import supabase from '../config/supabase';

class AuthService {
  // 使用静态变量确保在所有实例间共享请求时间
  static lastRequestTime = 0;
  static minRequestInterval = 15000;
  
  constructor() {
    this.currentUser = null;
    this.listeners = [];
  }

  // 检查请求频率限制
  checkRateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - AuthService.lastRequestTime;
    
    if (timeSinceLastRequest < AuthService.minRequestInterval) {
      const waitTime = Math.ceil((AuthService.minRequestInterval - timeSinceLastRequest) / 1000);
      throw new Error(`为了安全起见，请在 ${waitTime} 秒后再试`);
    }
    
    AuthService.lastRequestTime = now;
  }

  // 注册用户
  async register(email, password, username) {
    try {
      // 检查supabase客户端是否初始化成功
      if (!supabase) {
        throw new Error('数据库连接失败，请检查服务配置后重试');
      }
      
      // 检查请求频率限制
      this.checkRateLimit();
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
          // 处理Supabase的速率限制错误
          if (error.message && error.message.includes('after')) {
            const waitTime = error.message.match(/after\s+(\d+)\s+seconds/)?.[1] || '14';
            const enhancedError = new Error(`为了安全起见，请在 ${waitTime} 秒后再试注册`);
            console.error('注册失败:', enhancedError);
            throw enhancedError;
          }
          // 处理429请求过多的错误，提供更友好的错误消息
          if (error.status === 429) {
            const enhancedError = new Error('请求过于频繁，请14秒后再试');
            console.error('注册失败:', enhancedError);
            throw enhancedError;
          }
          // 处理其他常见错误
          if (error.message && error.message.includes('already registered')) {
            const enhancedError = new Error('该邮箱已被注册，请使用其他邮箱或直接登录');
            console.error('注册失败:', enhancedError);
            throw enhancedError;
          }
          if (error.message && error.message.includes('password')) {
            const enhancedError = new Error('密码不符合要求，请确保密码足够安全');
            console.error('注册失败:', enhancedError);
            throw enhancedError;
          }
          console.error('注册失败:', error);
          throw error;
        }

      // 如果需要存储用户名等额外信息
      if (data.user && username) {
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            username,
            email: data.user.email,
          });
        } catch (profileError) {
          console.error('存储用户信息失败:', profileError);
          // 即使存储用户信息失败，注册仍然成功
        }
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
      // 检查supabase客户端是否初始化成功
      if (!supabase) {
        throw new Error('数据库连接失败，请检查服务配置后重试');
      }
      
      // 检查请求频率限制
      this.checkRateLimit();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
          // 处理Supabase的速率限制错误
          if (error.message && error.message.includes('after')) {
            const waitTime = error.message.match(/after\s+(\d+)\s+seconds/)?.[1] || '14';
            const enhancedError = new Error(`为了安全起见，请在 ${waitTime} 秒后再试登录`);
            console.error('登录失败:', enhancedError);
            throw enhancedError;
          }
          // 处理429请求过多的错误
          if (error.status === 429) {
            const enhancedError = new Error('请求过于频繁，请14秒后再试');
            console.error('登录失败:', enhancedError);
            throw enhancedError;
          }
          // 处理其他常见错误
          if (error.message && error.message.includes('Invalid login credentials')) {
            const enhancedError = new Error('邮箱或密码错误，请检查后重试');
            console.error('登录失败:', enhancedError);
            throw enhancedError;
          }
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