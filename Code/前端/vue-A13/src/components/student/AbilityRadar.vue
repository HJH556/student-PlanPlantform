<!--
能力评估组件 - 基于智能体分析结果展示

功能：
- 展示智能体分析的能力评分数据
- 使用 ECharts 绘制雷达图、柱状图等可视化图表
- 显示能力评分和技能掌握进度
- 支持数据驱动的可视化展示

数据来源：
- 智能体返回的 ability_assessment 数据
- 智能体返回的 visualization_data 数据
- 智能体返回的 match_analysis 数据

使用场景：
- 学生画像页面的能力评估功能
- 能力分析和可视化展示

技术特点：
- 使用 ECharts 5 绘制多种图表
- 响应式图表设计
- 动态数据绑定
- 基于智能体分析结果
-->

<template>
  <div class="ability-evaluation">
    <h3 class="evaluation-title">能力评估</h3>
    
    <!-- 能力评分概览 -->
    <div class="score-overview" v-if="abilityData">
      <h4 class="section-title">
        <span class="section-icon">📊</span>
        能力评分概览
      </h4>
      <div class="score-grid">
        <div v-for="(ability, key) in abilityData" :key="key" class="score-card">
          <div class="score-circle" :style="{ background: getScoreColor(ability.score) }">
            <span class="score-value">{{ ability.score }}</span>
          </div>
          <div class="score-info">
            <span class="ability-name">{{ key }}</span>
            <span class="ability-desc">{{ ability.description }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 能力雷达图 -->
    <div class="radar-section" v-if="radarData">
      <h4 class="section-title">
        <span class="section-icon">📈</span>
        能力雷达图
      </h4>
      <div ref="radarChartRef" class="chart-container"></div>
    </div>
    
    <!-- 技能掌握进度 -->
    <div class="skill-progress" v-if="progressData">
      <h4 class="section-title">
        <span class="section-icon">⚡</span>
        技能掌握进度
      </h4>
      <div class="progress-list">
        <div v-for="(skill, index) in progressData" :key="index" class="progress-item">
          <span class="skill-name">{{ skill.name }}</span>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: skill.progress + '%' }"></div>
          </div>
          <span class="progress-value">{{ skill.progress }}%</span>
        </div>
      </div>
    </div>
    
    <!-- 能力分布柱状图 -->
    <div class="bar-chart-section" v-if="barChartData">
      <h4 class="section-title">
        <span class="section-icon">📋</span>
        能力分布图
      </h4>
      <div ref="barChartRef" class="chart-container"></div>
    </div>
    
    <!-- 技能匹配度 -->
    <div class="skill-match" v-if="skillMatchData">
      <h4 class="section-title">
        <span class="section-icon">🔗</span>
        技能岗位匹配度
      </h4>
      <div class="match-list">
        <div v-for="(skill, index) in skillMatchData" :key="index" class="match-item">
          <div class="match-header">
            <span class="skill-name">{{ skill.技能 }}</span>
            <span class="match-score">{{ skill.匹配度 }}%</span>
          </div>
          <div class="match-bar">
            <div class="match-fill" :style="{ width: skill.匹配度 + '%' }"></div>
          </div>
          <span class="match-importance" :class="{ high: skill.重要性 === '高', medium: skill.重要性 === '中', low: skill.重要性 === '低' }">
            {{ skill.重要性 }}重要性
          </span>
        </div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="!abilityData" class="loading-section">
      <div class="loading-icon">⏳</div>
      <p class="loading-text">正在加载能力评估数据...</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useUserStore } from '@/stores/user'

const props = defineProps<{
  resumeData?: any
}>()

const userStore = useUserStore()
const radarChartRef = ref<HTMLElement | null>(null)
const barChartRef = ref<HTMLElement | null>(null)

let radarChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null

// 数据状态
const abilityData = ref<any>(null)
const radarData = ref<any>(null)
const progressData = ref<any>(null)
const barChartData = ref<any>(null)
const skillMatchData = ref<any>(null)

