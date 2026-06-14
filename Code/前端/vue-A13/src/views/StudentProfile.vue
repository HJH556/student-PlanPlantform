<template>
  <Transition name="page-enter" appear>
    <div class="student-profile">
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
        <span class="page-badge">👤 学生画像</span>
        <h1 class="page-title">打造专属职业画像</h1>
        <p class="page-subtitle">展示你的优势，开启职业之路</p>
      </div>
    </section>

    <!-- Profile Content -->
    <section class="profile-content">
      <!-- 步骤指示器 -->
      <div class="steps-indicator">
        <div 
          class="step-item" 
          :class="{ active: currentStep >= 1, completed: currentStep > 1 }"
        >
          <span class="step-number">1</span>
          <span class="step-text">上传简历</span>
        </div>
        <div class="step-connector" :class="{ active: currentStep > 1 }"></div>
        <div 
          class="step-item" 
          :class="{ active: currentStep >= 2, completed: currentStep > 2 }"
        >
          <span class="step-number">2</span>
          <span class="step-text">生成画像</span>
        </div>
        <div class="step-connector" :class="{ active: currentStep > 2 }"></div>
        <div 
          class="step-item" 
          :class="{ active: currentStep >= 3 }"
        >
          <span class="step-number">3</span>
          <span class="step-text">能力评估</span>
        </div>
      </div>

      <!-- 步骤内容 -->
      <div class="step-content">
        <!-- 步骤1：简历上传 -->
        <div v-if="currentStep === 1" class="content-card">
          <div class="card-header">
            <div class="card-icon">📄</div>
            <div class="card-title-wrapper">
              <h3 class="card-title">简历上传</h3>
              <p class="card-desc">支持 PDF、Word、图片格式，AI 智能解析简历内容</p>
            </div>
          </div>
          <ResumeUpload @upload-success="handleResumeUpload" :reset="!resumeUploaded" />
          
          <!-- 生成个人画像按钮 -->
          <div v-if="resumeUploaded" class="action-section">
            <button 
              class="generate-btn" 
              @click="goToNextStep" 
              :disabled="isGenerating"
            >
              <span v-if="!isGenerating">生成个人画像</span>
              <span v-else>生成中...</span>
            </button>
          </div>
        </div>

        <!-- 步骤2：生成个人画像 -->
        <div v-if="currentStep === 2" class="content-card">
          <div class="card-header">
            <div class="card-icon">👤</div>
            <div class="card-title-wrapper">
              <h3 class="card-title">个人画像</h3>
              <p class="card-desc">AI 智能分析您的简历，生成完整的个人画像</p>
            </div>
          </div>
          <PersonaProfile :resume-data="parsedResumeData" />
          
          <!-- 操作按钮 -->
          <div class="action-section">
            <button class="back-btn" @click="goToPreviousStep">
              返回上一步
            </button>
            <button class="match-btn" @click="goToNextStep">
              查看能力评估
            </button>
          </div>
        </div>

        <!-- 步骤3：能力评估 -->
        <div v-if="currentStep === 3" class="content-card">
          <div class="card-header">
            <div class="card-icon">📊</div>
            <div class="card-title-wrapper">
              <h3 class="card-title">能力评估</h3>
              <p class="card-desc">多维度评估您的专业技能和综合素质</p>
            </div>
          </div>
          <AbilityRadar :resume-data="parsedResumeData" />
          
          <!-- 操作按钮 -->
          <div class="action-section">
            <button class="back-btn" @click="goToPreviousStep">
              返回上一步
            </button>
            <button class="match-btn" @click="goToNextStep">
              查看人岗匹配结果
            </button>
          </div>
        </div>


      </div>
    </section>
  </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import ResumeUpload from '../components/student/ResumeUpload.vue'
import PersonaProfile from '../components/student/PersonaProfile.vue'
import AbilityRadar from '../components/student/AbilityRadar.vue'

const router = useRouter()
const userStore = useUserStore()

// 从后端加载状态
const loadState = async () => {
  const savedStep = await userStore.fetchProfileStep()
  const savedUploaded = localStorage.getItem('studentProfileUploaded')
  const savedData = localStorage.getItem('studentProfileData')
  
  currentStep.value = savedStep || 1
  resumeUploaded.value = savedUploaded === 'true'
  parsedResumeData.value = savedData ? JSON.parse(savedData) : null
}

// 保存状态到后端
const saveState = async () => {
  await userStore.updateProfileStep(currentStep.value)
  localStorage.setItem('studentProfileUploaded', resumeUploaded.value.toString())
  if (parsedResumeData.value) {
    localStorage.setItem('studentProfileData', JSON.stringify(parsedResumeData.value))
  }
}

const currentStep = ref(1)
const resumeUploaded = ref(false)
const isGenerating = ref(false)
const parsedResumeData = ref<any>(null)

// 组件挂载时加载状态
onMounted(async () => {
  await loadState()
})

// 组件卸载时保存状态
onUnmounted(async () => {
  await saveState()
})

function resetSteps() {
  currentStep.value = 1
  resumeUploaded.value = false
  isGenerating.value = false
  parsedResumeData.value = null
  // 清除localStorage中的状态并重置后端
  saveState()
  localStorage.removeItem('studentProfileUploaded')
  localStorage.removeItem('studentProfileData')
}

