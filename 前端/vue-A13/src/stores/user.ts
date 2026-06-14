import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { userApi } from '@/api/user'

export interface User {
  id: string
  username: string
  email: string
  name?: string
  gender?: string
  age?: number
  phone?: string
  major?: string
  grade?: string
  role: string
  avatar?: string
  profile_step?: number
}

// 存储管理工具函数
function safeStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (error) {
    console.warn(`存储 ${key} 失败:`, error)
    // 尝试清理过期数据
    try {
      localStorage.removeItem(key)
      localStorage.setItem(key, value)
      return true
    } catch {
      return false
    }
  }
}

// sessionStorage 安全存储函数
function safeSessionStorageSet(key: string, value: string): boolean {
  try {
    sessionStorage.setItem(key, value)
    return true
  } catch (error) {
    console.warn(`sessionStorage 存储 ${key} 失败:`, error)
    // 尝试清理过期数据
    try {
      sessionStorage.removeItem(key)
      sessionStorage.setItem(key, value)
      return true
    } catch {
      return false
    }
  }
}

export const useUserStore = defineStore('user', () => {
  // State
  const user = ref<User | null>(null)
  const token = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const applications = ref<any[]>([])

  // Getters
  const isLoggedIn = computed(() => !!token.value)
  const userRole = computed(() => user.value?.role || 'guest')

  // Actions
  async function login(username: string, password: string, captcha: string, captchaId: string, remember: boolean = false) {
    try {
      isLoading.value = true
      error.value = null

      const response = await userApi.login(username, password, captcha, captchaId)
      const { token: accessToken, user: userData } = response.data

      // 存储token和用户信息
      token.value = accessToken
      user.value = userData

      // 保存到localStorage
      if (remember) {
        // 只存储必要的用户信息，避免存储过大数据
        const minimalUserData = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          role: userData.role
        }
        // 使用安全存储函数
        safeStorageSet('token', accessToken)
        safeStorageSet('user', JSON.stringify(minimalUserData))
      } else {
        // sessionStorage 也有配额限制，需要精简存储
        // 只存储必要的用户信息
        const minimalUserData = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          role: userData.role
        }
        // 使用安全存储函数
        safeSessionStorageSet('user', JSON.stringify(minimalUserData))
        safeStorageSet('token', accessToken)
      }

      return { success: true, message: '登录成功' }
    } catch (err: any) {
      console.error('登录失败:', err)
      error.value = err.response?.data?.detail || err.response?.data?.message || '登录失败'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function register(userData: any) {
    try {
      isLoading.value = true
      error.value = null

      try {
        const response = await userApi.register(userData)
        // 注册成功后，后端会直接返回用户信息
        return { success: true, message: '注册成功' }
      } catch (apiError) {
        // 后端接口不可用时，不再模拟注册成功
        console.error('注册失败:', apiError)
        throw apiError
      }
    } catch (err: any) {
      // 尝试从不同的位置获取错误信息
      error.value = err.response?.data?.detail || err.response?.data?.message || '注册失败'
      console.log('注册错误详情:', err.response)
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    try {
      // 调用后端退出接口
      userApi.logout().catch(err => {
        console.error('退出登录失败:', err)
      })
    } catch (err) {
      console.error('退出登录失败:', err)
    } finally {
      // 清除本地存储
      token.value = null
      user.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      sessionStorage.removeItem('user')

      // 跳转到登录页面
      window.location.href = '/login'
    }
  }

  async function fetchUserProfile() {
    if (!token.value) return

    try {
      isLoading.value = true
      const response = await userApi.getUserInfo()
      user.value = response.data

      // 更新本地存储
      if (localStorage.getItem('user')) {
        localStorage.setItem('user', JSON.stringify(response.data))
      } else if (sessionStorage.getItem('user')) {
        sessionStorage.setItem('user', JSON.stringify(response.data))
      }
    } catch (err) {
      console.error('获取用户信息失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchApplications() {
    if (!token.value) return

    try {
      isLoading.value = true
      const response = await userApi.getApplications()
      applications.value = response.data
    } catch (err) {
      console.error('获取申请记录失败:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function cancelApplication(applicationId: number) {
    if (!token.value) return false

    try {
      isLoading.value = true
      await userApi.cancelApplication(applicationId)
      // 刷新申请记录
      await fetchApplications()
      return true
    } catch (err) {
      console.error('取消申请失败:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function updateProfile(userData: any) {
    try {
      isLoading.value = true

      try {
        const response = await userApi.updateUserInfo(userData)
        user.value = response.data

        // 更新本地存储
        if (localStorage.getItem('user')) {
          localStorage.setItem('user', JSON.stringify(response.data))
        } else if (sessionStorage.getItem('user')) {
          sessionStorage.setItem('user', JSON.stringify(response.data))
        }

        return { success: true, message: '更新成功' }
      } catch (apiError) {
        // 后端接口不可用时，直接更新本地数据
        user.value = { ...user.value, ...userData }

        if (localStorage.getItem('user')) {
          localStorage.setItem('user', JSON.stringify(user.value))
        } else if (sessionStorage.getItem('user')) {
          sessionStorage.setItem('user', JSON.stringify(user.value))
        }

        return { success: true, message: '更新成功（演示模式）' }
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || '更新失败'
      return { success: false, message: error.value }
    } finally {
      isLoading.value = false
    }
  }

  async function fetchProfileStep() {
    if (!token.value) return 1
    try {
      const response = await userApi.getProfileStep()
      return response.data.step || 1
    } catch (err) {
      console.error('获取进度失败:', err)
      return 1
    }
  }

  async function updateProfileStep(step: number) {
    if (!token.value) return
    try {
      await userApi.updateProfileStep(step)
      if (user.value) {
        user.value.profile_step = step
      }
    } catch (err) {
      console.error('更新进度失败:', err)
    }
  }

  function loadFromLocalStorage() {
    // 从localStorage加载token和用户信息
    const storedToken = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user')

    if (storedToken) {
      token.value = storedToken
    }

    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser)
      } catch (err) {
        console.error('解析用户信息失败:', err)
      }
    }
  }

  return {
    user,
    token,
    isLoading,
    error,
    applications,
    isLoggedIn,
    userRole,
    login,
    register,
    logout,
    fetchUserProfile,
    fetchApplications,
    cancelApplication,
    updateProfile,
    fetchProfileStep,
    updateProfileStep,
    loadFromLocalStorage
  }
})
