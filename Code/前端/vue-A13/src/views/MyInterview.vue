<template>
  <Transition name="page-enter" appear>
    <div class="my-interview">
      <!-- Page Header -->
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
        </div>
        <div class="page-header-energy"></div>
        <div class="page-header-content">
          <span class="page-badge">🎯 面试管理</span>
          <h1 class="page-title">我的面试</h1>
          <p class="page-subtitle">管理您的面试记录，追踪面试进度</p>
        </div>
      </section>

      <!-- Action Bar -->
      <section class="action-bar">
        <div class="container">
          <div class="action-buttons">
            <button class="smart-create-btn" @click="showSmartCreateModal = true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"/>
                <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"/>
              </svg>
              <span>智能创建面试</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Interview List -->
      <section class="interview-list">
        <div class="container">
          <div v-if="interviews.length > 0" class="cards-grid">
            <div 
              v-for="interview in interviews" 
              :key="interview.id"
              class="interview-card"
              :class="'status-' + interview.status"
              @click="goToInterviewDetail(interview.id)"
            >
              <div class="card-header">
                <div class="company-info">
                  <div class="company-logo">
                    {{ interview.company.charAt(0) }}
                  </div>
                  <div class="company-details">
                    <h3>{{ interview.company }}</h3>
                    <p>{{ interview.position }}</p>
                  </div>
                </div>
                <span class="status-badge" :class="'status-' + interview.status">
                  {{ getStatusText(interview.status) }}
                </span>
              </div>
              
              <div class="card-body">
                <div class="info-row">
                  <span class="label">面试时间：</span>
                  <span class="value">{{ interview.date }}</span>
                </div>
                <div class="info-row">
                  <span class="label">面试形式：</span>
                  <span class="value">{{ interview.type }}</span>
                </div>
                <div class="info-row" v-if="interview.interviewer">
                  <span class="label">面试官：</span>
                  <span class="value">{{ interview.interviewer }}</span>
                </div>
                <div class="info-row" v-if="interview.remark">
                  <span class="label">备注：</span>
                  <span class="value">{{ interview.remark }}</span>
                </div>
              </div>
              
              <div class="card-actions">
                <button class="action-btn simulate" @click.stop="startSimulation(interview)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                  <span>智能模拟</span>
                </button>
                <button class="action-btn edit" @click.stop="editInterview(interview)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  <span>编辑</span>
                </button>
                <button class="action-btn delete" @click.stop="deleteInterview(interview)">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  <span>删除</span>
                </button>
              </div>
            </div>
          </div>
          
          <!-- Empty State -->
          <div v-else class="empty-state">
            <div class="empty-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h3>暂无面试记录</h3>
            <p>开始您的第一个面试吧！</p>
            <button class="smart-create-btn large" @click="showSmartCreateModal = true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 12l2 2 4-4"/>
                <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z"/>
              </svg>
              <span>智能创建第一个面试</span>
            </button>
          </div>
        </div>
      </section>

      <!-- 智能创建模态框 -->
      <div v-if="showSmartCreateModal" class="modal-overlay" @click="closeSmartCreateModal">
        <div class="modal smart-create-modal" @click.stop>
          <div class="modal-header">
            <h2>智能创建面试</h2>
            <button class="close-btn" @click="closeSmartCreateModal">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          
          <div class="modal-body">
            <div class="smart-create-form">
              <!-- 职业分类选择 -->
              <div class="form-group">
                <label class="form-label">
                  职业分类
                  <span class="required">*</span>
                </label>
                <div class="career-categories">
                  <div 
                    v-for="category in careerCategories" 
                    :key="category.id"
                    class="category-card"
                    :class="{ 'selected': smartCreateData.selectedCategory === category.id }"
                    @click="selectCategory(category.id)"
                  >
                    <div class="category-icon">{{ category.icon }}</div>
                    <div class="category-name">{{ category.name }}</div>
                    <div class="category-count">{{ category.positions.length }}个职位</div>
                  </div>
                </div>
              </div>
              
              <!-- 具体职位选择 -->
              <div v-if="smartCreateData.selectedCategory" class="form-group">
                <label class="form-label">
                  具体职位
                  <span class="required">*</span>
                </label>
                <select v-model="smartCreateData.selectedPosition" class="form-input" required>
                  <option value="">请选择职位</option>
                  <option 
                    v-for="position in getCategoryPositions(smartCreateData.selectedCategory)" 
                    :key="position"
                    :value="position"
                  >
                    {{ position }}
                  </option>
                </select>
              </div>
              
              <!-- 公司名称 -->
              <div class="form-group">
                <label class="form-label">
                  公司名称
                  <span class="info-icon" title="可选，不填写将使用智能推荐">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <path d="M12 16v-4"/>
                      <path d="M12 8h.01"/>
                    </svg>
                  </span>
                </label>
                <input 
                  v-model="smartCreateData.company" 
                  type="text" 
                  placeholder="请输入公司名称（可选）"
                  class="form-input"
                />
              </div>
              
              <!-- 面试语言 -->
              <div class="form-group">
                <label class="form-label">
                  面试语言
                  <span class="required">*</span>
                </label>
                <select v-model="smartCreateData.language" class="form-input" required>
                  <option value="中文">中文</option>
                  <option value="English">English</option>
                  <option value="日本語">日本語</option>
                </select>
              </div>
              
              <!-- 智能提示 -->
              <div class="smart-tips">
                <div class="tip-icon">💡</div>
                <div class="tip-content">
                  <strong>智能创建功能将根据您的简历和选择的职业方向：</strong>
                  <ul>
                    <li>推荐合适的公司名称</li>
                    <li>智能安排面试时间</li>
                    <li>提供面试准备建议</li>
                    <li>生成个性化面试问题</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          
          <div class="modal-footer">
            <button class="cancel-btn" @click="closeSmartCreateModal">取消</button>
            <button 
              class="submit-btn smart-submit" 
              @click="smartCreateInterview" 
              :disabled="isSmartCreating || !smartCreateData.selectedCategory || !smartCreateData.selectedPosition"
            >
              {{ isSmartCreating ? '智能创建中...' : '智能创建' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

interface Interview {
  id: string
  company: string
  position: string
  date: string
  type: string
  status: string
  interviewer?: string
  remark?: string
  language?: string
  secondLanguage?: string
}

const interviews = ref<Interview[]>([])
const showCreateModal = ref(false)
const showSmartCreateModal = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const isSmartCreating = ref(false)
const editingId = ref<string | null>(null)

// 职业分类数据 - 只保留计算机专业相关职业
const careerCategories = ref([
  {
    id: 'software',
    name: '软件开发',
    icon: '💻',
    positions: [
      '前端开发工程师',
      '后端开发工程师', 
      '全栈开发工程师',
      'Java开发工程师',
      'Python开发工程师',
      'C++开发工程师',
      'Go开发工程师'
    ]
  },
  {
    id: 'ai',
    name: '人工智能',
    icon: '🤖',
    positions: [
      '机器学习工程师',
      '深度学习工程师',
      '自然语言处理工程师',
      '计算机视觉工程师',
      'AI算法工程师'
    ]
  },
  {
    id: 'data',
    name: '数据科学',
    icon: '📊',
    positions: [
      '数据工程师',
      '数据分析师',
      '数据科学家',
      '大数据开发工程师',
      '数据挖掘工程师'
    ]
  },
  {
    id: 'infrastructure',
    name: '基础设施',
    icon: '⚙️',
    positions: [
      '运维工程师',
      'DevOps工程师',
      '系统工程师',
      '网络工程师',
      '安全工程师'
    ]
  },
  {
    id: 'mobile',
    name: '移动开发',
    icon: '📱',
    positions: [
      'Android开发工程师',
      'iOS开发工程师',
      'React Native开发工程师',
      'Flutter开发工程师'
    ]
  },
  {
    id: 'testing',
    name: '软件测试',
    icon: '🧪',
    positions: [
      '测试工程师',
      '自动化测试工程师',
      '性能测试工程师',
      '测试开发工程师'
    ]
  }
])

// 智能创建表单数据
const smartCreateData = ref({
  selectedCategory: '',
  selectedPosition: '',
  company: '',
  interviewType: '智能模拟面试',
  language: '中文'
})

const formData = ref({
  company: '',
  position: '',
  language: '中文',
  secondLanguage: '无',
  resume: '',
  date: '',
  type: '',
  status: 'pending',
  interviewer: '',
  remark: ''
})

// 获取状态文本
const getStatusText = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: '待面试',
    completed: '已完成',
    offer: '已拿 offer',
    rejected: '已拒绝'
  }
  return statusMap[status] || status
}

