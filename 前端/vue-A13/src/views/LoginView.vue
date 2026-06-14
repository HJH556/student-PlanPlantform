<!--
登录页面

功能：
- 用户登录功能
- 用户注册功能
- 表单验证
- 错误提示
- 后端接口连接

技术特点：
- 响应式布局
- 表单验证
- 与后端API集成
- 登录/注册切换
-->

<template>
  <Transition name="page-enter" appear>
    <div class="login-container">
    <div class="login-bg">
      <!-- 动态粒子网络 -->
      <div class="particles-network">
        <div class="particle-node" v-for="n in 20" :key="n" :style="getParticleStyle(n)"></div>
      </div>
      <!-- 渐变光球 -->
      <div class="gradient-orb orb-1"></div>
      <div class="gradient-orb orb-2"></div>
      <div class="gradient-orb orb-3"></div>
      <div class="gradient-orb orb-4"></div>
      <!-- 霓虹光晕 -->
      <div class="neon-glow"></div>
      <!-- 浮动几何形状 -->
      <div class="floating-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
        <div class="shape shape-5"></div>
        <div class="shape shape-6"></div>
      </div>
      <!-- 能量脉冲 -->
      <div class="energy-pulse"></div>
    </div>
    <div class="login-card">
      <div class="login-header">
        <div class="logo">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <h2>职业规划平台</h2>
        <p>{{ isLoginMode ? '欢迎回来，请登录您的账户' : '创建新账户，开启职业之旅' }}</p>
      </div>
      
      <!-- 通知组件 -->
      <Transition name="notification">
        <div v-if="notification.show" :class="['notification', notification.type]">
          <svg v-if="notification.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{{ notification.message }}</span>
        </div>
      </Transition>

      <form 
        v-if="isLoginMode"
        ref="loginFormRef" 
        class="login-form"
        @submit.prevent="handleLogin"
      >
        <div class="form-group">
          <label>用户名</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <input 
              v-model="loginForm.username" 
              type="text"
              placeholder="请输入用户名"
              required
              minlength="3"
              maxlength="20"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label>密码</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input 
              v-model="loginForm.password" 
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              required
              minlength="6"
              maxlength="20"
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              <svg v-if="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label>验证码</label>
          <div class="input-wrapper captcha-wrapper">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <input 
              v-model="loginForm.captcha" 
              type="text"
              placeholder="请输入验证码"
              required
              maxlength="4"
            />
            <div class="captcha-image" @click="refreshCaptcha">
              <img v-if="captchaUrl" :src="captchaUrl" alt="验证码" @click="refreshCaptcha" />
              <span v-else>加载中...</span>
            </div>
          </div>
        </div>
        
        <div class="form-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="loginForm.remember" />
            <span>记住我</span>
          </label>
          <a href="#" class="forgot-link">忘记密码？</a>
        </div>
        
        <button 
          type="submit"
          class="login-button" 
          :disabled="isLoading"
        >
          <span v-if="isLoading">登录中...</span>
          <span v-else>登录</span>
          <svg v-if="!isLoading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
        
        <div class="login-footer">
          <span>还没有账户？</span>
          <button type="button" class="link-button" @click="toggleMode">立即注册</button>
        </div>
      </form>

      <form 
        v-else
        ref="registerFormRef" 
        class="login-form"
        @submit.prevent="handleRegister"
      >
        <div class="form-group">
          <label>用户名</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <input 
              v-model="registerForm.username" 
              type="text"
              placeholder="请输入用户名"
              required
              minlength="3"
              maxlength="20"
            />
          </div>
        </div>
        
        <div class="form-group">
          <label>密码</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input 
              v-model="registerForm.password" 
              :type="showPassword ? 'text' : 'password'"
              placeholder="请输入密码"
              required
              minlength="6"
              maxlength="20"
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              <svg v-if="showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label>确认密码</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input 
              v-model="registerForm.confirmPassword" 
              :type="showConfirmPassword ? 'text' : 'password'"
              placeholder="请再次输入密码"
              required
            />
            <button type="button" class="toggle-password" @click="showConfirmPassword = !showConfirmPassword">
              <svg v-if="showConfirmPassword" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
        </div>
        
        <div class="form-group">
          <label>邮箱</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <input 
              v-model="registerForm.email" 
              type="email"
              placeholder="请输入邮箱"
              required
            />
          </div>
        </div>
        
        <div class="form-group">
          <label>真实姓名</label>
          <div class="input-wrapper">
            <svg class="input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <input 
              v-model="registerForm.name" 
              type="text"
              placeholder="请输入真实姓名"
              required
              minlength="2"
              maxlength="20"
            />
          </div>
        </div>
        
        <button 
          type="submit"
          class="login-button" 
          :disabled="isLoading"
        >
          <span v-if="isLoading">注册中...</span>
          <span v-else>注册</span>
          <svg v-if="!isLoading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="5" y1="12" x2="19" y2="12"/>
            <polyline points="12 5 19 12 12 19"/>
          </svg>
        </button>
        
        <div class="login-footer">
          <span>已有账户？</span>
          <button type="button" class="link-button" @click="toggleMode">立即登录</button>
        </div>
      </form>
    </div>
  </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/api/user'
