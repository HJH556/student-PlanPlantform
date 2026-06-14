<!--
人岗匹配结果组件 - 基于智能体分析结果展示

功能：
- 展示智能体分析的人岗匹配数据
- 显示推荐岗位和匹配度
- 使用 ECharts 绘制雷达图展示能力匹配
- 显示技能匹配度和改进建议

数据来源：
- 智能体返回的 career_tendency.匹配岗位 数据
- 智能体返回的 match_analysis 数据
- 智能体返回的 visualization_data 数据

使用场景：
- 职业规划页面的人岗匹配分析
- 岗位推荐和匹配度展示

技术特点：
- 使用 ECharts 5 绘制雷达图
- 动态数据绑定
- 响应式布局设计
- 基于智能体分析结果
-->

<template>
  <div class="match-result">
    <h3 class="result-title">人岗匹配分析</h3>
    
    <!-- 总体匹配度 -->
    <div class="overall-match" v-if="overallMatchScore">
      <div class="match-circle">
        <span class="match-percent">{{ overallMatchScore }}%</span>
        <span class="match-label">总体匹配度</span>
      </div>
      <div class="match-info">
        <h4>综合匹配度分析</h4>
        <p>{{ getMatchLevel(overallMatchScore) }}</p>
        <div class="match-stats">
          <span class="stat-item">推荐岗位：{{ recommendedPositions?.length || 0 }}个</span>
          <span class="stat-item">技能匹配：{{ skillMatchCount }}项</span>
        </div>
      </div>
    </div>
    
    <!-- 推荐岗位 -->
    <div class="recommended-positions" v-if="recommendedPositions && recommendedPositions.length > 0">
      <h4 class="section-title">
        <span class="section-icon">💼</span>
        推荐岗位
      </h4>
      <div class="positions-grid">
        <div v-for="(position, index) in recommendedPositions" :key="index" class="position-card">
          <div class="position-header">
            <span class="position-name">{{ position.name }}</span>
            <span class="position-score" :style="{ background: getScoreColor(position.match_score) }">
              {{ position.match_score }}% 匹配
            </span>
          </div>
          <p class="position-reason">{{ position.reason }}</p>
          <div class="position-tags">
            <span class="tag">推荐</span>
            <span class="tag" v-if="position.match_score >= 90">高匹配</span>
            <span class="tag" v-else-if="position.match_score >= 80">中匹配</span>
            <span class="tag" v-else>一般匹配</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 能力匹配雷达图 -->
    <div class="ability-match" v-if="radarData">
      <h4 class="section-title">
        <span class="section-icon">📊</span>
        能力匹配雷达图
      </h4>
      <div ref="radarChartRef" class="chart-container"></div>
    </div>
    
    <!-- 技能匹配度 -->
    <div class="skill-match" v-if="skillMatchData && skillMatchData.length > 0">
      <h4 class="section-title">
        <span class="section-icon">🔧</span>
        技能匹配度
      </h4>
      <div class="skills-grid">
        <div v-for="(skill, index) in skillMatchData" :key="index" class="skill-item">
          <div class="skill-header">
            <span class="skill-name">{{ skill.技能 }}</span>
            <span class="skill-score">{{ skill.匹配度 }}%</span>
          </div>
          <div class="skill-bar">
            <div class="skill-fill" :style="{ width: skill.匹配度 + '%' }"></div>
          </div>
          <span class="skill-importance" :class="{ high: skill.重要性 === '高', medium: skill.重要性 === '中', low: skill.重要性 === '低' }">
            {{ skill.重要性 }}重要性
          </span>
        </div>
      </div>
    </div>
    
    <!-- 匹配分析 -->
    <div class="match-analysis" v-if="matchAnalysis">
      <h4 class="section-title">
        <span class="section-icon">🔍</span>
        匹配分析
      </h4>
      <div class="analysis-content">
        <div class="analysis-item" v-if="matchAnalysis.优势分析">
          <span class="analysis-label">优势分析</span>
          <p class="analysis-text">{{ matchAnalysis.优势分析 }}</p>
        </div>
        <div class="analysis-item" v-if="matchAnalysis.改进建议">
          <span class="analysis-label">改进建议</span>
          <p class="analysis-text">{{ matchAnalysis.改进建议 }}</p>
        </div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="!recommendedPositions" class="loading-section">
      <div class="loading-icon">⏳</div>
      <p class="loading-text">正在加载人岗匹配数据...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import * as echarts from 'echarts'
import { useUserStore } from '@/stores/user'

const props = defineProps<{
  resumeData?: any
}>()

const userStore = useUserStore()

const radarChartRef = ref<HTMLElement | null>(null)
let radarChart: echarts.ECharts | null = null

// 数据状态
const recommendedPositions = ref<any[]>([])
const overallMatchScore = ref<number>(0)
const radarData = ref<any>(null)
const skillMatchData = ref<any[]>([])
const matchAnalysis = ref<any>(null)

// 计算技能匹配数量
const skillMatchCount = computed(() => {
  return skillMatchData.value.length
})

