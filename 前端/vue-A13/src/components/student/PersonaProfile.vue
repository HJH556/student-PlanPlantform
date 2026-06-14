<template>
  <div class="persona-profile">
    <h3 class="profile-title">个人画像</h3>
    
    <!-- 基本信息 -->
    <div class="profile-section" v-if="profileData && profileData.basicInfo">
      <h4 class="section-title">
        <span class="section-icon">👤</span>
        基本信息
      </h4>
      <div class="info-grid">
        <div class="info-card" v-for="(value, key) in profileData.basicInfo" :key="key">
          <span class="info-label">{{ key }}</span>
          <span class="info-value">{{ value || '待完善' }}</span>
        </div>
        <div v-if="Object.keys(profileData.basicInfo).length === 0" class="empty-state">
          暂无基本信息
        </div>
      </div>
    </div>

    <!-- 能力评估（带打分） -->
    <div class="profile-section" v-if="profileData && profileData.abilityAssessment">
      <h4 class="section-title">
        <span class="section-icon">📊</span>
        能力评估
      </h4>
      <div class="ability-container">
        <div v-for="(ability, key) in profileData.abilityAssessment" :key="key" class="ability-card">
          <div class="ability-header">
            <span class="ability-label">{{ key }}</span>
            <span class="ability-score">{{ ability.score || 0 }}分</span>
          </div>
          <div class="ability-bar">
            <div class="ability-fill" :style="{ width: (ability.score || 0) + '%' }"></div>
          </div>
          <p class="ability-desc">{{ ability.description || '待分析' }}</p>
          <div class="ability-details" v-if="ability.details && ability.details.length > 0">
            <span class="detail-tag" v-for="(detail, index) in ability.details" :key="index">
              {{ detail }}
            </span>
          </div>
        </div>
        <div v-if="Object.keys(profileData.abilityAssessment).length === 0" class="empty-state">
          暂无能力评估信息
        </div>
      </div>
    </div>

    <!-- 职业倾向 -->
    <div class="profile-section" v-if="profileData && profileData.careerTendency">
      <h4 class="section-title">
        <span class="section-icon">🎯</span>
        职业倾向
      </h4>
      <div class="career-container">
        <!-- 过滤掉匹配岗位，只显示其他职业倾向信息 -->
        <div v-for="(value, key) in filteredCareerTendency" :key="key" class="career-card">
          <span class="career-label">{{ key }}</span>
          <span class="career-value">{{ value || '待确定' }}</span>
        </div>
        
        <!-- 推荐岗位（使用匹配岗位数据） -->
        <div v-if="profileData.careerTendency && profileData.careerTendency.匹配岗位" class="recommended-positions">
          <h5 class="sub-title">推荐岗位</h5>
          <div class="position-list">
            <div v-for="(position, index) in profileData.careerTendency.匹配岗位" :key="index" class="position-card">
              <div class="position-header">
                <span class="position-name">{{ position.name }}</span>
                <span class="position-score">{{ position.match_score }}% 匹配</span>
              </div>
              <p class="position-reason">{{ position.reason }}</p>
            </div>
          </div>
        </div>
        
        <div v-if="Object.keys(profileData.careerTendency).length === 0" class="empty-state">
          暂无职业倾向信息
        </div>
      </div>
    </div>

    <!-- 匹配度分析 -->
    <div class="profile-section" v-if="profileData && profileData.matchAnalysis">
      <h4 class="section-title">
        <span class="section-icon">🔍</span>
        匹配度分析
      </h4>
      <div class="match-container">
        <div class="overall-match">
          <span class="match-label">总体匹配度</span>
          <div class="match-circle">
            <span class="match-percent">{{ profileData.matchAnalysis.总体匹配度 || 0 }}%</span>
          </div>
        </div>
        
        <div v-for="item in filteredMatchAnalysis" :key="item.key" class="match-card">
          <span class="match-label">{{ item.key }}</span>
          <span class="match-value">{{ item.value || '待分析' }}</span>
        </div>
        
        <!-- 技能匹配 -->
        <div v-if="profileData.matchAnalysis && profileData.matchAnalysis.技能匹配" class="skill-match">
          <h5 class="sub-title">技能匹配度</h5>
          <div class="skill-list">
            <div v-for="(skill, index) in profileData.matchAnalysis.技能匹配" :key="index" class="skill-item">
              <span class="skill-name">{{ skill.技能 }}</span>
              <div class="skill-bar">
                <div class="skill-fill" :style="{ width: skill.匹配度 + '%' }"></div>
              </div>
              <span class="skill-percent">{{ skill.匹配度 }}%</span>
              <span class="skill-importance" :class="{ high: skill.重要性 === '高', medium: skill.重要性 === '中', low: skill.重要性 === '低' }">
                {{ skill.重要性 }}
              </span>
            </div>
          </div>
        </div>
        
        <div v-if="Object.keys(profileData.matchAnalysis).length === 0" class="empty-state">
          暂无匹配度分析信息
        </div>
      </div>
    </div>

    <!-- 可视化数据 -->
    <div class="profile-section" v-if="profileData && profileData.visualizationData">
      <h4 class="section-title">
        <span class="section-icon">📈</span>
        数据可视化
      </h4>
      <div class="visualization-container">
        <!-- 雷达图数据 -->
        <div v-if="profileData.visualizationData.radar_chart" class="radar-data">
          <h5 class="sub-title">能力雷达图数据</h5>
          <div class="radar-indicators">
            <div v-for="(indicator, index) in profileData.visualizationData.radar_chart.indicators" :key="index" class="indicator-item">
              <span class="indicator-name">{{ indicator }}</span>
              <span class="indicator-score">{{ profileData.visualizationData.radar_chart.scores[index] }}分</span>
            </div>
          </div>
        </div>
        
        <!-- 进度条数据 -->
        <div v-if="profileData.visualizationData.progress_bars" class="progress-data">
          <h5 class="sub-title">技能掌握进度</h5>
          <div class="progress-list">
            <div v-for="(progress, index) in profileData.visualizationData.progress_bars" :key="index" class="progress-item">
              <span class="progress-name">{{ progress.name }}</span>
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: progress.progress + '%' }"></div>
              </div>
              <span class="progress-percent">{{ progress.progress }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="!profileData" class="loading-section">
      <div class="loading-icon">⏳</div>
      <p class="loading-text">正在加载个人画像数据...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue'
import { useUserStore } from '@/stores/user'

const props = defineProps<{
  resumeData?: any
}>()

const profileData = ref<any>(null)
const userStore = useUserStore()

// 计算属性：过滤掉总体匹配度和技能匹配的匹配分析项
const filteredMatchAnalysis = computed(() => {
  if (!profileData.value || !profileData.value.matchAnalysis) {
    return []
  }
  
  return Object.entries(profileData.value.matchAnalysis)
    .filter(([key]) => key !== '总体匹配度' && key !== '技能匹配')
    .map(([key, value]) => ({ key, value }))
})

// 计算属性：过滤掉匹配岗位的职业倾向信息
const filteredCareerTendency = computed(() => {
  if (!profileData.value || !profileData.value.careerTendency) {
    return {}
  }
  
  // 过滤掉匹配岗位和推荐岗位，只显示其他职业倾向信息
  const filtered = { ...profileData.value.careerTendency }
  delete filtered.匹配岗位
  delete filtered.推荐岗位
  
  return filtered
})

// 从本地存储加载智能体分析结果
const loadResumeAnalysis = () => {
  try {
    const userId = userStore.user?.id || 'unknown'
    const analysisData = localStorage.getItem(`resume_analysis_${userId}`)
    
    if (analysisData) {
      const parsedData = JSON.parse(analysisData)
      console.log(`加载用户${userId}的智能体分析结果:`, parsedData)
      
      // 转换数据格式以适应前端组件
      profileData.value = {
        basicInfo: parsedData.basic_info || {},
        abilityAssessment: parsedData.ability_assessment || {},
        careerTendency: parsedData.career_tendency || {},
        matchAnalysis: parsedData.match_analysis || {},
        visualizationData: parsedData.visualization_data || {}
      }
    } else {
      // 如果没有分析结果，设置默认数据
      console.log(`用户${userId}没有简历分析数据，显示默认状态`)
      profileData.value = {
        basicInfo: {
          姓名: '待分析',
          学历: '待分析',
          专业: '待分析',
          工作经验: '待分析',
          技能特长: '待分析'
        },
        abilityAssessment: {},
        careerTendency: {
          兴趣领域: '待分析',
          职业目标: '待分析',
          期望岗位: '待分析',
          匹配岗位: []
        },
        matchAnalysis: {
          总体匹配度: 0,
          优势分析: '待分析',
          改进建议: '待分析',
          技能匹配: []
        },
        visualizationData: {}
      }
    }
  } catch (error) {
    console.error('加载简历分析数据失败:', error)
    // 出错时设置默认数据
    profileData.value = {
      basicInfo: { 状态: '数据加载失败' },
      abilityAssessment: {},
      careerTendency: {},
      matchAnalysis: {},
      visualizationData: {}
    }
  }
}

const setDefaultData = () => {
  profileData.value = {
    basicInfo: {
      姓名: '待分析',
      学历: '待分析',
      专业: '待分析',
      工作经验: '待分析',
      技能特长: '待分析'
    },
    abilityAssessment: {
      技术能力: { score: 0, description: '待分析', details: [] },
      沟通能力: { score: 0, description: '待分析', details: [] },
      团队协作: { score: 0, description: '待分析', details: [] },
      学习能力: { score: 0, description: '待分析', details: [] }
    },
    careerTendency: {
      兴趣领域: '待分析',
      职业目标: '待分析',
      期望岗位: '待分析',
      匹配岗位: []
    },
    matchAnalysis: {
      总体匹配度: 0,
      优势分析: '待分析',
      改进建议: '待分析',
      技能匹配: []
    },
    visualizationData: {
      radar_chart: { indicators: [], scores: [] },
      progress_bars: []
    }
  }
}

// 将文本描述转换为分数宽度（用于进度条显示）
const getScoreWidth = (value: string) => {
  if (!value || typeof value !== 'string') return 0
  
  // 简单的文本匹配逻辑
  if (value.includes('优秀') || value.includes('很好') || value.includes('非常高')) return 90
  if (value.includes('良好') || value.includes('较好') || value.includes('较高')) return 75
  if (value.includes('一般') || value.includes('中等') || value.includes('普通')) return 60
  if (value.includes('需要提升') || value.includes('有待提高') || value.includes('较低')) return 40
  
  return 50 // 默认值
}

onMounted(() => {
  loadResumeAnalysis()
})

// 监听简历数据变化
watch(() => props.resumeData, (newData) => {
  if (newData) {
    console.log('新的简历数据:', newData)
    // 如果有新的简历数据，重新加载分析结果
    loadResumeAnalysis()
  }
})
</script>

<style scoped>
.persona-profile {
  padding: 20px;
}

.profile-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 30px;
}

