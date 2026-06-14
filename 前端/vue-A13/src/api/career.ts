import request from '@/utils/request'

// 职业规划相关API
export const careerApi = {
  // 获取人岗匹配结果
  getMatchResult: (jobId: string) => {
    return request.get(`/career/match/${jobId}`)
  },

  // 获取职业发展路径
  getCareerPath: (jobId: string) => {
    return request.get(`/career/path/${jobId}`)
  },

  // 生成行动计划
  generateActionPlan: (data: any) => {
    return request.post('/career/action-plan', data)
  },

  // 获取职业规划报告
  getCareerReport: () => {
    return request.get('/career/report')
  },

  // 导出报告
  exportReport: (format: 'pdf' | 'word') => {
    return request.get('/career/export-report', {
      params: { format },
      responseType: 'blob'
    })
  },

  // 保存报告
  saveReport: (data: any) => {
    return request.post('/career/save-report', data)
  }
}