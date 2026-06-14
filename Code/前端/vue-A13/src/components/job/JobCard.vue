<template>
  <div class="job-card" @click="handleClick">
    <div class="job-header">
      <h3 class="job-title">{{ job.title }}</h3>
      <span class="job-salary">{{ job.salary }}</span>
    </div>
    <div class="job-body">
      <div class="job-company">
        <span class="company-name">{{ job.company }}</span>
        <span class="company-tag">{{ getIndustryLabel(job.industry) }}</span>
      </div>
      <div class="job-meta">
        <span class="job-location">{{ job.location }}</span>
        <span class="job-experience">{{ job.experience }}</span>
        <span class="job-education">{{ job.education }}</span>
      </div>
      <div class="job-desc">
        <p>{{ job.description }}</p>
      </div>
      <div v-if="job.tags && job.tags.length" class="job-tags">
        <span v-for="tag in job.tags" :key="tag" class="job-tag">{{ tag }}</span>
      </div>
    </div>
    <div class="job-footer">
      <button class="apply-btn" @click.stop="handleApply">立即申请</button>
      <button
        class="favorite-btn"
        :class="{ 'is-favorite': job.isFavorite }"
        @click.stop="handleFavorite"
      >
        {{ job.isFavorite ? '已收藏' : '收藏' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useJobStore } from '@/stores/job'

interface Job {
  id: string
  title: string
  company: string
  industry: string
  location: string
  salary: string
  salaryMin: number
  salaryMax: number
  experience: string
  education: string
  description: string
  requirements: string[]
  tags: string[]
  isFavorite: boolean
  publishDate: string
}

const props = defineProps<{
  job: Job
}>()

const emit = defineEmits<{
  click: [job: Job]
}>()

const jobStore = useJobStore()

// 行业标签映射
const industryMap: Record<string, string> = {
  tech: '互联网/科技',
  finance: '金融',
  education: '教育',
  design: '设计',
  healthcare: '医疗',
  other: '其他'
}

const getIndustryLabel = (industry: string) => {
  return industryMap[industry] || industry
}

// 点击卡片
const handleClick = () => {
  emit('click', props.job)
}

// 申请岗位
const handleApply = async () => {
  try {
    const success = await jobStore.applyJob(props.job.id)
    if (success) {
      alert('申请成功！')
    } else {
      alert('申请失败，请重试')
    }
  } catch (error) {
    console.error('申请岗位失败:', error)
    alert('申请失败，请重试')
  }
}

// 收藏/取消收藏
const handleFavorite = () => {
  jobStore.toggleFavorite(props.job.id)
}
</script>

<style scoped>
.job-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.job-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.job-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.job-salary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 25px;
  font-weight: 600;
  font-size: 0.9rem;
}

.job-body {
  margin-bottom: 1.5rem;
}

.job-company {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  align-items: center;
}

.company-name {
  font-weight: 500;
  color: #333;
}

.company-tag {
  background: #f0f0f0;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #666;
}

.job-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.job-desc {
  color: #666;
  line-height: 1.5;
  font-size: 0.95rem;
  margin-bottom: 1rem;
}

.job-desc p {
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.job-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.job-tag {
  background: #e8f0fe;
  color: #667eea;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
}

.job-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.apply-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.apply-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.favorite-btn {
  background: white;
  color: #666;
  border: 2px solid #eaeaea;
  padding: 0.5rem 1.5rem;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.favorite-btn:hover {
  border-color: #667eea;
  color: #667eea;
}

.favorite-btn.is-favorite {
  background: #ff6b6b;
  color: white;
  border-color: #ff6b6b;
}

@media (max-width: 768px) {
  .job-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .job-meta {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .job-footer {
    flex-direction: column;
  }

  .apply-btn,
  .favorite-btn {
    width: 100%;
    text-align: center;
  }
}
</style>
