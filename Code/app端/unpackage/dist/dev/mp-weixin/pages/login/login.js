"use strict";
const common_vendor = require("../../common/vendor.js");
const config_index = require("../../config/index.js");
const stores_user = require("../../stores/user.js");
const _sfc_main = {
  data() {
    return {
      isLoginMode: true,
      isLoading: false,
      captchaUrl: "",
      captchaId: "",
      loginForm: {
        username: "",
        password: "",
        captcha: "",
        remember: false
      },
      registerForm: {
        username: "",
        email: "",
        name: "",
        password: "",
        confirmPassword: ""
      }
    };
  },
  onLoad() {
    this.refreshCaptcha();
  },
  methods: {
    async refreshCaptcha() {
      try {
        this.captchaUrl = "";
        common_vendor.index.__f__("log", "at pages/login/login.vue:213", "请求验证码，URL:", config_index.config.baseUrl + "/auth/captcha");
        common_vendor.index.request({
          url: config_index.config.baseUrl + "/auth/captcha",
          method: "GET",
          responseType: "arraybuffer",
          timeout: 1e4,
          // 10秒超时
          success: (res) => {
            var _a, _b, _c;
            common_vendor.index.__f__("log", "at pages/login/login.vue:220", "验证码响应状态:", res.statusCode);
            common_vendor.index.__f__("log", "at pages/login/login.vue:221", "响应数据长度:", res.data ? res.data.byteLength : 0);
            common_vendor.index.__f__("log", "at pages/login/login.vue:222", "响应头:", res.header);
            if (res.statusCode === 200 && res.data && res.data.byteLength > 0) {
              try {
                const base64 = common_vendor.index.arrayBufferToBase64(res.data);
                if (base64 && base64.length > 100) {
                  this.captchaUrl = "data:image/png;base64," + base64;
                  this.captchaId = ((_a = res.header) == null ? void 0 : _a["x-captcha-id"]) || ((_b = res.header) == null ? void 0 : _b["X-Captcha-Id"]) || ((_c = res.header) == null ? void 0 : _c["X-Captcha-ID"]) || "";
                  common_vendor.index.__f__("log", "at pages/login/login.vue:231", "验证码ID:", this.captchaId);
                  common_vendor.index.__f__("log", "at pages/login/login.vue:232", "验证码URL设置成功，长度:", base64.length);
                } else {
                  common_vendor.index.__f__("error", "at pages/login/login.vue:234", "Base64数据无效");
                  this.showCaptchaError();
                }
              } catch (error) {
                common_vendor.index.__f__("error", "at pages/login/login.vue:238", "Base64转换失败:", error);
                this.showCaptchaError();
              }
            } else {
              common_vendor.index.__f__("error", "at pages/login/login.vue:242", "验证码请求失败，状态码:", res.statusCode, "数据长度:", res.data ? res.data.byteLength : 0);
              this.showCaptchaError();
            }
          },
          fail: (e) => {
            common_vendor.index.__f__("error", "at pages/login/login.vue:247", "验证码请求失败", e);
            this.showCaptchaError();
          }
        });
      } catch (e) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:252", "验证码错误", e);
        this.showCaptchaError();
      }
    },
    handleImageError() {
      common_vendor.index.__f__("error", "at pages/login/login.vue:258", "验证码图片加载失败");
      this.showCaptchaError();
    },
    showCaptchaError() {
      this.captchaUrl = "/static/images/captcha-placeholder.png";
      common_vendor.index.showToast({
        title: "验证码加载失败，请点击重试",
        icon: "none",
        duration: 2e3
      });
    },
    async handleLogin() {
      var _a, _b;
      if (!this.loginForm.username || !this.loginForm.password || !this.loginForm.captcha) {
        common_vendor.index.showToast({ title: "请完善信息", icon: "none" });
        return;
      }
      if (!this.captchaId) {
        common_vendor.index.showToast({ title: "验证码异常，请刷新", icon: "none" });
        return;
      }
      this.isLoading = true;
      const loginData = {
        username: this.loginForm.username,
        password: this.loginForm.password,
        captcha: this.loginForm.captcha,
        captchaId: this.captchaId
      };
      common_vendor.index.__f__("log", "at pages/login/login.vue:289", "登录请求数据:", loginData);
      try {
        await stores_user.useUserStore.login(
          this.loginForm.username,
          this.loginForm.password,
          this.loginForm.captcha,
          this.captchaId,
          this.loginForm.remember
        );
        common_vendor.index.showToast({ title: "登录成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.switchTab({ url: "/pages/index/index" });
        }, 1e3);
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:305", "登录错误详情:", err);
        common_vendor.index.showToast({ title: (err == null ? void 0 : err.message) || ((_a = err == null ? void 0 : err.data) == null ? void 0 : _a.detail) || ((_b = err == null ? void 0 : err.data) == null ? void 0 : _b.msg) || "登录失败", icon: "none" });
        this.refreshCaptcha();
      } finally {
        this.isLoading = false;
      }
    },
    async handleRegister() {
      var _a;
      if (this.registerForm.password !== this.registerForm.confirmPassword) {
        common_vendor.index.showToast({ title: "两次密码不一致", icon: "none" });
        return;
      }
      this.isLoading = true;
      try {
        await stores_user.useUserStore.register({
          username: this.registerForm.username,
          email: this.registerForm.email,
          name: this.registerForm.name,
          password: this.registerForm.password
        });
        common_vendor.index.showToast({ title: "注册成功" });
        this.isLoginMode = true;
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/login/login.vue:332", err);
        common_vendor.index.showToast({ title: ((_a = err == null ? void 0 : err.data) == null ? void 0 : _a.msg) || "注册失败", icon: "none" });
      } finally {
        this.isLoading = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.isLoginMode ? 1 : "",
    b: common_vendor.o(($event) => $data.isLoginMode = true),
    c: !$data.isLoginMode ? 1 : "",
    d: common_vendor.o(($event) => $data.isLoginMode = false),
    e: $data.isLoginMode
  }, $data.isLoginMode ? common_vendor.e({
    f: $data.isLoading,
    g: $data.loginForm.username,
    h: common_vendor.o(($event) => $data.loginForm.username = $event.detail.value),
    i: $data.isLoading,
    j: $data.loginForm.password,
    k: common_vendor.o(($event) => $data.loginForm.password = $event.detail.value),
    l: $data.isLoading,
    m: $data.loginForm.captcha,
    n: common_vendor.o(($event) => $data.loginForm.captcha = $event.detail.value),
    o: $data.captchaUrl && $data.captchaUrl !== "/static/images/captcha-placeholder.png"
  }, $data.captchaUrl && $data.captchaUrl !== "/static/images/captcha-placeholder.png" ? {
    p: $data.captchaUrl,
    q: common_vendor.o((...args) => $options.handleImageError && $options.handleImageError(...args))
  } : $data.captchaUrl === "/static/images/captcha-placeholder.png" ? {} : {}, {
    r: $data.captchaUrl === "/static/images/captcha-placeholder.png",
    s: common_vendor.o((...args) => $options.refreshCaptcha && $options.refreshCaptcha(...args)),
    t: $data.loginForm.remember,
    v: common_vendor.o(($event) => $data.loginForm.remember = $event.detail.value),
    w: $data.isLoading,
    x: common_vendor.t($data.isLoading ? "登录中..." : "登录"),
    y: $data.isLoading ? 1 : "",
    z: common_vendor.o((...args) => $options.handleLogin && $options.handleLogin(...args)),
    A: $data.isLoading
  }) : {
    B: $data.isLoading,
    C: $data.registerForm.username,
    D: common_vendor.o(($event) => $data.registerForm.username = $event.detail.value),
    E: $data.isLoading,
    F: $data.registerForm.email,
    G: common_vendor.o(($event) => $data.registerForm.email = $event.detail.value),
    H: $data.isLoading,
    I: $data.registerForm.name,
    J: common_vendor.o(($event) => $data.registerForm.name = $event.detail.value),
    K: $data.isLoading,
    L: $data.registerForm.password,
    M: common_vendor.o(($event) => $data.registerForm.password = $event.detail.value),
    N: $data.isLoading,
    O: $data.registerForm.confirmPassword,
    P: common_vendor.o(($event) => $data.registerForm.confirmPassword = $event.detail.value),
    Q: common_vendor.t($data.isLoading ? "注册中..." : "注册"),
    R: $data.isLoading ? 1 : "",
    S: common_vendor.o((...args) => $options.handleRegister && $options.handleRegister(...args)),
    T: $data.isLoading
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-e4e4508d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/login/login.js.map
