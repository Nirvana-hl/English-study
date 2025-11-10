<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import Navigation from './components/common/Navigation.vue';
import WordList from './components/words/WordList.vue';
import EssayList from './components/essays/EssayList.vue';
import SentenceList from './components/sentences/SentenceList.vue';
import ExamCalendar from './components/calendar/ExamCalendar.vue';
import Auth from './components/auth/Auth.vue';
import { authService } from './services/authService.js';

const currentView = ref('words');
const user = ref(null);
const isLoading = ref(true);

// 处理视图切换
const handleViewChange = (view) => {
  currentView.value = view;
};

// 处理登出
const handleLogout = async () => {
  try {
    await authService.logout();
  } catch (error) {
    console.error('登出失败:', error);
  }
};

// 根据用户状态显示不同组件
const mainContentComponent = computed(() => {
  if (isLoading.value) {
    return null;
  }
  return user.value ? currentViewComponent.value : Auth;
});

// 根据当前视图返回对应的组件
const currentViewComponent = computed(() => {
  switch (currentView.value) {
    case 'words':
      return WordList;
    case 'essays':
      return EssayList;
    case 'sentences':
      return SentenceList;
    case 'calendar':
      return ExamCalendar;
    default:
      return WordList;
  }
});

// 监听用户状态变化
let subscription;
onMounted(async () => {
  try {
    // 初始获取用户信息
    const currentUser = await authService.getCurrentUser();
    user.value = currentUser;
  } catch (error) {
    console.error('获取用户信息失败:', error);
  } finally {
    isLoading.value = false;
  }

  // 订阅用户状态变化
  subscription = authService.onAuthStateChange((event, session) => {
    user.value = session?.user || null;
  });
});

onUnmounted(() => {
  if (subscription) {
    subscription.data?.unsubscribe();
  }
});
</script>

<template>
  <div class="app">
    <!-- 只有登录后才显示导航栏 -->
    <Navigation 
      v-if="user" 
      :current-view="currentView" 
      :user="user"
      @view-change="handleViewChange"
      @logout="handleLogout"
    />
    <main class="main-content">
      <!-- 显示加载状态 -->
      <div v-if="isLoading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>加载中...</p>
      </div>
      <!-- 根据用户状态显示内容 -->
      <template v-else>
        <transition name="fade" mode="out-in">
          <component :is="mainContentComponent" :key="user ? currentView : 'auth'" />
        </transition>
      </template>
    </main>
    <!-- 只有登录后才显示页脚 -->
    <footer v-if="user" class="footer">
      <p>© 2024 英语学习助手 - Vue + Supabase 项目</p>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App'
}
</script>

<style scoped>
.app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding: 20px 0;
  background-color: #f9fafb;
}

/* 加载状态样式 */
.loading-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  color: #3b82f6;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.footer {
  background-color: #f3f4f6;
  padding: 20px 0;
  text-align: center;
  color: #666;
  font-size: 14px;
}

/* 过渡动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
