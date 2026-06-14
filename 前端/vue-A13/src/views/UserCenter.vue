<!--
个人中心页面

功能：
- 展示用户个人信息
- 提供个人信息编辑功能
- 保存修改后的信息到后端
- 展示用户的职业规划数据
- 与后端API集成

技术特点：
- 响应式布局
- 数据展示与编辑
- 与后端API集成
-->

<template>
  <Transition name="page-enter" appear>
    <div class="user-center">
    <!-- Page Header - Dark Blue Theme -->
    <section class="page-header">
      <div class="page-header-bg">
        <div class="page-header-pattern"></div>
      </div>
      <div class="page-header-particles">
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
      </div>
      <div class="page-header-energy"></div>
      <div class="page-header-content">
        <span class="page-badge">👤 个人中心</span>
        <h1 class="page-title">个人信息管理</h1>
        <p class="page-subtitle">管理个人资料，追踪职业发展</p>
      </div>
    </section>
    
    <div class="user-profile" v-if="user">
      <div class="profile-header">
        <div class="avatar">
          <img :src="(user.avatar || defaultAvatar)" alt="用户头像" />
        </div>
        <div class="user-info">
          <h3>{{ user.name || user.username }}</h3>
          <p class="user-email">{{ user.email }}</p>
          <p class="user-role">{{ user.role }}</p>
        </div>
        <button class="edit-profile-btn" @click="openEditDialog">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          编辑资料
        </button>
      </div>
      
      <div class="profile-card">
        <div class="card-header">
          <div class="card-title-wrapper">
            <span class="card-icon">📋</span>
            <span>个人信息</span>
          </div>
        </div>
        
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">用户名</span>
            <span class="info-value">{{ user.username }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">姓名</span>
            <span class="info-value">{{ user.name || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">性别</span>
            <span class="info-value">{{ user.gender || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">年龄</span>
            <span class="info-value">{{ user.age || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">联系方式</span>
            <span class="info-value">{{ user.phone || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">专业</span>
            <span class="info-value">{{ user.major || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">年级</span>
            <span class="info-value">{{ user.grade || '未设置' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">邮箱</span>
            <span class="info-value">{{ user.email }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <div class="no-login" v-else>
      <div class="no-login-content">
        <div class="no-login-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <h3>请先登录</h3>
        <p>登录后查看和管理您的个人信息</p>
        <button class="btn-primary" @click="router.push('/login')">去登录</button>
      </div>
    </div>
    
    <div class="user-stats" v-if="user">
      <div class="section-header">
        <h3 class="section-title">📊 职业规划数据</h3>
        <p class="section-desc">您的职业发展进度概览</p>
      </div>
      <div class="stats-grid">
        <div class="stat-card" @click="viewApplications">
          <div class="stat-icon-bg">
            <span class="stat-icon">📊</span>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ careerStats.jobsApplied }}</div>
            <div class="stat-label">申请岗位数</div>
          </div>
          <div class="stat-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>
        
        <div class="stat-card" @click="viewFavorites">
          <div class="stat-icon-bg">
            <span class="stat-icon">💼</span>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ careerStats.jobsSaved }}</div>
            <div class="stat-label">收藏岗位数</div>
          </div>
          <div class="stat-arrow">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon-bg">
            <span class="stat-icon">✅</span>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ careerStats.tasksCompleted }}%</div>
            <div class="stat-label">任务完成率</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon-bg">
            <span class="stat-icon">🎯</span>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ careerStats.matchScore }}</div>
            <div class="stat-label">平均匹配度</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 申请记录表单 -->
    <div class="record-section" v-if="user && showApplications">
      <div class="section-header">
        <h3 class="section-title">📋 申请记录</h3>
        <p class="section-desc">您的岗位申请记录</p>
      </div>
      <div class="record-form">
        <div v-if="userStore.applications.length === 0" class="empty-record">
          <div class="empty-icon">📋</div>
          <p>暂无申请记录</p>
        </div>
        <table v-else class="record-table">
          <thead>
            <tr>
              <th>岗位名称</th>
              <th>公司</th>
              <th>薪资</th>
              <th>地点</th>
              <th>申请时间</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="app in userStore.applications" :key="app.id">
              <td>{{ app.job_title }}</td>
              <td>{{ app.company }}</td>
              <td>{{ app.salary }}</td>
              <td>{{ app.location }}</td>
              <td>{{ formatDate(app.applied_at) }}</td>
              <td>
                <span class="status-badge" :class="app.status">
                  {{ app.status === 'pending' ? '待处理' : app.status === 'approved' ? '已通过' : '已拒绝' }}
                </span>
              </td>
              <td>
                <button class="btn-text danger" @click="cancelApplication(app.id)">取消申请</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 收藏记录表单 -->
    <div class="record-section" v-if="user && showFavorites">
      <div class="section-header">
        <h3 class="section-title">💼 收藏记录</h3>
        <p class="section-desc">您收藏的岗位</p>
      </div>
      <div class="record-form">
        <div v-if="jobStore.favoriteJobs.length === 0" class="empty-record">
          <div class="empty-icon">💼</div>
          <p>暂无收藏记录</p>
        </div>
        <table v-else class="record-table">
          <thead>
            <tr>
              <th>岗位名称</th>
              <th>公司</th>
              <th>薪资</th>
              <th>地点</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="job in jobStore.favoriteJobs" :key="job.id">
              <td>{{ job.title }}</td>
              <td>{{ job.company }}</td>
              <td>{{ job.salary }}</td>
              <td>{{ job.location }}</td>
              <td>
                <button class="btn-text danger" @click="removeFavorite(job.id)">取消收藏</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="action-buttons" v-if="user">
      <button class="btn-secondary" @click="resetPassword">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        修改密码
      </button>
      <button class="btn-danger" @click="logout">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        退出登录
      </button>
    </div>

    <!-- Edit Dialog -->
    <div v-if="editDialogVisible" class="dialog-overlay" @click.self="editDialogVisible = false">
      <div class="dialog">
        <div class="dialog-header">
          <h3>编辑个人信息</h3>
          <button class="dialog-close" @click="editDialogVisible = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="dialog-body">
          <form ref="editFormRef" @submit.prevent="handleSave">
            <div class="form-group avatar-upload">
              <label>头像</label>
              <div class="avatar-preview">
                <img :src="editForm.avatar || defaultAvatar" alt="头像预览" />
                <input type="file" accept="image/*" @change="handleAvatarUpload" />
                <div class="avatar-upload-overlay">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span>更换头像</span>
                </div>
              </div>
            </div>
            
            <div class="form-group">
              <label>姓名</label>
              <input v-model="editForm.name" type="text" placeholder="请输入姓名" required />
            </div>
            
            <div class="form-group">
              <label>性别</label>
              <div class="radio-group">
                <label class="radio-label">
                  <input v-model="editForm.gender" type="radio" value="男" />
                  <span>男</span>
                </label>
                <label class="radio-label">
                  <input v-model="editForm.gender" type="radio" value="女" />
                  <span>女</span>
                </label>
              </div>
            </div>
            
            <div class="form-group">
              <label>年龄</label>
              <input v-model.number="editForm.age" type="number" min="1" max="100" placeholder="请输入年龄" />
            </div>
            
            <div class="form-group">
              <label>手机号</label>
              <input v-model="editForm.phone" type="tel" placeholder="请输入手机号" pattern="^1[3-9]\d{9}$" />
            </div>
            
            <div class="form-group">
              <label>专业</label>
              <input v-model="editForm.major" type="text" placeholder="请输入专业" />
            </div>
            
            <div class="form-group">
              <label>年级</label>
              <select v-model="editForm.grade">
                <option value="">请选择年级</option>
                <option value="大一">大一</option>
                <option value="大二">大二</option>
                <option value="大三">大三</option>
                <option value="大四">大四</option>
                <option value="研一">研一</option>
                <option value="研二">研二</option>
                <option value="研三">研三</option>
                <option value="教师">教师</option>
              </select>
            </div>
          </form>
        </div>
        <div class="dialog-footer">
          <button class="btn-secondary" @click="editDialogVisible = false">取消</button>
          <button class="btn-primary" @click="handleSave" :disabled="isSaving">
            <span v-if="isSaving">保存中...</span>
            <span v-else>保存</span>
          </button>
        </div>
      </div>
    </div>
  </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'
import { useCareerStore } from '@/stores/career'
import { useJobStore } from '@/stores/job'

const router = useRouter()
const userStore = useUserStore()
const careerStore = useCareerStore()
const jobStore = useJobStore()

const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'

const user = computed(() => userStore.user)
const editDialogVisible = ref(false)
const editFormRef = ref<HTMLFormElement>()
const isSaving = ref(false)
const showApplications = ref(false)
const showFavorites = ref(false)

const editForm = ref({
  name: '',
  gender: '',
  age: 0,
  phone: '',
  major: '',
  grade: '',
  avatar: ''
})

const careerStats = computed(() => {
  const allTasks = careerStore.actionPlans.flatMap(plan => plan.tasks)
  const completedTasks = allTasks.filter(task => task.completed).length
  const completionRate = allTasks.length > 0 ? Math.round((completedTasks / allTasks.length) * 100) : 0
  
  return {
    jobsApplied: userStore.applications?.length || 0,
    jobsSaved: jobStore.favoriteJobs?.length || 0,
    tasksCompleted: completionRate,
    matchScore: 85
  }
})

const openEditDialog = () => {
  if (!user.value) return
  
  editForm.value = {
    name: user.value.name || '',
    gender: user.value.gender || '',
    age: user.value.age || 0,
    phone: user.value.phone || '',
    major: user.value.major || '',
    grade: user.value.grade || '',
    avatar: user.value.avatar || ''
  }
  
  editDialogVisible.value = true
}

const handleAvatarUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const result = e.target?.result as string
      editForm.value.avatar = result
    }
    
    reader.readAsDataURL(file)
  }
}

const handleSave = async () => {
  if (!editFormRef.value) return
  
  try {
    isSaving.value = true
    
    const response = await userStore.updateProfile(editForm.value)
    
    if (response.success) {
      alert('保存成功！')
      editDialogVisible.value = false
    } else {
      alert(response.message || '保存失败')
    }
  } catch (error) {
    console.error('保存失败:', error)
    alert('保存失败，请重试')
  } finally {
    isSaving.value = false
  }
}

const resetPassword = () => {
  alert('修改密码功能开发中...')
}

const logout = () => {
  try {
    // 直接清除登录状态
    userStore.token = null
    userStore.user = null
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    sessionStorage.removeItem('user')
    
    // 强制跳转到登录页面
    window.location.href = '/login'
  } catch (error) {
    console.error('退出登录失败:', error)
  }
}

// 查看申请记录
const viewApplications = async () => {
  try {
    // 切换显示状态
    showApplications.value = !showApplications.value
    showFavorites.value = false
    
    // 如果显示申请记录，获取最新数据
    if (showApplications.value) {
      await userStore.fetchApplications()
    }
  } catch (error) {
    console.error('查看申请记录失败:', error)
    ElMessage.error('查看申请记录失败，请重试')
  }
}

// 查看收藏记录
const viewFavorites = async () => {
  try {
    // 切换显示状态
    showFavorites.value = !showFavorites.value
    showApplications.value = false
    
    // 收藏记录已经在jobStore中，不需要重新获取
  } catch (error) {
    console.error('查看收藏记录失败:', error)
    ElMessage.error('查看收藏记录失败，请重试')
  }
}

// 取消申请
const cancelApplication = async (applicationId: number) => {
  try {
    const success = await userStore.cancelApplication(applicationId)
    if (success) {
      ElMessage.success('取消申请成功')
    } else {
      ElMessage.error('取消申请失败，请重试')
    }
  } catch (error) {
    console.error('取消申请失败:', error)
    ElMessage.error('取消申请失败，请重试')
  }
}

// 取消收藏
const removeFavorite = async (jobId: string) => {
  try {
    await jobStore.toggleFavorite(jobId)
    ElMessage.success('取消收藏成功')
  } catch (error) {
    console.error('取消收藏失败:', error)
    ElMessage.error('取消收藏失败，请重试')
  }
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  if (!userStore.isLoggedIn) {
    userStore.loadFromLocalStorage()
    
    if (!userStore.isLoggedIn) {
      router.push('/login')
      return
    }
  }
  
  // 获取用户申请记录
  await userStore.fetchApplications()
})

watch(() => userStore.user, (newUser) => {
  console.log('用户数据已更新:', newUser)
}, { deep: true })
</script>

<style scoped>
/* Page Enter Animation */
.page-enter-enter-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.page-enter-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.user-center {
  padding: 0;
  max-width: 1400px;
  margin: 0 auto;
}

/* Page Header - Dark Blue Theme */
.page-header {
  position: relative;
  background: linear-gradient(135deg, #1a237e 0%, #283593 30%, #3949ab 60%, #3f51b5 100%);
  color: white;
  padding: 1.33rem 0;
  margin: -2rem -2rem 2rem 0rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
}

.page-header-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.page-header-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(240, 147, 251, 0.2) 0%, transparent 50%);
  animation: patternFloat 10s ease-in-out infinite;
}

@keyframes patternFloat {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translate(-15px, 10px) scale(1.05);
    opacity: 1;
  }
}

