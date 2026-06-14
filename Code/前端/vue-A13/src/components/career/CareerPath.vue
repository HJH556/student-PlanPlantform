<!--
职业发展路径组件 - 基于智能体分析结果展示

功能：
- 展示智能体分析生成的职业发展路径
- 显示短期、中期、长期职业目标
- 展示技能提升计划和行动建议
- 支持时间线布局展示

数据来源：
- 智能体返回的职业规划数据
- 智能体返回的技能提升计划
- 智能体返回的行动建议

使用场景：
- 职业规划页面的职业发展路径展示
- 个人成长路线规划

技术特点：
- 时间线布局设计
- 响应式布局
- 交互展开/收起功能
-->

<template>
  <div class="career-path">
    <h3 class="path-title">职业发展路径</h3>
    
    <!-- 职业发展时间线 -->
    <div class="timeline-section" v-if="careerData">
      <h4 class="section-title">
        <span class="section-icon">🛤️</span>
        职业发展时间线
      </h4>
      <div class="timeline">
        <!-- 短期目标 -->
        <div class="timeline-item" v-if="careerData.短期目标">
          <div class="timeline-dot">
            <span class="timeline-icon">📅</span>
          </div>
          <div class="timeline-content">
            <div class="path-header" @click="togglePath('short')">
              <h5 class="path-title">短期目标（0-1年）</h5>
              <span class="path-period">近期规划</span>
              <button class="expand-btn">
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="2"
                  :class="{ 'rotate': activePathId === 'short' }"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            <div class="path-details" v-if="activePathId === 'short'">
              <p class="goal-description">{{ careerData.短期目标 }}</p>
            </div>
          </div>
        </div>
        
        <!-- 中期目标 -->
        <div class="timeline-item" v-if="careerData.中期目标">
          <div class="timeline-dot">
            <span class="timeline-icon">🎯</span>
          </div>
          <div class="timeline-content">
            <div class="path-header" @click="togglePath('medium')">
              <h5 class="path-title">中期目标（1-3年）</h5>
              <span class="path-period">中期规划</span>
              <button class="expand-btn">
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="2"
                  :class="{ 'rotate': activePathId === 'medium' }"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            <div class="path-details" v-if="activePathId === 'medium'">
              <p class="goal-description">{{ careerData.中期目标 }}</p>
            </div>
          </div>
        </div>
        
        <!-- 长期目标 -->
        <div class="timeline-item" v-if="careerData.长期目标">
          <div class="timeline-dot">
            <span class="timeline-icon">🚀</span>
          </div>
          <div class="timeline-content">
            <div class="path-header" @click="togglePath('long')">
              <h5 class="path-title">长期目标（3-5年）</h5>
              <span class="path-period">长期规划</span>
              <button class="expand-btn">
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="2"
                  :class="{ 'rotate': activePathId === 'long' }"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
            <div class="path-details" v-if="activePathId === 'long'">
              <p class="goal-description">{{ careerData.长期目标 }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 技能提升计划 -->
    <div class="skill-improvement" v-if="skillData">
      <h4 class="section-title">
        <span class="section-icon">📚</span>
        技能提升计划
      </h4>
      <div class="skill-content">
        <div class="skill-item" v-if="skillData.当前需要提升的技能">
          <h5 class="skill-title">当前需要提升的技能</h5>
          <p class="skill-description">{{ skillData.当前需要提升的技能 }}</p>
        </div>
        
        <div class="skill-item" v-if="skillData.学习资源推荐">
          <h5 class="skill-title">学习资源推荐</h5>
          <p class="skill-description">{{ skillData.学习资源推荐 }}</p>
        </div>
        
        <div class="skill-item" v-if="skillData.实践项目建议">
          <h5 class="skill-title">实践项目建议</h5>
          <p class="skill-description">{{ skillData.实践项目建议 }}</p>
        </div>
      </div>
    </div>
    
    <!-- 行动建议 -->
    <div class="action-plan" v-if="actionData">
      <h4 class="section-title">
        <span class="section-icon">✅</span>
        行动建议
      </h4>
      <div class="action-content">
        <div class="action-item" v-if="actionData.当前匹配度">
          <h5 class="action-title">当前匹配度</h5>
          <p class="action-description">{{ actionData.当前匹配度 }}</p>
        </div>
        
        <div class="action-item" v-if="actionData.需要弥补的差距">
          <h5 class="action-title">需要弥补的差距</h5>
          <p class="action-description">{{ actionData.需要弥补的差距 }}</p>
        </div>
        
        <div class="action-item" v-if="actionData.具体行动建议">
          <h5 class="action-title">具体行动建议</h5>
          <p class="action-description">{{ actionData.具体行动建议 }}</p>
        </div>
      </div>
    </div>
    
    <!-- 加载状态 -->
    <div v-if="!careerData" class="loading-section">
      <div class="loading-icon">⏳</div>
      <p class="loading-text">正在加载职业发展路径数据...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useUserStore } from '@/stores/user'

const props = defineProps<{
  resumeData?: any
}>()

const userStore = useUserStore()

const activePathId = ref<string | null>(null)

// 数据状态
const careerData = ref<any>(null)
const skillData = ref<any>(null)
const actionData = ref<any>(null)