// 获取用户特定的存储键名
const getInterviewsStorageKey = (): string => {
  const userId = userStore.user?.id || 'guest'
  return `myInterviews_${userId}`
}

// 加载数据
const loadInterviews = () => {
  const storageKey = getInterviewsStorageKey()
  const saved = localStorage.getItem(storageKey)
  if (saved) {
    interviews.value = JSON.parse(saved)
  } else {
    // 示例数据
    interviews.value = [
      {
        id: '1',
        company: '某某科技有限公司',
        position: '前端开发工程师',
        date: '2024-03-20 14:00',
        type: '视频面试',
        status: 'pending',
        interviewer: '张经理',
        remark: '准备一下项目介绍'
      },
      {
        id: '2',
        company: '创新互联网公司',
        position: '全栈开发工程师',
        date: '2024-03-18 10:00',
        type: '现场面试',
        status: 'completed',
        interviewer: '李总监',
        remark: '感觉表现不错'
      }
    ]
  }
}

// 保存数据
const saveInterviews = () => {
  const storageKey = getInterviewsStorageKey()
  localStorage.setItem(storageKey, JSON.stringify(interviews.value))
}

// 打开编辑
const editInterview = (interview: Interview) => {
  isEditing.value = true
  editingId.value = interview.id
  formData.value = {
    company: interview.company,
    position: interview.position,
    language: '中文',
    secondLanguage: '无',
    resume: '',
    date: interview.date,
    type: interview.type,
    status: interview.status,
    interviewer: interview.interviewer || '',
    remark: interview.remark || ''
  }
  showCreateModal.value = true
}

