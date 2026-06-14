import userApi from '@/api/user.js'

export const useUserStore = {
    state: {
        token: uni.getStorageSync('token') || null,
        user: uni.getStorageSync('user') ? JSON.parse(uni.getStorageSync('user')) : null,
        isLoading: false,
        error: null
    },

    get isLoggedIn() {
        return !!this.state.token
    },

    get userRole() {
        return this.state.user?.role || 'guest'
    },

    async login(username, password, captcha, captchaId, remember = false) {
        try {
            this.state.isLoading = true
            this.state.error = null

            const response = await userApi.login(username, password, captcha, captchaId)
            const { token: accessToken, user: userData } = response.data

            this.state.token = accessToken
            this.state.user = userData

            uni.setStorageSync('token', accessToken)
            if (remember) {
                uni.setStorageSync('user', JSON.stringify(userData))
            } else {
                uni.setStorage({
                    key: 'user',
                    data: JSON.stringify(userData)
                })
            }

            return { success: true, message: '登录成功' }
        } catch (err) {
            console.error('登录失败:', err)
            this.state.error = err
            throw err
        } finally {
            this.state.isLoading = false
        }
    },

    async register(userData) {
        try {
            this.state.isLoading = true
            this.state.error = null

            await userApi.register(userData)
            return { success: true, message: '注册成功' }
        } catch (err) {
            console.error('注册失败:', err)
            this.state.error = err
            throw err
        } finally {
            this.state.isLoading = false
        }
    },

    logout() {
        try {
            userApi.logout().catch(err => {
                console.error('退出登录失败:', err)
            })
        } catch (err) {
            console.error('退出登录失败:', err)
        } finally {
            this.state.token = null
            this.state.user = null
            uni.removeStorageSync('token')
            uni.removeStorageSync('user')

            uni.reLaunch({
                url: '/pages/login/login'
            })
        }
    },

    async fetchCurrentUser() {
        try {
            const response = await userApi.getUserInfo()
            if (response && response.data) {
                this.state.user = response.data
                uni.setStorageSync('user', JSON.stringify(response.data))
            }
        } catch (err) {
            console.error('获取用户信息失败:', err)
        }
    }
}
