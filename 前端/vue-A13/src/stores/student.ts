import { ref } from 'vue'
import { defineStore } from 'pinia'
import { studentApi } from '@/api/student'

export interface Experience {
  id: string
  company: string
  position: string
  startDate: string
  endDate: string
  description: string
}

export interface Project {
  id: string
  name: string
  description: string
  technologies: string[]
  link: string
}

export interface StudentProfile {
  id: string
  name: string
  gender: string
  age: number
  phone: string
  email: string
  major: string
  grade: string
  school: string
  avatar: string
  skills: string[]
  certificates: string[]
  experience: Experience[]
  projects: Project[]
}

export const useStudentStore = defineStore('student', () => {
  const profile = ref<StudentProfile | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchProfile() {
    try {
      isLoading.value = true
      error.value = null

      try {
        const response = await studentApi.getStudentInfo()
        profile.value = response.data
        saveToLocalStorage()
      } catch (apiError) {
        // 后端接口不可用时，保持profile为null
        console.error('获取学生信息失败:', apiError)
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '获取学生信息失败'
    } finally {
      isLoading.value = false
    }
  }

  async function updateProfile(data: Partial<StudentProfile>) {
    try {
      isLoading.value = true
      error.value = null

      try {
        const response = await studentApi.updateStudentInfo(data)
        profile.value = response.data
        saveToLocalStorage()
        return { success: true, message: '更新成功' }
      } catch (apiError) {
        // 后端接口不可用时，返回失败
        console.error('更新学生信息失败:', apiError)
        return { success: false, message: '更新失败，请检查网络连接' }
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '更新失败'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function uploadResume(formData: FormData) {
    try {
      isLoading.value = true
      error.value = null

      try {
        await studentApi.uploadResume(formData)
        return { success: true, message: '简历上传成功' }
      } catch (apiError) {
        // 后端接口不可用时，返回失败
        console.error('简历上传失败:', apiError)
        return { success: false, message: '简历上传失败，请检查网络连接' }
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '简历上传失败'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  function saveToLocalStorage() {
    if (typeof window !== 'undefined' && profile.value) {
      localStorage.setItem('studentProfile', JSON.stringify(profile.value))
    }
  }

  function loadFromLocalStorage() {
    if (typeof window !== 'undefined') {
      const savedProfile = localStorage.getItem('studentProfile')
      if (savedProfile) {
        try {
          profile.value = JSON.parse(savedProfile)
        } catch (error) {
          console.error('加载学生信息失败:', error)
        }
      }
    }
  }

  return {
    profile,
    isLoading,
    error,
    fetchProfile,
    updateProfile,
    uploadResume,
    loadFromLocalStorage
  }
})