// 删除面试
const deleteInterview = (interview: Interview) => {
  if (confirm(`确定要删除"${interview.company} - ${interview.position}"的面试记录吗？`)) {
    interviews.value = interviews.value.filter(i => i.id !== interview.id)
    saveInterviews()
  }
}

// 智能创建面试
const smartCreateInterview = async () => {
  if (!smartCreateData.value.selectedCategory || !smartCreateData.value.selectedPosition) {
    alert('请选择职业分类和具体职位')
    return
  }
  
  isSmartCreating.value = true
  
  try {
    // 获取用户简历数据用于智能推荐
    const userId = userStore.user?.id || 'unknown'
    const analysisData = localStorage.getItem(`resume_analysis_${userId}`)
    
    let resumeText = ''
    if (analysisData) {
      const parsedData = JSON.parse(analysisData)
      if (parsedData.basic_info) {
        const basicInfo = parsedData.basic_info
        resumeText = `姓名：${basicInfo.姓名 || '未知'}\n学历：${basicInfo.学历 || '未知'}\n专业：${basicInfo.专业 || '未知'}\n工作经验：${basicInfo.工作经验 || '未知'}\n技能特长：${basicInfo.技能特长 || '未知'}`
      }
    }
    
    // 调用智能体API生成面试建议
    const API_BASE_URL = 'http://localhost:8000'
    const response = await fetch(`${API_BASE_URL}/interview/smart-create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resume_text: resumeText,
        career_category: smartCreateData.value.selectedCategory,
        position: smartCreateData.value.selectedPosition,
        interview_type: smartCreateData.value.interviewType,
        language: smartCreateData.value.language
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.success && result.data.interview_suggestion) {
      const suggestion = result.data.interview_suggestion
      
      // 创建智能推荐的面试记录
      const newInterview: Interview = {
        id: Date.now().toString(),
        company: smartCreateData.value.company || suggestion.recommended_company || '智能推荐公司',
        position: smartCreateData.value.selectedPosition,
        date: suggestion.recommended_date || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 16),
        type: smartCreateData.value.interviewType,
        status: 'pending',
        interviewer: suggestion.recommended_interviewer || '智能推荐面试官',
        remark: suggestion.interview_tips || '智能体推荐的面试准备建议',
        language: smartCreateData.value.language,
        secondLanguage: '无'
      }
      
      interviews.value.push(newInterview)
      saveInterviews()
      closeSmartCreateModal()
      
      // 显示创建成功提示
      alert(`智能创建成功！\n\n推荐公司：${newInterview.company}\n面试时间：${newInterview.date}\n面试官：${newInterview.interviewer}\n\n准备建议：${newInterview.remark}`)
      
    } else {
      // 智能体生成失败，使用默认模板创建
      createDefaultInterview()
    }
    
  } catch (error) {
    console.error('智能创建面试失败:', error)
    // 智能体服务不可用，使用默认模板创建
    createDefaultInterview()
  } finally {
    isSmartCreating.value = false
  }
}

// 默认模板创建
const createDefaultInterview = () => {
  const category = careerCategories.value.find(c => c.id === smartCreateData.value.selectedCategory)
  const categoryName = category ? category.name : '技术类'
  
  const newInterview: Interview = {
    id: Date.now().toString(),
    company: smartCreateData.value.company || `${categoryName}相关公司`,
    position: smartCreateData.value.selectedPosition,
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().replace('T', ' ').substring(0, 16),
    type: smartCreateData.value.interviewType,
    status: 'pending',
    interviewer: '待分配',
    remark: `智能创建的${categoryName}岗位面试，请根据简历内容准备相关技能问题`,
    language: smartCreateData.value.language,
    secondLanguage: '无'
  }
  
  interviews.value.push(newInterview)
  saveInterviews()
  closeSmartCreateModal()
  alert('智能创建成功！已使用默认模板创建面试记录。')
}

// 选择职业分类
const selectCategory = (categoryId: string) => {
  smartCreateData.value.selectedCategory = categoryId
  smartCreateData.value.selectedPosition = ''
}

// 获取分类下的职位列表
const getCategoryPositions = (categoryId: string) => {
  const category = careerCategories.value.find(c => c.id === categoryId)
  return category ? category.positions : []
}

// 关闭智能创建弹窗
const closeSmartCreateModal = () => {
  showSmartCreateModal.value = false
  smartCreateData.value = {
    selectedCategory: '',
    selectedPosition: '',
    company: '',
    interviewType: '智能模拟面试',
    language: '中文'
  }
}

// 智能模拟面试
const startSimulation = async (interview: Interview) => {
  try {
    // 获取用户简历数据
    const userId = 'unknown' // 这里可以根据实际用户ID获取
    const analysisData = localStorage.getItem(`resume_analysis_${userId}`)
    
    let resumeText = ''
    if (analysisData) {
      const parsedData = JSON.parse(analysisData)
      if (parsedData.basic_info) {
        const basicInfo = parsedData.basic_info
        resumeText = `姓名：${basicInfo.姓名 || '未知'}\n学历：${basicInfo.学历 || '未知'}\n专业：${basicInfo.专业 || '未知'}\n工作经验：${basicInfo.工作经验 || '未知'}\n技能特长：${basicInfo.技能特长 || '未知'}`
      }
    }
    
    // 使用智能体生成个性化面试问题
    const API_BASE_URL = 'http://localhost:8000'
    
    const response = await fetch(`${API_BASE_URL}/interview/generate-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resume_text: resumeText,
        job_title: interview.position,
        job_requirements: `公司：${interview.company}，面试形式：${interview.type}`,
        question_count: 5
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.success && result.data.interview_questions) {
      // 保存生成的面试问题到本地存储
      const simulationData = {
        interview: interview,
        questions: result.data.interview_questions,
        generated_at: new Date().toISOString()
      }
      
      localStorage.setItem(`interview_simulation_${interview.id}`, JSON.stringify(simulationData))
      
      // 跳转到面试模拟页面
      router.push(`/interview-questions?interviewId=${interview.id}`)
    } else {
      alert('智能体生成面试问题失败，请稍后重试')
    }
    
  } catch (error) {
    console.error('智能模拟面试失败:', error)
    alert('智能模拟面试服务暂时不可用，请检查网络连接')
  }
}

