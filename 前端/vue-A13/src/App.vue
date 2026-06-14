<script setup lang="ts">
import { RouterLink, RouterView, useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ref, onMounted } from 'vue'
import BackToTop from './components/common/BackToTop.vue'
import FloatingAgent from './components/common/FloatingAgent.vue'

// 页面启用状态
const pageStatus = ref<Record<string, boolean>>({})

// 面试模拟下拉菜单状态
const interviewMenuOpen = ref(false)

// 获取页面状态
const fetchPageStatus = async () => {
  try {
    const token = localStorage.getItem('token')
    if (!token) {
      return
    }
    
    const response = await fetch('http://localhost:8000/admin/pages/status', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
    
    if (response.ok) {
      const pages = await response.json()
      const status: Record<string, boolean> = {}
      pages.forEach((page: any) => {
        status[page.route] = page.is_enabled
      })
      pageStatus.value = status
    }
  } catch (error) {
    console.error('获取页面状态失败:', error)
  }
}

// 检查页面是否启用
const isPageEnabled = (routePath: string): boolean => {
  return pageStatus.value[routePath] !== false
}

// 页面加载时获取页面状态
onMounted(async () => {
  await fetchPageStatus()
})

const userStore = useUserStore()
const mobileMenuOpen = ref(false)
const router = useRouter()
const route = useRoute()

// 监听路由变化，自动回到顶部
router.beforeEach((to, from) => {
  // 直接跳转到目标页面的顶部，不先回到当前页面的顶部
  return true
})

router.afterEach(() => {
  // 路由跳转完成后，滚动到目标页面的顶部
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
})

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

// 检查是否为登录页面
const isLoginPage = () => {
  return route.path === '/login'
}

// 检查是否为管理端页面
const isAdminPage = () => {
  return route.path === '/admin'
}

// 切换面试模拟菜单
const toggleInterviewMenu = () => {
    interviewMenuOpen.value = !interviewMenuOpen.value
}

// 关闭面试模拟菜单
const closeInterviewMenu = () => {
    interviewMenuOpen.value = false
}

// 根据路由路径获取页面标题
const getPageTitle = (path: string): string => {
    const pageTitles: Record<string, string> = {
        '/': '首页',
        '/job-explore': '岗位探索',
        '/student-profile': '学生画像',
        '/career-plan': '职业规划',
        '/my-interview': '我的面试',
        '/interview-questions': '面试问题',
        '/my-written-test': '面试准备',
        '/report': '报告导出',
        '/admin': '管理中心',
        '/user-center': '个人中心',
        '/login': '用户登录'
    }
    
    // 检查动态路由匹配
    if (path.startsWith('/interview-detail/')) {
        return '面试详细'
    }
    
    return pageTitles[path] || '未知页面'
}
</script>

<template>
  <!-- 登录页面单独显示 -->
  <template v-if="isLoginPage()">
    <div class="login-container">
      <RouterView v-slot="{ Component }">
        <Transition name="page-transition" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </div>
  </template>
  
  <!-- 管理端页面单独显示 -->
  <template v-else-if="isAdminPage()">
    <RouterView v-slot="{ Component }">
      <Transition name="page-transition" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </template>
  
  <!-- 其他页面显示侧边导航 -->
  <template v-else>
    <div class="app">
      <!-- 侧边导航栏 -->
      <aside class="app-sidebar">
        <!-- 侧边栏背景动画 -->
        <div class="sidebar-bg-animations">
          <div class="sidebar-particle"></div>
          <div class="sidebar-particle"></div>
          <div class="sidebar-particle"></div>
          <div class="sidebar-particle"></div>
          <div class="sidebar-particle"></div>
          <div class="sidebar-glow"></div>
        </div>
        <div class="sidebar-content">
          <!-- Logo -->
          <RouterLink to="/" class="logo-link">
            <div class="logo-container">
              <div class="logo-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
                </svg>
              </div>
              <h1 class="app-title">职业规划系统</h1>
            </div>
          </RouterLink>

          <!-- Navigation -->
          <nav class="sidebar-nav">
            <RouterLink v-if="isPageEnabled('/')" to="/" class="nav-link">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              <span>首页</span>
            </RouterLink>
            <RouterLink v-if="isPageEnabled('/job-explore')" to="/job-explore" class="nav-link">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
              <span>岗位探索</span>
            </RouterLink>
            <RouterLink v-if="isPageEnabled('/student-profile')" to="/student-profile" class="nav-link">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>学生画像</span>
            </RouterLink>
            <RouterLink v-if="isPageEnabled('/career-plan')" to="/career-plan" class="nav-link">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              <span>职业规划</span>
            </RouterLink>
            
            <!-- 面试模拟下拉菜单 -->
            <div class="nav-dropdown" :class="{ 'open': interviewMenuOpen }">
              <div class="nav-link dropdown-toggle" @click="toggleInterviewMenu">
                <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                  <line x1="6" y1="1" x2="6" y2="4"/>
                  <line x1="10" y1="1" x2="10" y2="4"/>
                  <line x1="14" y1="1" x2="14" y2="4"/>
                </svg>
                <span>面试模拟</span>
                <svg class="dropdown-arrow" :class="{ 'rotated': interviewMenuOpen }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </div>
              <div class="dropdown-menu">
                <RouterLink v-if="isPageEnabled('/my-interview')" to="/my-interview" class="dropdown-item" @click="closeInterviewMenu">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  <span>我的面试</span>
                </RouterLink>
                <RouterLink v-if="isPageEnabled('/interview-questions')" to="/interview-questions" class="dropdown-item" @click="closeInterviewMenu">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 0 1-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                  </svg>
                  <span>面试问题</span>
                </RouterLink>
                <RouterLink v-if="isPageEnabled('/my-written-test')" to="/my-written-test" class="dropdown-item" @click="closeInterviewMenu">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                  <span>面试准备</span>
                </RouterLink>
              </div>
            </div>
            <RouterLink v-if="isPageEnabled('/report')" to="/report" class="nav-link">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14,2 14,8 20,8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10,9 9,9 8,9"/>
              </svg>
              <span>报告导出</span>
            </RouterLink>
            <!-- 管理员专用链接 -->
            <RouterLink v-if="userStore.user?.role === 'admin'" to="/admin" class="nav-link">
              <svg class="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              <span>管理中心</span>
            </RouterLink>
          </nav>

          <!-- User Info -->
          <div class="sidebar-footer">
            <template v-if="userStore.isLoggedIn">
              <RouterLink to="/user-center" class="user-info-link">
                <div class="user-avatar">
                  <img 
                    v-if="userStore.user?.avatar" 
                    :src="userStore.user.avatar" 
                    alt="用户头像" 
                    class="avatar-image"
                  />
                  <div v-else class="avatar-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                  </div>
                </div>
                <div class="user-details">
                  <p class="user-name">{{ userStore.user?.username }}</p>
                  <p class="user-role">{{ userStore.user?.role }}</p>
                </div>
              </RouterLink>
              <div class="sidebar-actions">
                <button class="action-link logout-btn" @click="userStore.logout()" title="退出登录">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                    <polyline points="16 17 21 12 16 7"/>
                    <line x1="21" y1="12" x2="9" y2="12"/>
                  </svg>
                  <span>退出登录</span>
                </button>
              </div>
            </template>
          </div>
        </div>
      </aside>

      <!-- 主内容区域 -->
      <main class="app-main">
        <!-- 页面标题栏 -->
        <div class="page-header">
          <div class="page-title-container">
            <h1 class="page-title">{{ getPageTitle(route.path) }}</h1>
            <div class="page-breadcrumb">
              <span class="breadcrumb-item">职业规划系统</span>
              <span class="breadcrumb-separator">/</span>
              <span class="breadcrumb-item current">{{ getPageTitle(route.path) }}</span>
            </div>
          </div>
          <div class="page-actions">
            <!-- 可以添加页面相关的操作按钮 -->
          </div>
        </div>
        
        <RouterView v-slot="{ Component }">
          <Transition name="page-transition" mode="out-in">
            <component :is="Component" />
          </Transition>
        </RouterView>
        <BackToTop />
        <FloatingAgent />
      </main>
    </div>
  </template>
</template>

<style scoped>
/* Page Transition Animation */
.page-transition-enter-active,
.page-transition-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.98);
}