import axios from 'axios'

const router = useRouter()
const userStore = useUserStore()
const loginFormRef = ref<HTMLFormElement>()
const registerFormRef = ref<HTMLFormElement>()
const isLoading = ref(false)
const isLoginMode = ref(true)
const showPassword = ref(false)
const showConfirmPassword = ref(false)
const captchaUrl = ref<string>('')
const captchaId = ref<string>('')

const loginForm = reactive({
  username: '',
  password: '',
  captcha: '',
  remember: false
})

const refreshCaptcha = async () => {
  try {
    const response = await axios.get('http://localhost:8000/auth/captcha', {
      responseType: 'blob'
    })
    console.log('验证码响应:', response)
    const blob = new Blob([response.data], { type: 'image/png' })
    captchaUrl.value = URL.createObjectURL(blob)
    console.log('响应头:', response.headers)
    captchaId.value = response.headers['x-captcha-id'] || response.headers['X-Captcha-Id'] || ''
    console.log('验证码ID:', captchaId.value)
  } catch (error) {
    console.error('获取验证码失败:', error)
  }
}

onMounted(() => {
  if (isLoginMode.value) {
    refreshCaptcha()
  }
})

const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  name: ''
})

const notification = reactive({
  show: false,
  message: '',
  type: 'success' // 'success' 或 'error'
})

const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
  notification.show = true
  notification.message = message
  notification.type = type
  
  // 3秒后自动隐藏
  setTimeout(() => {
    notification.show = false
  }, 3000)
}

const handleLogin = async () => {
  if (!loginFormRef.value) return
  
  // 检查验证码是否已加载
  if (!captchaId.value) {
    showNotification('验证码未加载，请刷新验证码', 'error')
    refreshCaptcha()
    return
  }
  
  if (!loginForm.captcha) {
    showNotification('请输入验证码', 'error')
    return
  }
  
  console.log('登录数据:', {
    username: loginForm.username,
    password: '***',
    captcha: loginForm.captcha,
    captchaId: captchaId.value
  })
  
  try {
    isLoading.value = true
    
    await userStore.login(
      loginForm.username, 
      loginForm.password, 
      loginForm.captcha,
      captchaId.value,
      loginForm.remember
    )
    
    showNotification('登录成功！')
    // 延迟跳转，让用户看到通知
    setTimeout(() => {
      // 根据用户角色跳转到不同页面
      const userInfo = userStore.user
      if (userInfo && userInfo.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/')
      }
    }, 1000)
  } catch (error: any) {
    console.error('登录失败:', error)
    const errorMsg = error.response?.data?.detail || error.response?.data?.message || '登录失败，请重试'
    showNotification(errorMsg, 'error')
    // 登录失败时刷新验证码
    refreshCaptcha()
    loginForm.captcha = ''
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  if (!registerFormRef.value) return
  
  if (registerForm.password !== registerForm.confirmPassword) {
    showNotification('两次输入密码不一致', 'error')
    return
  }
  
  try {
    isLoading.value = true
    
    const response = await userStore.register({
      username: registerForm.username,
      password: registerForm.password,
      email: registerForm.email,
      name: registerForm.name
    })
    
    if (response.success) {
      showNotification('注册成功！请登录')
      // 延迟切换到登录模式，让用户看到通知
      setTimeout(() => {
        isLoginMode.value = true
        registerFormRef.value?.reset()
      }, 1000)
    } else {
      showNotification(response.message || '注册失败', 'error')
    }
  } catch (error) {
    console.error('注册失败:', error)
    showNotification('注册失败，请重试', 'error')
  } finally {
    isLoading.value = false
  }
}

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
  showPassword.value = false
  showConfirmPassword.value = false
  if (isLoginMode.value) {
    refreshCaptcha()
  }
}

// 粒子样式生成函数
const getParticleStyle = (n: number) => {
  const randomX = Math.random() * 100
  const randomY = Math.random() * 100
  const randomDelay = Math.random() * 5
  const randomDuration = 3 + Math.random() * 4
  const randomSize = 2 + Math.random() * 4
  
  return {
    left: `${randomX}%`,
    top: `${randomY}%`,
    width: `${randomSize}px`,
    height: `${randomSize}px`,
    animationDelay: `${randomDelay}s`,
    animationDuration: `${randomDuration}s`
  }
}
</script>

