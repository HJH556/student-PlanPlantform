// 职业规划相关类型定义

export interface MatchItem {
  dimension: string
  studentScore: number
  jobRequirement: number
  gap: number
}

export interface MatchResult {
  overallScore: number
  items: MatchItem[]
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
}

export interface CareerPathNode {
  id: string
  jobTitle: string
  yearsRequired: number
  skillsRequired: string[]
  description: string
}

export interface CareerPath {
  nodes: CareerPathNode[]
  edges: {
    source: string
    target: string
    label: string
  }[]
}

export interface ActionItem {
  id: string
  title: string
  description: string
  deadline: string
  priority: 'high' | 'medium' | 'low'
  status: 'pending' | 'in_progress' | 'completed'
  type: 'learning' | 'practice' | 'certificate' | 'networking'
}

export interface ActionPlan {
  shortTerm: ActionItem[] // 短期（1-3个月）
  mediumTerm: ActionItem[] // 中期（3-6个月）
  longTerm: ActionItem[] // 长期（6-12个月）
}

export interface CareerReport {
  id: string
  studentName: string
  targetJob: string
  matchScore: number
  careerPath: CareerPath
  actionPlan: ActionPlan
  recommendations: string[]
  createdAt: string
  updatedAt: string
}