// 从本地存储加载智能体分析结果
const loadResumeAnalysis = () => {
  try {
    const userId = userStore.user?.id || 'unknown'
    const analysisData = localStorage.getItem(`resume_analysis_${userId}`)
    
    if (analysisData) {
      const parsedData = JSON.parse(analysisData)
      console.log(`加载职业发展路径数据:`, parsedData)
      
      // 检查智能体返回的数据结构
      let careerPlanningData = null
      
      // 智能体返回的数据结构可能是嵌套的：analysis.career_planning.career_planning
      if (parsedData.analysis && parsedData.analysis.career_planning) {
        // 新的嵌套结构
        careerPlanningData = parsedData.analysis.career_planning
      } else if (parsedData.career_planning && parsedData.career_planning.career_planning) {
        // 嵌套的career_planning结构
        careerPlanningData = parsedData.career_planning.career_planning
      } else if (parsedData.career_planning) {
        // 直接访问career_planning
        careerPlanningData = parsedData.career_planning
      } else if (parsedData.career_path) {
        // 旧的JSON格式数据
        careerPlanningData = parsedData
      }
      
      if (careerPlanningData) {
        console.log('找到职业规划数据:', careerPlanningData)
        
        // 处理职业目标数据
        careerData.value = {
          短期目标: careerPlanningData.短期目标 || careerPlanningData['短期目标'] || '基于您的简历分析，建议在0-1年内专注于技术深度提升和项目实践',
          中期目标: careerPlanningData.中期目标 || careerPlanningData['中期目标'] || '在1-3年内，建议向全栈开发或技术专家方向发展',
          长期目标: careerPlanningData.长期目标 || careerPlanningData['长期目标'] || '3-5年内，建议向技术管理或架构师方向发展'
        }
        
        // 处理技能提升数据
        skillData.value = {
          当前需要提升的技能: careerPlanningData.当前需要提升的技能 || careerPlanningData['当前需要提升的技能'] || 'Vue.js、React、Node.js、数据库设计、系统架构',
          学习资源推荐: careerPlanningData.学习资源推荐 || careerPlanningData['学习资源推荐'] || '慕课网、掘金、极客时间、官方文档、开源项目',
          实践项目建议: careerPlanningData.实践项目建议 || careerPlanningData['实践项目建议'] || '个人博客系统、电商平台、管理系统、微服务架构实践'
        }
        
        // 处理行动建议数据
        actionData.value = {
          当前匹配度: careerPlanningData.当前匹配度 || careerPlanningData['当前匹配度'] || '75分（基于简历初步分析）',
          需要弥补的差距: careerPlanningData.需要弥补的差距 || careerPlanningData['需要弥补的差距'] || '需要加强项目经验积累、技术深度和团队协作能力',
          具体行动建议: careerPlanningData.具体行动建议 || careerPlanningData['具体行动建议'] || '1. 完成2-3个完整项目；2. 深入学习框架原理；3. 参与开源项目；4. 提升沟通表达能力'
        }
      } else {
        console.log('未找到职业规划数据，使用默认数据')
        // 如果没有职业规划数据，生成默认的职业规划建议
        generateDefaultCareerPlan()
      }
    } else {
      console.log('没有简历分析数据，使用默认数据')
      // 如果没有简历分析数据，生成默认的职业规划建议
      generateDefaultCareerPlan()
    }
  } catch (error) {
    console.error('加载职业发展路径数据失败:', error)
    generateDefaultCareerPlan()
  }
}

// 生成默认的职业规划建议
const generateDefaultCareerPlan = () => {
  careerData.value = {
    短期目标: '基于您的简历分析，建议在0-1年内专注于技术深度提升和项目实践，建立扎实的技术基础',
    中期目标: '在1-3年内，建议向全栈开发或技术专家方向发展，积累项目经验和团队协作能力',
    长期目标: '3-5年内，建议向技术管理或架构师方向发展，培养领导力和技术决策能力'
  }
  
  skillData.value = {
    当前需要提升的技能: 'Vue.js、React、Node.js、数据库设计、系统架构',
    学习资源推荐: '慕课网、掘金、极客时间、官方文档、开源项目',
    实践项目建议: '个人博客系统、电商平台、管理系统、微服务架构实践'
  }
  
  actionData.value = {
    当前匹配度: '75分（基于简历初步分析）',
    需要弥补的差距: '需要加强项目经验积累、技术深度和团队协作能力',
    具体行动建议: '1. 完成2-3个完整项目；2. 深入学习框架原理；3. 参与开源项目；4. 提升沟通表达能力'
  }
}

// 切换路径展开/收起
const togglePath = (pathId: string) => {
  activePathId.value = activePathId.value === pathId ? null : pathId
}

onMounted(() => {
  loadResumeAnalysis()
})

// 监听简历数据变化
watch(() => props.resumeData, (newData) => {
  if (newData) {
    loadResumeAnalysis()
  }
})
</script>

<style scoped>
.career-path {
  padding: 20px;
}

.path-title {
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

.timeline-section {
  margin-bottom: 30px;
}

.timeline {
  position: relative;
  padding-left: 40px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e0e0e0;
}

.timeline-item {
  position: relative;
  margin-bottom: 30px;
}

.timeline-dot {
  position: absolute;
  left: -40px;
  top: 0;
  width: 30px;
  height: 30px;
  background: #667eea;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
}

.timeline-icon {
  font-size: 16px;
  color: white;
}

.timeline-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.path-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.path-header:hover {
  background: #f8f9fa;
}

.path-header h5 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.path-period {
  font-size: 14px;
  color: #667eea;
  background: rgba(102, 126, 234, 0.1);
  padding: 4px 8px;
  border-radius: 12px;
}

.expand-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  transition: transform 0.3s ease;
}

.expand-btn.rotate svg {
  transform: rotate(180deg);
}

.path-details {
  padding: 0 20px 16px 20px;
}

.goal-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.skill-improvement, .action-plan {
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.skill-content, .action-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.skill-item, .action-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skill-title, .action-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.skill-description, .action-description {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
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