.page-transition-enter-to,
.page-transition-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* Login Page Container */
.login-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

/* App Container */
.app {
  width: 100%;
  min-height: 100vh;
  display: flex;
  background-color: #f5f7fa;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* Sidebar Styles */
.app-sidebar {
  width: 280px;
  background: linear-gradient(135deg, #1a237e 0%, #283593 30%, #3949ab 60%, #3f51b5 100%);
  color: white;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  z-index: 1000;
  overflow-y: auto;
  animation: sidebarGlow 8s ease-in-out infinite;
}

/* 侧边栏背景动画 */
.sidebar-bg-animations {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.sidebar-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: sidebarParticleFloat 8s ease-in-out infinite;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.8);
}

.sidebar-particle:nth-child(1) { top: 10%; left: 20%; animation-delay: 0s; }
.sidebar-particle:nth-child(2) { top: 30%; left: 80%; animation-delay: 1s; }
.sidebar-particle:nth-child(3) { top: 50%; left: 40%; animation-delay: 2s; }
.sidebar-particle:nth-child(4) { top: 70%; left: 60%; animation-delay: 3s; }
.sidebar-particle:nth-child(5) { top: 90%; left: 25%; animation-delay: 4s; }

@keyframes sidebarParticleFloat {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) scale(1.5);
    opacity: 0.9;
  }
}

