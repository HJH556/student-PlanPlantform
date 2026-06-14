"use strict";
const utils_request = require("../utils/request.js");
const userApi = {
  // 获取验证码
  getCaptcha() {
    return utils_request.request.get("/auth/captcha", {}, { responseType: "arraybuffer" });
  },
  // 登录
  login(username, password, captcha, captchaId) {
    return utils_request.request.post("/auth/login", {
      username,
      password,
      captcha,
      captchaId
    });
  },
  // 注册
  register(userData) {
    return utils_request.request.post("/auth/register", userData);
  },
  // 退出登录
  logout() {
    return utils_request.request.post("/auth/logout");
  },
  // 获取用户信息
  getUserInfo() {
    return utils_request.request.get("/auth/user");
  },
  // 获取当前用户信息
  getCurrentUser() {
    return utils_request.request.get("/auth/user");
  },
  // 更新用户信息
  updateUserInfo(userData) {
    return utils_request.request.put("/auth/user", userData);
  },
  // 修改密码
  changePassword(passwordData) {
    return utils_request.request.post("/auth/change-password", passwordData);
  },
  // 获取申请记录
  getApplications() {
    return utils_request.request.get("/jobs/applications");
  },
  // 取消申请
  cancelApplication(applicationId) {
    return utils_request.request.delete(`/jobs/applications/${applicationId}`);
  },
  // 获取学生画像进度
  getProfileStep() {
    return utils_request.request.get("/auth/profile-step");
  },
  // 更新学生画像进度
  updateProfileStep(step) {
    return utils_request.request.put("/auth/profile-step", null, { params: { step } });
  }
};
exports.userApi = userApi;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/user.js.map
