import request from '@/utils/request.js'

export default {
    // 获取验证码
    getCaptcha() {
        return request.get('/auth/captcha', {}, { responseType: 'arraybuffer' })
    },

    // 登录
    login(username, password, captcha, captchaId) {
        return request.post('/auth/login', {
            username,
            password,
            captcha,
            captchaId
        })
    },

    // 注册
    register(userData) {
        return request.post('/auth/register', userData)
    },

    // 退出登录
    logout() {
        return request.post('/auth/logout')
    },

    // 获取用户信息
    getUserInfo() {
        return request.get('/auth/user')
    },

    // 获取当前用户信息
    getCurrentUser() {
        return request.get('/auth/user')
    },

    // 更新用户信息
    updateUserInfo(userData) {
        return request.put('/auth/user', userData)
    },

    // 修改密码
    changePassword(passwordData) {
        return request.post('/auth/change-password', passwordData)
    },

    // 获取申请记录
    getApplications() {
        return request.get('/jobs/applications')
    },

    // 取消申请
    cancelApplication(applicationId) {
        return request.delete(`/jobs/applications/${applicationId}`)
    },

    // 获取学生画像进度
    getProfileStep() {
        return request.get('/auth/profile-step')
    },

    // 更新学生画像进度
    updateProfileStep(step) {
        return request.put('/auth/profile-step', null, { params: { step } })
    }
}