<style scoped>
/* Page Enter Animation */
.page-enter-enter-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.page-enter-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #1a237e 0%, #283593 30%, #3949ab 60%, #3f51b5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  position: relative;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.login-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%);
}

/* 渐变光球动画 */
.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  animation: orbFloat 20s ease-in-out infinite;
}

.orb-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.8) 0%, transparent 70%);
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.orb-2 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.8) 0%, transparent 70%);
  bottom: -50px;
  right: -50px;
  animation-delay: -7s;
}

.orb-3 {
  width: 250px;
  height: 250px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.8) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  animation-delay: -14s;
}

@keyframes orbFloat {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(50px, -30px) scale(1.1);
  }
  50% {
    transform: translate(-30px, 50px) scale(0.9);
  }
  75% {
    transform: translate(-50px, -20px) scale(1.05);
  }
}

/* 波浪动画 */
.wave-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.wave {
  position: absolute;
  width: 200%;
  height: 200%;
  background: linear-gradient(90deg, 
    transparent 0%, 
    rgba(99, 102, 241, 0.03) 25%, 
    rgba(168, 85, 247, 0.03) 50%, 
    rgba(59, 130, 246, 0.03) 75%, 
    transparent 100%);
  animation: waveMove 15s linear infinite;
}

.wave-1 {
  top: -50%;
  left: -50%;
  animation-duration: 20s;
  transform: rotate(15deg);
}

.wave-2 {
  top: -50%;
  left: -50%;
  animation-duration: 25s;
  animation-delay: -5s;
  transform: rotate(-10deg);
}

.wave-3 {
  top: -50%;
  left: -50%;
  animation-duration: 30s;
  animation-delay: -10s;
  transform: rotate(25deg);
}

@keyframes waveMove {
  0% {
    transform: translateX(-50%) rotate(var(--rotation, 0deg));
  }
  100% {
    transform: translateX(0%) rotate(var(--rotation, 0deg));
  }
}

/* 浮动几何形状 */
.floating-shapes {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.shape {
  position: absolute;
  opacity: 0.15;
  animation: shapeFloat 25s ease-in-out infinite;
}

.shape-1 {
  width: 60px;
  height: 60px;
  border: 2px solid rgba(99, 102, 241, 0.6);
  top: 20%;
  left: 15%;
  animation-delay: 0s;
  border-radius: 12px;
  transform: rotate(45deg);
}

.shape-2 {
  width: 40px;
  height: 40px;
  background: rgba(168, 85, 247, 0.4);
  top: 60%;
  right: 20%;
  animation-delay: -8s;
  border-radius: 50%;
}

.shape-3 {
  width: 80px;
  height: 80px;
  border: 2px solid rgba(59, 130, 246, 0.5);
  bottom: 25%;
  left: 25%;
  animation-delay: -16s;
  clip-path: polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%);
}

.shape-4 {
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(168, 85, 247, 0.3));
  top: 35%;
  right: 30%;
  animation-delay: -4s;
  border-radius: 8px;
  transform: rotate(15deg);
}

@keyframes shapeFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg) scale(1);
    opacity: 0.15;
  }
  33% {
    transform: translateY(-40px) rotate(120deg) scale(1.1);
    opacity: 0.25;
  }
  66% {
    transform: translateY(20px) rotate(240deg) scale(0.9);
    opacity: 0.1;
  }
}

/* 动态粒子网络 */
.particles-network {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.particle-node {
  position: absolute;
  background: radial-gradient(circle, rgba(99, 102, 241, 1) 0%, transparent 70%);
  border-radius: 50%;
  animation: particlePulse 3s ease-in-out infinite;
  box-shadow: 0 0 10px rgba(99, 102, 241, 0.8), 0 0 20px rgba(99, 102, 241, 0.4);
}

@keyframes particlePulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.5);
    opacity: 1;
  }
}

/* 新增光球 */
.orb-4 {
  width: 350px;
  height: 350px;
  background: radial-gradient(circle, rgba(236, 72, 153, 0.6) 0%, transparent 70%);
  top: 30%;
  right: 10%;
  animation-delay: -10s;
}

/* 霓虹光晕 */
.neon-glow {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse at 30% 20%, rgba(99, 102, 241, 0.3) 0%, transparent 50%),
    radial-gradient(ellipse at 70% 80%, rgba(168, 85, 247, 0.3) 0%, transparent 50%);
  animation: neonPulse 4s ease-in-out infinite;
}

