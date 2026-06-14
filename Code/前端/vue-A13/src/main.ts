import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 引入 Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// 引入 stores
import { useUserStore } from './stores/user'
import { useJobStore } from './stores/job'
import { useCareerStore } from './stores/career'
import { useAgentStore } from './stores/agent'
import { useStudentStore } from './stores/student'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// 初始化 stores 数据
const userStore = useUserStore()
const jobStore = useJobStore()
const careerStore = useCareerStore()
const agentStore = useAgentStore()
const studentStore = useStudentStore()

// 不自动加载用户登录状态，强制要求重新登录

// 从后端加载收藏数据，从 localStorage 加载其他数据（除了用户登录数据）
jobStore.loadFavoritesFromBackend()
careerStore.loadFromLocalStorage()
agentStore.loadFromLocalStorage()
studentStore.loadFromLocalStorage()

// 应用启动时就开始加载 Excel 数据
jobStore.fetchJobs()

// 直接挂载应用
app.mount('#app')