.sidebar-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, transparent 70%);
  border-radius: 50%;
  animation: sidebarGlowPulse 6s ease-in-out infinite;
}

@keyframes sidebarGlowPulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.6;
  }
}

@keyframes sidebarGlow {
  0%, 100% {
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15), inset 0 0 0 rgba(255, 255, 255, 0);
  }
  50% {
    box-shadow: 4px 0 30px rgba(99, 102, 241, 0.3), inset 0 0 20px rgba(255, 255, 255, 0.05);
  }
}

.sidebar-content {
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* Logo Styles */
.logo-link {
  text-decoration: none;
  color: white;
  margin-bottom: 2.5rem;
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1rem;
}

.logo-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
  transition: all 0.3s ease;
}

.logo-icon:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
}

.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: white;
}

/* Sidebar Navigation */
.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-link {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  padding: 0.875rem 1rem;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  position: relative;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-link:hover {
  color: white;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.15) 100%);
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-link.router-link-active {
  color: white;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.3) 100%);
  font-weight: 600;
  animation: activePulse 2s ease-in-out infinite;
}

@keyframes activePulse {
  0%, 100% {
    box-shadow: 0 0 0 rgba(99, 102, 241, 0);
  }
  50% {
    box-shadow: 0 0 15px rgba(99, 102, 241, 0.3);
  }
}

.nav-link.router-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0 2px 2px 0;
  animation: indicatorGlow 2s ease-in-out infinite;
}

@keyframes indicatorGlow {
  0%, 100% {
    box-shadow: 0 0 5px rgba(102, 126, 234, 0.5);
  }
  50% {
    box-shadow: 0 0 15px rgba(102, 126, 234, 0.8);
  }
}

.nav-icon {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
}

/* Dropdown Menu Styles */
.nav-dropdown {
  position: relative;
  margin-bottom: 0.5rem;
}

.dropdown-toggle {
  cursor: pointer;
  justify-content: space-between;
}

.dropdown-arrow {
  transition: transform 0.3s ease;
  opacity: 0.7;
  margin-left: auto;
  flex-shrink: 0;
}

