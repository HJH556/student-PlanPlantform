<template>
    <view class="login-container">
        <view class="login-card">
            <view class="logo-section">
                <view class="logo-icon">
                    <text class="logo-text">📚</text>
                </view>
                <text class="app-title">职业规划系统</text>
                <text class="app-subtitle">基于AI的大学生职业规划智能体</text>
            </view>
            
            <view class="form-section">
                <view class="mode-switch">
                    <view 
                        class="mode-tab" 
                        :class="{ active: isLoginMode }"
                        @click="isLoginMode = true"
                    >
                        登录
                    </view>
                    <view 
                        class="mode-tab" 
                        :class="{ active: !isLoginMode }"
                        @click="isLoginMode = false"
                    >
                        注册
                    </view>
                </view>
                
                <view v-if="isLoginMode" class="login-form">
                    <view class="input-group">
                        <view class="input-wrapper">
                            <text class="input-icon">👤</text>
                            <input 
                                v-model="loginForm.username"
                                class="input-field"
                                placeholder="请输入用户名"
                                :disabled="isLoading"
                            />
                        </view>
                    </view>
                    
                    <view class="input-group">
                        <view class="input-wrapper">
                            <text class="input-icon">🔒</text>
                            <input 
                                v-model="loginForm.password"
                                class="input-field"
                                type="password"
                                placeholder="请输入密码"
                                :disabled="isLoading"
                            />
                        </view>
                    </view>
                    
                    <view class="input-group">
                        <view class="input-wrapper captcha-wrapper">
                            <text class="input-icon">🔐</text>
                            <input 
                                v-model="loginForm.captcha"
                                class="input-field captcha-input"
                                placeholder="请输入验证码"
                                maxlength="4"
                                :disabled="isLoading"
                            />
                            <view class="captcha-image" @click="refreshCaptcha">
                                <image 
                                    v-if="captchaUrl && captchaUrl !== '/static/images/captcha-placeholder.png'" 
                                    :src="captchaUrl" 
                                    mode="widthFix"
                                    class="captcha-img"
                                    @error="handleImageError"
                                />
                                <view v-else-if="captchaUrl === '/static/images/captcha-placeholder.png'" class="captcha-placeholder">
                                    <text class="placeholder-text">点击刷新</text>
                                </view>
                                <text v-else class="loading-text">加载中...</text>
                            </view>
                        </view>
                    </view>
                    
                    <view class="form-options">
                        <label class="remember-me">
                            <checkbox :checked="loginForm.remember" @change="loginForm.remember = $event.detail.value" :disabled="isLoading" />
                            <text>记住我</text>
                        </label>
                    </view>
                    
                    <button 
                        class="btn btn-primary login-btn"
                        :class="{ loading: isLoading }"
                        @click="handleLogin"
                        :disabled="isLoading"
                    >
                        {{ isLoading ? '登录中...' : '登录' }}
                    </button>
                </view>
                
                <view v-else class="register-form">
                    <view class="input-group">
                        <view class="input-wrapper">
                            <text class="input-icon">👤</text>
                            <input 
                                v-model="registerForm.username"
                                class="input-field"
                                placeholder="请输入用户名"
                                :disabled="isLoading"
                            />
                        </view>
                    </view>
                    
                    <view class="input-group">
                        <view class="input-wrapper">
                            <text class="input-icon">📧</text>
                            <input 
                                v-model="registerForm.email"
                                class="input-field"
                                type="email"
                                placeholder="请输入邮箱"
                                :disabled="isLoading"
                            />
                        </view>
                    </view>
                    
                    <view class="input-group">
                        <view class="input-wrapper">
                            <text class="input-icon">📛</text>
                            <input 
                                v-model="registerForm.name"
                                class="input-field"
                                placeholder="请输入姓名"
                                :disabled="isLoading"
                            />
                        </view>
                    </view>
                    
                    <view class="input-group">
                        <view class="input-wrapper">
                            <text class="input-icon">🔒</text>
                            <input 
                                v-model="registerForm.password"
                                class="input-field"
                                type="password"
                                placeholder="请输入密码"
                                :disabled="isLoading"
                            />
                        </view>
                    </view>
                    
                    <view class="input-group">
                        <view class="input-wrapper">
                            <text class="input-icon">🔒</text>
                            <input 
                                v-model="registerForm.confirmPassword"
                                class="input-field"
                                type="password"
                                placeholder="请确认密码"
                                :disabled="isLoading"
                            />
                        </view>
                    </view>
                    
                    <button 
                        class="btn btn-primary register-btn"
                        :class="{ loading: isLoading }"
                        @click="handleRegister"
                        :disabled="isLoading"
                    >
                        {{ isLoading ? '注册中...' : '注册' }}
                    </button>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import userApi from '@/api/user.js'
import { useUserStore } from '@/stores/user.js'
import appConfig from '@/config/index.js'

