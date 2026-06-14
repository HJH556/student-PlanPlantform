import request from '@/utils/request'

// 岗位相关API
export const jobApi = {
  // 获取岗位列表
  getJobList: async (params?: any) => {
    try {
      console.log('调用getJobList API...')
      const response = await request.get('/jobs', { params })
      console.log('getJobList API响应:', response)
      return response
    } catch (error) {
      console.error('getJobList API调用失败:', error)
      throw error
    }
  },

  // 获取岗位详情
  getJobDetail: async (jobId: string) => {
    try {
      console.log('调用getJobDetail API...')
      const response = await request.get(`/jobs/${jobId}`)
      console.log('getJobDetail API响应:', response)
      return response
    } catch (error) {
      console.error('getJobDetail API调用失败:', error)
      throw error
    }
  },

  // 获取岗位画像
  getJobProfile: async (jobId: string) => {
    try {
      console.log('调用getJobProfile API...')
      const response = await request.get(`/jobs/${jobId}/profile`)
      console.log('getJobProfile API响应:', response)
      return response
    } catch (error) {
      console.error('getJobProfile API调用失败:', error)
      throw error
    }
  },

  // 获取岗位关联图谱
  getJobGraph: async (jobId: string) => {
    try {
      console.log('调用getJobGraph API...')
      const response = await request.get(`/jobs/${jobId}/graph`)
      console.log('getJobGraph API响应:', response)
      return response
    } catch (error) {
      console.error('getJobGraph API调用失败:', error)
      throw error
    }
  },

  // 搜索岗位
  searchJobs: async (keyword: string, params?: any) => {
    try {
      console.log('调用searchJobs API...')
      const response = await request.get('/jobs/search', { params: { keyword, ...params } })
      console.log('searchJobs API响应:', response)
      return response
    } catch (error) {
      console.error('searchJobs API调用失败:', error)
      throw error
    }
  },

  // 添加收藏
  addFavorite: async (jobId: string) => {
    try {
      console.log('调用addFavorite API...')
      const response = await request.post(`/jobs/${jobId}/favorite`)
      console.log('addFavorite API响应:', response)
      return response
    } catch (error) {
      console.error('addFavorite API调用失败:', error)
      throw error
    }
  },

  // 取消收藏
  removeFavorite: async (jobId: string) => {
    try {
      console.log('调用removeFavorite API...')
      const response = await request.delete(`/jobs/${jobId}/favorite`)
      console.log('removeFavorite API响应:', response)
      return response
    } catch (error) {
      console.error('removeFavorite API调用失败:', error)
      throw error
    }
  },

  // 获取收藏列表
  getFavorites: async () => {
    try {
      console.log('调用getFavorites API...')
      const response = await request.get('/jobs/favorites')
      console.log('getFavorites API响应:', response)
      return response
    } catch (error) {
      console.error('getFavorites API调用失败:', error)
      throw error
    }
  },

  // 申请岗位
  applyJob: async (jobId: string) => {
    try {
      console.log('调用applyJob API...')
      const response = await request.post(`/jobs/${jobId}/apply`)
      console.log('applyJob API响应:', response)
      return response
    } catch (error) {
      console.error('applyJob API调用失败:', error)
      throw error
    }
  },

  // 获取申请列表
  getApplications: async () => {
    try {
      console.log('调用getApplications API...')
      const response = await request.get('/jobs/applications')
      console.log('getApplications API响应:', response)
      return response
    } catch (error) {
      console.error('getApplications API调用失败:', error)
      throw error
    }
  }
}