<!--
行动计划组件

技术特点：
- 任务状态管理
- 响应式布局
- 交互操作功能
-->

<template>
  <div class="action-plan">
    <h3 class="plan-title">行动计划</h3>
    <div class="plan-tabs">
      <button 
        v-for="type in planTypes" 
        :key="type.value"
        class="plan-tab"
        :class="{ active: activePlanType === type.value }"
        @click="activePlanType = type.value as 'short' | 'medium' | 'long'"
      >
        {{ type.label }}
      </button>
    </div>
    
    <div class="plan-content">
      <div 
        v-for="plan in filteredPlans" 
        :key="plan.id"
        class="plan-card"
      >
        <div class="plan-header">
          <h4 class="plan-name">{{ plan.title }}</h4>
          <span class="plan-duration">{{ plan.duration }}</span>
        </div>
        <div class="plan-tasks">
          <div 
            v-for="task in plan.tasks" 
            :key="task.id"
            class="task-item"
            :class="{ completed: task.completed }"
          >
            <input 
              type="checkbox" 
              :checked="task.completed"
              @change="toggleTask(plan.id, task.id)"
            />
            <span class="task-text">{{ task.text }}</span>
            <button 
              class="delete-task"
              @click="removeTask(plan.id, task.id)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
          <div class="add-task">
            <input 
              v-model="newTaskText"
              @keyup.enter="addTask(plan.id)"
              placeholder="添加新任务..."
              class="task-input"
            />
            <button 
              class="add-btn"
              @click="addTask(plan.id)"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useCareerStore } from '@/stores/career'
import { useUserStore } from '@/stores/user'

const careerStore = useCareerStore()
const userStore = useUserStore()
const activePlanType = ref<'short' | 'medium' | 'long'>('short')
const newTaskText = ref('')

const planTypes = [
  { label: '短期计划', value: 'short' },
  { label: '中期计划', value: 'medium' },
  { label: '长期计划', value: 'long' }
]

const filteredPlans = computed(() => {
  console.log('计算filteredPlans，当前actionPlans:', careerStore.actionPlans)
  return careerStore.actionPlans.filter(plan => plan.type === activePlanType.value)
})

const addTask = (planId: string) => {
  if (newTaskText.value.trim()) {
    careerStore.addTask(planId, newTaskText.value.trim())
    newTaskText.value = ''
  }
}

const toggleTask = (planId: string, taskId: string) => {
  careerStore.toggleTaskCompletion(planId, taskId)
}

const removeTask = (planId: string, taskId: string) => {
  careerStore.removeTask(planId, taskId)
}

// 组件挂载时加载智能体分析数据
onMounted(() => {
  loadActionPlanData()
})

// 从本地存储加载智能体分析结果并更新行动计划
const loadActionPlanData = () => {
  try {
    const userId = userStore.user?.id || 'unknown'
    const analysisData = localStorage.getItem(`resume_analysis_${userId}`)
    
    console.log(`开始加载用户${userId}的行动计划数据...`)
    
    if (analysisData) {
      const parsedData = JSON.parse(analysisData)
      console.log(`加载用户${userId}的智能体分析结果:`, parsedData)
      
      // 检查是否有action_plans数据
      if (parsedData.action_plans) {
        console.log('发现智能体行动计划数据:', parsedData.action_plans)
        updateActionPlansFromAI(parsedData.action_plans)
      } else {
        console.log('智能体分析结果中没有action_plans字段')
        console.log('可用字段:', Object.keys(parsedData))
        // 如果没有action_plans数据，使用默认数据
        initializeDefaultPlans()
      }
    } else {
      console.log(`用户${userId}没有简历分析数据，使用默认行动计划`)
      // 如果没有数据，使用默认数据
      initializeDefaultPlans()
    }
  } catch (error) {
    console.error('加载行动计划数据失败:', error)
    // 出错时使用默认数据
    initializeDefaultPlans()
  }
}

