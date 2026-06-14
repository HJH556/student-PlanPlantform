"use strict";
const common_vendor = require("../../common/vendor.js");
const stores_user = require("../../stores/user.js");
const _sfc_main = {
  data() {
    return {
      userName: "同学",
      userRole: "学生",
      initial: "同"
    };
  },
  onLoad() {
    const user = stores_user.useUserStore.state.user;
    if (user) {
      this.userName = user.username || user.name || "同学";
      this.userRole = user.role === "admin" ? "管理员" : "学生";
      this.initial = this.userName.charAt(0).toUpperCase();
    }
  },
  methods: {
    viewMyProfile() {
      common_vendor.index.switchTab({
        url: "/pages/student-profile/student-profile"
      });
    },
    viewMyApplications() {
      common_vendor.index.navigateTo({
        url: "/pages/my-applications/my-applications"
      });
    },
    viewMyFavorites() {
      common_vendor.index.navigateTo({
        url: "/pages/my-favorites/my-favorites"
      });
    },
    editPersonalInfo() {
      common_vendor.index.navigateTo({
        url: "/pages/edit-profile/edit-profile"
      });
    },
    editSettings() {
      common_vendor.index.showToast({
        title: "功能开发中",
        icon: "none"
      });
    },
    viewAbout() {
      common_vendor.index.showModal({
        title: "关于我们",
        content: "基于AI的大学生职业规划智能体 v1.0.0",
        showCancel: false
      });
    },
    contactSupport() {
      common_vendor.index.showToast({
        title: "功能开发中",
        icon: "none"
      });
    },
    handleLogout() {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要退出登录吗？",
        success: (res) => {
          if (res.confirm) {
            stores_user.useUserStore.logout();
          }
        }
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.t($data.initial),
    b: common_vendor.t($data.userName),
    c: common_vendor.t($data.userRole),
    d: common_vendor.o((...args) => $options.viewMyProfile && $options.viewMyProfile(...args)),
    e: common_vendor.o((...args) => $options.viewMyApplications && $options.viewMyApplications(...args)),
    f: common_vendor.o((...args) => $options.viewMyFavorites && $options.viewMyFavorites(...args)),
    g: common_vendor.o((...args) => $options.editPersonalInfo && $options.editPersonalInfo(...args)),
    h: common_vendor.o((...args) => $options.editSettings && $options.editSettings(...args)),
    i: common_vendor.o((...args) => $options.viewAbout && $options.viewAbout(...args)),
    j: common_vendor.o((...args) => $options.contactSupport && $options.contactSupport(...args)),
    k: common_vendor.o((...args) => $options.handleLogout && $options.handleLogout(...args))
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-5df2242c"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/user-center/user-center.js.map
