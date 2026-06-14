// 学生画像相关类型定义

export interface StudentInfo {
  id: string
  name: string
  gender: string
  age: number
  email: string
  phone: string
  major: string
  university: string
  graduationYear: string
}

export interface Education {
  id: string
  school: string
  degree: string
  major: string
  startDate: string
  endDate: string
  gpa?: number
  courses?: string[]
}

export interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
  achievements?: string[]
}

export interface Project {
  id: string
  name: string
  role: string
  startDate: string
  endDate: string
  description: string
  technologies: string[]
  achievements?: string[]
}

export interface Skill {
  id: string
  name: string
  level: 'beginner' | 'intermediate' | 'advanced'
  category: 'technical' | 'soft'
}

export interface Certificate {
  id: string
  name: string
  issuer: string
  issueDate: string
  expirationDate?: string
}

export interface Award {
  id: string
  name: string
  issuer: string
  date: string
  description?: string
}

export interface StudentProfile {
  basicInfo: StudentInfo
  education: Education[]
  experiences: Experience[]
  projects: Project[]
  skills: Skill[]
  certificates: Certificate[]
  awards: Award[]
}

export interface AbilityScore {
  professionalSkills: number
  learningAbility: number
  communicationAbility: number
 抗压能力: number
  innovationAbility: number
  internshipAbility: number
}

export interface AbilityEvaluation {
  scores: AbilityScore
  radarData: {
    indicator: {
      name: string
      max: number
    }[]
    data: number[]
  }
}