// 从本地存储加载智能体分析结果
const loadResumeAnalysis = () => {
  try {
    const userId = userStore.user?.id || 'unknown'
    const analysisData = localStorage.getItem(`resume_analysis_${userId}`)
    
    if (analysisData) {
      const parsedData = JSON.parse(analysisData)
      console.log(`加载用户${userId}的人岗匹配数据:`, parsedData)
      
      // 设置数据
      recommendedPositions.value = parsedData.career_tendency?.匹配岗位 || []
      overallMatchScore.value = parsedData.match_analysis?.总体匹配度 || 0
      radarData.value = parsedData.visualization_data?.radar_chart || null
      skillMatchData.value = parsedData.match_analysis?.技能匹配 || []
      matchAnalysis.value = parsedData.match_analysis || null
      
      // 初始化图表
      nextTick(() => {
        initRadarChart()
      })
    } else {
      console.log(`用户${userId}没有人岗匹配数据，显示默认状态`)
      // 设置默认数据
      recommendedPositions.value = []
      overallMatchScore.value = 0
      radarData.value = null
      skillMatchData.value = []
      matchAnalysis.value = null
    }
  } catch (error) {
    console.error('加载人岗匹配数据失败:', error)
    // 出错时设置默认数据
    recommendedPositions.value = []
    overallMatchScore.value = 0
    radarData.value = null
    skillMatchData.value = []
    matchAnalysis.value = null
  }
}

// 根据分数获取匹配等级
const getMatchLevel = (score: number): string => {
  if (score >= 90) return '优秀匹配 - 您与目标岗位高度契合'
  if (score >= 80) return '良好匹配 - 您与目标岗位较为契合'
  if (score >= 70) return '一般匹配 - 您与目标岗位基本契合'
  if (score >= 60) return '较低匹配 - 需要进一步提升能力'
  return '低匹配 - 建议调整职业方向'
}

// 根据分数获取颜色
const getScoreColor = (score: number) => {
  if (score >= 90) return '#52c41a'
  if (score >= 80) return '#73d13d'
  if (score >= 70) return '#faad14'
  if (score >= 60) return '#ffa940'
  return '#ff4d4f'
}

// 初始化雷达图
const initRadarChart = () => {
  if (!radarChartRef.value || !radarData.value) return
  
  radarChart = echarts.init(radarChartRef.value)
  
  const option = {
    tooltip: {},
    radar: {
      indicator: radarData.value.indicators.map((indicator: string, index: number) => ({
        name: indicator,
        max: 100
      })),
      radius: '60%',
      splitNumber: 5,
      axisName: {
        color: '#666',
        fontSize: 12
      },
      splitLine: {
        lineStyle: {
          color: '#e0e0e0'
        }
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ['#f8f9fa', '#fff']
        }
      }
    },
    series: [{
      type: 'radar',
      data: [{
        value: radarData.value.scores,
        name: '能力匹配度',
        areaStyle: {
          color: 'rgba(102, 126, 234, 0.3)'
        },
        lineStyle: {
          color: '#667eea',
          width: 2
        },
        itemStyle: {
          color: '#667eea'
        }
      }]
    }]
  }
  
  radarChart.setOption(option)
}

// 监听窗口大小变化，重新渲染图表
const handleResize = () => {
  if (radarChart) radarChart.resize()
}

onMounted(() => {
  loadResumeAnalysis()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (radarChart) radarChart.dispose()
})

// 监听简历数据变化
watch(() => props.resumeData, (newData) => {
  if (newData) {
    loadResumeAnalysis()
  }
})
</script>

<style scoped>
.match-result {
  padding: 20px;
}

.result-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 30px;
}

.overall-match {
  display: flex;
  align-items: center;
  gap: 30px;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.match-circle {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.match-percent {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
}

.match-label {
  font-size: 14px;
  margin-top: 4px;
}

.match-info {
  flex: 1;
}

.match-info h4 {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}

.match-info p {
  color: #666;
  margin-bottom: 12px;
  line-height: 1.4;
}

.match-stats {
  display: flex;
  gap: 20px;
}

.stat-item {
  font-size: 14px;
  color: #666;
  background: #f8f9fa;
  padding: 4px 8px;
  border-radius: 4px;
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

.recommended-positions {
  margin-bottom: 30px;
}

.positions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.position-card {
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.position-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.position-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.position-score {
  font-size: 14px;
  color: white;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
}

.position-reason {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin-bottom: 12px;
}

.position-tags {
  display: flex;
  gap: 8px;
}

.tag {
  font-size: 12px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 2px 6px;
  border-radius: 8px;
}

.ability-match {
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.chart-container {
  width: 100%;
  height: 300px;
}

.skill-match {
  margin-bottom: 30px;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.skill-item {
  padding: 12px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.skill-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.skill-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.skill-score {
  font-size: 14px;
  font-weight: 600;
  color: #52c41a;
}

.skill-bar {
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  margin: 8px 0;
  overflow: hidden;
}

.skill-fill {
  height: 100%;
  background: linear-gradient(90deg, #52c41a, #73d13d);
  transition: width 0.3s ease;
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

.match-analysis {
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.analysis-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.analysis-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.analysis-label {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.analysis-text {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
  margin: 0;
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