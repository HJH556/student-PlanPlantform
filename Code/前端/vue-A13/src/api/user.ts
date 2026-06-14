import request from '@/utils/request'

// 用户相关API
export const userApi = {
  // 获取验证码
  getCaptcha: () => {
    return request.get('/auth/captcha', {
      responseType: 'blob',
      transformResponse: [(data) => data]
    })
  },

  // 登录
  login: (username: string, password: string, captcha: string, captchaId: string) => {
    return request.post('/auth/login', { username, password, captcha, captchaId })
  },

  // 注册
  register: (userData: any) => {
    return request.post('/auth/register', userData)
  },

  // 退出登录
  logout: () => {
    return request.post('/auth/logout')
  },

  // 获取用户信息
  getUserInfo: () => {
    return request.get('/auth/user')
  },

  // 更新用户信息
  updateUserInfo: (userData: any) => {
    return request.put('/auth/user', userData)
  },

  // 修改密码
  changePassword: (passwordData: {
    oldPassword: string
    newPassword: string
    confirmPassword: string
  }) => {
    return request.post('/auth/change-password', passwordData)
  },

  // 上传头像
  uploadAvatar: (formData: FormData) => {
    return request.post('/auth/upload-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 获取申请记录
  getApplications: () => {
    return request.get('/jobs/applications')
  },

  // 取消申请
  cancelApplication: (applicationId: number) => {
    return request.delete(`/jobs/applications/${applicationId}`)
  },

  // 获取学生画像进度
  getProfileStep: () => {
    return request.get('/auth/profile-step')
  },

  // 更新学生画像进度
  updateProfileStep: (step: number) => {
    return request.put('/auth/profile-step', null, { params: { step } })
  }
}