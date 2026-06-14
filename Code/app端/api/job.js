import request from '@/utils/request.js'

export default {
    // 获取岗位列表
    getJobList(params) {
        return request.get('/jobs', params)
    },

    // 获取岗位详情
    getJobDetail(jobId) {
        return request.get(`/jobs/${jobId}`)
    },

    // 获取岗位画像
    getJobProfile(jobId) {
        return request.get(`/jobs/${jobId}/profile`)
    },

    // 获取岗位关联图谱
    getJobGraph(jobId) {
        return request.get(`/jobs/${jobId}/graph`)
    },

    // 搜索岗位
    searchJobs(keyword, params) {
        return request.get('/jobs/search', { keyword, ...params })
    },

    // 添加收藏
    addFavorite(jobId) {
        return request.post(`/jobs/${jobId}/favorite`)
    },

    // 取消收藏
    removeFavorite(jobId) {
        return request.delete(`/jobs/${jobId}/favorite`)
    },

    // 获取收藏列表
    getFavorites() {
        return request.get('/jobs/favorites')
    },

    // 申请岗位
    applyJob(jobId) {
        return request.post(`/jobs/${jobId}/apply`)
    },

    // 获取申请列表
    getApplications() {
        return request.get('/jobs/applications')
    }
}
