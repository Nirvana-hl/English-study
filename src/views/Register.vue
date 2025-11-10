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
            placeholder="请输入密码（至少8位）"
            minlength="8"
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
        <button type="submit" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
        <p class="login-link">
          已有账号？<router-link to="/login">立即登录</router-link>
        </p>
      </form>
      <div v-if="error" class="error-message">{{ error }}</div>
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
      error: ''
    };
  },
  methods: {
    async handleRegister() {
      // 表单验证
      if (this.password !== this.confirmPassword) {
        this.error = '两次输入的密码不一致';
        return;
      }

      if (this.password.length < 8) {
        this.error = '密码长度至少为8位';
        return;
      }

      this.loading = true;
      this.error = '';
      
      try {
        await authService.register(this.email, this.password, this.username);
        // 注册成功后自动登录并跳转到功能界面
        await authService.login(this.email, this.password);
        this.$router.push('/');
      } catch (error) {
        this.error = error.message || '注册失败，请稍后重试';
      } finally {
        this.loading = false;
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
</style>