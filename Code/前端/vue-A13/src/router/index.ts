import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useUserStore } from '@/stores/user'

// 页面启用状态缓存
let pageStatusCache: Record<string, boolean> = {}
let pageStatusLastUpdated: number = 0

// 获取页面状态
const getPageStatus = async (routePath: string): Promise<boolean> => {
  // 检查缓存是否过期（5分钟）
  const now = Date.now()
  if (now - pageStatusLastUpdated > 5 * 60 * 1000) {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        return true // 未登录时默认允许访问
      }

      const response = await fetch('/api/admin/pages/status', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const pages = await response.json()
        pageStatusCache = {}
        pages.forEach((page: any) => {
          pageStatusCache[page.route] = page.is_enabled
        })
        pageStatusLastUpdated = now
      }
    } catch (error) {
      console.error('获取页面状态失败:', error)
    }
  }

  // 如果缓存中没有该页面的状态，默认返回true
  return pageStatusCache[routePath] !== false
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
    },
    {
      path: '/user-center',
      name: 'user-center',
      component: () => import('../views/UserCenter.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/job-explore',
      name: 'job-explore',
      component: () => import('../views/JobExplore.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/student-profile',
      name: 'student-profile',
      component: () => import('../views/StudentProfile.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/career-plan',
      name: 'career-plan',
      component: () => import('../views/CareerPlan.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/report',
      name: 'report',
      component: () => import('../views/Report.vue'),
      meta: { requiresAuth: true }
    },


    {
      path: '/interview-questions',
      name: 'interview-questions',
      component: () => import('../views/InterviewQuestions.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/my-interview',
      name: 'my-interview',
      component: () => import('../views/MyInterview.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/interview-detail/:id',
      name: 'interview-detail',
      component: () => import('../views/InterviewDetail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/my-written-test',
      name: 'my-written-test',
      component: () => import('../views/MyWrittenTest.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/AdminView.vue'),
      meta: { requiresAuth: true }
    },

  ],
})

// 路由守卫
router.beforeEach(async (to, from) => {
  const userStore = useUserStore()

  // 每次启动或刷新页面时强制要求重新登录
  // 无论是否需要认证，都先清除登录状态
  if (from.name === null) {
    // 首次加载或刷新，强制清除登录状态（同步执行）
    userStore.token = null
    userStore.user = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.removeItem('user')

    // 清除登录状态后，直接跳转到登录页
    if (to.path !== '/login') {
      // 使用 window.location.href 强制跳转
      window.location.href = '/login'
      return false
    }
  }

  // 检查是否需要认证
  if (to.meta.requiresAuth !== false && !userStore.isLoggedIn) {
    // 未登录，强制重定向到登录页
    if (to.path !== '/login') {
      return '/login'
    }
  }

  // 检查页面是否启用（排除登录页和管理页）
  if (to.path !== '/login' && to.path !== '/admin') {
    const isEnabled = await getPageStatus(to.path)
    if (!isEnabled) {
      // 页面未启用，重定向到首页
      return '/'
    }
  }

  // 已登录或不需要认证，继续导航
  return true
})

export default router