export default {
    data() {
        return {
            isLoginMode: true,
            isLoading: false,
            captchaUrl: '',
            captchaId: '',
            loginForm: {
                username: '',
                password: '',
                captcha: '',
                remember: false
            },
            registerForm: {
                username: '',
                email: '',
                name: '',
                password: '',
                confirmPassword: ''
            }
        }
    },
    onLoad() {
        this.refreshCaptcha()
    },
    methods: {
        async refreshCaptcha() {
            try {
                // 先显示加载状态
                this.captchaUrl = ''
                
                console.log('请求验证码，URL:', appConfig.baseUrl + '/auth/captcha')
                uni.request({
                    url: appConfig.baseUrl + '/auth/captcha',
                    method: 'GET',
                    responseType: 'arraybuffer',
                    timeout: 10000, // 10秒超时
                    success: (res) => {
                        console.log('验证码响应状态:', res.statusCode)
                        console.log('响应数据长度:', res.data ? res.data.byteLength : 0)
                        console.log('响应头:', res.header)
                        
                        if (res.statusCode === 200 && res.data && res.data.byteLength > 0) {
                            try {
                                const base64 = uni.arrayBufferToBase64(res.data)
                                // 确保base64有效
                                if (base64 && base64.length > 100) {
                                    this.captchaUrl = 'data:image/png;base64,' + base64
                                    this.captchaId = res.header?.['x-captcha-id'] || res.header?.['X-Captcha-Id'] || res.header?.['X-Captcha-ID'] || ''
                                    console.log('验证码ID:', this.captchaId)
                                    console.log('验证码URL设置成功，长度:', base64.length)
                                } else {
                                    console.error('Base64数据无效')
                                    this.showCaptchaError()
                                }
                            } catch (error) {
                                console.error('Base64转换失败:', error)
                                this.showCaptchaError()
                            }
                        } else {
                            console.error('验证码请求失败，状态码:', res.statusCode, '数据长度:', res.data ? res.data.byteLength : 0)
                            this.showCaptchaError()
                        }
                    },
                    fail: (e) => {
                        console.error("验证码请求失败", e)
                        this.showCaptchaError()
                    }
                })
            } catch (e) {
                console.error("验证码错误", e)
                this.showCaptchaError()
            }
        },
        
        handleImageError() {
            console.error('验证码图片加载失败')
            this.showCaptchaError()
        },
        
        showCaptchaError() {
            this.captchaUrl = '/static/images/captcha-placeholder.png'
            uni.showToast({
                title: '验证码加载失败，请点击重试',
                icon: 'none',
                duration: 2000
            })
        },
        
        async handleLogin() {
            if (!this.loginForm.username || !this.loginForm.password || !this.loginForm.captcha) {
                uni.showToast({ title: '请完善信息', icon: 'none' })
                return
            }
            if (!this.captchaId) {
                uni.showToast({ title: '验证码异常，请刷新', icon: 'none' })
                return
            }

            this.isLoading = true

            const loginData = {
                username: this.loginForm.username,
                password: this.loginForm.password,
                captcha: this.loginForm.captcha,
                captchaId: this.captchaId
            }
            console.log('登录请求数据:', loginData)

            try {
                await useUserStore.login(
                    this.loginForm.username,
                    this.loginForm.password,
                    this.loginForm.captcha,
                    this.captchaId,
                    this.loginForm.remember
                )
                
                uni.showToast({ title: '登录成功', icon: "success" })
                setTimeout(() => {
                    uni.switchTab({ url: "/pages/index/index" })
                }, 1000)
            } catch (err) {
                console.error('登录错误详情:', err)
                uni.showToast({ title: err?.message || err?.data?.detail || err?.data?.msg || "登录失败", icon: "none" })
                this.refreshCaptcha()
            } finally {
                this.isLoading = false
            }
        },
        
        async handleRegister() {
            if (this.registerForm.password !== this.registerForm.confirmPassword) {
                uni.showToast({ title: '两次密码不一致', icon: 'none' })
                return
            }

            this.isLoading = true

            try {
                await useUserStore.register({
                    username: this.registerForm.username,
                    email: this.registerForm.email,
                    name: this.registerForm.name,
                    password: this.registerForm.password
                })

                uni.showToast({ title: "注册成功" })
                this.isLoginMode = true
            } catch (err) {
                console.error(err)
                uni.showToast({ title: err?.data?.msg || "注册失败", icon: "none" })
            } finally {
                this.isLoading = false
            }
        }
    }
}
</script>

<style scoped>
.login-container {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 40rpx;
}
.login-card {
    width: 100%;
    max-width: 600rpx;
    background: #fff;
    border-radius: 32rpx;
    padding: 60rpx 40rpx;
    box-shadow: 0 20rpx 60rpx rgba(0,0,0,0.2);
}
.logo-section { text-align: center; margin-bottom: 60rpx; }
.logo-icon {
    width: 120rpx; height: 120rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 24rpx;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 30rpx;
}
.logo-text { font-size: 60rpx; }
.app-title { font-size: 40rpx; font-weight: bold; color: #222; }
.app-subtitle { font-size: 24rpx; color: #888; margin-top: 8rpx; }
.form-section { width: 100%; }
.mode-switch {
    display: flex; background: #f0f0f0;
    border-radius: 16rpx; padding: 8rpx; margin-bottom: 40rpx;
}
.mode-tab {
    flex: 1; text-align: center; padding: 20rpx;
    border-radius: 12rpx; font-size: 28rpx; color: #666;
}
.mode-tab.active { background: #fff; color: #667eea; font-weight: bold; }
.input-group { margin-bottom: 30rpx; }
.input-wrapper {
    display: flex; align-items: center;
    background: #f8fafc; border: 2rpx solid #e2e8f0;
    border-radius: 16rpx; padding: 24rpx 30rpx;
}
.input-icon { font-size: 32rpx; margin-right: 20rpx; }
.input-field { flex: 1; font-size: 28rpx; }
.captcha-wrapper { position: relative; }
.captcha-input { padding-right: 160rpx; }
.captcha-image {
    position: absolute; right: 10rpx;
    width: 140rpx; height: 60rpx;
    background: #f0f0f0; border-radius: 8rpx;
    display: flex; align-items: center; justify-content: center;
}
.captcha-image image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.form-options {
    display: flex; align-items: center;
    margin-bottom: 40rpx;
}
.remember-me { display: flex; align-items: center; font-size: 26rpx; color: #666; }
.btn {
    width: 100%; padding: 28rpx; border-radius: 16rpx;
    font-size: 30rpx; font-weight: bold; border: none;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
}
.btn:disabled { opacity: 0.6; }
</style>