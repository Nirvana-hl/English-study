<template>
  <div class="login-container">
    <div class="login-form">
      <h2>用户登录</h2>
      <form @submit.prevent="handleLogin">
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
            placeholder="请输入密码"
          >
        </div>
        <button type="submit" :disabled="loading || countdown > 0">
          {{ loading ? '登录中...' : countdown > 0 ? `请等待 ${countdown} 秒` : '登录' }}
        </button>
        <p class="register-link">
          还没有账号？<router-link to="/register">立即注册</router-link>
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
  name: 'Login',
  data() {
    return {
      email: '',
      password: '',
      loading: false,
      error: '',
      countdown: 0, // 倒计时秒数
      countdownTimer: null // 倒计时定时器
    };
  },
  beforeUnmount() {
    // 清理定时器
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
    
    async handleLogin() {
      // 检查是否在倒计时中
      if (this.countdown > 0) {
        this.error = `请在 ${this.countdown} 秒后再试`;
        return;
      }

      // 表单验证
      if (!this.email || !this.password) {
        this.error = '请输入邮箱和密码';
        return;
      }

      this.loading = true;
      this.error = '';
      
      try {
        await authService.login(this.email, this.password);
        // 登录成功后跳转到功能界面
        this.$router.push('/');
      } catch (error) {
        // 处理常见登录错误
        if (error.message.includes('秒后')) {
          // 解析等待时间并显示倒计时
          const waitTime = parseInt(error.message.match(/(\d+)秒/)?.[1] || '14');
          this.error = error.message;
          this.startCountdown(waitTime);
        } else if (error.message.includes('邮箱或密码错误')) {
          this.error = error.message;
        } else if (error.message.includes('有效的邮箱地址')) {
          this.error = error.message;
        } else {
          this.error = error.message || '登录失败，请检查邮箱和密码';
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
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.login-form {
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

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.register-link a {
  color: #3182ce;
  text-decoration: none;
}

.register-link a:hover {
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