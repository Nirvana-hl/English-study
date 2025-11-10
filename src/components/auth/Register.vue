<template>
  <div class="auth-container">
    <div class="auth-form">
      <h2>用户注册</h2>
      <div v-if="error" class="error-message">{{ error }}</div>
      <div v-if="success" class="success-message">
        注册成功！请前往邮箱验证后登录。
      </div>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            type="email" 
            id="email" 
            v-model="email" 
            placeholder="请输入邮箱" 
            required
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="password" 
            placeholder="请输入密码（至少6位）" 
            required
          />
        </div>
        <div class="form-group">
          <label for="confirmPassword">确认密码</label>
          <input 
            type="password" 
            id="confirmPassword" 
            v-model="confirmPassword" 
            placeholder="请再次输入密码" 
            required
          />
        </div>
        <button type="submit" :disabled="loading" class="submit-button">
          {{ loading ? '注册中...' : '注册' }}
        </button>
        <div class="switch-form">
          <p>已有账号？<a href="#login" @click.prevent="$emit('switch', 'login')">立即登录</a></p>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import { authService } from '../../services/authService.js';

export default {
  name: 'Register',
  data() {
    return {
      email: '',
      password: '',
      confirmPassword: '',
      error: '',
      success: false,
      loading: false
    };
  },
  methods: {
    async handleRegister() {
      this.error = '';
      this.success = false;
      
      // 验证密码
      if (this.password !== this.confirmPassword) {
        this.error = '两次输入的密码不一致';
        return;
      }
      
      if (this.password.length < 6) {
        this.error = '密码长度至少为6位';
        return;
      }
      
      this.loading = true;
      
      try {
        await authService.register(this.email, this.password);
        this.success = true;
        // 清空表单
        this.email = '';
        this.password = '';
        this.confirmPassword = '';
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
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  padding: 20px;
  background-color: #f9fafb;
}

.auth-form {
  background: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  text-align: center;
  margin-bottom: 24px;
  color: #1f2937;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
}

input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.2s;
}

input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.submit-button {
  width: 100%;
  padding: 12px;
  background-color: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 8px;
}

.submit-button:hover:not(:disabled) {
  background-color: #059669;
}

.submit-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background-color: #fee2e2;
  color: #b91c1c;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.success-message {
  background-color: #d1fae5;
  color: #065f46;
  padding: 10px;
  border-radius: 6px;
  margin-bottom: 16px;
}

.switch-form {
  text-align: center;
  margin-top: 20px;
  color: #6b7280;
}

.switch-form a {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
}

.switch-form a:hover {
  text-decoration: underline;
}
</style>