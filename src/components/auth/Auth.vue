<template>
  <div class="auth-wrapper">
    <transition name="fade" mode="out-in">
      <Login v-if="currentView === 'login'" @switch="handleSwitch" />
      <Register v-else @switch="handleSwitch" />
    </transition>
  </div>
</template>

<script>
import Login from './Login.vue';
import Register from './Register.vue';

export default {
  name: 'Auth',
  components: {
    Login,
    Register
  },
  data() {
    return {
      currentView: 'login'
    };
  },
  methods: {
    handleSwitch(view) {
      this.currentView = view;
    }
  }
};
</script>

<style scoped>
.auth-wrapper {
  width: 100%;
  min-height: 100vh;
}

/* 过渡动画 */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>