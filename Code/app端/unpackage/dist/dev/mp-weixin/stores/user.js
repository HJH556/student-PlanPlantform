"use strict";
const common_vendor = require("../common/vendor.js");
const api_user = require("../api/user.js");
const useUserStore = {
  state: {
    token: common_vendor.index.getStorageSync("token") || null,
    user: common_vendor.index.getStorageSync("user") ? JSON.parse(common_vendor.index.getStorageSync("user")) : null,
    isLoading: false,
    error: null
  },
  get isLoggedIn() {
    return !!this.state.token;
  },
  get userRole() {
    var _a;
    return ((_a = this.state.user) == null ? void 0 : _a.role) || "guest";
  },
  async login(username, password, captcha, captchaId, remember = false) {
    try {
      this.state.isLoading = true;
      this.state.error = null;
      const response = await api_user.userApi.login(username, password, captcha, captchaId);
      const { token: accessToken, user: userData } = response.data;
      this.state.token = accessToken;
      this.state.user = userData;
      common_vendor.index.setStorageSync("token", accessToken);
      if (remember) {
        common_vendor.index.setStorageSync("user", JSON.stringify(userData));
      } else {
        common_vendor.index.setStorage({
          key: "user",
          data: JSON.stringify(userData)
        });
      }
      return { success: true, message: "登录成功" };
    } catch (err) {
      common_vendor.index.__f__("error", "at stores/user.js:42", "登录失败:", err);
      this.state.error = err;
      throw err;
    } finally {
      this.state.isLoading = false;
    }
  },
  async register(userData) {
    try {
      this.state.isLoading = true;
      this.state.error = null;
      await api_user.userApi.register(userData);
      return { success: true, message: "注册成功" };
    } catch (err) {
      common_vendor.index.__f__("error", "at stores/user.js:58", "注册失败:", err);
      this.state.error = err;
      throw err;
    } finally {
      this.state.isLoading = false;
    }
  },
  logout() {
    try {
      api_user.userApi.logout().catch((err) => {
        common_vendor.index.__f__("error", "at stores/user.js:69", "退出登录失败:", err);
      });
    } catch (err) {
      common_vendor.index.__f__("error", "at stores/user.js:72", "退出登录失败:", err);
    } finally {
      this.state.token = null;
      this.state.user = null;
      common_vendor.index.removeStorageSync("token");
      common_vendor.index.removeStorageSync("user");
      common_vendor.index.reLaunch({
        url: "/pages/login/login"
      });
    }
  },
  async fetchCurrentUser() {
    try {
      const response = await api_user.userApi.getUserInfo();
      if (response && response.data) {
        this.state.user = response.data;
        common_vendor.index.setStorageSync("user", JSON.stringify(response.data));
      }
    } catch (err) {
      common_vendor.index.__f__("error", "at stores/user.js:93", "获取用户信息失败:", err);
    }
  }
};
exports.useUserStore = useUserStore;
//# sourceMappingURL=../../.sourcemap/mp-weixin/stores/user.js.map
