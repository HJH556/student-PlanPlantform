"use strict";
const utils_request = require("../utils/request.js");
const jobApi = {
  // 获取岗位列表
  getJobList(params) {
    return utils_request.request.get("/jobs", params);
  },
  // 获取岗位详情
  getJobDetail(jobId) {
    return utils_request.request.get(`/jobs/${jobId}`);
  },
  // 获取岗位画像
  getJobProfile(jobId) {
    return utils_request.request.get(`/jobs/${jobId}/profile`);
  },
  // 获取岗位关联图谱
  getJobGraph(jobId) {
    return utils_request.request.get(`/jobs/${jobId}/graph`);
  },
  // 搜索岗位
  searchJobs(keyword, params) {
    return utils_request.request.get("/jobs/search", { keyword, ...params });
  },
  // 添加收藏
  addFavorite(jobId) {
    return utils_request.request.post(`/jobs/${jobId}/favorite`);
  },
  // 取消收藏
  removeFavorite(jobId) {
    return utils_request.request.delete(`/jobs/${jobId}/favorite`);
  },
  // 获取收藏列表
  getFavorites() {
    return utils_request.request.get("/jobs/favorites");
  },
  // 申请岗位
  applyJob(jobId) {
    return utils_request.request.post(`/jobs/${jobId}/apply`);
  },
  // 获取申请列表
  getApplications() {
    return utils_request.request.get("/jobs/applications");
  }
};
exports.jobApi = jobApi;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/job.js.map