.profile-section {
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-icon {
  font-size: 20px;
}

.sub-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 20px 0 12px 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.info-card, .ability-card, .career-card, .match-card, .position-card {
  display: flex;
  flex-direction: column;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.ability-card {
  padding: 16px;
}

.ability-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.ability-label {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.ability-score {
  font-size: 18px;
  font-weight: 700;
  color: #667eea;
}

.ability-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  margin: 8px 0;
  overflow: hidden;
}

.ability-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.ability-desc {
  font-size: 14px;
  color: #666;
  margin: 8px 0;
  line-height: 1.4;
}

.ability-details {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.detail-tag {
  font-size: 12px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
}

.position-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.position-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.position-score {
  font-size: 14px;
  color: #52c41a;
  font-weight: 600;
}

.position-reason {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.overall-match {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.match-circle {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 18px;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
}

.skill-name {
  color: #1a1a1a;
  min-width: 80px;
  font-size: 14px;
  font-weight: 500;
}

.skill-bar {
  flex: 1;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.skill-fill {
  height: 100%;
  background: linear-gradient(90deg, #52c41a, #73d13d);
  transition: width 0.3s ease;
}

.skill-percent {
  min-width: 40px;
  font-size: 14px;
  font-weight: 600;
  color: #52c41a;
}

.skill-importance {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.skill-importance.high {
  background: #ff4d4f;
  color: white;
}

.skill-importance.medium {
  background: #faad14;
  color: white;
}

.skill-importance.low {
  background: #52c41a;
  color: white;
}

.radar-indicators {
  color: #1a1a1a;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.indicator-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px;
  background: #f8f9fa;
  border-radius: 6px;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.progress-name {
  min-width: 80px;
  font-size: 14px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.progress-percent {
  min-width: 40px;
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
}

.info-label, .career-label, .match-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.info-value, .career-value, .match-value {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
}

.ability-container, .career-container, .match-container, .position-list, .skill-list, .progress-list {
  display: flex;
  color: #1a1a1a;
  flex-direction: column;
  gap: 12px;
}

.empty-state {
  text-align: center;
  color: #999;
  font-style: italic;
  padding: 20px;
}

.loading-section {
  text-align: center;
  padding: 40px;
}

.loading-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.loading-text {
  color: #666;
  font-size: 16px;
}
</style>