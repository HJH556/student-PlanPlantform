<template>
  <div class="job-profile">
    <div v-if="!job" class="empty-state">
      <p>请选择一个岗位查看详细信息</p>
    </div>
    <div v-else class="profile-content">
      <h3 class="profile-title">{{ job.title }} - 岗位画像</h3>

      <div class="info-section">
        <div class="info-item">
          <span class="info-label">公司：</span>
          <span class="info-value">{{ job.company }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">行业：</span>
          <span class="info-value">{{ getIndustryLabel(job.industry) }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">地点：</span>
          <span class="info-value">{{ job.location }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">薪资：</span>
          <span class="info-value salary">{{ job.salary }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">经验：</span>
          <span class="info-value">{{ job.experience }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">学历：</span>
          <span class="info-value">{{ job.education }}</span>
        </div>
      </div>

      <div class="skill-section" v-if="job.requirements && job.requirements.length">
           <h4 class="section-title">
             <i class="skill-icon">🛠️</i>
             技能要求
           </h4>
           <div class="skill-list">
             <div v-for="(req, index) in job.requirements" :key="index" class="skill-item">
               <span class="skill-name" v-html="formatDescription(req)"></span>
               <div class="skill-level">
                 <div class="skill-bar" :style="{ width: getSkillLevel(index) }"></div>
               </div>
             </div>
           </div>
         </div>

      <div class="description-section">
        <h4 class="section-title">
          <i class="skill-icon">📝</i>
          岗位描述
        </h4>
        <p class="description-text" v-html="formatDescription(job.description)"></p>
      </div>

      <div class="tags-section" v-if="job.tags && job.tags.length">
        <h4 class="section-title">
          <i class="skill-icon">🏷️</i>
          标签
        </h4>
        <div class="tags-list">
          <span v-for="tag in job.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
  job: Job | null
}>()

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

// 生成技能水平（模拟数据）
const getSkillLevel = (index: number) => {
  const levels = ['90%', '85%', '80%', '75%', '70%']
  return levels[index % levels.length]
}

// 格式化岗位描述，解析HTML实体并处理换行
const formatDescription = (description: string) => {
  if (!description) return ''
  // 替换HTML实体
  let formatted = description
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
  
  // 处理换行
  formatted = formatted.replace(/<br\s*\/>/g, '\n')
  
  // 转换为HTML换行
  return formatted.replace(/\n/g, '<br>')
}
</script>

<style scoped>
.job-profile {
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: #999;
}

.profile-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #667eea;
}

.info-section {
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-label {
  color: #666;
  font-weight: 500;
}

.info-value {
  color: #333;
  font-weight: 600;
}

.info-value.salary {
  color: #667eea;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.skill-icon {
  font-size: 1.2rem;
}

.skill-section {
  margin-bottom: 1.5rem;
}

.skill-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skill-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.skill-name {
  font-size: 0.9rem;
  color: #555;
}

.skill-level {
  height: 6px;
  background: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
}

.skill-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 3px;
  transition: width 0.5s ease;
}

.description-section {
  margin-bottom: 1.5rem;
}

.description-text {
  color: #666;
  line-height: 1.6;
  font-size: 0.95rem;
}

.tags-section {
  margin-bottom: 1rem;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.tag {
  background: #e8f0fe;
  color: #667eea;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
}
</style>
