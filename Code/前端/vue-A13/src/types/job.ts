// 岗位相关类型定义

export interface Job {
  id: string
  title: string
  company: string
  salary: string
  location: string
  industry: string
  experience: string
  education: string
  description: string
  tags: string[]
  createdAt: string
}

export interface JobProfile {
  jobId: string
  professionalSkills: string[]
  certificates: string[]
  softSkills: string[]
  developmentPath: string[]
  responsibilities: string[]
  requirements: string[]
}

export interface JobGraphNode {
  id: string
  name: string
  type: string
  level: number
}

export interface JobGraphLink {
  source: string
  target: string
  relationship: string
}

export interface JobGraph {
  nodes: JobGraphNode[]
  links: JobGraphLink[]
}

export interface JobSearchParams {
  keyword?: string
  industry?: string
  salaryMin?: number
  salaryMax?: number
  experience?: string
  education?: string
  sortBy?: 'salary' | 'popularity' | 'date'
  page?: number
  pageSize?: number
}