.page-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, 
    transparent 30%, 
    rgba(255, 255, 255, 0.05) 50%, 
    transparent 70%);
  animation: shimmer 4s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 添加粒子效果 */
.page-header-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.page-header-particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: headerParticleFloat 6s ease-in-out infinite;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
}

.page-header-particle:nth-child(1) { left: 5%; top: 30%; animation-delay: 0s; }
.page-header-particle:nth-child(2) { left: 15%; top: 70%; animation-delay: 0.8s; }
.page-header-particle:nth-child(3) { left: 25%; top: 50%; animation-delay: 1.5s; }
.page-header-particle:nth-child(4) { left: 35%; top: 80%; animation-delay: 0.3s; }
.page-header-particle:nth-child(5) { left: 45%; top: 40%; animation-delay: 2s; }
.page-header-particle:nth-child(6) { left: 55%; top: 60%; animation-delay: 1s; }
.page-header-particle:nth-child(7) { left: 65%; top: 30%; animation-delay: 2.5s; }
.page-header-particle:nth-child(8) { left: 75%; top: 70%; animation-delay: 0.5s; }
.page-header-particle:nth-child(9) { left: 85%; top: 50%; animation-delay: 1.8s; }
.page-header-particle:nth-child(10) { left: 95%; top: 80%; animation-delay: 1.2s; }