// 根据智能体分析结果更新行动计划
const updateActionPlansFromAI = (aiActionPlans: any) => {
  console.log('开始更新行动计划数据:', aiActionPlans)
  
  const newActionPlans: any[] = []
  
  // 根据智能体返回的数据结构更新行动计划
  if (aiActionPlans.short_term) {
    console.log('处理短期计划数据:', aiActionPlans.short_term)
    newActionPlans.push({
      id: 'short-term-plan',
      title: aiActionPlans.short_term.title || '短期职业发展计划',
      duration: aiActionPlans.short_term.duration || '0-1年',
      type: 'short',
      tasks: (aiActionPlans.short_term.tasks || []).map((task: any, index: number) => ({
        id: `short-task-${index}`,
        text: task.text || task.description || '',
        completed: false,
        deadline: task.deadline
      }))
    })
  }
  
  if (aiActionPlans.medium_term) {
    console.log('处理中期计划数据:', aiActionPlans.medium_term)
    newActionPlans.push({
      id: 'medium-term-plan',
      title: aiActionPlans.medium_term.title || '中期职业发展计划',
      duration: aiActionPlans.medium_term.duration || '1-3年',
      type: 'medium',
      tasks: (aiActionPlans.medium_term.tasks || []).map((task: any, index: number) => ({
        id: `medium-task-${index}`,
        text: task.text || task.description || '',
        completed: false,
        deadline: task.deadline
      }))
    })
  }
  
  if (aiActionPlans.long_term) {
    console.log('处理长期计划数据:', aiActionPlans.long_term)
    newActionPlans.push({
      id: 'long-term-plan',
      title: aiActionPlans.long_term.title || '长期职业发展计划',
      duration: aiActionPlans.long_term.duration || '3-5年',
      type: 'long',
      tasks: (aiActionPlans.long_term.tasks || []).map((task: any, index: number) => ({
        id: `long-task-${index}`,
        text: task.text || task.description || '',
        completed: false,
        deadline: task.deadline
      }))
    })
  }
  
  console.log('更新后的行动计划数据:', newActionPlans)
  
  // 使用store的响应式更新方法
  careerStore.actionPlans = newActionPlans
  
  // 如果没有智能体数据，使用默认数据
  if (careerStore.actionPlans.length === 0) {
    console.log('智能体数据为空，使用默认行动计划')
    initializeDefaultPlans()
  }
}

// 初始化默认行动计划
const initializeDefaultPlans = () => {
  careerStore.actionPlans = [
    {
      id: 'short-term-plan',
      title: '短期职业发展计划',
      duration: '0-1年',
      type: 'short',
      tasks: [
        { id: 'short-task-1', text: '学习前端开发技术', completed: false },
        { id: 'short-task-2', text: '参与项目管理培训', completed: false },
        { id: 'short-task-3', text: '构建个人作品集', completed: false }
      ]
    },
    {
      id: 'medium-term-plan',
      title: '中期职业发展计划',
      duration: '1-3年',
      type: 'medium',
      tasks: [
        { id: 'medium-task-1', text: '获得PMP认证', completed: false },
        { id: 'medium-task-2', text: '参与大型项目开发', completed: false },
        { id: 'medium-task-3', text: '提升团队管理能力', completed: false }
      ]
    },
    {
      id: 'long-term-plan',
      title: '长期职业发展计划',
      duration: '3-5年',
      type: 'long',
      tasks: [
        { id: 'long-task-1', text: '成为技术专家', completed: false },
        { id: 'long-task-2', text: '培养领导力', completed: false },
        { id: 'long-task-3', text: '实现职业目标', completed: false }
      ]
    }
  ]
}
</script>

<style scoped>
.action-plan {
  width: 100%;
  padding: 0;
}

.plan-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 1.5rem;
}

.plan-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.plan-tab {
  background: none;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  color: #666;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}

.plan-tab.active {
  color: #667eea;
  border-bottom-color: #667eea;
}

.plan-tab:hover {
  color: #667eea;
}

.plan-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.plan-card {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.plan-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.plan-duration {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  font-size: 0.8rem;
  font-weight: 500;
}

.plan-tasks {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
  transition: all 0.3s ease;
}

.task-item.completed {
  background: #f0f9ff;
  border-color: #b3e0ff;
}

.task-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.task-text {
  flex: 1;
  font-size: 0.9rem;
  color: #1a1a1a;
}

.task-item.completed .task-text {
  text-decoration: line-through;
  color: #999;
}

.delete-task {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.delete-task:hover {
  background: #ffebee;
  color: #f44336;
}

.add-task {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
}

.task-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 0.9rem;
}

.add-btn {
  background: #667eea;
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-btn:hover {
  background: #5a6fd8;
}
</style>