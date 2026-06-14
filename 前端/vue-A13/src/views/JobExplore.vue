<template>
  <Transition name="page-enter" appear>
    <div class="job-explore">
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
        <span class="page-badge">🔍 岗位探索</span>
        <h1 class="page-title">发现理想职业机会</h1>
        <p class="page-subtitle">探索适合你的岗位，开启职业新篇章</p>
      </div>
    </section>

    <!-- Search and Filter -->
    <section class="search-section">
      <div class="search-container">
        <div class="search-input-group">
          <div class="search-input-wrapper">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              v-model="searchKeyword"
              type="text"
              placeholder="搜索岗位名称、行业、公司..."
              class="search-input"
              @keyup.enter="handleSearch"
            />
          </div>
          <button class="search-btn" @click="handleSearch">
            <span>搜索</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
        <div class="filter-options">
          <div class="filter-group">
            <label class="filter-label">行业</label>
            <select v-model="jobStore.filter.industry" class="filter-select" @change="handleFilterChange">
              <option value="">所有行业</option>
              <option v-for="industry in jobStore.industries" :key="industry" :value="industry">
                {{ industry }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">公司类型</label>
            <select v-model="jobStore.filter.companyType" class="filter-select" @change="handleFilterChange">
              <option value="">所有类型</option>
              <option v-for="type in jobStore.companyTypes" :key="type" :value="type">
                {{ type }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">公司规模</label>
            <select v-model="jobStore.filter.companyScale" class="filter-select" @change="handleFilterChange">
              <option value="">所有规模</option>
              <option v-for="scale in jobStore.companyScales" :key="scale" :value="scale">
                {{ scale }}
              </option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">薪资范围</label>
            <select v-model="jobStore.filter.salaryRange" class="filter-select" @change="handleFilterChange">
              <option value="">不限</option>
              <option value="0-10">10K以下</option>
              <option value="10-20">10K-20K</option>
              <option value="20-30">20K-30K</option>
              <option value="30-50">30K-50K</option>
              <option value="50+">50K以上</option>
            </select>
          </div>
          <div class="filter-group">
            <label class="filter-label">排序</label>
            <select v-model="jobStore.filter.sortBy" class="filter-select" @change="handleFilterChange">
              <option value="date">最新发布</option>
              <option value="salary">薪资最高</option>
              <option value="hot">热度最高</option>
            </select>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats Bar -->
    <section class="stats-bar">
      <div class="stats-container">
        <div class="stat-item">
          <span class="stat-value">{{ jobStore.filteredJobs.length }}</span>
          <span class="stat-label">个岗位</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ jobStore.jobs.length }}</span>
          <span class="stat-label">总岗位数</span>
        </div>
        <div class="stat-divider"></div>
        <div class="stat-item">
          <span class="stat-value">{{ new Set(jobStore.jobs.map(j => j.company)).size }}</span>
          <span class="stat-label">家企业</span>
        </div>
      </div>
    </section>

    <!-- Loading State -->
    <div v-if="jobStore.isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载岗位数据...</p>
    </div>

    <!-- Job Content -->
    <section v-else class="job-content">
      <div class="job-main">
        <div v-if="jobStore.filteredJobs.length === 0" class="empty-state">
          <div class="empty-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
          </div>
          <h3>暂无符合条件的岗位</h3>
          <p>请尝试调整筛选条件或搜索关键词</p>
          <button class="btn-reset" @click="resetFilters">重置筛选</button>
        </div>
        <div v-else>
          <div class="job-list">
            <div
              v-for="job in paginatedJobs"
              :key="job.id"
              class="job-card"
              @click="openJobProfile(job)"
            >
              <div class="job-card-header">
                <div class="job-company-info">
                  <div class="company-logo">{{ job.company.charAt(0) }}</div>
                  <div class="job-basic-info">
                    <h3 class="job-title">{{ job.title }}</h3>
                    <div class="company-meta">
                      <span class="company-name">{{ job.company }}</span>
                      <span class="divider">·</span>
                      <span class="location">📍 {{ job.location }}</span>
                    </div>
                  </div>
                </div>
                <div class="job-header-actions">
                  <div class="job-salary">{{ job.salary }}</div>
                  <button 
                    class="favorite-btn" 
                    :class="{ 'is-favorite': job.isFavorite }"
                    @click.stop="toggleFavorite(job.id)"
                    title="{{ job.isFavorite ? '取消收藏' : '收藏' }}"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="job-info-list">
                <div class="info-item">
                  <span class="info-label">行业:</span>
                  <span class="info-value">{{ job.industry }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">经验:</span>
                  <span class="info-value">{{ job.experience }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">学历:</span>
                  <span class="info-value">{{ job.education }}</span>
                </div>
              </div>
              
              <!-- 知识图谱 -->
              <div class="job-graph-section">
                <h4 class="graph-section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="3"/>
                    <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6L19 19M5 19l1.4-1.4M17.6 6.4L19 5"/>
                  </svg>
                  知识体系总览
                </h4>
                <div class="job-card-graph">
                  <JobGraph :compact-mode="true" />
                </div>
              </div>
              
              <div class="job-footer">
                <div class="job-requirements">
                  <span class="requirement">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {{ job.experience }}
                  </span>
                  <span class="requirement">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                      <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                    </svg>
                    {{ job.education }}
                  </span>
                </div>
                <button 
                  class="job-apply-btn" 
                  :class="{ 'is-applied': job.isApplied }"
                  @click.stop="job.isApplied ? null : applyJob(job.id)"
                  :disabled="job.isApplied"
                >
                  {{ job.isApplied ? '已申请' : '立即申请' }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- 分页组件 -->
          <div class="pagination">
            <button 
              class="pagination-btn" 
              @click="currentPage = 1" 
              :disabled="currentPage === 1"
            >
              首页
            </button>
            <button 
              class="pagination-btn" 
              @click="currentPage--" 
              :disabled="currentPage === 1"
            >
              上一页
            </button>
            <span class="pagination-info">
              第 {{ currentPage }} 页，共 {{ totalPages }} 页
            </span>
            <button 
              class="pagination-btn" 
              @click="currentPage++" 
              :disabled="currentPage === totalPages"
            >
              下一页
            </button>
            <button 
              class="pagination-btn" 
              @click="currentPage = totalPages" 
              :disabled="currentPage === totalPages"
            >
              末页
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 岗位画像弹窗 -->
    <div v-if="showJobProfile" class="job-profile-modal" @click="closeJobProfile">
      <div class="job-profile-modal-content" @click.stop>
        <div class="job-profile-modal-header">
          <h3>岗位画像</h3>
          <button class="close-btn" @click="closeJobProfile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="job-profile-modal-body">
          <JobProfile :job="selectedJob" />
          <div class="modal-divider"></div>
          <div class="graph-section">
            <h4>岗位发展路径</h4>
            <JobGraph :job="selectedJob" :detail-mode="true" />
          </div>
        </div>
      </div>
    </div>
  </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import JobProfile from '../components/job/JobProfile.vue'
import JobGraph from '../components/job/JobGraph.vue'
import { useJobStore } from '../stores/job'
import { ElMessage } from 'element-plus'

const jobStore = useJobStore()
const searchKeyword = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const showJobProfile = ref(false)
const selectedJob = ref<any>(null)

// 计算当前页显示的岗位
const paginatedJobs = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return jobStore.filteredJobs.slice(start, end)
})

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(jobStore.filteredJobs.length / pageSize.value)
})