.dropdown-arrow.rotated {
  transform: rotate(180deg);
}

.dropdown-menu {
  position: relative;
  background: transparent;
  border-radius: 8px;
  overflow: hidden;
  max-height: 0;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  margin-top: 0;
}

.nav-dropdown.open .dropdown-menu {
  max-height: 200px;
  opacity: 1;
  transform: translateY(0);
  padding: 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.875rem 1rem 0.875rem 2.2rem;
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  margin-bottom: 0.5rem;
}

.dropdown-item:last-child {
  margin-bottom: 0;
}

.dropdown-item:hover {
  color: white;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.15) 100%);
  transform: translateX(4px);
  border-left-color: rgba(255, 255, 255, 0.3);
}

.dropdown-item.router-link-active {
  color: white;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.3) 100%);
  font-weight: 600;
  border-left-color: #667eea;
}

.dropdown-item.router-link-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 0 2px 2px 0;
  animation: indicatorGlow 2s ease-in-out infinite;
}

/* Sidebar Footer */
.sidebar-footer {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  text-decoration: none;
  color: white;
  margin-bottom: 1.5rem;
}

.user-info-link:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
  animation: avatarPulse 3s ease-in-out infinite;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes avatarPulse {
  0%, 100% {
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }
  50% {
    box-shadow: 0 2px 20px rgba(102, 126, 234, 0.6), 0 0 0 4px rgba(102, 126, 234, 0.1);
  }
}

.user-details {
  flex: 1;
}

.user-name {
  font-weight: 600;
  margin: 0 0 0.25rem;
  font-size: 0.95rem;
}

.user-role {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

.sidebar-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.action-link {
  color: rgba(255, 255, 255, 0.85);
  text-decoration: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: transparent;
  border: none;
  cursor: pointer;
  width: 100%;
  text-align: left;
}

.action-link:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.logout-btn:hover {
  color: #f87171;
  background: rgba(248, 113, 113, 0.1);
}

/* Main Content */
.app-main {
  flex: 1;
  margin-left: 280px;
  min-height: 100vh;
  padding: 2rem;
  background-color: #f5f7fa;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .app-sidebar {
    width: 240px;
  }
  
  .app-main {
    margin-left: 240px;
    padding: 1.5rem;
  }
  
  .app-title {
    font-size: 1.25rem;
  }
}

@media (max-width: 768px) {
  .app-sidebar {
    width: 100%;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
  }
  
  .app-sidebar.is-open {
    transform: translateX(0);
  }
  
  .app-main {
    margin-left: 0;
    padding: 1.5rem;
  }
  
  .logo-container {
    padding: 0;
  }
  
  .app-title {
    font-size: 1.1rem;
  }
  
  .nav-link {
    padding: 0.75rem;
  }
}

@media (max-width: 480px) {
  .app-main {
    padding: 1rem;
  }
  
  .logo-icon {
    width: 36px;
    height: 36px;
  }
  
  .app-title {
    font-size: 1rem;
  }
}

/* 页面标题栏样式 */
.page-header {
  background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
  border-bottom: 1px solid #e2e8f0;
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: pageHeaderSlideIn 0.5s ease-out;
}

@keyframes pageHeaderSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.page-title-container {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.page-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  line-height: 1.2;
}

.page-breadcrumb {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: #64748b;
}

.breadcrumb-item {
  transition: color 0.2s ease;
}

.breadcrumb-item.current {
  color: #3b82f6;
  font-weight: 500;
}

.breadcrumb-separator {
  color: #cbd5e1;
}

.page-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    padding: 1rem 1.5rem;
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .page-title {
    font-size: 1.5rem;
  }
  
  .page-actions {
    width: 100%;
    justify-content: flex-end;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 1rem;
    margin-bottom: 1rem;
  }
  
  .page-title {
    font-size: 1.25rem;
  }
  
  .page-breadcrumb {
    font-size: 0.8rem;
  }
}
</style>
