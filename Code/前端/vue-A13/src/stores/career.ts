import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export interface CareerPath {
  id: string
  title: string
  level: number
  levelName: string
  experience: string
  salary: string
  skills: string[]
  description: string
}

export interface ActionItem {
  id: string
  text: string
  completed: boolean
  deadline?: string
}

export interface ActionPlan {
  id: string
  title: string
  duration: string
  type: 'short' | 'medium' | 'long'
  tasks: ActionItem[]
}

export interface MatchResult {
  overallScore: number
  dimensions: {
    name: string
    score: number
    weight: number
  }[]
  recommendations: string[]
}

export const useCareerStore = defineStore('career', () => {
  // State - 初始化空数据
  const careerPaths = ref<CareerPath[]>([])
  const actionPlans = ref<ActionPlan[]>([])
  const matchResult = ref<MatchResult>({
    overallScore: 0,
    dimensions: [],
    recommendations: []
  })

  const selectedPath = ref<CareerPath | null>(null)
  const isGeneratingPlan = ref(false)

  // Getters
  const overallProgress = computed(() => {
    const allTasks = actionPlans.value.flatMap(plan => plan.tasks)
    if (allTasks.length === 0) return 0
    const completedTasks = allTasks.filter(task => task.completed).length
    return Math.round((completedTasks / allTasks.length) * 100)
  })

  const completedTasks = computed(() => {
    return actionPlans.value.flatMap(plan => plan.tasks).filter(task => task.completed)
  })

  const pendingTasks = computed(() => {
    return actionPlans.value.flatMap(plan => plan.tasks).filter(task => !task.completed)
  })

  // Actions
  function selectPath(path: CareerPath | null) {
    selectedPath.value = path
  }

  function toggleTaskCompletion(planId: string, taskId: string) {
    const plan = actionPlans.value.find(p => p.id === planId)
    if (plan) {
      const task = plan.tasks.find(t => t.id === taskId)
      if (task) {
        task.completed = !task.completed
        saveToLocalStorage()
      }
    }
  }

  function addTask(planId: string, taskText: string, deadline?: string) {
    const plan = actionPlans.value.find(p => p.id === planId)
    if (plan) {
      const newTask: ActionItem = {
        id: `${planId}-${plan.tasks.length + 1}`,
        text: taskText,
        completed: false,
        deadline
      }
      plan.tasks.push(newTask)
      saveToLocalStorage()
    }
  }

  function removeTask(planId: string, taskId: string) {
    const plan = actionPlans.value.find(p => p.id === planId)
    if (plan) {
      const taskIndex = plan.tasks.findIndex(t => t.id === taskId)
      if (taskIndex > -1) {
        plan.tasks.splice(taskIndex, 1)
        saveToLocalStorage()
      }
    }
  }

  function updateMatchResult(newResult: MatchResult) {
    matchResult.value = newResult
  }

  function saveToLocalStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('actionPlans', JSON.stringify(actionPlans.value))
      localStorage.setItem('matchResult', JSON.stringify(matchResult.value))
    }
  }

  function loadFromLocalStorage() {
    if (typeof window !== 'undefined') {
      const savedPlans = localStorage.getItem('actionPlans')
      const savedMatchResult = localStorage.getItem('matchResult')

      if (savedPlans) {
        actionPlans.value = JSON.parse(savedPlans)
      }

      if (savedMatchResult) {
        matchResult.value = JSON.parse(savedMatchResult)
      }
    }
  }

  function generatePlan() {
    isGeneratingPlan.value = true
    // 模拟生成计划
    setTimeout(() => {
      isGeneratingPlan.value = false
    }, 2000)
  }

  function resetProgress() {
    actionPlans.value.forEach(plan => {
      plan.tasks.forEach(task => {
        task.completed = false
      })
    })
    saveToLocalStorage()
  }

  return {
    careerPaths,
    actionPlans,
    matchResult,
    selectedPath,
    isGeneratingPlan,
    overallProgress,
    completedTasks,
    pendingTasks,
    selectPath,
    toggleTaskCompletion,
    addTask,
    removeTask,
    updateMatchResult,
    loadFromLocalStorage,
    generatePlan,
    resetProgress
  }
})