// 页面加载时获取岗位列表
onMounted(async () => {
  await jobStore.fetchJobs()
})

// 监听筛选条件变化，重置到第一页
watch(
  () => jobStore.filteredJobs.length,
  (newLength) => {
    currentPage.value = 1
  }
)

// 搜索岗位
const handleSearch = async () => {
  if (searchKeyword.value.trim()) {
    await jobStore.searchJobs(searchKeyword.value.trim())
  } else {
    await jobStore.fetchJobs()
  }
  currentPage.value = 1
}

// 筛选变化
const handleFilterChange = () => {
  // 筛选逻辑已经在 computed 中处理
  currentPage.value = 1
}

// 重置筛选
const resetFilters = () => {
  searchKeyword.value = ''
  jobStore.filter.industry = ''
  jobStore.filter.salaryRange = ''
  jobStore.filter.companyType = ''
  jobStore.filter.companyScale = ''
  jobStore.filter.sortBy = 'date'
  jobStore.fetchJobs()
  currentPage.value = 1
}

// 打开岗位画像弹窗
const openJobProfile = (job: any) => {
  selectedJob.value = job
  showJobProfile.value = true
}

// 关闭岗位画像弹窗
const closeJobProfile = () => {
  showJobProfile.value = false
  selectedJob.value = null
}

