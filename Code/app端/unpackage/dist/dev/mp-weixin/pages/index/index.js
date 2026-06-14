"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const _sfc_main = {
  data() {
    return {
      userName: "同学"
    };
  },
  onLoad() {
    const user = stores_user.useUserStore.state.user;
    if (user && user.username) {
      this.userName = user.username;
    }
  },
  onShow() {
    const user = stores_user.useUserStore.state.user;
    if (user && user.username) {
      this.userName = user.username;
    }
  },
  methods: {
    navigateTo(url) {
      common_vendor.index.switchTab({
        url,
        fail: () => {
          common_vendor.index.navigateTo({
            url
          });
        }
      });
    },
    openAIAssistant() {
      common_vendor.index.switchTab({
        url: "/pages/ai-assistant/ai-assistant"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($data.userName),
    b: common_vendor.o(($event) => $options.navigateTo("/pages/job-explore/job-explore")),
    c: common_vendor.o(($event) => $options.navigateTo("/pages/student-profile/student-profile")),
    d: common_vendor.o(($event) => $options.navigateTo("/pages/career-plan/career-plan")),
    e: common_vendor.o(($event) => $options.navigateTo("/pages/interview-questions/interview-questions")),
    f: common_vendor.o(($event) => $options.navigateTo("/pages/my-interview/my-interview")),
    g: common_vendor.o((...args) => $options.openAIAssistant && $options.openAIAssistant(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-1cf27b2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/index/index.js.map
