"use strict";
Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
const common_vendor = require("./common/vendor.js");
const config_index = require("./config/index.js");
if (!Math) {
  "./pages/login/login.js";
  "./pages/index/index.js";
  "./pages/ai-assistant/ai-assistant.js";
  "./pages/job-explore/job-explore.js";
  "./pages/student-profile/student-profile.js";
  "./pages/user-center/user-center.js";
  "./pages/job-detail/job-detail.js";
  "./pages/upload-resume/upload-resume.js";
  "./pages/edit-profile/edit-profile.js";
  "./pages/career-plan/career-plan.js";
  "./pages/interview-prep/interview-prep.js";
  "./pages/my-applications/my-applications.js";
  "./pages/my-favorites/my-favorites.js";
  "./pages/interview-questions/interview-questions.js";
  "./pages/my-interview/my-interview.js";
  "./pages/interview-simulation/interview-simulation.js";
}
const _sfc_main = {
  onLaunch: function() {
    common_vendor.index.__f__("log", "at App.vue:4", "App Launch");
    const token = common_vendor.index.getStorageSync("token");
    if (!token) {
      common_vendor.index.reLaunch({
        url: "/pages/login/login"
      });
    }
  },
  onShow: function() {
    common_vendor.index.__f__("log", "at App.vue:16", "App Show");
  },
  onHide: function() {
    common_vendor.index.__f__("log", "at App.vue:19", "App Hide");
  }
};
function createApp() {
  const app = common_vendor.createSSRApp(_sfc_main);
  app.config.globalProperties.$baseUrl = config_index.config.baseUrl;
  return {
    app
  };
}
createApp().app.mount("#app");
exports.createApp = createApp;
//# sourceMappingURL=../.sourcemap/mp-weixin/app.js.map