@keyframes headerParticleFloat {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-15px) scale(1.3);
    opacity: 0.9;
  }
}

/* 添加能量环 */
.page-header-energy {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: energyRing 4s ease-out infinite;
}

.page-header-energy::before,
.page-header-energy::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.page-header-energy::before {
  width: 300px;
  height: 300px;
  animation: energyRing 4s ease-out infinite 0.5s;
}

.page-header-energy::after {
  width: 400px;
  height: 400px;
  animation: energyRing 4s ease-out infinite 1s;
}

@keyframes energyRing {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

.page-header-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  padding: 0 2rem;
}

.page-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 0.3rem 0.8rem;
  border-radius: 50px;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
}

/* User Profile */
.user-profile {
  margin-bottom: 2rem;
}

.profile-header {
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  position: relative;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 2rem;
  border: 4px solid #f1f5f9;
  flex-shrink: 0;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.user-info {
  flex: 1;
}

.user-info h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.user-email, .user-role {
  color: #64748b;
  margin-bottom: 0.25rem;
  font-size: 0.95rem;
}

.edit-profile-btn {
  position: absolute;
  top: 2rem;
  right: 2rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-profile-btn:hover {
  background: #283593;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.3);
}

/* Profile Card */
.profile-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.card-title-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.card-icon {
  font-size: 1.25rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.info-label {
  font-weight: 600;
  color: #475569;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  color: #1e293b;
  font-size: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

/* No Login */
.no-login {
  padding: 4rem 2rem;
  text-align: center;
}

.no-login-content {
  max-width: 400px;
  margin: 0 auto;
}

.no-login-icon {
  color: #cbd5e1;
  margin-bottom: 1.5rem;
}

.no-login-content h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.no-login-content p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

/* User Stats */
.user-stats {
  margin-bottom: 2rem;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.section-desc {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border-color: #1a237e;
}

.stat-icon-bg {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon {
  font-size: 1.5rem;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1a237e;
  margin-bottom: 0.25rem;
}

.stat-label {
  color: #64748b;
  font-size: 0.9rem;
}

.stat-arrow {
  color: #94a3b8;
  margin-left: 1rem;
  transition: all 0.3s ease;
}

.stat-card:hover .stat-arrow {
  color: #1a237e;
  transform: translateX(5px);
}

.stat-card {
  cursor: pointer;
}

/* Record Section */
.record-section {
  margin-bottom: 2rem;
}

.record-form {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.empty-record {
  text-align: center;
  padding: 4rem 2rem;
  color: #64748b;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.record-table {
  width: 100%;
  border-collapse: collapse;
}

.record-table th,
.record-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  color: #1e293b;
}

.record-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
}

.record-table tr:hover {
  background: #f8fafc;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 50px;
  font-size: 0.85rem;
  font-weight: 600;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.approved {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.rejected {
  background: #fee2e2;
  color: #991b1b;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #283593;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.3);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: white;
  color: #1a237e;
  border: 2px solid #1a237e;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #f8fafc;
  transform: translateY(-2px);
}

.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

/* Dialog */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.dialog {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #1e293b;
}

.dialog-close {
  background: none;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.dialog-close:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.dialog-body {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #475569;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.avatar-upload {
  margin-bottom: 1.5rem;
}

.avatar-preview {
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  margin: 0 auto;
  cursor: pointer;
  border: 3px solid #e2e8f0;
  transition: all 0.3s ease;
}

.avatar-preview:hover {
  border-color: #1a237e;
  transform: scale(1.05);
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-preview input[type="file"] {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
  z-index: 2;
}

.avatar-upload-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 1;
}

.avatar-preview:hover .avatar-upload-overlay {
  opacity: 1;
}

.avatar-upload-overlay svg {
  margin-bottom: 0.5rem;
}

.avatar-upload-overlay span {
  font-size: 0.8rem;
  font-weight: 600;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #1a237e;
  box-shadow: 0 0 0 4px rgba(26, 35, 126, 0.1);
}

.radio-group {
  display: flex;
  gap: 1.5rem;
}

.radio-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: #475569;
}

.radio-label input {
  width: auto;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

/* Responsive */
@media (min-width: 1200px) {
  .page-title {
    font-size: 3rem;
  }
}

@media (max-width: 992px) {
  .page-header {
    padding: 1.33rem 0;
    margin: -1.5rem -1.5rem 1.5rem -1.5rem;
  }

  .page-title {
    font-size: 2.25rem;
  }

  .profile-header {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .avatar {
    margin-right: 0;
  }

  .edit-profile-btn {
    position: static;
    margin-top: 1rem;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.75rem;
  }

  .user-center {
    padding: 0;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .action-buttons {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary,
  .btn-danger {
    width: 100%;
    justify-content: center;
  }
}
</style>