// 跳转到面试详情
const goToInterviewDetail = (id: string) => {
  router.push(`/interview-detail/${id}`)
}

// 关闭弹窗
const closeModal = () => {
  showCreateModal.value = false
  isEditing.value = false
  editingId.value = null
  formData.value = {
    company: '',
    position: '',
    language: '中文',
    secondLanguage: '无',
    resume: '',
    date: '',
    type: '',
    status: 'pending',
    interviewer: '',
    remark: ''
  }
}

// 提交表单
const submitForm = () => {
  isSubmitting.value = true
  
  setTimeout(() => {
    if (isEditing.value && editingId.value) {
      // 编辑模式
      const index = interviews.value.findIndex(i => i.id === editingId.value)
      if (index !== -1) {
        interviews.value[index] = {
          id: editingId.value,
          company: formData.value.company,
          position: formData.value.position,
          date: formData.value.date,
          type: formData.value.type,
          status: formData.value.status,
          interviewer: formData.value.interviewer || undefined,
          remark: formData.value.remark || undefined
        }
      }
    } else {
      // 创建模式
      const newInterview: Interview = {
        id: Date.now().toString(),
        company: formData.value.company,
        position: formData.value.position,
        date: formData.value.date,
        type: formData.value.type,
        status: formData.value.status,
        interviewer: formData.value.interviewer || undefined,
        remark: formData.value.remark || undefined
      }
      interviews.value.push(newInterview)
    }
    
    saveInterviews()
    closeModal()
    isSubmitting.value = false
  }, 500)
}