// 从本地存储加载智能体分析结果
const loadResumeAnalysis = () => {
  try {
    const userId = userStore.user?.id || 'unknown'
    const analysisData = localStorage.getItem(`resume_analysis_${userId}`)
    
    if (analysisData) {
      const parsedData = JSON.parse(analysisData)
      console.log(`加载用户${userId}的能力评估数据:`, parsedData)
      
      // 设置数据
      abilityData.value = parsedData.ability_assessment || {}
      radarData.value = parsedData.visualization_data?.radar_chart || null
      progressData.value = parsedData.visualization_data?.progress_bars || null
      barChartData.value = parsedData.visualization_data?.bar_chart || null
      skillMatchData.value = parsedData.match_analysis?.技能匹配 || null
      
      // 初始化图表
      nextTick(() => {
        initRadarChart()
        initBarChart()
      })
    } else {
      console.log(`用户${userId}没有能力评估数据，显示默认状态`)
      abilityData.value = {}
      radarData.value = null
      progressData.value = null
      barChartData.value = null
      skillMatchData.value = null
    }
  } catch (error) {
    console.error('加载能力评估数据失败:', error)
  }
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
        name: '能力评估',
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

// 初始化柱状图
const initBarChart = () => {
  if (!barChartRef.value || !barChartData.value) return
  
  barChart = echarts.init(barChartRef.value)
  
  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: barChartData.value.categories,
      axisLabel: {
        color: '#666'
      }
    },
    yAxis: {
      type: 'value',
      max: 100,
      axisLabel: {
        color: '#666'
      }
    },
    series: [{
      data: barChartData.value.values,
      type: 'bar',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#667eea' },
          { offset: 1, color: '#764ba2' }
        ])
      },
      label: {
        show: true,
        position: 'top',
        color: '#333'
      }
    }]
  }
  
  barChart.setOption(option)
}

// 监听窗口大小变化，重新渲染图表
const handleResize = () => {
  if (radarChart) radarChart.resize()
  if (barChart) barChart.resize()
}

onMounted(() => {
  loadResumeAnalysis()
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  if (radarChart) radarChart.dispose()
  if (barChart) barChart.dispose()
})

// 监听简历数据变化
watch(() => props.resumeData, (newData) => {
  if (newData) {
    loadResumeAnalysis()
  }
})
</script>

<style scoped>
.ability-evaluation {
  padding: 20px;
}

.evaluation-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 30px;
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

.score-overview {
  margin-bottom: 30px;
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.score-card {
  display: flex;
  align-items: center;
  padding: 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  gap: 12px;
}

.score-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 18px;
}

.score-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.ability-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.ability-desc {
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.radar-section, .bar-chart-section {
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

.skill-progress {
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.progress-list {
  display: flex;
  color: #1a1a1a;
  flex-direction: column;
  gap: 12px;
}

.progress-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.skill-name {
  color: #1a1a1a;
  min-width: 100px;
  font-size: 14px;
  font-weight: 500;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #667eea, #764ba2);
  transition: width 0.3s ease;
}

.progress-value {
  min-width: 40px;
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
}

.skill-match {
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.match-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.match-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
}

.match-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.match-score {
  font-size: 14px;
  font-weight: 600;
  color: #52c41a;
}

.match-bar {
  width: 100%;
  height: 6px;
  background: #e0e0e0;
  border-radius: 3px;
  margin: 8px 0;
  overflow: hidden;
}

.match-fill {
  height: 100%;
  background: linear-gradient(90deg, #52c41a, #73d13d);
  transition: width 0.3s ease;
}

.match-importance {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.match-importance.high {
  background: #ff4d4f;
  color: white;
}

.match-importance.medium {
  background: #faad14;
  color: white;
}

.match-importance.low {
  background: #52c41a;
  color: white;
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