function handleResumeUpload(data: any) {
  resumeUploaded.value = true
  if (data && data.parsed) {
    // 检查 parsed 字段的结构
    if (data.parsed.parsed) {
      // 如果 parsed 包含 parsed 属性，使用它
      parsedResumeData.value = data.parsed.parsed
    } else {
      // 否则直接使用 parsed
      parsedResumeData.value = data.parsed
    }
  }
  // 保存状态
  saveState()
}

function generateProfile() {
  isGenerating.value = true
  
  setTimeout(() => {
    isGenerating.value = false
    currentStep.value = 2
    // 保存状态
    saveState()
  }, 1500)
}

function goToNextStep() {
  if (currentStep.value === 1 && resumeUploaded.value) {
    generateProfile()
  } else if (currentStep.value === 3) {
    // 步骤3（能力评估）点击下一步直接跳转到职业规划
    navigateToCareerPlan()
  } else if (currentStep.value < 4) {
    currentStep.value++
    // 保存状态
    saveState()
    // 滚动到页面顶部
    scrollToTop()
  }
}

function goToPreviousStep() {
  if (currentStep.value > 1) {
    currentStep.value--
    if (currentStep.value === 1) {
      resumeUploaded.value = false
    }
    // 保存状态
    saveState()
    // 滚动到页面顶部
    scrollToTop()
  }
}

function scrollToTop() {
  // 使用平滑滚动到页面顶部
  window.scrollTo({
    top: 0,
    behavior: 'smooth'
  })
}

function navigateToCareerPlan() {
  router.push('/career-plan')
}
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

.student-profile {
  width: 100%;
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

/* Profile Tabs */
.profile-tabs {
  margin-bottom: 2rem;
  position: sticky;
  top: 0;
  z-index: 100;
  background: #f8fafc;
  padding: 1rem 0;
  border-bottom: 1px solid #e2e8f0;
}

.tabs-container {
  display: flex;
  background: white;
  border-radius: 12px;
  padding: 0.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.tab-btn {
  flex: 1;
  padding: 1rem;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-weight: 600;
  color: #64748b;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.tab-btn.active {
  background: #1a237e;
  color: white;
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.3);
}

.tab-btn:hover:not(.active) {
  background: #f1f5f9;
  color: #1a237e;
}

.tab-icon {
  font-size: 1.25rem;
}

/* Profile Content */
.profile-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.content-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  scroll-margin-top: 120px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.content-card:hover {
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
  border-color: #1a237e;
}

.card-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f1f5f9;
}

.card-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  flex-shrink: 0;
}

.card-title-wrapper {
  flex: 1;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.375rem 0;
}

.card-desc {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0;
}

/* Steps Indicator */
.steps-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.step-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}

.step-number {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  background: #e2e8f0;
  color: #64748b;
  transition: all 0.3s ease;
}

.step-item.active .step-number {
  background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.3);
}

.step-item.completed .step-number {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.step-item.completed .step-number::after {
  content: '✓';
  font-size: 1.2rem;
}

.step-text {
  font-size: 0.9rem;
  font-weight: 600;
  color: #64748b;
  transition: all 0.3s ease;
}

.step-item.active .step-text {
  color: #1a237e;
  font-weight: 700;
}

.step-item.completed .step-text {
  color: #10b981;
  font-weight: 700;
}

.step-connector {
  width: 60px;
  height: 2px;
  background: #e2e8f0;
  transition: all 0.3s ease;
}

.step-connector.active {
  background: linear-gradient(90deg, #1a237e 0%, #3949ab 100%);
}

/* Action Section */
.action-section {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #f1f5f9;
}

/* 单按钮居中 */
.action-section:only-child {
  justify-content: center;
}

.generate-btn {
  background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.3);
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(26, 35, 126, 0.4);
}

.generate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.match-btn {
  background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
  color: white;
  border: none;
  padding: 1rem 2.5rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
}

.match-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
}

.back-btn {
  background: #f1f5f9;
  color: #1e293b;
  border: 2px solid #e2e8f0;
  padding: 1rem 2.5rem;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #e2e8f0;
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* Match Info */
.match-info {
  padding: 2rem;
  background: #f8fafc;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 2rem;
  border: 1px solid #e2e8f0;
}

.match-info p {
  font-size: 1.1rem;
  color: #475569;
  margin: 0;
  line-height: 1.5;
}

/* Responsive */
@media (min-width: 1200px) {
  .content-card {
    padding: 2.5rem;
  }

  .page-title {
    font-size: 3rem;
  }

  .tabs-container {
    max-width: 1200px;
    margin: 0 auto;
  }
}

@media (max-width: 992px) {
  .page-header {
    padding: 3rem 1.5rem;
    margin: -1.5rem -1.5rem 1.5rem -1.5rem;
  }

  .page-title {
    font-size: 2.25rem;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.75rem;
  }

  .content-card {
    padding: 1.5rem;
  }

  .tabs-container {
    flex-direction: column;
    gap: 0.5rem;
  }

  .tab-btn {
    padding: 0.75rem;
    justify-content: flex-start;
  }
  
  .profile-tabs {
    position: relative;
    padding: 0.5rem 0;
  }

  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