// 监听用户状态变化
const handleUserChange = () => {
  if (!userStore.user) {
    // 用户退出登录，清空当前面试列表
    interviews.value = []
  } else {
    // 用户登录，加载对应的面试数据
    loadInterviews()
  }
}

onMounted(() => {
  loadInterviews()
  
  // 监听用户状态变化
  watch(() => userStore.user, (newUser, oldUser) => {
    if (newUser?.id !== oldUser?.id) {
      handleUserChange()
    }
  })
})
</script>

<style scoped>
/* Page Transition */
.page-enter-active,
.page-leave-active {
  transition: all 0.4s ease;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* My Interview Container */
.my-interview {
  min-height: 100vh;
  background: #f5f7fa;
}

/* Page Header */
.page-header {
  position: relative;
  background: linear-gradient(135deg, #1a237e 0%, #283593 50%, #3949ab 100%);
  padding: 4rem 2rem;
  overflow: hidden;
  margin-bottom: 2rem;
}

.page-header-bg {
  position: absolute;
  inset: 0;
  opacity: 0.1;
}

.page-header-pattern {
  width: 100%;
  height: 100%;
  background-image: 
    radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
}

.page-header-particles {
  position: absolute;
  inset: 0;
}

.page-header-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.page-header-particle:nth-child(1) { top: 10%; left: 20%; animation-delay: 0s; }
.page-header-particle:nth-child(2) { top: 30%; left: 80%; animation-delay: 1s; }
.page-header-particle:nth-child(3) { top: 50%; left: 40%; animation-delay: 2s; }
.page-header-particle:nth-child(4) { top: 70%; left: 60%; animation-delay: 3s; }
.page-header-particle:nth-child(5) { top: 20%; left: 90%; animation-delay: 4s; }
.page-header-particle:nth-child(6) { top: 60%; left: 10%; animation-delay: 5s; }
.page-header-particle:nth-child(7) { top: 80%; left: 70%; animation-delay: 6s; }
.page-header-particle:nth-child(8) { top: 40%; left: 30%; animation-delay: 7s; }

@keyframes float {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-20px) scale(1.5);
    opacity: 0.9;
  }
}

.page-header-energy {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
  border-radius: 50%;
  animation: pulse 4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.3;
  }
  50% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0.6;
  }
}

.page-header-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: white;
}

.page-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  backdrop-filter: blur(10px);
}

.page-title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem;
  letter-spacing: 2px;
}