// 切换收藏状态
const toggleFavorite = async (jobId: string) => {
  await jobStore.toggleFavorite(jobId)
  const job = jobStore.jobs.find(j => j.id === jobId)
  if (job) {
    ElMessage.success(job.isFavorite ? '收藏成功' : '取消收藏成功')
  }
}

// 申请岗位
const applyJob = async (jobId: string) => {
  try {
    await jobStore.applyJob(jobId)
    ElMessage.success('申请成功')
  } catch (error: any) {
    console.error('申请失败:', error)
    if (error.message === 'already_applied') {
      ElMessage.warning('该岗位已经申请过了')
    } else {
      ElMessage.error('申请失败，请重试')
    }
  }
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

.job-explore {
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

/* Search Section */
.search-section {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
  border: 1px solid #e2e8f0;
}

.search-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.search-input-group {
  display: flex;
  gap: 1rem;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1.25rem;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input {
  width: 100%;
  padding: 1rem 1.25rem 1rem 3rem;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.search-input:focus {
  outline: none;
  border-color: #1a237e;
  box-shadow: 0 0 0 4px rgba(26, 35, 126, 0.1);
  background: white;
}

.search-btn {
  background: #2563eb;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
}

.search-btn:hover {
  background: #1d4ed8;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(37, 99, 235, 0.4);
}

/* Filter Options */
.filter-options {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.filter-group {
  flex: 1;
  min-width: 150px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #475569;
}

.filter-select {
  padding: 0.875rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
  cursor: pointer;
}

.filter-select:focus {
  outline: none;
  border-color: #1a237e;
  box-shadow: 0 0 0 4px rgba(26, 35, 126, 0.1);
}

/* Stats Bar */
.stats-bar {
  background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
  padding: 1.25rem 2rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.stats-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: white;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.9;
}

.stat-divider {
  width: 1px;
  height: 30px;
  background: rgba(255, 255, 255, 0.3);
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f1f5f9;
  border-top: 4px solid #1a237e;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.empty-icon {
  color: #cbd5e1;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #64748b;
  margin-bottom: 1.5rem;
}

.btn-reset {
  background: #1a237e;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-reset:hover {
  background: #283593;
}

/* Job Content */
.job-content {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  padding: 0 2rem;
}

.job-main {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.job-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 1250px;
}

/* Job Card */
.job-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  cursor: pointer;
  min-height: 550px;
  height: auto;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  width: 100%;
}

.job-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: #1a237e;
}

.job-card.is-selected {
  border-color: #1a237e;
  background: #f8fafc;
}

.job-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.25rem;
  flex-shrink: 0;
}

.job-header-actions {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.favorite-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.favorite-btn:hover {
  background: #f1f5f9;
  color: #f59e0b;
  transform: scale(1.1);
}

.favorite-btn.is-favorite {
  color: #f59e0b;
  background: #fffbeb;
}

.favorite-btn.is-favorite:hover {
  color: #dc2626;
  background: #fef2f2;
}

.job-company-info {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.company-logo {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.job-basic-info {
  flex: 1;
}

.job-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.375rem 0;
}

.company-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #64748b;
}

.divider {
  color: #cbd5e1;
}

.job-salary {
  color: #2563eb;
  font-weight: 700;
  font-size: 1.1rem;
}

.job-info-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  flex: 1;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 0.35rem;
  border-bottom: 1px solid #f1f5f9;
}

.info-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.info-label {
  font-size: 0.9rem;
  color: #64748b;
  font-weight: 500;
}

.info-value {
  font-size: 0.9rem;
  color: #1e293b;
  font-weight: 600;
}

/* 知识图谱区域 */
.job-graph-section {
  margin: 1rem 0;
  padding: 1rem;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.graph-section-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1a237e;
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.graph-section-title svg {
  color: #3949ab;
}

.job-card-graph {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
}

.job-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
  margin-top: auto;
  flex-shrink: 0;
}

.job-requirements {
  display: flex;
  gap: 1rem;
}

.requirement {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.85rem;
  color: #64748b;
}

.requirement svg {
  color: #94a3b8;
}

.job-apply-btn {
  background: #1a237e;
  color: white;
  border: none;
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.job-apply-btn:hover:not(:disabled) {
  background: #283593;
}

.job-apply-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.job-apply-btn.is-applied {
  background: #10b981;
  color: white;
}

.job-apply-btn.is-applied:hover {
  background: #059669;
}

/* Sidebar */
.job-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: 20px; /* 距离顶部的距离，根据导航栏高度调整 */
  align-self: flex-start;
  max-height: calc(100vh - 40px); /* 最大高度，避免超出视口 */
  overflow-y: auto; /* 当内容超出时显示滚动条 */
}

.sidebar-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.sidebar-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.sidebar-badge {
  background: rgba(26, 35, 126, 0.1);
  color: #1a237e;
  padding: 0.25rem 0.625rem;
  border-radius: 50px;
  font-size: 0.75rem;
  font-weight: 600;
}

.sidebar-tip {
  text-align: center;
  padding: 2rem;
}

.tip-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.sidebar-tip h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.sidebar-tip p {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
}

/* 分页样式 */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
}

.pagination-btn {
  background: #f8fafc;
  color: #1e293b;
  border: 1px solid #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #1a237e;
  color: white;
  border-color: #1a237e;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 600;
}

/* Responsive */
@media (min-width: 1200px) {
  .job-content {
    grid-template-columns: 3fr 1fr;
    gap: 2.5rem;
  }

  .search-section {
    padding: 2.5rem;
  }

  .page-title {
    font-size: 3rem;
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

  .job-content {
    grid-template-columns: 1fr;
  }

  .job-sidebar {
    order: -1;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.75rem;
  }

  .search-input-group {
    flex-direction: column;
  }

  .filter-options {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }

  .search-section {
    padding: 1.5rem;
  }

  .stats-container {
    gap: 1rem;
  }

  .stat-divider {
    display: none;
  }

  .job-card-header {
    flex-direction: column;
    gap: 1rem;
  }

  .job-footer {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .pagination {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .pagination-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .pagination {
    flex-direction: column;
  }

  .pagination-btn {
    width: 100%;
    text-align: center;
  }
}

/* 岗位画像弹窗 */
.job-profile-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.job-profile-modal-content {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  animation: modalFadeIn 0.3s ease;
}

@keyframes modalFadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.job-profile-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.job-profile-modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #1e293b;
  transform: scale(1.1);
}

.job-profile-modal-body {
  padding: 2rem;
}

.modal-divider {
  height: 1px;
  background: #e2e8f0;
  margin: 2rem 0;
}

.graph-section h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
}

/* 响应式弹窗 */
@media (max-width: 768px) {
  .job-profile-modal-content {
    max-width: 95%;
    max-height: 95vh;
  }
  
  .job-profile-modal-header,
  .job-profile-modal-body {
    padding: 1rem 1.5rem;
  }
}

</style>
