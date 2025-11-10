<template>
  <div class="home-container">
    <header class="home-header">
      <h1>英语学习助手</h1>
      <div class="user-info">
        <span>欢迎，{{ username || '用户' }}</span>
        <button @click="handleLogout" class="logout-btn">退出登录</button>
      </div>
    </header>
    <
    <main class="content-area">
      <div class="function-tabs">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['tab-btn', { active: activeTab === tab.id }]"
          @click="activeTab = tab.id"
        >
          {{ tab.name }}
        </button>
      </div>
      <
      <div class="tab-content">
        <WordList v-if="activeTab === 'words'" />
        <EssayList v-else-if="activeTab === 'essays'" />
        <SentenceList v-else-if="activeTab === 'sentences'" />
        <ExamCalendar v-else-if="activeTab === 'calendar'" />
      </div>
    </main>
  </div>
</template>

<script>
import authService from '../services/auth.js';
import WordList from '../components/words/WordList.vue';
import EssayList from '../components/essays/EssayList.vue';
import SentenceList from '../components/sentences/SentenceList.vue';
import ExamCalendar from '../components/calendar/ExamCalendar.vue';

export default {
  name: 'Home',
  components: {
    WordList,
    EssayList,
    SentenceList,
    ExamCalendar
  },
  data() {
    return {
      activeTab: 'words',
      tabs: [
        { id: 'words', name: '单词管理' },
        { id: 'essays', name: '作文管理' },
        { id: 'sentences', name: '好句收藏' },
        { id: 'calendar', name: '考试日历' }
      ],
      username: ''
    };
  },
  async beforeMount() {
    // 检查用户是否已登录
    const user = await authService.getCurrentUser();
    if (!user) {
      // 如果未登录，重定向到登录页
      this.$router.push('/login');
    } else {
      // 获取用户名信息
      this.username = user.email.split('@')[0];
    }
  },
  methods: {
    async handleLogout() {
      try {
        await authService.logout();
        this.$router.push('/login');
      } catch (error) {
        console.error('退出登录失败:', error);
        alert('退出登录失败，请稍后重试');
      }
    }
  }
};
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #f8f9fa;
}

.home-header {
  background-color: #3182ce;
  color: white;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
  margin: 0;
  font-size: 24px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
}

.user-info span {
  font-size: 16px;
}

.logout-btn {
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.logout-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.content-area {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.function-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  background-color: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background-color: transparent;
  color: #666;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.3s;
  font-size: 16px;
}

.tab-btn:hover {
  background-color: #f0f0f0;
}

.tab-btn.active {
  background-color: #3182ce;
  color: white;
}

.tab-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .home-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .function-tabs {
    flex-wrap: wrap;
  }
  
  .tab-btn {
    flex: 1;
    min-width: 120px;
  }
}
</style>