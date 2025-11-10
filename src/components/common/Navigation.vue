<template>
  <nav class="navigation">
    <div class="nav-container">
      <div class="logo">
        <span class="logo-text">英语学习助手</span>
      </div>
      <ul class="nav-links">
        <li class="nav-item">
          <a
            href="#words"
            @click.prevent="changeView('words')"
            :class="{ active: currentView === 'words' }"
          >
            单词本
          </a>
        </li>
        <li class="nav-item">
          <a
            href="#essays"
            @click.prevent="changeView('essays')"
            :class="{ active: currentView === 'essays' }"
          >
            备考作文
          </a>
        </li>
        <li class="nav-item">
          <a
            href="#sentences"
            @click.prevent="changeView('sentences')"
            :class="{ active: currentView === 'sentences' }"
          >
            好句收藏
          </a>
        </li>
        <li class="nav-item">
          <a
            href="#calendar"
            @click.prevent="changeView('calendar')"
            :class="{ active: currentView === 'calendar' }"
          >
            考试日历
          </a>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'Navigation',
  props: {
    currentView: {
      type: String,
      default: 'words'
    }
  },
  methods: {
    changeView(view) {
      this.$emit('view-change', view);
    }
  }
};
</script>

<style scoped>
.navigation {
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 60px;
}

.logo {
  display: flex;
  align-items: center;
}

.logo-text {
  font-size: 20px;
  font-weight: bold;
  color: #3b82f6;
}

.nav-links {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 2px;
}

.nav-item {
  margin: 0;
}

.nav-item a {
  display: block;
  padding: 18px 20px;
  color: #666;
  text-decoration: none;
  font-size: 16px;
  transition: all 0.3s ease;
  border-radius: 4px 4px 0 0;
}

.nav-item a:hover {
  background-color: #f8fafc;
  color: #3b82f6;
}

.nav-item a.active {
  background-color: #3b82f6;
  color: white;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-container {
    flex-direction: column;
    height: auto;
    padding: 10px 0;
  }
  
  .logo {
    margin-bottom: 10px;
  }
  
  .nav-links {
    width: 100%;
    justify-content: center;
    flex-wrap: wrap;
    gap: 5px;
  }
  
  .nav-item a {
    padding: 10px 15px;
    font-size: 14px;
  }
}
</style>