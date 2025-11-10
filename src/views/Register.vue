<template>
  <div class="register-container">
    <div class="register-form">
      <h2>用户注册</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="username" 
            required 
            placeholder="请输入用户名"
          >
        </div>
        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            required 
            placeholder="请输入邮箱"
          >
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            required 
            placeholder="请输入密码（至少6位）"
            minlength="6"
          >
        </div>
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="confirmPassword" 
            required 
            placeholder="请再次输入密码"
          >
        </div>
        <button type="submit" :disabled="loading || countdown > 0">
          {{ loading ? '注册中...' : (countdown > 0 ? `请等待 ${countdown} 秒` : '注册') }}
        </button>
        <p class="login-link">
          已有账号？<router-link to="/login">立即登录</router-link>
        </p>
      </form>
      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="countdown > 0" class="countdown-info">
        系统正在保护您的账号安全，请稍后再试...
      </div>
    </div>
  </div>
</template>

<script>
import authService from '../services/auth.js';

export default {
  name: 'Register',
  data() {
    return {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      loading: false,
      error: '',
      countdown: 0,
      countdownTimer: null
    };
  },
  beforeUnmount() {
    // 清除倒计时定时器
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  },
  computed: {
    // 检查是否可以提交表单
    canSubmit() {
      return !this.loading && this.countdown === 0;
    }
  },
  methods: {
    // 开始倒计时
    startCountdown(seconds = 14) {
      this.countdown = seconds;
      this.loading = false;
      
      if (this.countdownTimer) {
        clearInterval(this.countdownTimer);
      }
      
      this.countdownTimer = setInterval(() => {
        this.countdown--;
        if (this.countdown <= 0) {
          clearInterval(this.countdownTimer);
          this.countdownTimer = null;
        }
      }, 1000);
    },
    
    async handleRegister() {
      // 检查是否在倒计时中
      if (this.countdown > 0) {
        this.error = `请在 ${this.countdown} 秒后再试`;
        return;
      }

      // 表单验证
      if (this.password !== this.confirmPassword) {
        this.error = '两次输入的密码不一致';
        return;
      }

      if (this.password.length < 6) {
        this.error = '密码长度至少为6位';
        return;
      }

      this.loading = true;
      this.error = '';
      
      try {
        await authService.register(this.email, this.password, this.username);
        // 注册成功后直接跳转到功能界面（Supabase注册成功后已创建会话）
        this.$router.push('/');
      } catch (error) {
        // 处理常见注册错误
        if (error.message.includes('秒后')) {
          // 解析等待时间并显示倒计时
          const waitTime = parseInt(error.message.match(/(\d+)秒/)?.[1] || '14');
          this.error = error.message;
          this.startCountdown(waitTime);
        } else if (error.message.includes('邮箱已被注册')) {
          this.error = error.message;
        } else if (error.message.includes('密码不符合要求')) {
          this.error = error.message;
        } else if (error.message && error.message.includes('秒后再试')) {
          this.error = error.message;
          const waitTime = parseInt(error.message.match(/(\d+)秒/)?.[1] || '14');
          this.startCountdown(waitTime);
        } else {
          this.error = error.message || '注册失败，请稍后重试';
        }
      } finally {
        if (!this.countdownTimer) {
          this.loading = false;
        }
      }
    }
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.register-form {
  background-color: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  transition: border-color 0.3s;
}

input:focus {
  outline: none;
  border-color: #3182ce;
}

button {
  width: 100%;
  padding: 12px;
  background-color: #3182ce;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;
}

button:hover:not(:disabled) {
  background-color: #2c5aa0;
}

button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.login-link a {
  color: #3182ce;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}

.error-message {
  margin-top: 15px;
  padding: 10px;
  background-color: #fed7d7;
  color: #c53030;
  border-radius: 4px;
  text-align: center;
}

.countdown-info {
  margin-top: 10px;
  padding: 8px;
  background-color: #e6fffa;
  color: #2c5aa0;
  border-radius: 4px;
  text-align: center;
  font-size: 14px;
}
</style>