.page-subtitle {
  font-size: 1.125rem;
  opacity: 0.9;
  margin: 0;
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Action Bar */
.action-bar {
  background: white;
  padding: 1.5rem 0;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.action-bar .container {
  display: flex;
  justify-content: flex-end;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.create-btn {
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.create-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.3);
}

.create-btn:active {
  transform: translateY(0);
}

.smart-create-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.smart-create-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.smart-create-btn:active {
  transform: translateY(0);
}

.create-btn.large {
  padding: 1rem 2rem;
  font-size: 1.125rem;
}

/* Interview List */
.interview-list {
  padding-bottom: 4rem;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.interview-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.interview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.interview-card.status-offer {
  border-left-color: #2196f3;
}

.interview-card.status-rejected {
  border-left-color: #f44336;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.company-info {
  display: flex;
  gap: 1rem;
  flex: 1;
}

.company-logo {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.company-details h3 {
  margin: 0 0 0.25rem;
  font-size: 1.125rem;
  color: #1a237e;
}

.company-details p {
  margin: 0;
  color: #666;
  font-size: 0.875rem;
}

.status-badge {
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
}

.status-badge.status-pending {
  background: rgba(253, 216, 53, 0.15);
  color: #f57f17;
}

.status-badge.status-completed {
  background: rgba(76, 175, 80, 0.15);
  color: #2e7d32;
}

.status-badge.status-offer {
  background: rgba(33, 150, 243, 0.15);
  color: #1565c0;
}

.status-badge.status-rejected {
  background: rgba(244, 67, 54, 0.15);
  color: #c62828;
}

.card-body {
  margin-bottom: 1rem;
}

.info-row {
  display: flex;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
}

.info-row:last-child {
  margin-bottom: 0;
}

.label {
  color: #666;
  width: 80px;
  flex-shrink: 0;
}

.value {
  color: #333;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.action-btn.edit {
  background: rgba(33, 150, 243, 0.1);
  color: #1976d2;
}

.action-btn.edit:hover {
  background: rgba(33, 150, 243, 0.2);
}

.action-btn.delete {
  background: rgba(244, 67, 54, 0.1);
  color: #d32f2f;
}

.action-btn.delete:hover {
  background: rgba(244, 67, 54, 0.2);
}

.action-btn.simulate {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
}

.action-btn.simulate:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.action-btn.simulate:active {
  transform: translateY(0);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.empty-icon {
  margin-bottom: 1.5rem;
  opacity: 0.3;
}

.empty-state h2 {
  margin: 0 0 0.5rem;
  color: #1a237e;
}

.empty-state p {
  margin: 0 0 2rem;
  color: #666;
}

/* 智能创建样式 */
.career-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 0.5rem;
}

.category-card {
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
}

.category-card:hover {
  border-color: #667eea;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
}

.category-card.selected {
  border-color: #667eea;
  background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.2);
}

.category-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.category-name {
  font-weight: 600;
  color: #1a237e;
  margin-bottom: 0.25rem;
}

.category-count {
  font-size: 0.85rem;
  color: #666;
}

.smart-tips {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  border: 1px solid #ffcc80;
  border-radius: 8px;
  padding: 1rem;
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}

.tip-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.tip-content {
  flex: 1;
}

.tip-content strong {
  color: #e65100;
  display: block;
  margin-bottom: 0.5rem;
}

.tip-content ul {
  margin: 0;
  padding-left: 1rem;
}

.tip-content li {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

.smart-submit {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
}

.smart-submit:hover:not(:disabled) {
  background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%) !important;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 2rem;
}

.modal {
  background: white;
  border-radius: 16px;
  width: 100%;
  max-width: 680px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #999;
  transition: all 0.3s ease;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  color: #333;
  background: #f5f5f5;
}

.modal-body {
  padding: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  color: #1a1a1a;
  font-weight: 500;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.required {
  color: #ff4d4f;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #999;
  cursor: help;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.info-icon:hover {
  opacity: 1;
}

.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  font-family: inherit;
  background: #fff;
  color: #333;
}

.form-input:hover {
  border-color: #40a9ff;
}

.form-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

.form-input:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.input-with-button {
  display: flex;
  gap: 0.75rem;
}

.input-with-button .form-input {
  flex: 1;
}

.add-jd-btn,
.upload-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 1rem;
  background: #fff;
  border: 1px solid #d9d9d9;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #333;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.add-jd-btn:hover,
.upload-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.15);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.agreement-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
}

.agreement-label input[type="checkbox"] {
  margin-top: 0.25rem;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.agreement-link {
  color: #1890ff;
  text-decoration: none;
}

.agreement-link:hover {
  text-decoration: underline;
}

.agreement-label {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
  cursor: pointer;
}

.agreement-label input[type="checkbox"] {
  margin-top: 0.25rem;
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.agreement-link {
  color: #1890ff;
  text-decoration: none;
}

.agreement-link:hover {
  text-decoration: underline;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem 2rem;
  border-top: 1px solid #f0f0f0;
  justify-content: flex-end;
}

.cancel-btn,
.submit-btn {
  padding: 0.625rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.cancel-btn:hover {
  background: #e8e8e8;
}

.submit-btn {
  background: linear-gradient(135deg, #fdd835 0%, #fbc02d 100%);
  color: #1a237e;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(253, 216, 53, 0.4);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .cards-grid {
    grid-template-columns: 1fr;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .modal {
    max-height: 95vh;
  }
}
</style>
