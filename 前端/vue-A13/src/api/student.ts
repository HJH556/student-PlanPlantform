import request from '@/utils/request'

// 学生画像相关API
export const studentApi = {
  // 获取学生信息
  getStudentInfo: () => {
    return request.get('/student/profile')
  },

  // 更新学生信息
  updateStudentInfo: (data: any) => {
    return request.put('/student/profile', data)
  },

  // 上传简历
  uploadResume: (formData: FormData) => {
    return request.post('/student/upload-resume', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  },

  // 解析简历
  parseResume: (fileId: string) => {
    return request.post('/student/parse-resume', { fileId })
  },

  // 获取学生能力评估
  getAbilityEvaluation: () => {
    return request.get('/student/ability-evaluation')
  }
}