@keyframes neonPulse {
  0%, 100% {
    opacity: 0.5;
    filter: hue-rotate(0deg);
  }
  50% {
    opacity: 0.8;
    filter: hue-rotate(30deg);
  }
}

/* 新增几何形状 */
.shape-5 {
  width: 70px;
  height: 70px;
  border: 3px solid rgba(236, 72, 153, 0.5);
  top: 15%;
  right: 15%;
  animation-delay: -12s;
  border-radius: 50%;
  border-style: dashed;
}

.shape-6 {
  width: 45px;
  height: 45px;
  background: linear-gradient(45deg, rgba(59, 130, 246, 0.4), rgba(99, 102, 241, 0.4));
  bottom: 40%;
  right: 10%;
  animation-delay: -20s;
  clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
}

/* 能量脉冲 */
.energy-pulse {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100px;
  height: 100px;
  border: 2px solid rgba(99, 102, 241, 0.5);
  border-radius: 50%;
  animation: energyPulse 3s ease-out infinite;
}

.energy-pulse::before,
.energy-pulse::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid rgba(168, 85, 247, 0.4);
  border-radius: 50%;
}

.energy-pulse::before {
  width: 200px;
  height: 200px;
  animation: energyPulse 3s ease-out infinite 0.5s;
}

.energy-pulse::after {
  width: 300px;
  height: 300px;
  animation: energyPulse 3s ease-out infinite 1s;
}

@keyframes energyPulse {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}



.login-card {
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 450px;
  animation: fadeIn 0.5s ease;
  position: relative;
  z-index: 1;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.logo {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  color: white;
}

.login-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 8px;
}

.login-header p {
  color: #64748b;
  font-size: 0.95rem;
  margin: 0 0 20px;
}

.login-form {
  width: 100%;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #475569;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  pointer-events: none;
}

.input-wrapper input {
  width: 100%;
  padding: 12px 14px 12px 44px;
  border: 2px solid #e2e8f0;
  border-radius: 10px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: #f8fafc;
}

.input-wrapper input:focus {
  outline: none;
  border-color: #1a237e;
  background: white;
  box-shadow: 0 0 0 4px rgba(26, 35, 126, 0.1);
}

.toggle-password {
  position: absolute;
  right: 14px;
  background: none;
  border: none;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

.toggle-password:hover {
  color: #64748b;
}

.captcha-wrapper {
  gap: 12px;
}

.captcha-wrapper input {
  flex: 1;
  padding-right: 140px;
}

.captcha-image {
  position: absolute;
  right: 14px;
  width: 120px;
  height: 40px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid #e2e8f0;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  font-size: 0.85rem;
  color: #94a3b8;
}

.captcha-image:hover {
  border-color: #1a237e;
  box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
}

.captcha-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #64748b;
  font-size: 0.9rem;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  accent-color: #1a237e;
}

.forgot-link {
  color: #1a237e;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 600;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #283593;
}

.login-button {
  width: 100%;
  padding: 14px;
  font-size: 1rem;
  font-weight: 600;
  background: #1a237e;
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.login-button:hover:not(:disabled) {
  background: #283593;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(26, 35, 126, 0.3);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.login-footer {
  text-align: center;
  margin-top: 24px;
  color: #64748b;
  font-size: 0.95rem;
}

.link-button {
  background: none;
  border: none;
  color: #1a237e;
  font-weight: 600;
  cursor: pointer;
  padding: 0;
  margin-left: 4px;
  font-size: 0.95rem;
  transition: color 0.3s ease;
}

.link-button:hover {
  color: #283593;
  text-decoration: underline;
}

/* 通知组件样式 */
.notification {
  position: fixed;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  padding: 16px 24px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  font-weight: 600;
  font-size: 0.95rem;
  min-width: 300px;
  max-width: 90%;
  justify-content: center;
}

.notification.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.notification.error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
}

/* 通知动画 */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  opacity: 0;
  transform: translate(-50%, -50px);
}

.notification-leave-to {
  opacity: 0;
  transform: translate(-50%, -50px);
}

@media (max-width: 768px) {
  .login-card {
    padding: 30px 20px;
    max-width: 100%;
  }

  .login-header h2 {
    font-size: 1.5rem;
  }
  
  .notification {
    top: 30px;
    left: 50%;
    transform: translateX(-50%);
    padding: 12px 20px;
    min-width: 250px;
  }
  
  .notification-enter-from {
    opacity: 0;
    transform: translate(-50%, -30px);
  }
  
  .notification-leave-to {
    opacity: 0;
    transform: translate(-50%, -30px);
  }
}
</style>
