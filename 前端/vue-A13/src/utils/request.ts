import axios from 'axios'
import { ElMessage } from 'element-plus'

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api', // 通过Vite代理转发到后端
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token')
    // 对登录和注册请求不添加 token
    const url = config.url || ''
    const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/register')
    console.log('Request URL:', config.url)
    console.log('Is auth request:', isAuthRequest)
    console.log('Token exists:', !!token)
    // 添加token到请求头
    if (token && !isAuthRequest) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Added token to request')
    } else {
      console.log('Skipping token for auth request')
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    // 直接返回完整的响应对象，让调用方自己处理
    return response
  },
  (error) => {
    // 处理错误响应
    if (error.response) {
      const { status, data, config } = error.response
      const url = config?.url || ''

      // 对于登录请求，不做统一处理，让调用方自己处理具体错误
      const isLoginRequest = url.includes('/auth/login')

      if (!isLoginRequest) {
        switch (status) {
          case 401:
            ElMessage.error('登录已过期，请重新登录')
            // 清除 token 并跳转到登录页
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
            break
          case 403:
            ElMessage.error('没有权限执行此操作')
            break
          case 404:
            ElMessage.error('请求的资源不存在')
            break
          case 500:
            ElMessage.error('服务器内部错误')
            break
          default:
            ElMessage.error(data?.message || '请求失败')
        }
      }
    } else {
      ElMessage.error('网络错误，请检查后端服务是否启动')
    }

    return Promise.reject(error)
  }
)

export default request
