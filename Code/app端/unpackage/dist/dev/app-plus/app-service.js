if (typeof Promise !== "undefined" && !Promise.prototype.finally) {
  Promise.prototype.finally = function(callback) {
    const promise = this.constructor;
    return this.then(
      (value) => promise.resolve(callback()).then(() => value),
      (reason) => promise.resolve(callback()).then(() => {
        throw reason;
      })
    );
  };
}
;
if (typeof uni !== "undefined" && uni && uni.requireGlobal) {
  const global = uni.requireGlobal();
  ArrayBuffer = global.ArrayBuffer;
  Int8Array = global.Int8Array;
  Uint8Array = global.Uint8Array;
  Uint8ClampedArray = global.Uint8ClampedArray;
  Int16Array = global.Int16Array;
  Uint16Array = global.Uint16Array;
  Int32Array = global.Int32Array;
  Uint32Array = global.Uint32Array;
  Float32Array = global.Float32Array;
  Float64Array = global.Float64Array;
  BigInt64Array = global.BigInt64Array;
  BigUint64Array = global.BigUint64Array;
}
;
if (uni.restoreGlobal) {
  uni.restoreGlobal(Vue, weex, plus, setTimeout, clearTimeout, setInterval, clearInterval);
}
(function(vue) {
  "use strict";
  const ON_LOAD = "onLoad";
  function formatAppLog(type, filename, ...args) {
    if (uni.__log__) {
      uni.__log__(type, filename, ...args);
    } else {
      console[type].apply(console, [...args, filename]);
    }
  }
  const createHook = (lifecycle) => (hook, target = vue.getCurrentInstance()) => {
    !vue.isInSSRComponentSetup && vue.injectHook(lifecycle, hook, target);
  };
  const onLoad = /* @__PURE__ */ createHook(ON_LOAD);
  const getBaseUrl = () => {
    if (typeof uni !== "undefined" && uni.getSystemInfoSync) {
      const systemInfo = uni.getSystemInfoSync();
      if (systemInfo.platform === "devtools") {
        return "http://localhost:8000";
      } else {
        return "http://10.216.96.113:8000";
      }
    }
    return "http://localhost:8000";
  };
  const config = {
    baseUrl: getBaseUrl(),
    setBaseUrl(url) {
      this.baseUrl = url;
    }
  };
  const BASE_URL = config.baseUrl;
  function requestInterceptor(options) {
    const token = uni.getStorageSync("token");
    const url = options.url || "";
    const isAuthRequest = url.includes("/auth/login") || url.includes("/auth/register");
    options.header = options.header || {};
    if (token && !isAuthRequest) {
      options.header.Authorization = `Bearer ${token}`;
    }
    options.header["Content-Type"] = "application/json";
    return options;
  }
  function responseInterceptor(response, options) {
    const { statusCode, data } = response;
    const url = options.url || "";
    const isLoginRequest = url.includes("/auth/login");
    if (statusCode >= 200 && statusCode < 300) {
      return { data, status: statusCode, statusCode };
    }
    if (statusCode === 401 && !isLoginRequest) {
      uni.showToast({
        title: "登录已过期，请重新登录",
        icon: "none"
      });
      uni.removeStorageSync("token");
      uni.removeStorageSync("user");
      setTimeout(() => {
        uni.reLaunch({
          url: "/pages/login/login"
        });
      }, 1500);
    } else if (statusCode === 403 && !isLoginRequest) {
      uni.showToast({
        title: "没有权限执行此操作",
        icon: "none"
      });
    } else if (statusCode === 404 && !isLoginRequest) {
      uni.showToast({
        title: "请求的资源不存在",
        icon: "none"
      });
    } else if (statusCode === 500 && !isLoginRequest) {
      uni.showToast({
        title: "服务器内部错误",
        icon: "none"
      });
    }
    return Promise.reject({
      response,
      data,
      status: statusCode,
      statusCode,
      message: (data == null ? void 0 : data.detail) || (data == null ? void 0 : data.msg) || "请求失败"
    });
  }
  function buildQueryParams(params) {
    if (!params || Object.keys(params).length === 0) {
      return "";
    }
    return "?" + Object.keys(params).map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(params[key])).join("&");
  }
  function request(options) {
    return new Promise((resolve, reject) => {
      const finalOptions = requestInterceptor({
        ...options,
        url: BASE_URL + options.url
      });
      formatAppLog("log", "at utils/request.js:93", "发送请求:", {
        url: finalOptions.url,
        method: finalOptions.method,
        data: finalOptions.data,
        headers: finalOptions.header
      });
      uni.request({
        ...finalOptions,
        success: (res) => {
          formatAppLog("log", "at utils/request.js:103", "请求成功响应:", res);
          try {
            const result = responseInterceptor(res, finalOptions);
            resolve(result);
          } catch (err) {
            formatAppLog("log", "at utils/request.js:108", "响应拦截器错误:", err);
            reject(err);
          }
        },
        fail: (err) => {
          formatAppLog("log", "at utils/request.js:113", "请求失败:", err);
          uni.showToast({
            title: "网络错误，请检查后端服务是否启动",
            icon: "none"
          });
          reject(err);
        }
      });
    });
  }
  const request$1 = {
    get(url, data = {}, options = {}) {
      const queryString = buildQueryParams(data);
      return request({
        url: url + queryString,
        method: "GET",
        ...options
      });
    },
    post(url, data = {}, options = {}) {
      let finalUrl = url;
      if (options.params) {
        const queryString = buildQueryParams(options.params);
        finalUrl = url + queryString;
      }
      return request({
        url: finalUrl,
        method: "POST",
        data,
        ...options
      });
    },
    put(url, data = {}, options = {}) {
      return request({
        url,
        method: "PUT",
        data,
        ...options
      });
    },
    delete(url, data = {}, options = {}) {
      const queryString = buildQueryParams(data);
      return request({
        url: url + queryString,
        method: "DELETE",
        ...options
      });
    },
    upload(url, filePath, formData = {}, options = {}) {
      return new Promise((resolve, reject) => {
        const token = uni.getStorageSync("token");
        uni.uploadFile({
          url: BASE_URL + url,
          filePath,
          name: "file",
          formData,
          header: {
            "Authorization": token ? `Bearer ${token}` : ""
          },
          success: (res) => {
            try {
              const data = JSON.parse(res.data);
              resolve(data);
            } catch (err) {
              resolve(res.data);
            }
          },
          fail: reject
        });
      });
    }
  };
  const userApi = {
    // 获取验证码
    getCaptcha() {
      return request$1.get("/auth/captcha", {}, { responseType: "arraybuffer" });
    },
    // 登录
    login(username, password, captcha, captchaId) {
      return request$1.post("/auth/login", {
        username,
        password,
        captcha,
        captchaId
      });
    },
    // 注册
    register(userData) {
      return request$1.post("/auth/register", userData);
    },
    // 退出登录
    logout() {
      return request$1.post("/auth/logout");
    },
    // 获取用户信息
    getUserInfo() {
      return request$1.get("/auth/user");
    },
    // 获取当前用户信息
    getCurrentUser() {
      return request$1.get("/auth/user");
    },
    // 更新用户信息
    updateUserInfo(userData) {
      return request$1.put("/auth/user", userData);
    },
    // 修改密码
    changePassword(passwordData) {
      return request$1.post("/auth/change-password", passwordData);
    },
    // 获取申请记录
    getApplications() {
      return request$1.get("/jobs/applications");
    },
    // 取消申请
    cancelApplication(applicationId) {
      return request$1.delete(`/jobs/applications/${applicationId}`);
    },
    // 获取学生画像进度
    getProfileStep() {
      return request$1.get("/auth/profile-step");
    },
    // 更新学生画像进度
    updateProfileStep(step) {
      return request$1.put("/auth/profile-step", null, { params: { step } });
    }
  };
  const useUserStore = {
    state: {
      token: uni.getStorageSync("token") || null,
      user: uni.getStorageSync("user") ? JSON.parse(uni.getStorageSync("user")) : null,
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
        const response = await userApi.login(username, password, captcha, captchaId);
        const { token: accessToken, user: userData } = response.data;
        this.state.token = accessToken;
        this.state.user = userData;
        uni.setStorageSync("token", accessToken);
        if (remember) {
          uni.setStorageSync("user", JSON.stringify(userData));
        } else {
          uni.setStorage({
            key: "user",
            data: JSON.stringify(userData)
          });
        }
        return { success: true, message: "登录成功" };
      } catch (err) {
        formatAppLog("error", "at stores/user.js:42", "登录失败:", err);
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
        await userApi.register(userData);
        return { success: true, message: "注册成功" };
      } catch (err) {
        formatAppLog("error", "at stores/user.js:58", "注册失败:", err);
        this.state.error = err;
        throw err;
      } finally {
        this.state.isLoading = false;
      }
    },
    logout() {
      try {
        userApi.logout().catch((err) => {
          formatAppLog("error", "at stores/user.js:69", "退出登录失败:", err);
        });
      } catch (err) {
        formatAppLog("error", "at stores/user.js:72", "退出登录失败:", err);
      } finally {
        this.state.token = null;
        this.state.user = null;
        uni.removeStorageSync("token");
        uni.removeStorageSync("user");
        uni.reLaunch({
          url: "/pages/login/login"
        });
      }
    },
    async fetchCurrentUser() {
      try {
        const response = await userApi.getUserInfo();
        if (response && response.data) {
          this.state.user = response.data;
          uni.setStorageSync("user", JSON.stringify(response.data));
        }
      } catch (err) {
        formatAppLog("error", "at stores/user.js:93", "获取用户信息失败:", err);
      }
    }
  };
  const _export_sfc = (sfc, props) => {
    const target = sfc.__vccOpts || sfc;
    for (const [key, val] of props) {
      target[key] = val;
    }
    return target;
  };
  const _sfc_main$g = {
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
          formatAppLog("log", "at pages/login/login.vue:213", "请求验证码，URL:", config.baseUrl + "/auth/captcha");
          uni.request({
            url: config.baseUrl + "/auth/captcha",
            method: "GET",
            responseType: "arraybuffer",
            timeout: 1e4,
            // 10秒超时
            success: (res) => {
              var _a, _b, _c;
              formatAppLog("log", "at pages/login/login.vue:220", "验证码响应状态:", res.statusCode);
              formatAppLog("log", "at pages/login/login.vue:221", "响应数据长度:", res.data ? res.data.byteLength : 0);
              formatAppLog("log", "at pages/login/login.vue:222", "响应头:", res.header);
              if (res.statusCode === 200 && res.data && res.data.byteLength > 0) {
                try {
                  const base64 = uni.arrayBufferToBase64(res.data);
                  if (base64 && base64.length > 100) {
                    this.captchaUrl = "data:image/png;base64," + base64;
                    this.captchaId = ((_a = res.header) == null ? void 0 : _a["x-captcha-id"]) || ((_b = res.header) == null ? void 0 : _b["X-Captcha-Id"]) || ((_c = res.header) == null ? void 0 : _c["X-Captcha-ID"]) || "";
                    formatAppLog("log", "at pages/login/login.vue:231", "验证码ID:", this.captchaId);
                    formatAppLog("log", "at pages/login/login.vue:232", "验证码URL设置成功，长度:", base64.length);
                  } else {
                    formatAppLog("error", "at pages/login/login.vue:234", "Base64数据无效");
                    this.showCaptchaError();
                  }
                } catch (error) {
                  formatAppLog("error", "at pages/login/login.vue:238", "Base64转换失败:", error);
                  this.showCaptchaError();
                }
              } else {
                formatAppLog("error", "at pages/login/login.vue:242", "验证码请求失败，状态码:", res.statusCode, "数据长度:", res.data ? res.data.byteLength : 0);
                this.showCaptchaError();
              }
            },
            fail: (e) => {
              formatAppLog("error", "at pages/login/login.vue:247", "验证码请求失败", e);
              this.showCaptchaError();
            }
          });
        } catch (e) {
          formatAppLog("error", "at pages/login/login.vue:252", "验证码错误", e);
          this.showCaptchaError();
        }
      },
      handleImageError() {
        formatAppLog("error", "at pages/login/login.vue:258", "验证码图片加载失败");
        this.showCaptchaError();
      },
      showCaptchaError() {
        this.captchaUrl = "/static/images/captcha-placeholder.png";
        uni.showToast({
          title: "验证码加载失败，请点击重试",
          icon: "none",
          duration: 2e3
        });
      },
      async handleLogin() {
        var _a, _b;
        if (!this.loginForm.username || !this.loginForm.password || !this.loginForm.captcha) {
          uni.showToast({ title: "请完善信息", icon: "none" });
          return;
        }
        if (!this.captchaId) {
          uni.showToast({ title: "验证码异常，请刷新", icon: "none" });
          return;
        }
        this.isLoading = true;
        const loginData = {
          username: this.loginForm.username,
          password: this.loginForm.password,
          captcha: this.loginForm.captcha,
          captchaId: this.captchaId
        };
        formatAppLog("log", "at pages/login/login.vue:289", "登录请求数据:", loginData);
        try {
          await useUserStore.login(
            this.loginForm.username,
            this.loginForm.password,
            this.loginForm.captcha,
            this.captchaId,
            this.loginForm.remember
          );
          uni.showToast({ title: "登录成功", icon: "success" });
          setTimeout(() => {
            uni.switchTab({ url: "/pages/index/index" });
          }, 1e3);
        } catch (err) {
          formatAppLog("error", "at pages/login/login.vue:305", "登录错误详情:", err);
          uni.showToast({ title: (err == null ? void 0 : err.message) || ((_a = err == null ? void 0 : err.data) == null ? void 0 : _a.detail) || ((_b = err == null ? void 0 : err.data) == null ? void 0 : _b.msg) || "登录失败", icon: "none" });
          this.refreshCaptcha();
        } finally {
          this.isLoading = false;
        }
      },
      async handleRegister() {
        var _a;
        if (this.registerForm.password !== this.registerForm.confirmPassword) {
          uni.showToast({ title: "两次密码不一致", icon: "none" });
          return;
        }
        this.isLoading = true;
        try {
          await useUserStore.register({
            username: this.registerForm.username,
            email: this.registerForm.email,
            name: this.registerForm.name,
            password: this.registerForm.password
          });
          uni.showToast({ title: "注册成功" });
          this.isLoginMode = true;
        } catch (err) {
          formatAppLog("error", "at pages/login/login.vue:332", err);
          uni.showToast({ title: ((_a = err == null ? void 0 : err.data) == null ? void 0 : _a.msg) || "注册失败", icon: "none" });
        } finally {
          this.isLoading = false;
        }
      }
    }
  };
  function _sfc_render$f(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "login-container" }, [
      vue.createElementVNode("view", { class: "login-card" }, [
        vue.createElementVNode("view", { class: "logo-section" }, [
          vue.createElementVNode("view", { class: "logo-icon" }, [
            vue.createElementVNode("text", { class: "logo-text" }, "📚")
          ]),
          vue.createElementVNode("text", { class: "app-title" }, "职业规划系统"),
          vue.createElementVNode("text", { class: "app-subtitle" }, "基于AI的大学生职业规划智能体")
        ]),
        vue.createElementVNode("view", { class: "form-section" }, [
          vue.createElementVNode("view", { class: "mode-switch" }, [
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["mode-tab", { active: $data.isLoginMode }]),
                onClick: _cache[0] || (_cache[0] = ($event) => $data.isLoginMode = true)
              },
              " 登录 ",
              2
              /* CLASS */
            ),
            vue.createElementVNode(
              "view",
              {
                class: vue.normalizeClass(["mode-tab", { active: !$data.isLoginMode }]),
                onClick: _cache[1] || (_cache[1] = ($event) => $data.isLoginMode = false)
              },
              " 注册 ",
              2
              /* CLASS */
            )
          ]),
          $data.isLoginMode ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "login-form"
          }, [
            vue.createElementVNode("view", { class: "input-group" }, [
              vue.createElementVNode("view", { class: "input-wrapper" }, [
                vue.createElementVNode("text", { class: "input-icon" }, "👤"),
                vue.withDirectives(vue.createElementVNode("input", {
                  "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.loginForm.username = $event),
                  class: "input-field",
                  placeholder: "请输入用户名",
                  disabled: $data.isLoading
                }, null, 8, ["disabled"]), [
                  [vue.vModelText, $data.loginForm.username]
                ])
              ])
            ]),
            vue.createElementVNode("view", { class: "input-group" }, [
              vue.createElementVNode("view", { class: "input-wrapper" }, [
                vue.createElementVNode("text", { class: "input-icon" }, "🔒"),
                vue.withDirectives(vue.createElementVNode("input", {
                  "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.loginForm.password = $event),
                  class: "input-field",
                  type: "password",
                  placeholder: "请输入密码",
                  disabled: $data.isLoading
                }, null, 8, ["disabled"]), [
                  [vue.vModelText, $data.loginForm.password]
                ])
              ])
            ]),
            vue.createElementVNode("view", { class: "input-group" }, [
              vue.createElementVNode("view", { class: "input-wrapper captcha-wrapper" }, [
                vue.createElementVNode("text", { class: "input-icon" }, "🔐"),
                vue.withDirectives(vue.createElementVNode("input", {
                  "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $data.loginForm.captcha = $event),
                  class: "input-field captcha-input",
                  placeholder: "请输入验证码",
                  maxlength: "4",
                  disabled: $data.isLoading
                }, null, 8, ["disabled"]), [
                  [vue.vModelText, $data.loginForm.captcha]
                ]),
                vue.createElementVNode("view", {
                  class: "captcha-image",
                  onClick: _cache[6] || (_cache[6] = (...args) => $options.refreshCaptcha && $options.refreshCaptcha(...args))
                }, [
                  $data.captchaUrl && $data.captchaUrl !== "/static/images/captcha-placeholder.png" ? (vue.openBlock(), vue.createElementBlock("image", {
                    key: 0,
                    src: $data.captchaUrl,
                    mode: "widthFix",
                    class: "captcha-img",
                    onError: _cache[5] || (_cache[5] = (...args) => $options.handleImageError && $options.handleImageError(...args))
                  }, null, 40, ["src"])) : $data.captchaUrl === "/static/images/captcha-placeholder.png" ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 1,
                    class: "captcha-placeholder"
                  }, [
                    vue.createElementVNode("text", { class: "placeholder-text" }, "点击刷新")
                  ])) : (vue.openBlock(), vue.createElementBlock("text", {
                    key: 2,
                    class: "loading-text"
                  }, "加载中..."))
                ])
              ])
            ]),
            vue.createElementVNode("view", { class: "form-options" }, [
              vue.createElementVNode("label", { class: "remember-me" }, [
                vue.createElementVNode("checkbox", {
                  checked: $data.loginForm.remember,
                  onChange: _cache[7] || (_cache[7] = ($event) => $data.loginForm.remember = $event.detail.value),
                  disabled: $data.isLoading
                }, null, 40, ["checked", "disabled"]),
                vue.createElementVNode("text", null, "记住我")
              ])
            ]),
            vue.createElementVNode("button", {
              class: vue.normalizeClass(["btn btn-primary login-btn", { loading: $data.isLoading }]),
              onClick: _cache[8] || (_cache[8] = (...args) => $options.handleLogin && $options.handleLogin(...args)),
              disabled: $data.isLoading
            }, vue.toDisplayString($data.isLoading ? "登录中..." : "登录"), 11, ["disabled"])
          ])) : (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "register-form"
          }, [
            vue.createElementVNode("view", { class: "input-group" }, [
              vue.createElementVNode("view", { class: "input-wrapper" }, [
                vue.createElementVNode("text", { class: "input-icon" }, "👤"),
                vue.withDirectives(vue.createElementVNode("input", {
                  "onUpdate:modelValue": _cache[9] || (_cache[9] = ($event) => $data.registerForm.username = $event),
                  class: "input-field",
                  placeholder: "请输入用户名",
                  disabled: $data.isLoading
                }, null, 8, ["disabled"]), [
                  [vue.vModelText, $data.registerForm.username]
                ])
              ])
            ]),
            vue.createElementVNode("view", { class: "input-group" }, [
              vue.createElementVNode("view", { class: "input-wrapper" }, [
                vue.createElementVNode("text", { class: "input-icon" }, "📧"),
                vue.withDirectives(vue.createElementVNode("input", {
                  "onUpdate:modelValue": _cache[10] || (_cache[10] = ($event) => $data.registerForm.email = $event),
                  class: "input-field",
                  type: "email",
                  placeholder: "请输入邮箱",
                  disabled: $data.isLoading
                }, null, 8, ["disabled"]), [
                  [vue.vModelText, $data.registerForm.email]
                ])
              ])
            ]),
            vue.createElementVNode("view", { class: "input-group" }, [
              vue.createElementVNode("view", { class: "input-wrapper" }, [
                vue.createElementVNode("text", { class: "input-icon" }, "📛"),
                vue.withDirectives(vue.createElementVNode("input", {
                  "onUpdate:modelValue": _cache[11] || (_cache[11] = ($event) => $data.registerForm.name = $event),
                  class: "input-field",
                  placeholder: "请输入姓名",
                  disabled: $data.isLoading
                }, null, 8, ["disabled"]), [
                  [vue.vModelText, $data.registerForm.name]
                ])
              ])
            ]),
            vue.createElementVNode("view", { class: "input-group" }, [
              vue.createElementVNode("view", { class: "input-wrapper" }, [
                vue.createElementVNode("text", { class: "input-icon" }, "🔒"),
                vue.withDirectives(vue.createElementVNode("input", {
                  "onUpdate:modelValue": _cache[12] || (_cache[12] = ($event) => $data.registerForm.password = $event),
                  class: "input-field",
                  type: "password",
                  placeholder: "请输入密码",
                  disabled: $data.isLoading
                }, null, 8, ["disabled"]), [
                  [vue.vModelText, $data.registerForm.password]
                ])
              ])
            ]),
            vue.createElementVNode("view", { class: "input-group" }, [
              vue.createElementVNode("view", { class: "input-wrapper" }, [
                vue.createElementVNode("text", { class: "input-icon" }, "🔒"),
                vue.withDirectives(vue.createElementVNode("input", {
                  "onUpdate:modelValue": _cache[13] || (_cache[13] = ($event) => $data.registerForm.confirmPassword = $event),
                  class: "input-field",
                  type: "password",
                  placeholder: "请确认密码",
                  disabled: $data.isLoading
                }, null, 8, ["disabled"]), [
                  [vue.vModelText, $data.registerForm.confirmPassword]
                ])
              ])
            ]),
            vue.createElementVNode("button", {
              class: vue.normalizeClass(["btn btn-primary register-btn", { loading: $data.isLoading }]),
              onClick: _cache[14] || (_cache[14] = (...args) => $options.handleRegister && $options.handleRegister(...args)),
              disabled: $data.isLoading
            }, vue.toDisplayString($data.isLoading ? "注册中..." : "注册"), 11, ["disabled"])
          ]))
        ])
      ])
    ]);
  }
  const PagesLoginLogin = /* @__PURE__ */ _export_sfc(_sfc_main$g, [["render", _sfc_render$f], ["__scopeId", "data-v-e4e4508d"], ["__file", "D:/计算机编程/A13/app端/pages/login/login.vue"]]);
  const _sfc_main$f = {
    data() {
      return {
        userName: "同学"
      };
    },
    onLoad() {
      const user = useUserStore.state.user;
      if (user && user.username) {
        this.userName = user.username;
      }
    },
    onShow() {
      const user = useUserStore.state.user;
      if (user && user.username) {
        this.userName = user.username;
      }
    },
    methods: {
      navigateTo(url) {
        uni.switchTab({
          url,
          fail: () => {
            uni.navigateTo({
              url
            });
          }
        });
      },
      openAIAssistant() {
        uni.switchTab({
          url: "/pages/ai-assistant/ai-assistant"
        });
      }
    }
  };
  function _sfc_render$e(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header" }, [
        vue.createElementVNode("view", { class: "welcome-card" }, [
          vue.createElementVNode("text", { class: "welcome-text" }, "👋 欢迎回来"),
          vue.createElementVNode(
            "text",
            { class: "user-name" },
            vue.toDisplayString($data.userName),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "welcome-desc" }, "开始你的职业规划之旅吧！")
        ])
      ]),
      vue.createElementVNode("view", { class: "quick-actions" }, [
        vue.createElementVNode("view", { class: "section-title" }, "快捷入口"),
        vue.createElementVNode("view", { class: "action-grid" }, [
          vue.createElementVNode("view", {
            class: "action-item",
            onClick: _cache[0] || (_cache[0] = ($event) => $options.navigateTo("/pages/job-explore/job-explore"))
          }, [
            vue.createElementVNode("view", { class: "action-icon job-icon" }, "🔍"),
            vue.createElementVNode("text", { class: "action-text" }, "岗位探索")
          ]),
          vue.createElementVNode("view", {
            class: "action-item",
            onClick: _cache[1] || (_cache[1] = ($event) => $options.navigateTo("/pages/student-profile/student-profile"))
          }, [
            vue.createElementVNode("view", { class: "action-icon profile-icon" }, "👤"),
            vue.createElementVNode("text", { class: "action-text" }, "学生画像")
          ]),
          vue.createElementVNode("view", {
            class: "action-item",
            onClick: _cache[2] || (_cache[2] = ($event) => $options.navigateTo("/pages/career-plan/career-plan"))
          }, [
            vue.createElementVNode("view", { class: "action-icon career-icon" }, "📊"),
            vue.createElementVNode("text", { class: "action-text" }, "职业规划")
          ]),
          vue.createElementVNode("view", {
            class: "action-item",
            onClick: _cache[3] || (_cache[3] = ($event) => $options.navigateTo("/pages/interview-questions/interview-questions"))
          }, [
            vue.createElementVNode("view", { class: "action-icon interview-icon" }, "💼"),
            vue.createElementVNode("text", { class: "action-text" }, "面试问题")
          ]),
          vue.createElementVNode("view", {
            class: "action-item",
            onClick: _cache[4] || (_cache[4] = ($event) => $options.navigateTo("/pages/my-interview/my-interview"))
          }, [
            vue.createElementVNode("view", { class: "action-icon my-interview-icon" }, "📋"),
            vue.createElementVNode("text", { class: "action-text" }, "我的面试")
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "ai-assistant-section" }, [
        vue.createElementVNode("view", {
          class: "ai-card",
          onClick: _cache[5] || (_cache[5] = (...args) => $options.openAIAssistant && $options.openAIAssistant(...args))
        }, [
          vue.createElementVNode("view", { class: "ai-icon" }, "🤖"),
          vue.createElementVNode("view", { class: "ai-content" }, [
            vue.createElementVNode("text", { class: "ai-title" }, "AI职业助手"),
            vue.createElementVNode("text", { class: "ai-desc" }, "有任何职业问题，随时问我！")
          ]),
          vue.createElementVNode("text", { class: "ai-arrow" }, "›")
        ])
      ]),
      vue.createElementVNode("view", { class: "features" }, [
        vue.createElementVNode("view", { class: "section-title" }, "功能特点"),
        vue.createElementVNode("view", { class: "feature-list" }, [
          vue.createElementVNode("view", { class: "feature-item" }, [
            vue.createElementVNode("view", { class: "feature-icon" }, "🧠"),
            vue.createElementVNode("view", { class: "feature-content" }, [
              vue.createElementVNode("text", { class: "feature-title" }, "AI智能分析"),
              vue.createElementVNode("text", { class: "feature-desc" }, "基于大模型的智能职业规划分析")
            ])
          ]),
          vue.createElementVNode("view", { class: "feature-item" }, [
            vue.createElementVNode("view", { class: "feature-icon" }, "📈"),
            vue.createElementVNode("view", { class: "feature-content" }, [
              vue.createElementVNode("text", { class: "feature-title" }, "知识图谱"),
              vue.createElementVNode("text", { class: "feature-desc" }, "可视化展示岗位关系和技能要求")
            ])
          ]),
          vue.createElementVNode("view", { class: "feature-item" }, [
            vue.createElementVNode("view", { class: "feature-icon" }, "🎯"),
            vue.createElementVNode("view", { class: "feature-content" }, [
              vue.createElementVNode("text", { class: "feature-title" }, "精准匹配"),
              vue.createElementVNode("text", { class: "feature-desc" }, "智能推荐最适合你的岗位")
            ])
          ]),
          vue.createElementVNode("view", { class: "feature-item" }, [
            vue.createElementVNode("view", { class: "feature-icon" }, "💬"),
            vue.createElementVNode("view", { class: "feature-content" }, [
              vue.createElementVNode("text", { class: "feature-title" }, "智能对话"),
              vue.createElementVNode("text", { class: "feature-desc" }, "随时与AI助手交流职业问题")
            ])
          ])
        ])
      ])
    ]);
  }
  const PagesIndexIndex = /* @__PURE__ */ _export_sfc(_sfc_main$f, [["render", _sfc_render$e], ["__scopeId", "data-v-1cf27b2a"], ["__file", "D:/计算机编程/A13/app端/pages/index/index.vue"]]);
  const agentApi = {
    sendMessage(userId, message) {
      return request$1.post("/agent/send-message", null, {
        params: {
          user_id: userId,
          message
        }
      });
    },
    // 分析简历
    analyzeResume(resumeText, userId) {
      return request$1.post("/langchain/analyze-resume", {
        resume_text: resumeText,
        user_id: userId
      }, {
        header: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      });
    }
  };
  const _sfc_main$e = {
    data() {
      return {
        messages: [],
        inputText: "",
        isLoading: false,
        bottomPadding: "20rpx",
        scrollIntoView: "",
        quickMessages: [
          "前端开发能晋升到哪些岗位？",
          "Java可以转岗到哪些方向？",
          "C/C++的发展路径？"
        ]
      };
    },
    onLoad() {
      this.setSafeArea();
    },
    methods: {
      setSafeArea() {
        var _a;
        const systemInfo = uni.getSystemInfoSync();
        this.bottomPadding = (((_a = systemInfo.safeAreaInsets) == null ? void 0 : _a.bottom) || 0) + 20 + "rpx";
      },
      scrollToBottom() {
        this.$nextTick(() => {
          if (this.messages.length > 0) {
            this.scrollIntoView = "msg-" + (this.messages.length - 1);
          }
        });
      },
      sendQuickMessage(message) {
        this.inputText = message;
        this.sendMessage();
      },
      async sendMessage() {
        var _a, _b;
        if (!this.inputText.trim() || this.isLoading)
          return;
        const userMessage = this.inputText.trim();
        this.inputText = "";
        this.messages.push({
          isUser: true,
          content: userMessage
        });
        this.scrollToBottom();
        this.isLoading = true;
        try {
          const userId = "user_" + Date.now();
          const response = await agentApi.sendMessage(userId, userMessage);
          formatAppLog("log", "at pages/ai-assistant/ai-assistant.vue:131", "API响应:", response);
          if (response && response.data) {
            const aiResponse = ((_a = response.data) == null ? void 0 : _a.response) || ((_b = response.data) == null ? void 0 : _b.message) || "抱歉，我现在无法回答你的问题。";
            this.messages.push({
              isUser: false,
              content: aiResponse
            });
            this.scrollToBottom();
          }
        } catch (err) {
          formatAppLog("error", "at pages/ai-assistant/ai-assistant.vue:142", "请求错误:", err);
          this.messages.push({
            isUser: false,
            content: "抱歉，网络连接失败，请检查网络设置。"
          });
          this.scrollToBottom();
        } finally {
          this.isLoading = false;
        }
      }
    }
  };
  function _sfc_render$d(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("scroll-view", {
        class: "messages-container",
        style: vue.normalizeStyle({ paddingBottom: $data.bottomPadding }),
        "scroll-y": "true",
        "scroll-into-view": $data.scrollIntoView,
        "scroll-with-animation": true
      }, [
        $data.messages.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "empty-state"
        }, [
          vue.createElementVNode("text", { class: "empty-icon" }, "🤖"),
          vue.createElementVNode("text", { class: "empty-title" }, "你好！我是AI职业助手"),
          vue.createElementVNode("text", { class: "empty-desc" }, "有什么职业问题可以问我哦~")
        ])) : vue.createCommentVNode("v-if", true),
        vue.createElementVNode("view", { class: "messages-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.messages, (msg, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: index,
                id: "msg-" + index,
                class: vue.normalizeClass(["message-item", { "user-message": msg.isUser, "ai-message": !msg.isUser }])
              }, [
                vue.createElementVNode("view", { class: "avatar" }, [
                  msg.isUser ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "👤")) : (vue.openBlock(), vue.createElementBlock("text", { key: 1 }, "🤖"))
                ]),
                vue.createElementVNode("view", { class: "message-content" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "message-text" },
                    vue.toDisplayString(msg.content),
                    1
                    /* TEXT */
                  )
                ])
              ], 10, ["id"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ], 12, ["scroll-into-view"]),
      vue.createElementVNode("view", { class: "quick-messages-container" }, [
        vue.createElementVNode("scroll-view", {
          class: "quick-messages-scroll",
          "scroll-x": "true",
          "show-scrollbar": "false"
        }, [
          vue.createElementVNode("view", { class: "quick-messages" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.quickMessages, (msg, index) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: index,
                  class: "quick-message-btn",
                  onClick: ($event) => $options.sendQuickMessage(msg)
                }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(msg),
                    1
                    /* TEXT */
                  )
                ], 8, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "input-area" }, [
        vue.createElementVNode("view", { class: "input-wrapper" }, [
          vue.withDirectives(vue.createElementVNode("input", {
            "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.inputText = $event),
            class: "input-field",
            placeholder: "输入你的问题...",
            onConfirm: _cache[1] || (_cache[1] = (...args) => $options.sendMessage && $options.sendMessage(...args)),
            disabled: $data.isLoading
          }, null, 40, ["disabled"]), [
            [vue.vModelText, $data.inputText]
          ]),
          vue.createElementVNode(
            "view",
            {
              class: vue.normalizeClass(["send-btn", { disabled: !$data.inputText.trim() || $data.isLoading }]),
              onClick: _cache[2] || (_cache[2] = (...args) => $options.sendMessage && $options.sendMessage(...args))
            },
            [
              vue.createElementVNode(
                "text",
                null,
                vue.toDisplayString($data.isLoading ? "..." : "发送"),
                1
                /* TEXT */
              )
            ],
            2
            /* CLASS */
          )
        ])
      ])
    ]);
  }
  const PagesAiAssistantAiAssistant = /* @__PURE__ */ _export_sfc(_sfc_main$e, [["render", _sfc_render$d], ["__scopeId", "data-v-8303b4fc"], ["__file", "D:/计算机编程/A13/app端/pages/ai-assistant/ai-assistant.vue"]]);
  const jobApi = {
    // 获取岗位列表
    getJobList(params) {
      return request$1.get("/jobs", params);
    },
    // 获取岗位详情
    getJobDetail(jobId) {
      return request$1.get(`/jobs/${jobId}`);
    },
    // 获取岗位画像
    getJobProfile(jobId) {
      return request$1.get(`/jobs/${jobId}/profile`);
    },
    // 获取岗位关联图谱
    getJobGraph(jobId) {
      return request$1.get(`/jobs/${jobId}/graph`);
    },
    // 搜索岗位
    searchJobs(keyword, params) {
      return request$1.get("/jobs/search", { keyword, ...params });
    },
    // 添加收藏
    addFavorite(jobId) {
      return request$1.post(`/jobs/${jobId}/favorite`);
    },
    // 取消收藏
    removeFavorite(jobId) {
      return request$1.delete(`/jobs/${jobId}/favorite`);
    },
    // 获取收藏列表
    getFavorites() {
      return request$1.get("/jobs/favorites");
    },
    // 申请岗位
    applyJob(jobId) {
      return request$1.post(`/jobs/${jobId}/apply`);
    },
    // 获取申请列表
    getApplications() {
      return request$1.get("/jobs/applications");
    }
  };
  const _sfc_main$d = {
    data() {
      return {
        searchKeyword: "",
        activeFilter: 0,
        filters: ["全部", "前端", "后端", "算法", "产品", "运营"],
        jobList: [],
        allJobList: [],
        loading: false,
        hasMore: true,
        page: 1,
        pageSize: 20
      };
    },
    onLoad() {
      this.loadJobList();
    },
    onPullDownRefresh() {
      this.refresh();
    },
    methods: {
      parseTags(tagsStr) {
        if (!tagsStr)
          return [];
        if (Array.isArray(tagsStr))
          return tagsStr;
        return tagsStr.split(",").filter((t) => t.trim());
      },
      async loadJobList() {
        if (this.loading)
          return;
        this.loading = true;
        formatAppLog("log", "at pages/job-explore/job-explore.vue:114", "开始加载数据, 页码:", this.page, "搜索关键词:", this.searchKeyword);
        try {
          const params = {
            skip: (this.page - 1) * this.pageSize,
            limit: this.pageSize
          };
          if (this.searchKeyword.trim()) {
            params.keyword = this.searchKeyword.trim();
          }
          const response = await jobApi.getJobList(params);
          formatAppLog("log", "at pages/job-explore/job-explore.vue:127", "岗位列表响应:", response);
          if (response && response.data && Array.isArray(response.data)) {
            const newData = response.data;
            formatAppLog("log", "at pages/job-explore/job-explore.vue:131", "获取到数据数量:", newData.length);
            if (this.page === 1) {
              this.allJobList = newData;
            } else {
              this.allJobList = [...this.allJobList, ...newData];
            }
            this.hasMore = newData.length >= this.pageSize;
            if (this.searchKeyword.trim()) {
              this.jobList = this.allJobList;
            } else {
              this.applyFilter();
            }
          } else {
            formatAppLog("log", "at pages/job-explore/job-explore.vue:147", "响应数据格式不正确");
          }
        } catch (error) {
          formatAppLog("error", "at pages/job-explore/job-explore.vue:150", "加载岗位列表失败:", error);
          if (this.page === 1) {
            this.allJobList = this.getMockJobs();
            this.jobList = this.allJobList;
          }
        } finally {
          this.loading = false;
          uni.stopPullDownRefresh();
        }
      },
      getMockJobs() {
        return [
          {
            id: 1,
            title: "前端开发工程师",
            company: "字节跳动",
            salary: "25-45K",
            location: "北京",
            experience: "1-3年",
            education: "本科",
            tags: ["Vue", "React", "TypeScript"]
          },
          {
            id: 2,
            title: "后端开发工程师",
            company: "阿里巴巴",
            salary: "30-50K",
            location: "杭州",
            experience: "3-5年",
            education: "本科",
            tags: ["Java", "Spring", "MySQL"]
          },
          {
            id: 3,
            title: "算法工程师",
            company: "腾讯",
            salary: "35-60K",
            location: "深圳",
            experience: "3-5年",
            education: "硕士",
            tags: ["Python", "机器学习", "深度学习"]
          }
        ];
      },
      async handleSearch() {
        this.page = 1;
        this.hasMore = true;
        await this.loadJobList();
      },
      clearSearch() {
        this.searchKeyword = "";
        this.page = 1;
        this.hasMore = true;
        this.loadJobList();
      },
      handleFilterChange(index) {
        if (this.searchKeyword.trim()) {
          uni.showToast({
            title: "请先清除搜索再使用筛选",
            icon: "none"
          });
          return;
        }
        this.activeFilter = index;
        this.applyFilter();
      },
      applyFilter() {
        if (this.searchKeyword.trim()) {
          this.jobList = this.allJobList;
          return;
        }
        const filter = this.filters[this.activeFilter];
        formatAppLog("log", "at pages/job-explore/job-explore.vue:228", "应用筛选:", filter);
        if (filter === "全部") {
          this.jobList = this.allJobList;
        } else {
          this.jobList = this.allJobList.filter((job) => {
            const title = job.title || "";
            const tags = this.parseTags(job.tags);
            return title.includes(filter) || tags.includes(filter);
          });
        }
        formatAppLog("log", "at pages/job-explore/job-explore.vue:239", "筛选后数据数量:", this.jobList.length);
      },
      loadMore() {
        if (this.loading || !this.hasMore) {
          formatAppLog("log", "at pages/job-explore/job-explore.vue:244", "不加载更多:", { loading: this.loading, hasMore: this.hasMore });
          return;
        }
        formatAppLog("log", "at pages/job-explore/job-explore.vue:248", "加载更多数据");
        this.page++;
        this.loadJobList();
      },
      refresh() {
        formatAppLog("log", "at pages/job-explore/job-explore.vue:254", "刷新数据");
        this.page = 1;
        this.hasMore = true;
        this.loadJobList();
      },
      viewJobDetail(job) {
        uni.navigateTo({
          url: `/pages/job-detail/job-detail?id=${job.id}`
        });
      }
    }
  };
  function _sfc_render$c(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "search-section" }, [
        vue.createElementVNode("view", { class: "search-bar" }, [
          vue.createElementVNode("text", { class: "search-icon" }, "🔍"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.searchKeyword = $event),
              class: "search-input",
              placeholder: "输入关键词搜索岗位名称...",
              onConfirm: _cache[1] || (_cache[1] = (...args) => $options.handleSearch && $options.handleSearch(...args))
            },
            null,
            544
            /* NEED_HYDRATION, NEED_PATCH */
          ), [
            [vue.vModelText, $data.searchKeyword]
          ]),
          $data.searchKeyword ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "clear-button",
            onClick: _cache[2] || (_cache[2] = (...args) => $options.clearSearch && $options.clearSearch(...args))
          }, "✕")) : vue.createCommentVNode("v-if", true),
          vue.createElementVNode("view", {
            class: "search-button",
            onClick: _cache[3] || (_cache[3] = (...args) => $options.handleSearch && $options.handleSearch(...args))
          }, "搜索")
        ])
      ]),
      vue.createElementVNode("view", { class: "filter-section" }, [
        vue.createElementVNode("scroll-view", {
          class: "filter-scroll",
          "scroll-x": "true"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.filters, (filter, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: index,
                class: vue.normalizeClass(["filter-item", { active: $data.activeFilter === index }]),
                onClick: ($event) => $options.handleFilterChange(index)
              }, vue.toDisplayString(filter), 11, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createElementVNode(
        "scroll-view",
        {
          class: "job-scroll",
          "scroll-y": "true",
          onScrolltolower: _cache[4] || (_cache[4] = (...args) => $options.loadMore && $options.loadMore(...args)),
          "lower-threshold": 100
        },
        [
          $data.jobList.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "job-list"
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.jobList, (job) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: job.id,
                  class: "job-card",
                  onClick: ($event) => $options.viewJobDetail(job)
                }, [
                  vue.createElementVNode("view", { class: "job-header" }, [
                    vue.createElementVNode(
                      "view",
                      { class: "job-title" },
                      vue.toDisplayString(job.title || "岗位名称"),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "view",
                      { class: "job-salary" },
                      vue.toDisplayString(job.salary || "薪资面议"),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode(
                    "view",
                    { class: "job-company" },
                    vue.toDisplayString(job.company || "公司名称"),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("view", { class: "job-info" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "info-tag" },
                      vue.toDisplayString(job.location || "地点"),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "info-tag" },
                      vue.toDisplayString(job.experience || "经验不限"),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "info-tag" },
                      vue.toDisplayString(job.education || "学历不限"),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "job-tags" }, [
                    (vue.openBlock(true), vue.createElementBlock(
                      vue.Fragment,
                      null,
                      vue.renderList($options.parseTags(job.tags), (tag, i) => {
                        return vue.openBlock(), vue.createElementBlock(
                          "text",
                          {
                            key: i,
                            class: "tag"
                          },
                          vue.toDisplayString(tag),
                          1
                          /* TEXT */
                        );
                      }),
                      128
                      /* KEYED_FRAGMENT */
                    ))
                  ])
                ], 8, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : vue.createCommentVNode("v-if", true),
          $data.loading ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "loading-state"
          }, [
            vue.createElementVNode("text", null, "加载中...")
          ])) : $data.jobList.length === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 2,
            class: "empty-state"
          }, [
            vue.createElementVNode("text", { class: "empty-icon" }, "📭"),
            vue.createElementVNode("text", { class: "empty-text" }, "暂无岗位数据"),
            vue.createElementVNode("text", { class: "empty-desc" }, "请确保后端服务已启动")
          ])) : !$data.hasMore ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 3,
            class: "no-more-state"
          }, [
            vue.createElementVNode("text", null, "没有更多数据了")
          ])) : vue.createCommentVNode("v-if", true)
        ],
        32
        /* NEED_HYDRATION */
      )
    ]);
  }
  const PagesJobExploreJobExplore = /* @__PURE__ */ _export_sfc(_sfc_main$d, [["render", _sfc_render$c], ["__scopeId", "data-v-71ef44db"], ["__file", "D:/计算机编程/A13/app端/pages/job-explore/job-explore.vue"]]);
  const _sfc_main$c = {
    data() {
      return {
        userName: "同学",
        userRole: "学生",
        initial: "同",
        currentStep: 1,
        resumeAnalysis: null,
        steps: [
          { icon: "📝", text: "简历分析" },
          { icon: "📊", text: "能力评估" },
          { icon: "🎯", text: "岗位匹配" },
          { icon: "🚀", text: "职业规划" }
        ]
      };
    },
    onLoad() {
      var _a, _b;
      const userStore = ((_b = (_a = this.$store) == null ? void 0 : _a.state) == null ? void 0 : _b.user) || {};
      const user = userStore.user || {};
      if (user) {
        this.userName = user.username || user.name || "同学";
        this.userRole = user.role === "admin" ? "管理员" : "学生";
        this.initial = this.userName.charAt(0).toUpperCase();
      }
      this.loadResumeAnalysis();
    },
    onShow() {
      this.loadResumeAnalysis();
    },
    methods: {
      uploadResume() {
        uni.navigateTo({
          url: "/pages/upload-resume/upload-resume"
        });
      },
      editProfile() {
        uni.navigateTo({
          url: "/pages/edit-profile/edit-profile"
        });
      },
      loadResumeAnalysis() {
        var _a, _b, _c;
        try {
          const userStore = ((_b = (_a = this.$store) == null ? void 0 : _a.state) == null ? void 0 : _b.user) || {};
          const userId = ((_c = userStore.user) == null ? void 0 : _c.id) || "unknown";
          const storageKey = `resume_analysis_${userId}`;
          formatAppLog("log", "at pages/student-profile/student-profile.vue:315", `加载用户${userId}的简历分析数据，存储键: ${storageKey}`);
          const analysisData = uni.getStorageSync(storageKey);
          formatAppLog("log", "at pages/student-profile/student-profile.vue:318", "从本地存储加载的数据结构:", Object.keys(analysisData || {}));
          if (analysisData) {
            this.resumeAnalysis = analysisData;
            formatAppLog("log", "at pages/student-profile/student-profile.vue:322", "设置到页面的简历分析结果:", Object.keys(this.resumeAnalysis || {}));
            if (this.resumeAnalysis) {
              this.currentStep = 2;
              formatAppLog("log", "at pages/student-profile/student-profile.vue:327", "进度步骤已更新为:", this.currentStep);
            }
          } else {
            formatAppLog("log", "at pages/student-profile/student-profile.vue:330", `用户${userId}没有简历分析数据，显示默认状态`);
            this.resumeAnalysis = {
              basic_info: { 状态: "请先上传简历进行分析" },
              ability_assessment: {},
              career_tendency: {},
              match_analysis: {}
            };
          }
        } catch (err) {
          formatAppLog("error", "at pages/student-profile/student-profile.vue:339", "加载简历分析结果失败:", err);
          this.resumeAnalysis = {
            basic_info: { 状态: "数据加载失败" },
            ability_assessment: {},
            career_tendency: {},
            match_analysis: {}
          };
        }
      }
    }
  };
  function _sfc_render$b(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "profile-header" }, [
        vue.createElementVNode("view", { class: "avatar-section" }, [
          vue.createElementVNode("view", { class: "avatar" }, [
            vue.createElementVNode(
              "text",
              { class: "avatar-text" },
              vue.toDisplayString($data.initial),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "user-info" }, [
            vue.createElementVNode(
              "text",
              { class: "user-name" },
              vue.toDisplayString($data.userName),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "user-role" },
              vue.toDisplayString($data.userRole),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "progress-section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "画像进度"),
        vue.createElementVNode("view", { class: "progress-steps" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.steps, (step, index) => {
              return vue.openBlock(), vue.createElementBlock(
                "view",
                {
                  key: index,
                  class: vue.normalizeClass(["step-item", { completed: index <= $data.currentStep, active: index === $data.currentStep }])
                },
                [
                  vue.createElementVNode(
                    "view",
                    { class: "step-icon" },
                    vue.toDisplayString(step.icon),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "step-text" },
                    vue.toDisplayString(step.text),
                    1
                    /* TEXT */
                  )
                ],
                2
                /* CLASS */
              );
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 个人画像概览 "),
      $data.resumeAnalysis && $data.resumeAnalysis.basic_info ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "profile-overview"
      }, [
        vue.createElementVNode("view", { class: "section-title" }, "个人画像概览"),
        vue.createElementVNode("view", { class: "overview-grid" }, [
          $data.resumeAnalysis.basic_info.姓名 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "overview-card"
          }, [
            vue.createElementVNode("text", { class: "overview-icon" }, "👤"),
            vue.createElementVNode("text", { class: "overview-label" }, "姓名"),
            vue.createElementVNode(
              "text",
              { class: "overview-value" },
              vue.toDisplayString($data.resumeAnalysis.basic_info.姓名),
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true),
          $data.resumeAnalysis.basic_info.学历 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "overview-card"
          }, [
            vue.createElementVNode("text", { class: "overview-icon" }, "🎓"),
            vue.createElementVNode("text", { class: "overview-label" }, "学历"),
            vue.createElementVNode(
              "text",
              { class: "overview-value" },
              vue.toDisplayString($data.resumeAnalysis.basic_info.学历),
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true),
          $data.resumeAnalysis.basic_info.专业 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 2,
            class: "overview-card"
          }, [
            vue.createElementVNode("text", { class: "overview-icon" }, "📚"),
            vue.createElementVNode("text", { class: "overview-label" }, "专业"),
            vue.createElementVNode(
              "text",
              { class: "overview-value" },
              vue.toDisplayString($data.resumeAnalysis.basic_info.专业),
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true),
          $data.resumeAnalysis.basic_info.工作经验 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 3,
            class: "overview-card"
          }, [
            vue.createElementVNode("text", { class: "overview-icon" }, "💼"),
            vue.createElementVNode("text", { class: "overview-label" }, "经验"),
            vue.createElementVNode(
              "text",
              { class: "overview-value" },
              vue.toDisplayString($data.resumeAnalysis.basic_info.工作经验),
              1
              /* TEXT */
            )
          ])) : vue.createCommentVNode("v-if", true)
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 能力评估卡片 "),
      $data.resumeAnalysis && $data.resumeAnalysis.ability_assessment ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "ability-cards"
      }, [
        vue.createElementVNode("view", { class: "section-title" }, "能力评估"),
        vue.createElementVNode("view", { class: "cards-container" }, [
          $data.resumeAnalysis.ability_assessment.技术能力 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "ability-card"
          }, [
            vue.createElementVNode("view", { class: "ability-header" }, [
              vue.createElementVNode("text", { class: "ability-name" }, "技术能力"),
              $data.resumeAnalysis.ability_assessment.技术能力.score ? (vue.openBlock(), vue.createElementBlock(
                "text",
                {
                  key: 0,
                  class: "ability-score"
                },
                vue.toDisplayString($data.resumeAnalysis.ability_assessment.技术能力.score) + "分",
                1
                /* TEXT */
              )) : vue.createCommentVNode("v-if", true)
            ]),
            $data.resumeAnalysis.ability_assessment.技术能力.score ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "ability-progress"
            }, [
              vue.createElementVNode("view", { class: "progress-bar" }, [
                vue.createElementVNode(
                  "view",
                  {
                    class: "progress-fill",
                    style: vue.normalizeStyle({ width: $data.resumeAnalysis.ability_assessment.技术能力.score + "%" })
                  },
                  null,
                  4
                  /* STYLE */
                )
              ])
            ])) : vue.createCommentVNode("v-if", true),
            $data.resumeAnalysis.ability_assessment.技术能力.description ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 1,
                class: "ability-desc"
              },
              vue.toDisplayString($data.resumeAnalysis.ability_assessment.技术能力.description),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ])) : vue.createCommentVNode("v-if", true),
          vue.createCommentVNode(" 显示可视化数据中的进度条 "),
          $data.resumeAnalysis.visualization_data && $data.resumeAnalysis.visualization_data.progress_bars ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 1,
            class: "ability-card"
          }, [
            vue.createElementVNode("view", { class: "ability-header" }, [
              vue.createElementVNode("text", { class: "ability-name" }, "技能掌握度")
            ]),
            vue.createElementVNode("view", { class: "skill-progress-list" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.resumeAnalysis.visualization_data.progress_bars, (skill, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "skill-progress-item",
                    key: index
                  }, [
                    vue.createElementVNode("view", { class: "skill-header" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "skill-name" },
                        vue.toDisplayString(skill.name),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "skill-percent" },
                        vue.toDisplayString(skill.progress) + "%",
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "skill-progress" }, [
                      vue.createElementVNode("view", { class: "progress-bar" }, [
                        vue.createElementVNode(
                          "view",
                          {
                            class: "progress-fill",
                            style: vue.normalizeStyle({ width: skill.progress + "%" })
                          },
                          null,
                          4
                          /* STYLE */
                        )
                      ])
                    ])
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])) : vue.createCommentVNode("v-if", true)
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 职业倾向分析 "),
      $data.resumeAnalysis && $data.resumeAnalysis.career_tendency ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "career-section"
      }, [
        vue.createElementVNode("view", { class: "section-title" }, "职业倾向分析"),
        vue.createElementVNode("view", { class: "career-content" }, [
          vue.createElementVNode("view", { class: "career-item" }, [
            vue.createElementVNode("view", { class: "career-header" }, [
              vue.createElementVNode("text", { class: "career-label" }, "兴趣领域")
            ]),
            $data.resumeAnalysis.career_tendency.兴趣领域 ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "career-desc"
              },
              vue.toDisplayString($data.resumeAnalysis.career_tendency.兴趣领域),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { class: "career-item" }, [
            vue.createElementVNode("view", { class: "career-header" }, [
              vue.createElementVNode("text", { class: "career-label" }, "职业目标")
            ]),
            $data.resumeAnalysis.career_tendency.职业目标 ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "career-desc"
              },
              vue.toDisplayString($data.resumeAnalysis.career_tendency.职业目标),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createElementVNode("view", { class: "career-item" }, [
            vue.createElementVNode("view", { class: "career-header" }, [
              vue.createElementVNode("text", { class: "career-label" }, "期望岗位")
            ]),
            $data.resumeAnalysis.career_tendency.期望岗位 ? (vue.openBlock(), vue.createElementBlock(
              "text",
              {
                key: 0,
                class: "career-desc"
              },
              vue.toDisplayString($data.resumeAnalysis.career_tendency.期望岗位),
              1
              /* TEXT */
            )) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createCommentVNode(" 匹配岗位列表 "),
          $data.resumeAnalysis.career_tendency.匹配岗位 && $data.resumeAnalysis.career_tendency.匹配岗位.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "career-item"
          }, [
            vue.createElementVNode("view", { class: "career-header" }, [
              vue.createElementVNode("text", { class: "career-label" }, "推荐岗位")
            ]),
            vue.createElementVNode("view", { class: "match-job-list" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.resumeAnalysis.career_tendency.匹配岗位, (job, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "match-job-item",
                    key: index
                  }, [
                    vue.createElementVNode("view", { class: "job-header" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "job-name" },
                        vue.toDisplayString(job.name),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "job-score" },
                        vue.toDisplayString(job.match_score) + "分",
                        1
                        /* TEXT */
                      )
                    ]),
                    job.reason ? (vue.openBlock(), vue.createElementBlock(
                      "text",
                      {
                        key: 0,
                        class: "job-reason"
                      },
                      vue.toDisplayString(job.reason),
                      1
                      /* TEXT */
                    )) : vue.createCommentVNode("v-if", true)
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])) : vue.createCommentVNode("v-if", true)
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 岗位匹配度 "),
      $data.resumeAnalysis && $data.resumeAnalysis.match_analysis ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 3,
        class: "match-section"
      }, [
        vue.createElementVNode("view", { class: "section-title" }, "岗位匹配度"),
        vue.createElementVNode("view", { class: "match-list" }, [
          vue.createElementVNode("view", { class: "match-item" }, [
            vue.createElementVNode("view", { class: "match-header" }, [
              vue.createElementVNode("text", { class: "match-position" }, "总体匹配度"),
              $data.resumeAnalysis.match_analysis.总体匹配度 ? (vue.openBlock(), vue.createElementBlock(
                "text",
                {
                  key: 0,
                  class: "match-percent"
                },
                vue.toDisplayString($data.resumeAnalysis.match_analysis.总体匹配度) + "分",
                1
                /* TEXT */
              )) : vue.createCommentVNode("v-if", true)
            ]),
            $data.resumeAnalysis.match_analysis.优势分析 ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "match-reason"
            }, [
              vue.createElementVNode(
                "text",
                { class: "reason-text" },
                vue.toDisplayString($data.resumeAnalysis.match_analysis.优势分析),
                1
                /* TEXT */
              )
            ])) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createCommentVNode(" 技能匹配度 "),
          $data.resumeAnalysis.match_analysis.技能匹配 && $data.resumeAnalysis.match_analysis.技能匹配.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "match-item"
          }, [
            vue.createElementVNode("view", { class: "match-header" }, [
              vue.createElementVNode("text", { class: "match-position" }, "技能匹配度")
            ]),
            vue.createElementVNode("view", { class: "skill-match-list" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.resumeAnalysis.match_analysis.技能匹配, (skill, index) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "skill-match-item",
                    key: index
                  }, [
                    vue.createElementVNode("view", { class: "skill-match-header" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "skill-name" },
                        vue.toDisplayString(skill.技能),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "skill-match-percent" },
                        vue.toDisplayString(skill.匹配度) + "%",
                        1
                        /* TEXT */
                      )
                    ]),
                    skill.重要性 ? (vue.openBlock(), vue.createElementBlock(
                      "text",
                      {
                        key: 0,
                        class: "skill-importance"
                      },
                      "重要性: " + vue.toDisplayString(skill.重要性),
                      1
                      /* TEXT */
                    )) : vue.createCommentVNode("v-if", true)
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])) : vue.createCommentVNode("v-if", true)
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 职业规划建议 "),
      $data.resumeAnalysis && $data.resumeAnalysis.career_planning ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 4,
        class: "career-plan-section"
      }, [
        vue.createElementVNode("view", { class: "section-title" }, "职业规划建议"),
        vue.createElementVNode("view", { class: "plan-timeline" }, [
          vue.createElementVNode("view", { class: "plan-stage" }, [
            vue.createElementVNode("view", { class: "stage-header" }, [
              vue.createElementVNode("text", { class: "stage-title" }, "短期目标 (0-1年)")
            ]),
            vue.createElementVNode("view", { class: "stage-content" }, [
              $data.resumeAnalysis.career_planning.短期目标 ? (vue.openBlock(), vue.createElementBlock(
                "text",
                {
                  key: 0,
                  class: "stage-goal"
                },
                vue.toDisplayString($data.resumeAnalysis.career_planning.短期目标),
                1
                /* TEXT */
              )) : vue.createCommentVNode("v-if", true)
            ])
          ]),
          vue.createElementVNode("view", { class: "plan-stage" }, [
            vue.createElementVNode("view", { class: "stage-header" }, [
              vue.createElementVNode("text", { class: "stage-title" }, "中期目标 (1-3年)")
            ]),
            vue.createElementVNode("view", { class: "stage-content" }, [
              $data.resumeAnalysis.career_planning.中期目标 ? (vue.openBlock(), vue.createElementBlock(
                "text",
                {
                  key: 0,
                  class: "stage-goal"
                },
                vue.toDisplayString($data.resumeAnalysis.career_planning.中期目标),
                1
                /* TEXT */
              )) : vue.createCommentVNode("v-if", true)
            ])
          ]),
          vue.createElementVNode("view", { class: "plan-stage" }, [
            vue.createElementVNode("view", { class: "stage-header" }, [
              vue.createElementVNode("text", { class: "stage-title" }, "长期目标 (3-5年)")
            ]),
            vue.createElementVNode("view", { class: "stage-content" }, [
              $data.resumeAnalysis.career_planning.长期目标 ? (vue.openBlock(), vue.createElementBlock(
                "text",
                {
                  key: 0,
                  class: "stage-goal"
                },
                vue.toDisplayString($data.resumeAnalysis.career_planning.长期目标),
                1
                /* TEXT */
              )) : vue.createCommentVNode("v-if", true)
            ])
          ]),
          vue.createCommentVNode(" 行动建议 "),
          vue.createElementVNode("view", { class: "plan-stage" }, [
            vue.createElementVNode("view", { class: "stage-header" }, [
              vue.createElementVNode("text", { class: "stage-title" }, "行动建议")
            ]),
            vue.createElementVNode("view", { class: "stage-content" }, [
              $data.resumeAnalysis.career_planning.具体行动建议 ? (vue.openBlock(), vue.createElementBlock(
                "text",
                {
                  key: 0,
                  class: "stage-action"
                },
                vue.toDisplayString($data.resumeAnalysis.career_planning.具体行动建议),
                1
                /* TEXT */
              )) : vue.createCommentVNode("v-if", true)
            ])
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 能力雷达图 "),
      $data.resumeAnalysis && $data.resumeAnalysis.ability_radar ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 5,
        class: "ability-section"
      }, [
        vue.createElementVNode("view", { class: "section-title" }, "能力雷达图"),
        vue.createElementVNode("view", { class: "radar-container" }, [
          vue.createElementVNode("view", { class: "radar-placeholder" }, [
            vue.createElementVNode("text", { class: "placeholder-icon" }, "📊"),
            vue.createElementVNode("text", { class: "placeholder-text" }, "能力雷达图开发中")
          ]),
          $data.resumeAnalysis.ability_radar ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "radar-legend"
          }, [
            vue.createElementVNode("text", { class: "legend-title" }, "能力分布"),
            vue.createElementVNode("view", { class: "legend-items" }, [
              (vue.openBlock(true), vue.createElementBlock(
                vue.Fragment,
                null,
                vue.renderList($data.resumeAnalysis.ability_radar, (score, ability) => {
                  return vue.openBlock(), vue.createElementBlock("view", {
                    class: "legend-item",
                    key: ability
                  }, [
                    vue.createElementVNode("view", { class: "legend-color" }),
                    vue.createElementVNode(
                      "text",
                      { class: "legend-label" },
                      vue.toDisplayString(ability),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "legend-score" },
                      vue.toDisplayString(score) + "分",
                      1
                      /* TEXT */
                    )
                  ]);
                }),
                128
                /* KEYED_FRAGMENT */
              ))
            ])
          ])) : vue.createCommentVNode("v-if", true)
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("view", { class: "action-section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "快捷操作"),
        vue.createElementVNode("view", { class: "action-list" }, [
          vue.createElementVNode("view", {
            class: "action-card",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.uploadResume && $options.uploadResume(...args))
          }, [
            vue.createElementVNode("text", { class: "action-icon" }, "📄"),
            vue.createElementVNode("view", { class: "action-content" }, [
              vue.createElementVNode("text", { class: "action-title" }, "上传简历"),
              vue.createElementVNode("text", { class: "action-desc" }, "AI智能分析你的简历")
            ]),
            vue.createElementVNode("text", { class: "action-arrow" }, "›")
          ]),
          vue.createElementVNode("view", {
            class: "action-card",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.editProfile && $options.editProfile(...args))
          }, [
            vue.createElementVNode("text", { class: "action-icon" }, "✏️"),
            vue.createElementVNode("view", { class: "action-content" }, [
              vue.createElementVNode("text", { class: "action-title" }, "编辑画像"),
              vue.createElementVNode("text", { class: "action-desc" }, "完善你的个人信息")
            ]),
            vue.createElementVNode("text", { class: "action-arrow" }, "›")
          ])
        ])
      ])
    ]);
  }
  const PagesStudentProfileStudentProfile = /* @__PURE__ */ _export_sfc(_sfc_main$c, [["render", _sfc_render$b], ["__scopeId", "data-v-c6fc90ce"], ["__file", "D:/计算机编程/A13/app端/pages/student-profile/student-profile.vue"]]);
  const _sfc_main$b = {
    data() {
      return {
        userName: "同学",
        userRole: "学生",
        initial: "同"
      };
    },
    onLoad() {
      const user = useUserStore.state.user;
      if (user) {
        this.userName = user.username || user.name || "同学";
        this.userRole = user.role === "admin" ? "管理员" : "学生";
        this.initial = this.userName.charAt(0).toUpperCase();
      }
    },
    methods: {
      viewMyProfile() {
        uni.switchTab({
          url: "/pages/student-profile/student-profile"
        });
      },
      viewMyApplications() {
        uni.navigateTo({
          url: "/pages/my-applications/my-applications"
        });
      },
      viewMyFavorites() {
        uni.navigateTo({
          url: "/pages/my-favorites/my-favorites"
        });
      },
      editPersonalInfo() {
        uni.navigateTo({
          url: "/pages/edit-profile/edit-profile"
        });
      },
      editSettings() {
        uni.showToast({
          title: "功能开发中",
          icon: "none"
        });
      },
      viewAbout() {
        uni.showModal({
          title: "关于我们",
          content: "基于AI的大学生职业规划智能体 v1.0.0",
          showCancel: false
        });
      },
      contactSupport() {
        uni.showToast({
          title: "功能开发中",
          icon: "none"
        });
      },
      handleLogout() {
        uni.showModal({
          title: "提示",
          content: "确定要退出登录吗？",
          success: (res) => {
            if (res.confirm) {
              useUserStore.logout();
            }
          }
        });
      }
    }
  };
  function _sfc_render$a(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "user-header" }, [
        vue.createElementVNode("view", { class: "user-info" }, [
          vue.createElementVNode("view", { class: "avatar" }, [
            vue.createElementVNode(
              "text",
              { class: "avatar-text" },
              vue.toDisplayString($data.initial),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "info" }, [
            vue.createElementVNode(
              "text",
              { class: "username" },
              vue.toDisplayString($data.userName),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "role" },
              vue.toDisplayString($data.userRole),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "menu-section" }, [
        vue.createElementVNode("view", {
          class: "menu-item",
          onClick: _cache[0] || (_cache[0] = (...args) => $options.viewMyProfile && $options.viewMyProfile(...args))
        }, [
          vue.createElementVNode("text", { class: "menu-icon" }, "👤"),
          vue.createElementVNode("text", { class: "menu-text" }, "我的画像"),
          vue.createElementVNode("text", { class: "menu-arrow" }, "›")
        ]),
        vue.createElementVNode("view", {
          class: "menu-item",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.viewMyApplications && $options.viewMyApplications(...args))
        }, [
          vue.createElementVNode("text", { class: "menu-icon" }, "📋"),
          vue.createElementVNode("text", { class: "menu-text" }, "我的申请"),
          vue.createElementVNode("text", { class: "menu-arrow" }, "›")
        ]),
        vue.createElementVNode("view", {
          class: "menu-item",
          onClick: _cache[2] || (_cache[2] = (...args) => $options.viewMyFavorites && $options.viewMyFavorites(...args))
        }, [
          vue.createElementVNode("text", { class: "menu-icon" }, "⭐"),
          vue.createElementVNode("text", { class: "menu-text" }, "我的收藏"),
          vue.createElementVNode("text", { class: "menu-arrow" }, "›")
        ])
      ]),
      vue.createElementVNode("view", { class: "menu-section" }, [
        vue.createElementVNode("view", {
          class: "menu-item",
          onClick: _cache[3] || (_cache[3] = (...args) => $options.editPersonalInfo && $options.editPersonalInfo(...args))
        }, [
          vue.createElementVNode("text", { class: "menu-icon" }, "✏️"),
          vue.createElementVNode("text", { class: "menu-text" }, "编辑个人信息"),
          vue.createElementVNode("text", { class: "menu-arrow" }, "›")
        ]),
        vue.createElementVNode("view", {
          class: "menu-item",
          onClick: _cache[4] || (_cache[4] = (...args) => $options.editSettings && $options.editSettings(...args))
        }, [
          vue.createElementVNode("text", { class: "menu-icon" }, "⚙️"),
          vue.createElementVNode("text", { class: "menu-text" }, "设置"),
          vue.createElementVNode("text", { class: "menu-arrow" }, "›")
        ]),
        vue.createElementVNode("view", {
          class: "menu-item",
          onClick: _cache[5] || (_cache[5] = (...args) => $options.viewAbout && $options.viewAbout(...args))
        }, [
          vue.createElementVNode("text", { class: "menu-icon" }, "ℹ️"),
          vue.createElementVNode("text", { class: "menu-text" }, "关于我们"),
          vue.createElementVNode("text", { class: "menu-arrow" }, "›")
        ]),
        vue.createElementVNode("view", {
          class: "menu-item",
          onClick: _cache[6] || (_cache[6] = (...args) => $options.contactSupport && $options.contactSupport(...args))
        }, [
          vue.createElementVNode("text", { class: "menu-icon" }, "💬"),
          vue.createElementVNode("text", { class: "menu-text" }, "联系客服"),
          vue.createElementVNode("text", { class: "menu-arrow" }, "›")
        ])
      ]),
      vue.createElementVNode("view", { class: "logout-section" }, [
        vue.createElementVNode("button", {
          class: "logout-btn",
          onClick: _cache[7] || (_cache[7] = (...args) => $options.handleLogout && $options.handleLogout(...args))
        }, "退出登录")
      ])
    ]);
  }
  const PagesUserCenterUserCenter = /* @__PURE__ */ _export_sfc(_sfc_main$b, [["render", _sfc_render$a], ["__scopeId", "data-v-5df2242c"], ["__file", "D:/计算机编程/A13/app端/pages/user-center/user-center.vue"]]);
  const _sfc_main$a = {
    data() {
      return {
        jobId: null,
        job: {
          title: "前端开发工程师",
          salary: "15-25K",
          company: "字节跳动",
          location: "北京",
          experience: "3-5年",
          education: "本科",
          tags: [],
          responsibilities: "",
          requirements: "",
          benefits: [],
          applied: false
        },
        isFavorite: false,
        appliedJobIds: /* @__PURE__ */ new Set()
      };
    },
    onLoad(options) {
      if (options.id) {
        this.jobId = options.id;
        this.loadJobDetail();
        this.loadApplications();
      }
    },
    methods: {
      parseTags(tagsStr) {
        if (!tagsStr)
          return [];
        if (Array.isArray(tagsStr))
          return tagsStr;
        return tagsStr.split(",").filter((t) => t.trim());
      },
      splitText(text) {
        if (!text)
          return [];
        return text.replace(/<br\s*\/?>/gi, "\n").replace(/<br>/gi, "\n").split("\n").filter((line) => line.trim());
      },
      async loadApplications() {
        try {
          const response = await jobApi.getApplications();
          formatAppLog("log", "at pages/job-detail/job-detail.vue:117", "申请列表响应:", response);
          if (response && response.data && Array.isArray(response.data)) {
            this.appliedJobIds = new Set(response.data.map((app) => app.job_id || app.jobId));
            this.checkIfApplied();
          }
        } catch (err) {
          formatAppLog("error", "at pages/job-detail/job-detail.vue:123", "获取申请列表失败:", err);
        }
      },
      checkIfApplied() {
        if (this.jobId && this.appliedJobIds.has(Number(this.jobId))) {
          this.job.applied = true;
        }
      },
      async loadJobDetail() {
        try {
          uni.showLoading({ title: "加载中..." });
          const response = await jobApi.getJobDetail(this.jobId);
          formatAppLog("log", "at pages/job-detail/job-detail.vue:137", "岗位详情响应:", response);
          if (response && response.data) {
            this.job = response.data;
            this.job.applied = false;
            if (!this.job.tags) {
              this.job.tags = [];
            }
            if (!this.job.benefits) {
              this.job.benefits = [];
            }
            this.checkIfApplied();
          }
        } catch (err) {
          formatAppLog("error", "at pages/job-detail/job-detail.vue:150", err);
          uni.showToast({
            title: "加载失败",
            icon: "none"
          });
        } finally {
          uni.hideLoading();
        }
      },
      async toggleFavorite() {
        try {
          if (this.isFavorite) {
            await jobApi.removeFavorite(this.jobId);
            this.isFavorite = false;
            uni.showToast({ title: "取消收藏", icon: "success" });
          } else {
            await jobApi.addFavorite(this.jobId);
            this.isFavorite = true;
            uni.showToast({ title: "收藏成功", icon: "success" });
          }
        } catch (err) {
          formatAppLog("error", "at pages/job-detail/job-detail.vue:172", err);
          uni.showToast({ title: "操作失败", icon: "none" });
        }
      },
      async applyJob() {
        var _a;
        if (this.job.applied) {
          uni.showToast({
            title: "岗位已申请",
            icon: "none"
          });
          return;
        }
        try {
          uni.showLoading({ title: "申请中..." });
          await jobApi.applyJob(this.jobId);
          this.job.applied = true;
          this.appliedJobIds.add(Number(this.jobId));
          uni.showToast({
            title: "申请成功",
            icon: "success"
          });
        } catch (err) {
          formatAppLog("error", "at pages/job-detail/job-detail.vue:196", err);
          uni.showToast({
            title: (err == null ? void 0 : err.message) || ((_a = err == null ? void 0 : err.data) == null ? void 0 : _a.detail) || "申请失败",
            icon: "none"
          });
        } finally {
          uni.hideLoading();
        }
      }
    }
  };
  function _sfc_render$9(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "job-header" }, [
        vue.createElementVNode("view", { class: "job-info" }, [
          vue.createElementVNode(
            "text",
            { class: "job-title" },
            vue.toDisplayString($data.job.title),
            1
            /* TEXT */
          ),
          vue.createElementVNode("view", { class: "job-tags" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($options.parseTags($data.job.tags), (tag, index) => {
                return vue.openBlock(), vue.createElementBlock(
                  "text",
                  {
                    key: index,
                    class: "job-tag"
                  },
                  vue.toDisplayString(tag),
                  1
                  /* TEXT */
                );
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        vue.createElementVNode(
          "view",
          { class: "job-salary" },
          vue.toDisplayString($data.job.salary),
          1
          /* TEXT */
        )
      ]),
      vue.createElementVNode("view", { class: "section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "岗位信息"),
        vue.createElementVNode("view", { class: "info-grid" }, [
          vue.createElementVNode("view", { class: "info-item" }, [
            vue.createElementVNode("text", { class: "info-label" }, "公司"),
            vue.createElementVNode(
              "text",
              { class: "info-value" },
              vue.toDisplayString($data.job.company),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "info-item" }, [
            vue.createElementVNode("text", { class: "info-label" }, "地点"),
            vue.createElementVNode(
              "text",
              { class: "info-value" },
              vue.toDisplayString($data.job.location),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "info-item" }, [
            vue.createElementVNode("text", { class: "info-label" }, "经验"),
            vue.createElementVNode(
              "text",
              { class: "info-value" },
              vue.toDisplayString($data.job.experience),
              1
              /* TEXT */
            )
          ]),
          vue.createElementVNode("view", { class: "info-item" }, [
            vue.createElementVNode("text", { class: "info-label" }, "学历"),
            vue.createElementVNode(
              "text",
              { class: "info-value" },
              vue.toDisplayString($data.job.education),
              1
              /* TEXT */
            )
          ])
        ])
      ]),
      vue.createElementVNode("view", { class: "section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "岗位详情"),
        vue.createElementVNode("view", { class: "content-box" }, [
          $data.job.requirements || $data.job.description ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 0,
            class: "content-text"
          }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($options.splitText($data.job.requirements || $data.job.description), (line, index) => {
                return vue.openBlock(), vue.createElementBlock("text", { key: index }, [
                  vue.createTextVNode(
                    vue.toDisplayString(line) + " ",
                    1
                    /* TEXT */
                  ),
                  index < $options.splitText($data.job.requirements || $data.job.description).length - 1 ? (vue.openBlock(), vue.createElementBlock("text", { key: 0 }, "\\n")) : vue.createCommentVNode("v-if", true)
                ]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])) : (vue.openBlock(), vue.createElementBlock("text", {
            key: 1,
            class: "content-placeholder"
          }, "暂无信息"))
        ])
      ]),
      $data.job.benefits && $data.job.benefits.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "section"
      }, [
        vue.createElementVNode("view", { class: "section-title" }, "福利待遇"),
        vue.createElementVNode("view", { class: "benefits-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.job.benefits, (benefit, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: index,
                class: "benefit-item"
              }, [
                vue.createElementVNode("text", { class: "benefit-icon" }, "🎁"),
                vue.createElementVNode(
                  "text",
                  { class: "benefit-text" },
                  vue.toDisplayString(benefit),
                  1
                  /* TEXT */
                )
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createElementVNode("view", { class: "bottom-actions" }, [
        vue.createElementVNode(
          "button",
          {
            class: "btn btn-secondary",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.toggleFavorite && $options.toggleFavorite(...args))
          },
          vue.toDisplayString($data.isFavorite ? "已收藏" : "收藏"),
          1
          /* TEXT */
        ),
        vue.createElementVNode(
          "button",
          {
            class: "btn btn-primary",
            onClick: _cache[1] || (_cache[1] = (...args) => $options.applyJob && $options.applyJob(...args))
          },
          vue.toDisplayString($data.job.applied ? "已申请" : "立即申请"),
          1
          /* TEXT */
        )
      ])
    ]);
  }
  const PagesJobDetailJobDetail = /* @__PURE__ */ _export_sfc(_sfc_main$a, [["render", _sfc_render$9], ["__scopeId", "data-v-2bde8e2a"], ["__file", "D:/计算机编程/A13/app端/pages/job-detail/job-detail.vue"]]);
  const PDFExtractor = {
    async extractTextFromPDF(file) {
      formatAppLog("log", "at utils/resumeExtractor.js:9", "PDF文件提取（模拟）:", file.name);
      return `模拟PDF简历内容 - ${file.name}

个人信息
姓名：张三
学历：本科
专业：计算机科学与技术

工作经历
2020-2023 某科技公司 前端开发工程师
- 负责Vue.js项目开发
- 参与移动端应用开发

技能
- JavaScript/TypeScript
- Vue.js/React
- Node.js
- 数据库设计`;
    }
  };
  const DocxExtractor = {
    async extractTextFromDocx(file) {
      formatAppLog("log", "at utils/resumeExtractor.js:35", "Word文件提取（模拟）:", file.name);
      return `模拟Word简历内容 - ${file.name}

个人简介
姓名：李四
学历：硕士
专业：软件工程

项目经验
2021-2023 电商平台项目
- 负责后端API开发
- 数据库设计与优化

专业技能
- Java/Spring Boot
- MySQL/Redis
- 微服务架构`;
    }
  };
  const ImageExtractor = {
    async extractTextFromImage(file) {
      formatAppLog("log", "at utils/resumeExtractor.js:59", "图片文件提取（模拟）:", file.name);
      return `模拟图片简历内容 - ${file.name}

基本信息
姓名：王五
学历：博士
专业：人工智能

研究成果
- 发表论文3篇
- 参与国家级项目

技术能力
- Python/机器学习
- TensorFlow/PyTorch
- 数据分析`;
    }
  };
  const ResumeExtractor = {
    /**
     * 从文件提取文本内容
     * @param {File} file - 文件对象
     * @returns {Promise<string>} - 提取的文本内容
     */
    async extractTextFromFile(file) {
      if (!file) {
        throw new Error("文件不能为空");
      }
      const fileType = this.getFileType(file.name);
      try {
        let text = "";
        switch (fileType) {
          case "pdf":
            text = await PDFExtractor.extractTextFromPDF(file);
            break;
          case "docx":
          case "doc":
            text = await DocxExtractor.extractTextFromDocx(file);
            break;
          case "image":
            text = await ImageExtractor.extractTextFromImage(file);
            break;
          default:
            throw new Error(`不支持的文件格式: ${fileType}`);
        }
        return this.cleanResumeText(text);
      } catch (error) {
        formatAppLog("error", "at utils/resumeExtractor.js:113", "简历文本提取失败:", error);
        throw new Error(`简历解析失败: ${error.message}`);
      }
    },
    /**
     * 获取文件类型
     * @param {string} fileName - 文件名
     * @returns {string} - 文件类型
     */
    getFileType(fileName) {
      const ext = fileName.toLowerCase().split(".").pop();
      if (ext === "pdf")
        return "pdf";
      if (ext === "docx" || ext === "doc")
        return "docx";
      if (["jpg", "jpeg", "png", "gif", "bmp"].includes(ext))
        return "image";
      return "unknown";
    },
    /**
     * 清理和格式化简历文本
     * @param {string} text - 原始文本
     * @returns {string} - 清理后的文本
     */
    cleanResumeText(text) {
      if (!text)
        return "";
      let cleaned = text.replace(/\s+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
      if (cleaned.length < 50) {
        throw new Error("简历内容过短，请检查文件内容");
      }
      return cleaned;
    },
    /**
     * 验证简历文本是否有效
     * @param {string} text - 简历文本
     * @returns {boolean} - 是否有效
     */
    validateResumeText(text) {
      if (!text || text.length < 50)
        return false;
      const keywords = ["姓名", "学历", "专业", "工作", "项目", "技能", "经验"];
      const hasKeywords = keywords.some((keyword) => text.includes(keyword));
      return hasKeywords;
    }
  };
  const _sfc_main$9 = {
    data() {
      return {
        selectedFile: null,
        isUploading: false
      };
    },
    methods: {
      chooseFile() {
        uni.chooseMessageFile({
          count: 1,
          type: "file",
          extension: [".pdf", ".doc", ".docx"],
          success: (res) => {
            const file = res.tempFiles[0];
            this.selectedFile = file;
          },
          fail: (err) => {
            formatAppLog("error", "at pages/upload-resume/upload-resume.vue:77", "选择文件失败:", err);
            uni.showToast({
              title: "选择文件失败",
              icon: "none"
            });
          }
        });
      },
      removeFile() {
        this.selectedFile = null;
      },
      formatFileSize(bytes) {
        if (bytes === 0)
          return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
      },
      async uploadResume() {
        if (!this.selectedFile) {
          uni.showToast({
            title: "请先选择文件",
            icon: "none"
          });
          return;
        }
        this.isUploading = true;
        try {
          uni.showLoading({ title: "提取简历文本..." });
          formatAppLog("log", "at pages/upload-resume/upload-resume.vue:113", "开始提取简历文本内容...");
          const resumeText = await ResumeExtractor.extractTextFromFile(this.selectedFile);
          formatAppLog("log", "at pages/upload-resume/upload-resume.vue:115", "简历文本提取成功，长度:", resumeText.length);
          if (!ResumeExtractor.validateResumeText(resumeText)) {
            throw new Error("简历文本提取失败或内容无效，请检查文件格式和内容");
          }
          const cleanedText = ResumeExtractor.cleanResumeText(resumeText);
          formatAppLog("log", "at pages/upload-resume/upload-resume.vue:124", "简历文本清理完成，长度:", cleanedText.length);
          if (cleanedText.length < 50) {
            throw new Error("简历内容过短，请确保简历包含完整的个人信息、教育经历和工作经验");
          }
          uni.showLoading({ title: "AI分析中..." });
          await this.analyzeResumeWithLangChain(cleanedText, null);
        } catch (err) {
          formatAppLog("error", "at pages/upload-resume/upload-resume.vue:136", "简历上传和分析失败:", err);
          uni.showToast({
            title: err.message || "简历上传失败",
            icon: "none"
          });
          this.isUploading = false;
          uni.hideLoading();
        }
      },
      // 上传文件到服务器
      uploadFileToServer(file) {
        return new Promise((resolve, reject) => {
          const uploadTask = uni.uploadFile({
            url: config.baseUrl + "/student/upload",
            filePath: file.path,
            name: "file",
            success: (res) => {
              const data = JSON.parse(res.data);
              if (res.statusCode === 200 && data.success) {
                resolve(data.data);
              } else {
                reject(new Error(data.msg || "上传失败"));
              }
            },
            fail: (err) => {
              reject(new Error("上传失败: " + err.errMsg));
            }
          });
          uploadTask.onProgressUpdate((res) => {
            formatAppLog("log", "at pages/upload-resume/upload-resume.vue:167", "上传进度", res.progress);
          });
        });
      },
      async analyzeResumeWithLangChain(resumeText, fileUrl) {
        var _a, _b, _c, _d, _e, _f;
        try {
          const userStore = ((_b = (_a = this.$store) == null ? void 0 : _a.state) == null ? void 0 : _b.user) || {};
          const userId = ((_c = userStore.user) == null ? void 0 : _c.id) || "unknown";
          formatAppLog("log", "at pages/upload-resume/upload-resume.vue:178", "开始调用智能体分析简历，用户ID:", userId);
          formatAppLog("log", "at pages/upload-resume/upload-resume.vue:179", "简历文本前100字符:", resumeText.substring(0, 100));
          const userIdInt = parseInt(userId) || 1;
          formatAppLog("log", "at pages/upload-resume/upload-resume.vue:184", "调用智能体API，用户ID:", userIdInt, "原始ID:", userId);
          formatAppLog("log", "at pages/upload-resume/upload-resume.vue:187", "尝试方法1：直接传递对象数据");
          const response = await new Promise((resolve, reject) => {
            uni.request({
              url: config.baseUrl + "/langchain/analyze-resume",
              method: "POST",
              header: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              data: {
                resume_text: resumeText,
                user_id: userIdInt.toString()
              },
              success: (res) => {
                formatAppLog("log", "at pages/upload-resume/upload-resume.vue:201", "方法1响应状态:", res.statusCode);
                formatAppLog("log", "at pages/upload-resume/upload-resume.vue:202", "方法1响应数据:", JSON.stringify(res.data));
                resolve(res);
              },
              fail: (err) => {
                formatAppLog("error", "at pages/upload-resume/upload-resume.vue:206", "方法1调用失败:", err);
                formatAppLog("log", "at pages/upload-resume/upload-resume.vue:209", "尝试方法2：使用JSON格式");
                uni.request({
                  url: config.baseUrl + "/langchain/analyze-resume",
                  method: "POST",
                  header: {
                    "Content-Type": "application/json"
                  },
                  data: {
                    resume_text: resumeText,
                    user_id: userIdInt
                  },
                  success: (res) => {
                    formatAppLog("log", "at pages/upload-resume/upload-resume.vue:221", "方法2响应状态:", res.statusCode);
                    formatAppLog("log", "at pages/upload-resume/upload-resume.vue:222", "方法2响应数据:", JSON.stringify(res.data));
                    resolve(res);
                  },
                  fail: (err2) => {
                    formatAppLog("error", "at pages/upload-resume/upload-resume.vue:226", "方法2调用失败:", err2);
                    reject(new Error(`所有方法都失败: ${err.errMsg}, ${err2.errMsg}`));
                  }
                });
              }
            });
          });
          formatAppLog("log", "at pages/upload-resume/upload-resume.vue:234", "智能体响应状态:", response.statusCode);
          formatAppLog("log", "at pages/upload-resume/upload-resume.vue:235", "智能体响应数据:", JSON.stringify(response.data));
          if (response.statusCode === 200 && response.data.success) {
            const analysisData = response.data.data.analysis;
            formatAppLog("log", "at pages/upload-resume/upload-resume.vue:239", "简历分析成功，数据结构:", Object.keys(analysisData));
            uni.showToast({
              title: "简历分析完成",
              icon: "success"
            });
            this.saveResumeAnalysis(analysisData, userId);
            setTimeout(() => {
              uni.navigateBack();
            }, 1500);
          } else {
            const errorDetail = response.data.detail ? JSON.stringify(response.data.detail) : "未知错误";
            formatAppLog("log", "at pages/upload-resume/upload-resume.vue:255", "详细错误信息:", errorDetail);
            throw new Error(`分析失败 (${response.statusCode}): ${response.data.message || errorDetail}`);
          }
        } catch (err) {
          formatAppLog("error", "at pages/upload-resume/upload-resume.vue:260", "简历分析失败:", err);
          uni.showToast({
            title: err.message || "简历分析失败",
            icon: "none"
          });
          const userStore = ((_e = (_d = this.$store) == null ? void 0 : _d.state) == null ? void 0 : _e.user) || {};
          const userId = ((_f = userStore.user) == null ? void 0 : _f.id) || "unknown";
          this.saveResumeAnalysis({
            basic_info: { 状态: "AI分析暂时不可用，请稍后重试" },
            ability_assessment: {},
            career_tendency: {},
            match_analysis: {},
            visualization_data: {}
          }, userId);
        } finally {
          this.isUploading = false;
          uni.hideLoading();
        }
      },
      saveResumeAnalysis(analysisData, userId) {
        try {
          const storageKey = `resume_analysis_${userId}`;
          uni.setStorageSync(storageKey, analysisData);
          formatAppLog("log", "at pages/upload-resume/upload-resume.vue:288", `简历分析结果已保存到本地存储，用户ID: ${userId}, 存储键: ${storageKey}`);
          const savedData = uni.getStorageSync(storageKey);
          formatAppLog("log", "at pages/upload-resume/upload-resume.vue:292", "验证保存的数据结构:", Object.keys(savedData || {}));
        } catch (err) {
          formatAppLog("error", "at pages/upload-resume/upload-resume.vue:294", "保存分析结果失败:", err);
        }
      }
    }
  };
  function _sfc_render$8(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "upload-section" }, [
        vue.createElementVNode("view", {
          class: "upload-area",
          onClick: _cache[1] || (_cache[1] = (...args) => $options.chooseFile && $options.chooseFile(...args))
        }, [
          !$data.selectedFile ? (vue.openBlock(), vue.createElementBlock("text", {
            key: 0,
            class: "upload-icon"
          }, "📄")) : vue.createCommentVNode("v-if", true),
          !$data.selectedFile ? (vue.openBlock(), vue.createElementBlock("text", {
            key: 1,
            class: "upload-text"
          }, "点击上传简历")) : vue.createCommentVNode("v-if", true),
          !$data.selectedFile ? (vue.openBlock(), vue.createElementBlock("text", {
            key: 2,
            class: "upload-desc"
          }, "支持PDF、DOC、DOCX格式")) : vue.createCommentVNode("v-if", true),
          $data.selectedFile ? (vue.openBlock(), vue.createElementBlock("view", {
            key: 3,
            class: "file-info"
          }, [
            vue.createElementVNode("text", { class: "file-icon" }, "📎"),
            vue.createElementVNode("view", { class: "file-detail" }, [
              vue.createElementVNode(
                "text",
                { class: "file-name" },
                vue.toDisplayString($data.selectedFile.name),
                1
                /* TEXT */
              ),
              vue.createElementVNode(
                "text",
                { class: "file-size" },
                vue.toDisplayString($options.formatFileSize($data.selectedFile.size)),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("text", {
              class: "file-remove",
              onClick: _cache[0] || (_cache[0] = vue.withModifiers((...args) => $options.removeFile && $options.removeFile(...args), ["stop"]))
            }, "✕")
          ])) : vue.createCommentVNode("v-if", true)
        ])
      ]),
      vue.createElementVNode("view", { class: "tips-section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "上传提示"),
        vue.createElementVNode("view", { class: "tips-list" }, [
          vue.createElementVNode("view", { class: "tip-item" }, [
            vue.createElementVNode("text", { class: "tip-icon" }, "✅"),
            vue.createElementVNode("text", { class: "tip-text" }, "建议使用最新版本的简历")
          ]),
          vue.createElementVNode("view", { class: "tip-item" }, [
            vue.createElementVNode("text", { class: "tip-icon" }, "✅"),
            vue.createElementVNode("text", { class: "tip-text" }, "确保简历包含完整的教育和工作经历")
          ]),
          vue.createElementVNode("view", { class: "tip-item" }, [
            vue.createElementVNode("text", { class: "tip-icon" }, "✅"),
            vue.createElementVNode("text", { class: "tip-text" }, "文件大小不超过10MB")
          ]),
          vue.createElementVNode("view", { class: "tip-item" }, [
            vue.createElementVNode("text", { class: "tip-icon" }, "✅"),
            vue.createElementVNode("text", { class: "tip-text" }, "上传后AI将自动分析你的简历")
          ])
        ])
      ]),
      $data.selectedFile ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "action-section"
      }, [
        vue.createElementVNode("button", {
          class: vue.normalizeClass(["btn btn-primary", { loading: $data.isUploading }]),
          onClick: _cache[2] || (_cache[2] = (...args) => $options.uploadResume && $options.uploadResume(...args)),
          disabled: $data.isUploading
        }, vue.toDisplayString($data.isUploading ? "分析中..." : "开始分析"), 11, ["disabled"])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesUploadResumeUploadResume = /* @__PURE__ */ _export_sfc(_sfc_main$9, [["render", _sfc_render$8], ["__scopeId", "data-v-615e4326"], ["__file", "D:/计算机编程/A13/app端/pages/upload-resume/upload-resume.vue"]]);
  const _sfc_main$8 = {
    data() {
      const currentYear = (/* @__PURE__ */ new Date()).getFullYear();
      const yearOptions = [];
      for (let i = currentYear; i <= currentYear + 10; i++) {
        yearOptions.push(i + "年");
      }
      return {
        isSaving: false,
        genderOptions: [
          { label: "男", value: "male" },
          { label: "女", value: "female" }
        ],
        educationOptions: ["专科", "本科", "硕士", "博士"],
        yearOptions,
        form: {
          name: "",
          gender: "",
          phone: "",
          email: "",
          school: "",
          major: "",
          education: "",
          graduationYear: "",
          bio: ""
        }
      };
    },
    onLoad() {
      this.loadProfile();
    },
    methods: {
      async loadProfile() {
        try {
          uni.showLoading({ title: "加载中..." });
          const res = await userApi.getUserInfo();
          if (res && res.data) {
            this.form = { ...this.form, ...res.data };
          }
        } catch (err) {
          formatAppLog("error", "at pages/edit-profile/edit-profile.vue:170", "加载个人信息失败:", err);
        } finally {
          uni.hideLoading();
        }
      },
      onEducationChange(e) {
        this.form.education = this.educationOptions[e.detail.value];
      },
      onYearChange(e) {
        this.form.graduationYear = this.yearOptions[e.detail.value];
      },
      async saveProfile() {
        if (!this.form.name) {
          uni.showToast({
            title: "请输入姓名",
            icon: "none"
          });
          return;
        }
        this.isSaving = true;
        try {
          await userApi.updateUserInfo(this.form);
          uni.showToast({
            title: "保存成功",
            icon: "success"
          });
          setTimeout(() => {
            uni.navigateBack();
          }, 1500);
        } catch (err) {
          formatAppLog("error", "at pages/edit-profile/edit-profile.vue:205", err);
          uni.showToast({
            title: "保存失败",
            icon: "none"
          });
        } finally {
          this.isSaving = false;
        }
      }
    }
  };
  function _sfc_render$7(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "form-section" }, [
        vue.createElementVNode("view", { class: "form-group" }, [
          vue.createElementVNode("text", { class: "form-label" }, "姓名"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $data.form.name = $event),
              class: "form-input",
              placeholder: "请输入姓名"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.form.name]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-group" }, [
          vue.createElementVNode("text", { class: "form-label" }, "性别"),
          vue.createElementVNode("view", { class: "gender-select" }, [
            (vue.openBlock(true), vue.createElementBlock(
              vue.Fragment,
              null,
              vue.renderList($data.genderOptions, (item) => {
                return vue.openBlock(), vue.createElementBlock("view", {
                  key: item.value,
                  class: vue.normalizeClass(["gender-option", { active: $data.form.gender === item.value }]),
                  onClick: ($event) => $data.form.gender = item.value
                }, [
                  vue.createElementVNode(
                    "text",
                    null,
                    vue.toDisplayString(item.label),
                    1
                    /* TEXT */
                  )
                ], 10, ["onClick"]);
              }),
              128
              /* KEYED_FRAGMENT */
            ))
          ])
        ]),
        vue.createElementVNode("view", { class: "form-group" }, [
          vue.createElementVNode("text", { class: "form-label" }, "手机号"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[1] || (_cache[1] = ($event) => $data.form.phone = $event),
              class: "form-input",
              type: "number",
              placeholder: "请输入手机号",
              maxlength: "11"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.form.phone]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-group" }, [
          vue.createElementVNode("text", { class: "form-label" }, "邮箱"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $data.form.email = $event),
              class: "form-input",
              type: "email",
              placeholder: "请输入邮箱"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.form.email]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-group" }, [
          vue.createElementVNode("text", { class: "form-label" }, "学校"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[3] || (_cache[3] = ($event) => $data.form.school = $event),
              class: "form-input",
              placeholder: "请输入学校"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.form.school]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-group" }, [
          vue.createElementVNode("text", { class: "form-label" }, "专业"),
          vue.withDirectives(vue.createElementVNode(
            "input",
            {
              "onUpdate:modelValue": _cache[4] || (_cache[4] = ($event) => $data.form.major = $event),
              class: "form-input",
              placeholder: "请输入专业"
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.form.major]
          ])
        ]),
        vue.createElementVNode("view", { class: "form-group" }, [
          vue.createElementVNode("text", { class: "form-label" }, "学历"),
          vue.createElementVNode("picker", {
            mode: "selector",
            range: $data.educationOptions,
            onChange: _cache[5] || (_cache[5] = (...args) => $options.onEducationChange && $options.onEducationChange(...args))
          }, [
            vue.createElementVNode("view", { class: "picker" }, [
              vue.createElementVNode(
                "text",
                {
                  class: vue.normalizeClass({ placeholder: !$data.form.education })
                },
                vue.toDisplayString($data.form.education || "请选择学历"),
                3
                /* TEXT, CLASS */
              ),
              vue.createElementVNode("text", { class: "picker-arrow" }, "›")
            ])
          ], 40, ["range"])
        ]),
        vue.createElementVNode("view", { class: "form-group" }, [
          vue.createElementVNode("text", { class: "form-label" }, "毕业年份"),
          vue.createElementVNode("picker", {
            mode: "selector",
            range: $data.yearOptions,
            onChange: _cache[6] || (_cache[6] = (...args) => $options.onYearChange && $options.onYearChange(...args))
          }, [
            vue.createElementVNode("view", { class: "picker" }, [
              vue.createElementVNode(
                "text",
                {
                  class: vue.normalizeClass({ placeholder: !$data.form.graduationYear })
                },
                vue.toDisplayString($data.form.graduationYear || "请选择毕业年份"),
                3
                /* TEXT, CLASS */
              ),
              vue.createElementVNode("text", { class: "picker-arrow" }, "›")
            ])
          ], 40, ["range"])
        ]),
        vue.createElementVNode("view", { class: "form-group" }, [
          vue.createElementVNode("text", { class: "form-label" }, "个人简介"),
          vue.withDirectives(vue.createElementVNode(
            "textarea",
            {
              "onUpdate:modelValue": _cache[7] || (_cache[7] = ($event) => $data.form.bio = $event),
              class: "form-textarea",
              placeholder: "请简单介绍一下自己...",
              maxlength: 500
            },
            null,
            512
            /* NEED_PATCH */
          ), [
            [vue.vModelText, $data.form.bio]
          ]),
          vue.createElementVNode(
            "text",
            { class: "char-count" },
            vue.toDisplayString($data.form.bio.length) + "/500",
            1
            /* TEXT */
          )
        ])
      ]),
      vue.createElementVNode("view", { class: "action-section" }, [
        vue.createElementVNode("button", {
          class: vue.normalizeClass(["btn btn-primary", { loading: $data.isSaving }]),
          onClick: _cache[8] || (_cache[8] = (...args) => $options.saveProfile && $options.saveProfile(...args)),
          disabled: $data.isSaving
        }, vue.toDisplayString($data.isSaving ? "保存中..." : "保存"), 11, ["disabled"])
      ])
    ]);
  }
  const PagesEditProfileEditProfile = /* @__PURE__ */ _export_sfc(_sfc_main$8, [["render", _sfc_render$7], ["__scopeId", "data-v-c0f45e44"], ["__file", "D:/计算机编程/A13/app端/pages/edit-profile/edit-profile.vue"]]);
  const _sfc_main$7 = {
    data() {
      return {
        resumeAnalysis: null,
        paths: [],
        stages: [],
        skills: []
      };
    },
    onLoad() {
      this.loadResumeAnalysis();
    },
    onShow() {
      this.loadResumeAnalysis();
    },
    methods: {
      loadResumeAnalysis() {
        try {
          const analysisData = uni.getStorageSync("resume_analysis");
          if (analysisData) {
            this.resumeAnalysis = analysisData;
            formatAppLog("log", "at pages/career-plan/career-plan.vue:82", "加载简历分析结果:", this.resumeAnalysis);
            this.generateCareerPlan();
          }
        } catch (err) {
          formatAppLog("error", "at pages/career-plan/career-plan.vue:86", "加载简历分析结果失败:", err);
          this.setDefaultData();
        }
      },
      generateCareerPlan() {
        if (!this.resumeAnalysis) {
          this.setDefaultData();
          return;
        }
        const careerTendency = this.resumeAnalysis.career_tendency || {};
        const matchAnalysis = this.resumeAnalysis.match_analysis || {};
        const abilityAssessment = this.resumeAnalysis.ability_assessment || {};
        this.paths = this.generatePaths(careerTendency, matchAnalysis);
        this.stages = this.generateStages();
        this.skills = this.generateSkills(abilityAssessment);
      },
      generatePaths(careerTendency, matchAnalysis) {
        const paths = [];
        if (careerTendency["期望岗位"]) {
          const positions = careerTendency["期望岗位"].split("、");
          positions.forEach((position, index) => {
            paths.push({
              name: position.trim(),
              match: `${85 + index * 5}% 匹配`,
              desc: `基于你的${careerTendency["兴趣领域"] || "技术背景"}，${position}是最适合你的发展方向`,
              color: index === 0 ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : index === 1 ? "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" : "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              steps: ["入门阶段", "成长阶段", "高级阶段", "专家阶段"]
            });
          });
        }
        if (paths.length === 0) {
          paths.push({
            name: "技术开发工程师",
            match: "90% 匹配",
            desc: "基于你的技术背景，技术开发是最适合你的发展方向",
            color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            steps: ["初级开发", "中级开发", "高级开发", "技术专家"]
          });
        }
        return paths;
      },
      generateStages() {
        return [
          {
            title: "入门阶段",
            time: "0-6个月",
            desc: "掌握基础技能，完成基础项目"
          },
          {
            title: "成长阶段",
            time: "6-18个月",
            desc: "深入学习核心技术，参与复杂项目"
          },
          {
            title: "成熟阶段",
            time: "18-36个月",
            desc: "具备独立解决问题能力，成为技术骨干"
          }
        ];
      },
      generateSkills(abilityAssessment) {
        const skills = [];
        if (abilityAssessment["技术能力"]) {
          skills.push({ name: "核心技术", progress: 85, color: "#667eea" });
        }
        if (abilityAssessment["沟通能力"]) {
          skills.push({ name: "沟通表达", progress: 70, color: "#61dafb" });
        }
        if (abilityAssessment["团队协作"]) {
          skills.push({ name: "团队协作", progress: 80, color: "#f7df1e" });
        }
        if (abilityAssessment["学习能力"]) {
          skills.push({ name: "学习能力", progress: 90, color: "#3178c6" });
        }
        if (skills.length === 0) {
          skills.push(
            { name: "技术能力", progress: 85, color: "#667eea" },
            { name: "沟通能力", progress: 70, color: "#61dafb" },
            { name: "团队协作", progress: 80, color: "#f7df1e" },
            { name: "学习能力", progress: 90, color: "#3178c6" }
          );
        }
        return skills;
      },
      setDefaultData() {
        this.paths = [
          {
            name: "技术开发工程师",
            match: "90% 匹配",
            desc: "基于你的技术背景，技术开发是最适合你的发展方向",
            color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            steps: ["初级开发", "中级开发", "高级开发", "技术专家"]
          }
        ];
        this.stages = this.generateStages();
        this.skills = [
          { name: "技术能力", progress: 85, color: "#667eea" },
          { name: "沟通能力", progress: 70, color: "#61dafb" },
          { name: "团队协作", progress: 80, color: "#f7df1e" },
          { name: "学习能力", progress: 90, color: "#3178c6" }
        ];
      }
    }
  };
  function _sfc_render$6(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "header-card" }, [
        vue.createElementVNode("text", { class: "header-title" }, "🎯 职业规划"),
        vue.createElementVNode("text", { class: "header-desc" }, "基于AI智能分析，为你定制专属职业发展路径")
      ]),
      vue.createElementVNode("view", { class: "section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "推荐路径"),
        vue.createElementVNode("view", { class: "path-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.paths, (path, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "path-card",
                key: index
              }, [
                vue.createElementVNode("view", { class: "path-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "path-name" },
                    vue.toDisplayString(path.name),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "view",
                    {
                      class: "path-match",
                      style: vue.normalizeStyle({ background: path.color })
                    },
                    vue.toDisplayString(path.match),
                    5
                    /* TEXT, STYLE */
                  )
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "path-desc" },
                  vue.toDisplayString(path.desc),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "path-steps" }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList(path.steps, (step, i) => {
                      return vue.openBlock(), vue.createElementBlock(
                        "view",
                        {
                          key: i,
                          class: "step-tag"
                        },
                        vue.toDisplayString(step),
                        1
                        /* TEXT */
                      );
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createElementVNode("view", { class: "section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "发展阶段"),
        vue.createElementVNode("view", { class: "stage-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.stages, (stage, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "stage-item",
                key: index
              }, [
                vue.createElementVNode("view", { class: "stage-dot" }),
                vue.createElementVNode("view", { class: "stage-content" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "stage-title" },
                    vue.toDisplayString(stage.title),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "stage-time" },
                    vue.toDisplayString(stage.time),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "stage-desc" },
                    vue.toDisplayString(stage.desc),
                    1
                    /* TEXT */
                  )
                ])
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createElementVNode("view", { class: "section" }, [
        vue.createElementVNode("view", { class: "section-title" }, "技能提升建议"),
        vue.createElementVNode("view", { class: "skill-list" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.skills, (skill, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                class: "skill-card",
                key: index
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "skill-name" },
                  vue.toDisplayString(skill.name),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "skill-bar" }, [
                  vue.createElementVNode(
                    "view",
                    {
                      class: "skill-progress",
                      style: vue.normalizeStyle({ width: skill.progress + "%", background: skill.color })
                    },
                    null,
                    4
                    /* STYLE */
                  )
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "skill-percent" },
                  vue.toDisplayString(skill.progress) + "%",
                  1
                  /* TEXT */
                )
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ])
    ]);
  }
  const PagesCareerPlanCareerPlan = /* @__PURE__ */ _export_sfc(_sfc_main$7, [["render", _sfc_render$6], ["__scopeId", "data-v-f0b5c96f"], ["__file", "D:/计算机编程/A13/app端/pages/career-plan/career-plan.vue"]]);
  const _sfc_main$6 = {
    data() {
      return {
        activeTab: 0,
        tabs: ["常见问题", "面试技巧", "模拟面试"],
        questions: [
          {
            question: "请简单介绍一下你自己",
            answer: "这是一个经典的面试开场白。回答时要突出自己的教育背景、相关工作经验和核心技能，保持简洁有条理，2-3分钟为宜。",
            expanded: false
          },
          {
            question: "你为什么想加入我们公司？",
            answer: "这是考察你对公司的了解程度。回答时要结合公司的产品、文化和发展方向，说明自己为什么认同公司的价值观。",
            expanded: false
          },
          {
            question: "请描述一个你最有成就感的项目",
            answer: "使用STAR法则：情境(Situation)、任务(Task)、行动(Action)、结果(Result)。重点突出你在项目中的贡献和学到的东西。",
            expanded: false
          },
          {
            question: "你的优点和缺点是什么？",
            answer: "优点要具体，最好有例子支撑；缺点要说真实但不致命的，并且说明你正在如何改进。",
            expanded: false
          },
          {
            question: "你对未来3-5年有什么规划？",
            answer: "说明你对职业发展的思考，既要体现进取心，又要切合实际，可以结合应聘公司的发展来谈。",
            expanded: false
          }
        ]
      };
    },
    methods: {
      toggleAnswer(index) {
        this.questions[index].expanded = !this.questions[index].expanded;
      },
      startSimulation() {
        uni.switchTab({
          url: "/pages/ai-assistant/ai-assistant"
        });
      }
    }
  };
  function _sfc_render$5(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "tabs" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.tabs, (tab, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: index,
              class: vue.normalizeClass(["tab-item", { active: $data.activeTab === index }]),
              onClick: ($event) => $data.activeTab = index
            }, vue.toDisplayString(tab), 11, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      vue.createElementVNode("view", { class: "content-section" }, [
        $data.activeTab === 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "questions-section"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.questions, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: index,
                class: "question-card",
                onClick: ($event) => $options.toggleAnswer(index)
              }, [
                vue.createElementVNode("view", { class: "question-header" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "question-index" },
                    "Q" + vue.toDisplayString(index + 1),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "question-text" },
                    vue.toDisplayString(item.question),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode(
                  "view",
                  {
                    class: vue.normalizeClass(["answer-content", { expanded: item.expanded }])
                  },
                  [
                    vue.createElementVNode(
                      "text",
                      { class: "answer-text" },
                      vue.toDisplayString(item.answer),
                      1
                      /* TEXT */
                    )
                  ],
                  2
                  /* CLASS */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "toggle-icon" },
                  vue.toDisplayString(item.expanded ? "▲" : "▼"),
                  1
                  /* TEXT */
                )
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : vue.createCommentVNode("v-if", true),
        $data.activeTab === 1 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "tips-section"
        }, [
          vue.createElementVNode("view", { class: "tip-card" }, [
            vue.createElementVNode("text", { class: "tip-icon" }, "🎯"),
            vue.createElementVNode("view", { class: "tip-content" }, [
              vue.createElementVNode("text", { class: "tip-title" }, "面试前准备"),
              vue.createElementVNode("text", { class: "tip-desc" }, "了解公司文化和岗位要求")
            ])
          ]),
          vue.createElementVNode("view", { class: "tip-card" }, [
            vue.createElementVNode("text", { class: "tip-icon" }, "💬"),
            vue.createElementVNode("view", { class: "tip-content" }, [
              vue.createElementVNode("text", { class: "tip-title" }, "自我介绍"),
              vue.createElementVNode("text", { class: "tip-desc" }, "准备2-3分钟的自我介绍")
            ])
          ]),
          vue.createElementVNode("view", { class: "tip-card" }, [
            vue.createElementVNode("text", { class: "tip-icon" }, "📚"),
            vue.createElementVNode("view", { class: "tip-content" }, [
              vue.createElementVNode("text", { class: "tip-title" }, "技能复习"),
              vue.createElementVNode("text", { class: "tip-desc" }, "复习核心技术知识点")
            ])
          ]),
          vue.createElementVNode("view", { class: "tip-card" }, [
            vue.createElementVNode("text", { class: "tip-icon" }, "🎨"),
            vue.createElementVNode("view", { class: "tip-content" }, [
              vue.createElementVNode("text", { class: "tip-title" }, "项目准备"),
              vue.createElementVNode("text", { class: "tip-desc" }, "准备2-3个代表性项目")
            ])
          ])
        ])) : vue.createCommentVNode("v-if", true),
        $data.activeTab === 2 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 2,
          class: "simulation-section"
        }, [
          vue.createElementVNode("view", {
            class: "simulation-card",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.startSimulation && $options.startSimulation(...args))
          }, [
            vue.createElementVNode("text", { class: "simulation-icon" }, "🎮"),
            vue.createElementVNode("text", { class: "simulation-title" }, "开始模拟面试"),
            vue.createElementVNode("text", { class: "simulation-desc" }, "AI面试官将与你进行真实对话")
          ])
        ])) : vue.createCommentVNode("v-if", true)
      ])
    ]);
  }
  const PagesInterviewPrepInterviewPrep = /* @__PURE__ */ _export_sfc(_sfc_main$6, [["render", _sfc_render$5], ["__scopeId", "data-v-39f6a714"], ["__file", "D:/计算机编程/A13/app端/pages/interview-prep/interview-prep.vue"]]);
  const _sfc_main$5 = {
    data() {
      return {
        activeTab: 0,
        tabs: ["全部", "待处理", "已通过", "已拒绝"],
        isLoading: true,
        applications: []
      };
    },
    computed: {
      filteredList() {
        if (this.activeTab === 0) {
          return this.applications;
        }
        const statusMap = {
          1: "pending",
          2: "approved",
          3: "rejected"
        };
        return this.applications.filter((item) => item.status === statusMap[this.activeTab]);
      }
    },
    onLoad() {
      this.loadApplications();
    },
    onPullDownRefresh() {
      this.loadApplications();
      setTimeout(() => {
        uni.stopPullDownRefresh();
      }, 1e3);
    },
    methods: {
      async loadApplications() {
        this.isLoading = true;
        try {
          const res = await userApi.getApplications();
          if (res && res.data) {
            this.applications = res.data;
          } else {
            this.applications = this.getMockData();
          }
        } catch (err) {
          formatAppLog("error", "at pages/my-applications/my-applications.vue:112", err);
          this.applications = this.getMockData();
        } finally {
          this.isLoading = false;
        }
      },
      getMockData() {
        return [
          {
            id: 1,
            title: "前端开发工程师",
            salary: "15-25K",
            company: "字节跳动",
            location: "北京",
            experience: "3-5年",
            education: "本科",
            status: "pending",
            applyTime: "2024-01-15 14:30"
          },
          {
            id: 2,
            title: "后端开发工程师",
            salary: "20-35K",
            company: "阿里巴巴",
            location: "杭州",
            experience: "3-5年",
            education: "本科",
            status: "approved",
            applyTime: "2024-01-10 10:20"
          },
          {
            id: 3,
            title: "产品经理",
            salary: "25-40K",
            company: "腾讯",
            location: "深圳",
            experience: "5-10年",
            education: "硕士",
            status: "rejected",
            applyTime: "2024-01-05 16:45"
          }
        ];
      },
      getStatusText(status) {
        const statusMap = {
          pending: "待处理",
          approved: "已通过",
          rejected: "已拒绝"
        };
        return statusMap[status] || status;
      },
      viewJobDetail(item) {
        uni.navigateTo({
          url: `/pages/job-detail/job-detail?id=${item.id}`
        });
      },
      async cancelApplication(item, index) {
        uni.showModal({
          title: "提示",
          content: "确定要取消这个申请吗？",
          success: async (res) => {
            if (res.confirm) {
              try {
                uni.showLoading({ title: "处理中..." });
                await userApi.cancelApplication(item.id);
                this.applications.splice(index, 1);
                uni.showToast({
                  title: "已取消",
                  icon: "success"
                });
              } catch (err) {
                formatAppLog("error", "at pages/my-applications/my-applications.vue:187", err);
                this.applications.splice(index, 1);
                uni.showToast({
                  title: "已取消",
                  icon: "success"
                });
              } finally {
                uni.hideLoading();
              }
            }
          }
        });
      },
      goToJobExplore() {
        uni.switchTab({
          url: "/pages/job-explore/job-explore"
        });
      }
    }
  };
  function _sfc_render$4(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createElementVNode("view", { class: "tabs" }, [
        (vue.openBlock(true), vue.createElementBlock(
          vue.Fragment,
          null,
          vue.renderList($data.tabs, (tab, index) => {
            return vue.openBlock(), vue.createElementBlock("view", {
              key: index,
              class: vue.normalizeClass(["tab-item", { active: $data.activeTab === index }]),
              onClick: ($event) => $data.activeTab = index
            }, vue.toDisplayString(tab), 11, ["onClick"]);
          }),
          128
          /* KEYED_FRAGMENT */
        ))
      ]),
      !$data.isLoading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "content-section"
      }, [
        $options.filteredList.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "applications-list"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($options.filteredList, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: index,
                class: "application-card",
                onClick: ($event) => $options.viewJobDetail(item)
              }, [
                vue.createElementVNode("view", { class: "card-header" }, [
                  vue.createElementVNode("view", { class: "job-info" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "job-title" },
                      vue.toDisplayString(item.title),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "job-salary" },
                      vue.toDisplayString(item.salary),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode(
                    "view",
                    {
                      class: vue.normalizeClass(["status-badge", "status-" + item.status])
                    },
                    vue.toDisplayString($options.getStatusText(item.status)),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                vue.createElementVNode(
                  "view",
                  { class: "job-company" },
                  vue.toDisplayString(item.company),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "job-meta" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "meta-item" },
                    vue.toDisplayString(item.location),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("text", { class: "meta-divider" }, "·"),
                  vue.createElementVNode(
                    "text",
                    { class: "meta-item" },
                    vue.toDisplayString(item.experience),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("text", { class: "meta-divider" }, "·"),
                  vue.createElementVNode(
                    "text",
                    { class: "meta-item" },
                    vue.toDisplayString(item.education),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode(
                  "view",
                  { class: "apply-time" },
                  "申请时间：" + vue.toDisplayString(item.applyTime),
                  1
                  /* TEXT */
                ),
                item.status === "pending" ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "card-actions"
                }, [
                  vue.createElementVNode("button", {
                    class: "action-btn cancel-btn",
                    onClick: vue.withModifiers(($event) => $options.cancelApplication(item, index), ["stop"])
                  }, " 取消申请 ", 8, ["onClick"])
                ])) : vue.createCommentVNode("v-if", true)
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "empty-state"
        }, [
          vue.createElementVNode("text", { class: "empty-icon" }, "📋"),
          vue.createElementVNode("text", { class: "empty-text" }, "暂无申请记录"),
          vue.createElementVNode("text", { class: "empty-desc" }, "去岗位探索看看吧~"),
          vue.createElementVNode("button", {
            class: "go-btn",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goToJobExplore && $options.goToJobExplore(...args))
          }, "去探索")
        ]))
      ])) : (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "loading-state"
      }, [
        vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
      ]))
    ]);
  }
  const PagesMyApplicationsMyApplications = /* @__PURE__ */ _export_sfc(_sfc_main$5, [["render", _sfc_render$4], ["__scopeId", "data-v-0ed30e59"], ["__file", "D:/计算机编程/A13/app端/pages/my-applications/my-applications.vue"]]);
  const _sfc_main$4 = {
    data() {
      return {
        isLoading: true,
        favoritesList: []
      };
    },
    onLoad() {
      this.loadFavorites();
    },
    onPullDownRefresh() {
      this.loadFavorites();
      setTimeout(() => {
        uni.stopPullDownRefresh();
      }, 1e3);
    },
    methods: {
      async loadFavorites() {
        this.isLoading = true;
        try {
          const res = await jobApi.getFavorites();
          if (res && res.data) {
            this.favoritesList = res.data;
          } else {
            this.favoritesList = this.getMockData();
          }
        } catch (err) {
          formatAppLog("error", "at pages/my-favorites/my-favorites.vue:86", err);
          this.favoritesList = this.getMockData();
        } finally {
          this.isLoading = false;
        }
      },
      getMockData() {
        return [
          {
            id: 1,
            title: "前端开发工程师",
            salary: "15-25K",
            company: "字节跳动",
            location: "北京",
            experience: "3-5年",
            education: "本科",
            tags: ["Vue", "React", "TypeScript"]
          },
          {
            id: 2,
            title: "后端开发工程师",
            salary: "20-35K",
            company: "阿里巴巴",
            location: "杭州",
            experience: "3-5年",
            education: "本科",
            tags: ["Java", "Spring", "MySQL"]
          },
          {
            id: 3,
            title: "算法工程师",
            salary: "30-50K",
            company: "腾讯",
            location: "深圳",
            experience: "3-5年",
            education: "硕士",
            tags: ["Python", "机器学习", "深度学习"]
          }
        ];
      },
      viewJobDetail(item) {
        uni.navigateTo({
          url: `/pages/job-detail/job-detail?id=${item.id}`
        });
      },
      async removeFavorite(item, index) {
        uni.showModal({
          title: "提示",
          content: "确定要取消收藏吗？",
          success: async (res) => {
            if (res.confirm) {
              try {
                uni.showLoading({ title: "处理中..." });
                await jobApi.removeFavorite(item.id);
                this.favoritesList.splice(index, 1);
                uni.showToast({
                  title: "已取消收藏",
                  icon: "success"
                });
              } catch (err) {
                formatAppLog("error", "at pages/my-favorites/my-favorites.vue:149", err);
                this.favoritesList.splice(index, 1);
                uni.showToast({
                  title: "已取消收藏",
                  icon: "success"
                });
              } finally {
                uni.hideLoading();
              }
            }
          }
        });
      },
      async applyJob(item) {
        try {
          uni.showLoading({ title: "申请中..." });
          await jobApi.applyJob(item.id);
          uni.showToast({
            title: "申请成功",
            icon: "success"
          });
        } catch (err) {
          formatAppLog("error", "at pages/my-favorites/my-favorites.vue:172", err);
          uni.showToast({
            title: "申请失败",
            icon: "none"
          });
        } finally {
          uni.hideLoading();
        }
      },
      goToJobExplore() {
        uni.switchTab({
          url: "/pages/job-explore/job-explore"
        });
      }
    }
  };
  function _sfc_render$3(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      !$data.isLoading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "content-section"
      }, [
        $data.favoritesList.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "favorites-list"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($data.favoritesList, (item, index) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: index,
                class: "favorite-card",
                onClick: ($event) => $options.viewJobDetail(item)
              }, [
                vue.createElementVNode("view", { class: "card-header" }, [
                  vue.createElementVNode("view", { class: "job-info" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "job-title" },
                      vue.toDisplayString(item.title),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "job-salary" },
                      vue.toDisplayString(item.salary),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", {
                    class: "favorite-icon",
                    onClick: vue.withModifiers(($event) => $options.removeFavorite(item, index), ["stop"])
                  }, [
                    vue.createElementVNode("text", { class: "icon-text" }, "❤️")
                  ], 8, ["onClick"])
                ]),
                vue.createElementVNode(
                  "view",
                  { class: "job-company" },
                  vue.toDisplayString(item.company),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode("view", { class: "job-meta" }, [
                  vue.createElementVNode(
                    "text",
                    { class: "meta-item" },
                    vue.toDisplayString(item.location),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("text", { class: "meta-divider" }, "·"),
                  vue.createElementVNode(
                    "text",
                    { class: "meta-item" },
                    vue.toDisplayString(item.experience),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode("text", { class: "meta-divider" }, "·"),
                  vue.createElementVNode(
                    "text",
                    { class: "meta-item" },
                    vue.toDisplayString(item.education),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "job-tags" }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList(item.tags, (tag, i) => {
                      return vue.openBlock(), vue.createElementBlock(
                        "text",
                        {
                          key: i,
                          class: "tag"
                        },
                        vue.toDisplayString(tag),
                        1
                        /* TEXT */
                      );
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ]),
                vue.createElementVNode("view", { class: "card-actions" }, [
                  vue.createElementVNode("button", {
                    class: "action-btn apply-btn",
                    onClick: vue.withModifiers(($event) => $options.applyJob(item), ["stop"])
                  }, " 立即申请 ", 8, ["onClick"])
                ])
              ], 8, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "empty-state"
        }, [
          vue.createElementVNode("text", { class: "empty-icon" }, "⭐"),
          vue.createElementVNode("text", { class: "empty-text" }, "暂无收藏"),
          vue.createElementVNode("text", { class: "empty-desc" }, "去岗位探索收藏心仪的岗位吧~"),
          vue.createElementVNode("button", {
            class: "go-btn",
            onClick: _cache[0] || (_cache[0] = (...args) => $options.goToJobExplore && $options.goToJobExplore(...args))
          }, "去探索")
        ]))
      ])) : (vue.openBlock(), vue.createElementBlock("view", {
        key: 1,
        class: "loading-state"
      }, [
        vue.createElementVNode("text", { class: "loading-text" }, "加载中...")
      ]))
    ]);
  }
  const PagesMyFavoritesMyFavorites = /* @__PURE__ */ _export_sfc(_sfc_main$4, [["render", _sfc_render$3], ["__scopeId", "data-v-98a552f5"], ["__file", "D:/计算机编程/A13/app端/pages/my-favorites/my-favorites.vue"]]);
  const _sfc_main$3 = {
    __name: "interview-questions",
    setup(__props, { expose: __expose }) {
      __expose();
      const matchResults = vue.ref([]);
      const selectedJob = vue.ref("");
      const interviewQuestions = vue.ref([]);
      const userAnswers = vue.ref({});
      const answerEvaluations = vue.ref({});
      const expandedQuestions = vue.ref(/* @__PURE__ */ new Set());
      const loading = vue.ref(false);
      const errorMessage = vue.ref("");
      const aiEnabled = vue.ref(false);
      onLoad(() => {
        loadRecommendedJobs();
        checkAIService();
      });
      const loadRecommendedJobs = () => {
        try {
          const resumeAnalysis = uni.getStorageSync("resume_analysis");
          if (resumeAnalysis && resumeAnalysis.match_results) {
            matchResults.value = resumeAnalysis.match_results;
          } else {
            matchResults.value = [
              { id: "frontend", title: "前端开发工程师", score: 85 },
              { id: "backend", title: "后端开发工程师", score: 78 },
              { id: "fullstack", title: "全栈开发工程师", score: 72 }
            ];
          }
        } catch (error) {
          formatAppLog("error", "at pages/interview-questions/interview-questions.vue:183", "加载推荐职业失败:", error);
          matchResults.value = [
            { id: "frontend", title: "前端开发工程师", score: 85 },
            { id: "backend", title: "后端开发工程师", score: 78 },
            { id: "fullstack", title: "全栈开发工程师", score: 72 }
          ];
        }
      };
      const checkAIService = async () => {
        try {
          const response = await uni.request({
            url: this.$baseUrl + "/interview/health",
            method: "GET"
          });
          aiEnabled.value = response.data.success;
        } catch (error) {
          aiEnabled.value = false;
          formatAppLog("error", "at pages/interview-questions/interview-questions.vue:202", "检查智能体服务失败:", error);
        }
      };
      const selectJob = (jobId) => {
        selectedJob.value = jobId;
        loadInterviewQuestions(jobId);
      };
      const getSelectedJobTitle = () => {
        const job = matchResults.value.find((job2) => job2.id === selectedJob.value);
        return job ? job.title : "";
      };
      const getResumeText = () => {
        try {
          const resumeAnalysis = uni.getStorageSync("resume_analysis");
          return (resumeAnalysis == null ? void 0 : resumeAnalysis.resume_text) || "计算机专业学生，具备扎实的编程基础和项目经验";
        } catch (error) {
          return "计算机专业学生，具备扎实的编程基础和项目经验";
        }
      };
      const getJobRequirements = () => {
        const jobTitle = getSelectedJobTitle();
        const requirementsMap = {
          "前端开发工程师": "熟悉HTML/CSS/JavaScript，掌握Vue/React框架，有响应式设计经验",
          "后端开发工程师": "熟悉Java/Python/Go等后端语言，掌握数据库设计，有API开发经验",
          "全栈开发工程师": "具备前后端开发能力，熟悉完整项目开发流程，有全栈项目经验"
        };
        return requirementsMap[jobTitle] || "具备良好的学习能力和团队协作精神";
      };
      const loadInterviewQuestions = async (jobId) => {
        loading.value = true;
        errorMessage.value = "";
        try {
          if (aiEnabled.value) {
            const response = await uni.request({
              url: this.$baseUrl + "/interview/generate-questions",
              method: "POST",
              data: {
                resume_text: getResumeText(),
                job_title: interviewData.value.position,
                job_requirements: getJobRequirements(),
                question_count: 5
              }
            });
            if (response.data.success) {
              interviewQuestions.value = response.data.data.questions || [];
            } else {
              throw new Error("智能体生成问题失败");
            }
          }
          if (!interviewQuestions.value.length) {
            interviewQuestions.value = getDefaultQuestions(jobId);
          }
          userAnswers.value = {};
          answerEvaluations.value = {};
          expandedQuestions.value = /* @__PURE__ */ new Set();
        } catch (error) {
          formatAppLog("error", "at pages/interview-questions/interview-questions.vue:276", "加载面试问题失败:", error);
          errorMessage.value = "加载面试问题失败，请稍后重试";
          interviewQuestions.value = getDefaultQuestions(jobId);
        } finally {
          loading.value = false;
        }
      };
      const getDefaultQuestions = (jobId) => {
        const defaultQuestions = {
          frontend: [
            {
              question: "请介绍一下您在前端开发方面的经验和技术栈",
              type: "技术能力",
              difficulty: "中等",
              answerHint: "可以从项目经验、技术栈掌握程度、解决问题的能力等方面回答"
            },
            {
              question: "您如何处理浏览器兼容性问题？",
              type: "技术问题",
              difficulty: "中等",
              answerHint: "可以提到使用polyfill、特性检测、渐进增强等策略"
            }
          ],
          backend: [
            {
              question: "请介绍一下您在后端开发方面的经验",
              type: "技术能力",
              difficulty: "中等",
              answerHint: "可以从数据库设计、API开发、性能优化等方面回答"
            }
          ],
          fullstack: [
            {
              question: "作为全栈工程师，您如何平衡前后端开发工作？",
              type: "综合能力",
              difficulty: "中等",
              answerHint: "可以提到时间管理、技术栈选择、团队协作等方面"
            }
          ]
        };
        return defaultQuestions[jobId] || [];
      };
      const toggleQuestion = (index) => {
        if (expandedQuestions.value.has(index)) {
          expandedQuestions.value.delete(index);
        } else {
          expandedQuestions.value.add(index);
        }
      };
      const evaluateAnswer = async (index) => {
        if (!userAnswers.value[index]) {
          uni.showToast({
            title: "请先输入您的回答",
            icon: "none"
          });
          return;
        }
        const question = interviewQuestions.value[index];
        const userAnswer = userAnswers.value[index];
        loading.value = true;
        errorMessage.value = "";
        try {
          if (aiEnabled.value) {
            const response = await uni.request({
              url: this.$baseUrl + "/interview/evaluate-answer",
              method: "POST",
              data: {
                question: question.question,
                user_answer: userAnswer,
                expected_answer: question.answerHint || ""
              }
            });
            if (response.data.success) {
              answerEvaluations.value[index] = response.data.data.evaluation;
              uni.showToast({
                title: "评估完成",
                icon: "success"
              });
              return;
            }
          }
          const defaultEvaluation = generateDefaultEvaluation(question, userAnswer);
          answerEvaluations.value[index] = defaultEvaluation;
          uni.showToast({
            title: "评估完成",
            icon: "success"
          });
        } catch (error) {
          formatAppLog("error", "at pages/interview-questions/interview-questions.vue:379", "评估回答失败:", error);
          errorMessage.value = "评估服务暂时不可用";
          const defaultEvaluation = generateDefaultEvaluation(question, userAnswer);
          answerEvaluations.value[index] = defaultEvaluation;
        } finally {
          loading.value = false;
        }
      };
      const generateDefaultEvaluation = (question, userAnswer) => {
        const answerLength = userAnswer.length;
        const hasKeywords = userAnswer.includes("项目") || userAnswer.includes("经验") || userAnswer.includes("技术");
        const hasExamples = userAnswer.includes("例如") || userAnswer.includes("比如");
        let baseScore = 60;
        if (answerLength > 200)
          baseScore += 10;
        if (answerLength > 400)
          baseScore += 10;
        if (hasKeywords)
          baseScore += 10;
        if (hasExamples)
          baseScore += 10;
        const score = Math.min(baseScore, 95);
        const strengths = [];
        const weaknesses = [];
        const suggestions = [];
        if (answerLength > 200)
          strengths.push("回答内容充实");
        if (hasKeywords)
          strengths.push("关键词使用恰当");
        if (hasExamples)
          strengths.push("举例说明清晰");
        if (answerLength < 100)
          weaknesses.push("回答内容较为简略");
        if (!hasExamples)
          weaknesses.push("缺乏具体案例支撑");
        if (answerLength < 200)
          suggestions.push("建议补充更多细节和案例");
        if (!hasKeywords)
          suggestions.push("建议突出技术关键词");
        return {
          score,
          strengths: strengths.length ? strengths : ["回答结构清晰"],
          weaknesses: weaknesses.length ? weaknesses : ["可以进一步优化表达"],
          suggestions: suggestions.length ? suggestions : ["继续完善回答内容"]
        };
      };
      const __returned__ = { matchResults, selectedJob, interviewQuestions, userAnswers, answerEvaluations, expandedQuestions, loading, errorMessage, aiEnabled, loadRecommendedJobs, checkAIService, selectJob, getSelectedJobTitle, getResumeText, getJobRequirements, loadInterviewQuestions, getDefaultQuestions, toggleQuestion, evaluateAnswer, generateDefaultEvaluation, ref: vue.ref, onMounted: vue.onMounted, get onLoad() {
        return onLoad;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$2(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 页面头部 "),
      vue.createElementVNode("view", { class: "page-header" }, [
        vue.createElementVNode("view", { class: "header-content" }, [
          vue.createElementVNode("text", { class: "page-badge" }, "💼 面试准备"),
          vue.createElementVNode("text", { class: "page-title" }, "职业面试问题"),
          vue.createElementVNode("text", { class: "page-subtitle" }, "根据您的职业匹配度，获取个性化的面试问题和答案建议")
        ])
      ]),
      vue.createCommentVNode(" 职业选择 "),
      vue.createElementVNode("view", { class: "job-selection" }, [
        vue.createElementVNode("view", { class: "section-title" }, "人岗匹配结果"),
        vue.createElementVNode("text", { class: "section-desc" }, "根据您的个人特质和技能，以下是最匹配的职业"),
        vue.createElementVNode("view", { class: "job-buttons" }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.matchResults, (job) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: job.id,
                class: vue.normalizeClass(["job-btn", { active: $setup.selectedJob === job.id }]),
                onClick: ($event) => $setup.selectJob(job.id)
              }, [
                vue.createElementVNode(
                  "text",
                  { class: "job-title" },
                  vue.toDisplayString(job.title),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "match-score" },
                  vue.toDisplayString(job.score) + "%",
                  1
                  /* TEXT */
                )
              ], 10, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])
      ]),
      vue.createCommentVNode(" 面试问题列表 "),
      $setup.selectedJob ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "questions-container"
      }, [
        vue.createElementVNode("view", { class: "questions-header" }, [
          vue.createElementVNode("view", { class: "section-title" }, "面试问题"),
          vue.createElementVNode(
            "text",
            { class: "section-desc" },
            "针对 " + vue.toDisplayString($setup.getSelectedJobTitle()) + " 职位的常见面试问题",
            1
            /* TEXT */
          ),
          vue.createCommentVNode(" 智能体状态显示 "),
          vue.createElementVNode("view", { class: "ai-status" }, [
            vue.createElementVNode(
              "text",
              {
                class: vue.normalizeClass(["status-badge", { "ai-enabled": $setup.aiEnabled, "ai-disabled": !$setup.aiEnabled }])
              },
              vue.toDisplayString($setup.aiEnabled ? "🤖 智能体模式" : "📝 默认模式"),
              3
              /* TEXT, CLASS */
            ),
            !$setup.aiEnabled ? (vue.openBlock(), vue.createElementBlock("text", {
              key: 0,
              class: "status-hint"
            }, "（智能体服务不可用，使用默认问题）")) : vue.createCommentVNode("v-if", true)
          ]),
          vue.createCommentVNode(" 错误信息 "),
          $setup.errorMessage ? (vue.openBlock(), vue.createElementBlock(
            "text",
            {
              key: 0,
              class: "error-message"
            },
            "⚠️ " + vue.toDisplayString($setup.errorMessage),
            1
            /* TEXT */
          )) : vue.createCommentVNode("v-if", true)
        ]),
        vue.createCommentVNode(" 加载状态 "),
        $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "loading-container"
        }, [
          vue.createElementVNode("view", { class: "loading-spinner" }),
          vue.createElementVNode("text", null, "智能体正在生成个性化面试问题...")
        ])) : (vue.openBlock(), vue.createElementBlock("view", {
          key: 1,
          class: "questions-list"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.interviewQuestions, (question, index) => {
              var _a;
              return vue.openBlock(), vue.createElementBlock("view", {
                key: index,
                class: "question-card"
              }, [
                vue.createElementVNode("view", {
                  class: "question-header",
                  onClick: ($event) => $setup.toggleQuestion(index)
                }, [
                  vue.createElementVNode(
                    "text",
                    { class: "question-number" },
                    vue.toDisplayString(index + 1),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    { class: "question-text" },
                    vue.toDisplayString(question.question),
                    1
                    /* TEXT */
                  ),
                  vue.createElementVNode(
                    "text",
                    {
                      class: vue.normalizeClass(["toggle-icon", { "rotated": $setup.expandedQuestions.has(index) }])
                    },
                    " ▼ ",
                    2
                    /* CLASS */
                  )
                ], 8, ["onClick"]),
                $setup.expandedQuestions.has(index) ? (vue.openBlock(), vue.createElementBlock("view", {
                  key: 0,
                  class: "question-content"
                }, [
                  vue.createElementVNode("view", { class: "question-meta" }, [
                    vue.createElementVNode(
                      "text",
                      { class: "question-type" },
                      vue.toDisplayString(question.type),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode(
                      "text",
                      { class: "question-difficulty" },
                      "难度：" + vue.toDisplayString(question.difficulty || "中等"),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createCommentVNode(" 用户回答区域 "),
                  vue.createElementVNode("view", { class: "user-answer-section" }, [
                    vue.createElementVNode("text", { class: "answer-title" }, "💬 您的回答："),
                    vue.withDirectives(vue.createElementVNode("textarea", {
                      "onUpdate:modelValue": ($event) => $setup.userAnswers[index] = $event,
                      class: "answer-input",
                      placeholder: "请输入您的回答...",
                      maxlength: "1000"
                    }, null, 8, ["onUpdate:modelValue"]), [
                      [vue.vModelText, $setup.userAnswers[index]]
                    ]),
                    vue.createElementVNode("view", { class: "answer-actions" }, [
                      vue.createElementVNode("button", {
                        class: "evaluate-btn",
                        onClick: ($event) => $setup.evaluateAnswer(index),
                        disabled: !$setup.userAnswers[index]
                      }, " 📊 评估回答 ", 8, ["onClick", "disabled"]),
                      vue.createElementVNode(
                        "text",
                        { class: "answer-length" },
                        vue.toDisplayString(((_a = $setup.userAnswers[index]) == null ? void 0 : _a.length) || 0) + "/1000",
                        1
                        /* TEXT */
                      )
                    ])
                  ]),
                  vue.createCommentVNode(" 参考答案 "),
                  vue.createElementVNode("view", { class: "reference-answer" }, [
                    vue.createElementVNode("text", { class: "answer-title" }, "💡 参考答案："),
                    vue.createElementVNode(
                      "view",
                      { class: "answer-content" },
                      vue.toDisplayString(question.answer || question.answerHint || "暂无参考答案"),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createCommentVNode(" 评估结果 "),
                  $setup.answerEvaluations[index] ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "evaluation-result"
                  }, [
                    vue.createElementVNode("text", { class: "evaluation-title" }, "📈 评估结果："),
                    vue.createElementVNode("view", { class: "evaluation-content" }, [
                      vue.createElementVNode("view", { class: "score-section" }, [
                        vue.createElementVNode("text", { class: "score-label" }, "综合评分："),
                        vue.createElementVNode(
                          "text",
                          { class: "score-value" },
                          vue.toDisplayString($setup.answerEvaluations[index].score) + "/100",
                          1
                          /* TEXT */
                        )
                      ]),
                      $setup.answerEvaluations[index].strengths ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 0,
                        class: "strengths-section"
                      }, [
                        vue.createElementVNode("text", { class: "section-label" }, "👍 优点："),
                        vue.createElementVNode(
                          "text",
                          { class: "section-content" },
                          vue.toDisplayString($setup.answerEvaluations[index].strengths.join("、")),
                          1
                          /* TEXT */
                        )
                      ])) : vue.createCommentVNode("v-if", true),
                      $setup.answerEvaluations[index].weaknesses ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 1,
                        class: "weaknesses-section"
                      }, [
                        vue.createElementVNode("text", { class: "section-label" }, "👎 改进建议："),
                        vue.createElementVNode(
                          "text",
                          { class: "section-content" },
                          vue.toDisplayString($setup.answerEvaluations[index].weaknesses.join("、")),
                          1
                          /* TEXT */
                        )
                      ])) : vue.createCommentVNode("v-if", true),
                      $setup.answerEvaluations[index].suggestions ? (vue.openBlock(), vue.createElementBlock("view", {
                        key: 2,
                        class: "suggestions-section"
                      }, [
                        vue.createElementVNode("text", { class: "section-label" }, "💡 优化建议："),
                        vue.createElementVNode(
                          "text",
                          { class: "section-content" },
                          vue.toDisplayString($setup.answerEvaluations[index].suggestions.join("、")),
                          1
                          /* TEXT */
                        )
                      ])) : vue.createCommentVNode("v-if", true)
                    ])
                  ])) : vue.createCommentVNode("v-if", true)
                ])) : vue.createCommentVNode("v-if", true)
              ]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ]))
      ])) : (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 1 },
        [
          vue.createCommentVNode(" 无匹配职业提示 "),
          vue.createElementVNode("view", { class: "no-job-selected" }, [
            vue.createElementVNode("view", { class: "no-job-content" }, [
              vue.createElementVNode("text", { class: "no-job-icon" }, "💼"),
              vue.createElementVNode("text", { class: "no-job-title" }, "请先选择职业"),
              vue.createElementVNode("text", { class: "no-job-desc" }, "选择上方匹配的职业开始获取面试问题")
            ])
          ])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      ))
    ]);
  }
  const PagesInterviewQuestionsInterviewQuestions = /* @__PURE__ */ _export_sfc(_sfc_main$3, [["render", _sfc_render$2], ["__scopeId", "data-v-5b2a5f3d"], ["__file", "D:/计算机编程/A13/app端/pages/interview-questions/interview-questions.vue"]]);
  const _sfc_main$2 = {
    __name: "my-interview",
    setup(__props, { expose: __expose }) {
      __expose();
      const interviews = vue.ref([]);
      const showSmartCreateModal = vue.ref(false);
      const careerCategories = vue.ref([
        {
          id: "technology",
          name: "技术类",
          icon: "💻",
          positions: ["前端开发工程师", "后端开发工程师", "全栈开发工程师", "移动开发工程师", "测试工程师"]
        },
        {
          id: "product",
          name: "产品类",
          icon: "📱",
          positions: ["产品经理", "产品助理", "产品运营"]
        },
        {
          id: "design",
          name: "设计类",
          icon: "🎨",
          positions: ["UI设计师", "UX设计师", "平面设计师"]
        },
        {
          id: "operation",
          name: "运营类",
          icon: "📊",
          positions: ["运营专员", "内容运营", "用户运营"]
        }
      ]);
      const interviewTypes = vue.ref(["线上面试", "线下面试", "电话面试", "视频面试"]);
      const smartCreateData = vue.ref({
        selectedCategory: "",
        selectedPosition: "",
        company: "",
        date: "",
        type: ""
      });
      const canCreateInterview = vue.computed(() => {
        return smartCreateData.value.selectedCategory && smartCreateData.value.selectedPosition && smartCreateData.value.date && smartCreateData.value.type;
      });
      onLoad(() => {
        loadInterviews();
      });
      const loadInterviews = () => {
        try {
          const savedInterviews = uni.getStorageSync("my_interviews");
          interviews.value = savedInterviews || [];
        } catch (error) {
          formatAppLog("error", "at pages/my-interview/my-interview.vue:259", "加载面试记录失败:", error);
          interviews.value = getDefaultInterviews();
        }
      };
      const getDefaultInterviews = () => {
        return [
          {
            id: "1",
            company: "腾讯科技",
            position: "前端开发工程师",
            date: "2024-04-15",
            type: "线上面试",
            status: "pending",
            interviewer: "张经理",
            remark: "技术面第一轮"
          },
          {
            id: "2",
            company: "阿里巴巴",
            position: "后端开发工程师",
            date: "2024-04-20",
            type: "线下面试",
            status: "completed",
            interviewer: "李总监",
            remark: "已通过技术面"
          }
        ];
      };
      const getStatusText = (status) => {
        const statusMap = {
          "pending": "待面试",
          "completed": "已完成",
          "offer": "已录用",
          "rejected": "未通过"
        };
        return statusMap[status] || "未知状态";
      };
      const selectCategory = (categoryId) => {
        smartCreateData.value.selectedCategory = categoryId;
        smartCreateData.value.selectedPosition = "";
      };
      const getCategoryPositions = (categoryId) => {
        const category = careerCategories.value.find((cat) => cat.id === categoryId);
        return category ? category.positions : [];
      };
      const onPositionChange = (e) => {
        const positions = getCategoryPositions(smartCreateData.value.selectedCategory);
        smartCreateData.value.selectedPosition = positions[e.detail.value];
      };
      const onDateChange = (e) => {
        smartCreateData.value.date = e.detail.value;
      };
      const onTypeChange = (e) => {
        smartCreateData.value.type = interviewTypes.value[e.detail.value];
      };
      const closeSmartCreateModal = () => {
        showSmartCreateModal.value = false;
        resetSmartCreateData();
      };
      const resetSmartCreateData = () => {
        smartCreateData.value = {
          selectedCategory: "",
          selectedPosition: "",
          company: "",
          date: "",
          type: ""
        };
      };
      const createInterview = () => {
        if (!canCreateInterview.value) {
          uni.showToast({
            title: "请填写完整信息",
            icon: "none"
          });
          return;
        }
        const newInterview = {
          id: Date.now().toString(),
          company: smartCreateData.value.company || getSmartCompany(smartCreateData.value.selectedPosition),
          position: smartCreateData.value.selectedPosition,
          date: smartCreateData.value.date,
          type: smartCreateData.value.type,
          status: "pending",
          interviewer: getSmartInterviewer(),
          remark: "智能创建的面试记录"
        };
        interviews.value.unshift(newInterview);
        saveInterviews();
        uni.showToast({
          title: "面试创建成功",
          icon: "success"
        });
        closeSmartCreateModal();
      };
      const getSmartCompany = (position) => {
        const companyMap = {
          "前端开发工程师": "字节跳动",
          "后端开发工程师": "阿里巴巴",
          "全栈开发工程师": "腾讯科技",
          "产品经理": "美团",
          "UI设计师": "网易",
          "运营专员": "京东"
        };
        return companyMap[position] || "知名互联网公司";
      };
      const getSmartInterviewer = () => {
        const interviewers = ["张经理", "李总监", "王主管", "刘工程师"];
        return interviewers[Math.floor(Math.random() * interviewers.length)];
      };
      const saveInterviews = () => {
        try {
          uni.setStorageSync("my_interviews", interviews.value);
        } catch (error) {
          formatAppLog("error", "at pages/my-interview/my-interview.vue:402", "保存面试记录失败:", error);
        }
      };
      const goToInterviewDetail = (interviewId) => {
        const interview = interviews.value.find((item) => item.id === interviewId);
        if (interview) {
          uni.navigateTo({
            url: `/pages/interview-simulation/interview-simulation?position=${encodeURIComponent(interview.position)}&company=${encodeURIComponent(interview.company)}`
          });
        }
      };
      const startSimulation = (interview) => {
        uni.showModal({
          title: "智能模拟面试",
          content: `即将开始 ${interview.position} 职位的智能模拟面试`,
          success: (res) => {
            if (res.confirm) {
              uni.navigateTo({
                url: `/pages/interview-simulation/interview-simulation?position=${encodeURIComponent(interview.position)}&company=${encodeURIComponent(interview.company)}`
              });
            }
          }
        });
      };
      const editInterview = (interview) => {
        uni.showModal({
          title: "编辑面试",
          content: "编辑功能开发中",
          showCancel: false
        });
      };
      const deleteInterview = (interview) => {
        uni.showModal({
          title: "确认删除",
          content: `确定要删除 ${interview.company} 的面试记录吗？`,
          success: (res) => {
            if (res.confirm) {
              interviews.value = interviews.value.filter((item) => item.id !== interview.id);
              saveInterviews();
              uni.showToast({
                title: "删除成功",
                icon: "success"
              });
            }
          }
        });
      };
      const __returned__ = { interviews, showSmartCreateModal, careerCategories, interviewTypes, smartCreateData, canCreateInterview, loadInterviews, getDefaultInterviews, getStatusText, selectCategory, getCategoryPositions, onPositionChange, onDateChange, onTypeChange, closeSmartCreateModal, resetSmartCreateData, createInterview, getSmartCompany, getSmartInterviewer, saveInterviews, goToInterviewDetail, startSimulation, editInterview, deleteInterview, ref: vue.ref, onMounted: vue.onMounted, computed: vue.computed, get onLoad() {
        return onLoad;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render$1(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 页面头部 "),
      vue.createElementVNode("view", { class: "page-header" }, [
        vue.createElementVNode("view", { class: "header-content" }, [
          vue.createElementVNode("text", { class: "page-badge" }, "🎯 面试管理"),
          vue.createElementVNode("text", { class: "page-title" }, "我的面试"),
          vue.createElementVNode("text", { class: "page-subtitle" }, "管理您的面试记录，追踪面试进度")
        ])
      ]),
      vue.createCommentVNode(" 操作栏 "),
      vue.createElementVNode("view", { class: "action-bar" }, [
        vue.createElementVNode("button", {
          class: "smart-create-btn",
          onClick: _cache[0] || (_cache[0] = ($event) => $setup.showSmartCreateModal = true)
        }, [
          vue.createElementVNode("text", { class: "btn-icon" }, "✨"),
          vue.createElementVNode("text", { class: "btn-text" }, "智能创建面试")
        ])
      ]),
      vue.createCommentVNode(" 面试列表 "),
      vue.createElementVNode("view", { class: "interview-list" }, [
        $setup.interviews.length > 0 ? (vue.openBlock(), vue.createElementBlock("view", {
          key: 0,
          class: "cards-container"
        }, [
          (vue.openBlock(true), vue.createElementBlock(
            vue.Fragment,
            null,
            vue.renderList($setup.interviews, (interview) => {
              return vue.openBlock(), vue.createElementBlock("view", {
                key: interview.id,
                class: vue.normalizeClass(["interview-card", "status-" + interview.status]),
                onClick: ($event) => $setup.goToInterviewDetail(interview.id)
              }, [
                vue.createElementVNode("view", { class: "card-header" }, [
                  vue.createElementVNode("view", { class: "company-info" }, [
                    vue.createElementVNode("view", { class: "company-logo" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "logo-text" },
                        vue.toDisplayString(interview.company.charAt(0)),
                        1
                        /* TEXT */
                      )
                    ]),
                    vue.createElementVNode("view", { class: "company-details" }, [
                      vue.createElementVNode(
                        "text",
                        { class: "company-name" },
                        vue.toDisplayString(interview.company),
                        1
                        /* TEXT */
                      ),
                      vue.createElementVNode(
                        "text",
                        { class: "position-name" },
                        vue.toDisplayString(interview.position),
                        1
                        /* TEXT */
                      )
                    ])
                  ]),
                  vue.createElementVNode(
                    "text",
                    {
                      class: vue.normalizeClass(["status-badge", "status-" + interview.status])
                    },
                    vue.toDisplayString($setup.getStatusText(interview.status)),
                    3
                    /* TEXT, CLASS */
                  )
                ]),
                vue.createElementVNode("view", { class: "card-body" }, [
                  vue.createElementVNode("view", { class: "info-row" }, [
                    vue.createElementVNode("text", { class: "label" }, "面试时间："),
                    vue.createElementVNode(
                      "text",
                      { class: "value" },
                      vue.toDisplayString(interview.date),
                      1
                      /* TEXT */
                    )
                  ]),
                  vue.createElementVNode("view", { class: "info-row" }, [
                    vue.createElementVNode("text", { class: "label" }, "面试形式："),
                    vue.createElementVNode(
                      "text",
                      { class: "value" },
                      vue.toDisplayString(interview.type),
                      1
                      /* TEXT */
                    )
                  ]),
                  interview.interviewer ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 0,
                    class: "info-row"
                  }, [
                    vue.createElementVNode("text", { class: "label" }, "面试官："),
                    vue.createElementVNode(
                      "text",
                      { class: "value" },
                      vue.toDisplayString(interview.interviewer),
                      1
                      /* TEXT */
                    )
                  ])) : vue.createCommentVNode("v-if", true),
                  interview.remark ? (vue.openBlock(), vue.createElementBlock("view", {
                    key: 1,
                    class: "info-row"
                  }, [
                    vue.createElementVNode("text", { class: "label" }, "备注："),
                    vue.createElementVNode(
                      "text",
                      { class: "value" },
                      vue.toDisplayString(interview.remark),
                      1
                      /* TEXT */
                    )
                  ])) : vue.createCommentVNode("v-if", true)
                ]),
                vue.createElementVNode("view", { class: "card-actions" }, [
                  vue.createElementVNode("button", {
                    class: "action-btn simulate",
                    onClick: vue.withModifiers(($event) => $setup.startSimulation(interview), ["stop"])
                  }, [
                    vue.createElementVNode("text", { class: "action-icon" }, "🎭"),
                    vue.createElementVNode("text", { class: "action-text" }, "智能模拟")
                  ], 8, ["onClick"]),
                  vue.createElementVNode("button", {
                    class: "action-btn edit",
                    onClick: vue.withModifiers(($event) => $setup.editInterview(interview), ["stop"])
                  }, [
                    vue.createElementVNode("text", { class: "action-icon" }, "✏️"),
                    vue.createElementVNode("text", { class: "action-text" }, "编辑")
                  ], 8, ["onClick"]),
                  vue.createElementVNode("button", {
                    class: "action-btn delete",
                    onClick: vue.withModifiers(($event) => $setup.deleteInterview(interview), ["stop"])
                  }, [
                    vue.createElementVNode("text", { class: "action-icon" }, "🗑️"),
                    vue.createElementVNode("text", { class: "action-text" }, "删除")
                  ], 8, ["onClick"])
                ])
              ], 10, ["onClick"]);
            }),
            128
            /* KEYED_FRAGMENT */
          ))
        ])) : (vue.openBlock(), vue.createElementBlock(
          vue.Fragment,
          { key: 1 },
          [
            vue.createCommentVNode(" 空状态 "),
            vue.createElementVNode("view", { class: "empty-state" }, [
              vue.createElementVNode("view", { class: "empty-icon" }, [
                vue.createElementVNode("text", null, "📋")
              ]),
              vue.createElementVNode("text", { class: "empty-title" }, "暂无面试记录"),
              vue.createElementVNode("text", { class: "empty-desc" }, "开始您的第一个面试吧！"),
              vue.createElementVNode("button", {
                class: "smart-create-btn large",
                onClick: _cache[1] || (_cache[1] = ($event) => $setup.showSmartCreateModal = true)
              }, [
                vue.createElementVNode("text", { class: "btn-icon" }, "✨"),
                vue.createElementVNode("text", { class: "btn-text" }, "智能创建第一个面试")
              ])
            ])
          ],
          2112
          /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
        ))
      ]),
      vue.createCommentVNode(" 智能创建模态框 "),
      $setup.showSmartCreateModal ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "modal-overlay",
        onClick: $setup.closeSmartCreateModal
      }, [
        vue.createElementVNode("view", {
          class: "modal smart-create-modal",
          onClick: _cache[3] || (_cache[3] = vue.withModifiers(() => {
          }, ["stop"]))
        }, [
          vue.createElementVNode("view", { class: "modal-header" }, [
            vue.createElementVNode("text", { class: "modal-title" }, "智能创建面试"),
            vue.createElementVNode("button", {
              class: "close-btn",
              onClick: $setup.closeSmartCreateModal
            }, [
              vue.createElementVNode("text", { class: "close-icon" }, "✕")
            ])
          ]),
          vue.createElementVNode("view", { class: "modal-body" }, [
            vue.createElementVNode("view", { class: "smart-create-form" }, [
              vue.createCommentVNode(" 职业分类选择 "),
              vue.createElementVNode("view", { class: "form-group" }, [
                vue.createElementVNode("text", { class: "form-label" }, "职业分类"),
                vue.createElementVNode("view", { class: "career-categories" }, [
                  (vue.openBlock(true), vue.createElementBlock(
                    vue.Fragment,
                    null,
                    vue.renderList($setup.careerCategories, (category) => {
                      return vue.openBlock(), vue.createElementBlock("view", {
                        key: category.id,
                        class: vue.normalizeClass(["category-card", { "selected": $setup.smartCreateData.selectedCategory === category.id }]),
                        onClick: ($event) => $setup.selectCategory(category.id)
                      }, [
                        vue.createElementVNode(
                          "text",
                          { class: "category-icon" },
                          vue.toDisplayString(category.icon),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          { class: "category-name" },
                          vue.toDisplayString(category.name),
                          1
                          /* TEXT */
                        ),
                        vue.createElementVNode(
                          "text",
                          { class: "category-count" },
                          vue.toDisplayString(category.positions.length) + "个职位",
                          1
                          /* TEXT */
                        )
                      ], 10, ["onClick"]);
                    }),
                    128
                    /* KEYED_FRAGMENT */
                  ))
                ])
              ]),
              vue.createCommentVNode(" 具体职位选择 "),
              $setup.smartCreateData.selectedCategory ? (vue.openBlock(), vue.createElementBlock("view", {
                key: 0,
                class: "form-group"
              }, [
                vue.createElementVNode("text", { class: "form-label" }, "具体职位"),
                vue.createElementVNode("picker", {
                  range: $setup.getCategoryPositions($setup.smartCreateData.selectedCategory),
                  onChange: $setup.onPositionChange,
                  class: "form-picker"
                }, [
                  vue.createElementVNode("view", { class: "picker-display" }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString($setup.smartCreateData.selectedPosition || "请选择职位"),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("text", { class: "picker-arrow" }, "▼")
                  ])
                ], 40, ["range"])
              ])) : vue.createCommentVNode("v-if", true),
              vue.createCommentVNode(" 公司名称 "),
              vue.createElementVNode("view", { class: "form-group" }, [
                vue.createElementVNode("text", { class: "form-label" }, [
                  vue.createTextVNode(" 公司名称 "),
                  vue.createElementVNode("text", { class: "info-hint" }, "（可选）")
                ]),
                vue.withDirectives(vue.createElementVNode(
                  "input",
                  {
                    "onUpdate:modelValue": _cache[2] || (_cache[2] = ($event) => $setup.smartCreateData.company = $event),
                    class: "form-input",
                    placeholder: "不填写将使用智能推荐"
                  },
                  null,
                  512
                  /* NEED_PATCH */
                ), [
                  [vue.vModelText, $setup.smartCreateData.company]
                ])
              ]),
              vue.createCommentVNode(" 面试时间 "),
              vue.createElementVNode("view", { class: "form-group" }, [
                vue.createElementVNode("text", { class: "form-label" }, "面试时间"),
                vue.createElementVNode("picker", {
                  mode: "date",
                  value: $setup.smartCreateData.date,
                  onChange: $setup.onDateChange,
                  class: "form-picker"
                }, [
                  vue.createElementVNode("view", { class: "picker-display" }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString($setup.smartCreateData.date || "请选择面试日期"),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("text", { class: "picker-arrow" }, "▼")
                  ])
                ], 40, ["value"])
              ]),
              vue.createCommentVNode(" 面试形式 "),
              vue.createElementVNode("view", { class: "form-group" }, [
                vue.createElementVNode("text", { class: "form-label" }, "面试形式"),
                vue.createElementVNode("picker", {
                  range: $setup.interviewTypes,
                  onChange: $setup.onTypeChange,
                  class: "form-picker"
                }, [
                  vue.createElementVNode("view", { class: "picker-display" }, [
                    vue.createElementVNode(
                      "text",
                      null,
                      vue.toDisplayString($setup.smartCreateData.type || "请选择面试形式"),
                      1
                      /* TEXT */
                    ),
                    vue.createElementVNode("text", { class: "picker-arrow" }, "▼")
                  ])
                ], 40, ["range"])
              ])
            ])
          ]),
          vue.createElementVNode("view", { class: "modal-footer" }, [
            vue.createElementVNode("button", {
              class: "btn-cancel",
              onClick: $setup.closeSmartCreateModal
            }, "取消"),
            vue.createElementVNode("button", {
              class: "btn-confirm",
              onClick: $setup.createInterview,
              disabled: !$setup.canCreateInterview
            }, " 创建面试 ", 8, ["disabled"])
          ])
        ])
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesMyInterviewMyInterview = /* @__PURE__ */ _export_sfc(_sfc_main$2, [["render", _sfc_render$1], ["__scopeId", "data-v-10201d82"], ["__file", "D:/计算机编程/A13/app端/pages/my-interview/my-interview.vue"]]);
  const _sfc_main$1 = {
    __name: "interview-simulation",
    setup(__props, { expose: __expose }) {
      __expose();
      const parseMarkdown = (text) => {
        if (!text)
          return "";
        text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
        text = text.replace(/`(.*?)`/g, "<code>$1</code>");
        text = text.replace(/\n/g, "<br/>");
        text = text.replace(/^\s*[-*]\s+(.*)$/gm, "<li>$1</li>");
        text = text.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");
        return text;
      };
      const interviewData2 = vue.ref({
        position: "",
        company: "",
        type: "智能模拟面试"
      });
      const aiEnabled = vue.ref(false);
      const interviewStarted = vue.ref(false);
      const loading = vue.ref(false);
      const evaluating = vue.ref(false);
      const errorMessage = vue.ref("");
      const aiGeneratedQuestions = vue.ref([]);
      const currentQuestionIndex = vue.ref(0);
      const userAnswer = vue.ref("");
      const userAnswers = vue.ref({});
      const evaluationCompleted = vue.ref(false);
      const evaluation = vue.ref({
        score: 0,
        quality: "",
        professionalism: "",
        suggestions: "",
        detailed_analysis: ""
      });
      const aiResponse = vue.ref("欢迎使用智能面试模拟系统！我将为您提供个性化的面试体验。");
      const currentQuestion = vue.computed(() => {
        return aiGeneratedQuestions.value[currentQuestionIndex.value] || {};
      });
      const totalQuestions = vue.computed(() => {
        return aiGeneratedQuestions.value.length;
      });
      const isLastQuestion = vue.computed(() => {
        return currentQuestionIndex.value === totalQuestions.value - 1;
      });
      onLoad((options) => {
        if (options.position) {
          interviewData2.value.position = decodeURIComponent(options.position);
        }
        if (options.company) {
          interviewData2.value.company = decodeURIComponent(options.company);
        }
        checkAIService();
      });
      const checkAIService = async () => {
        try {
          const response = await uni.request({
            url: config.baseUrl + "/interview/health",
            method: "GET"
          });
          aiEnabled.value = response.data.success;
        } catch (error) {
          formatAppLog("error", "at pages/interview-simulation/interview-simulation.vue:246", "检查智能体服务失败:", error);
          aiEnabled.value = false;
        }
      };
      const getResumeText = () => {
        try {
          const resumeAnalysis = uni.getStorageSync("resume_analysis");
          return (resumeAnalysis == null ? void 0 : resumeAnalysis.resume_text) || "计算机专业学生，具备扎实的编程基础和项目经验";
        } catch (error) {
          return "计算机专业学生，具备扎实的编程基础和项目经验";
        }
      };
      const getJobRequirements = () => {
        const position = interviewData2.value.position;
        const requirementsMap = {
          "前端开发工程师": "熟悉HTML/CSS/JavaScript，掌握Vue/React框架，有响应式设计经验",
          "后端开发工程师": "熟悉Java/Python/Go等后端语言，掌握数据库设计，有API开发经验",
          "全栈开发工程师": "具备前后端开发能力，熟悉完整项目开发流程，有全栈项目经验",
          "产品经理": "具备产品设计、需求分析、项目管理能力，熟悉用户研究",
          "UI设计师": "熟悉UI设计规范，掌握设计工具，具备良好的审美能力"
        };
        return requirementsMap[position] || "具备良好的学习能力和团队协作精神";
      };
      const startInterview = async () => {
        loading.value = true;
        errorMessage.value = "";
        try {
          await generateInterviewQuestions();
          aiResponse.value = `面试已开始！我将为您提供${totalQuestions.value}个问题。

当前问题类型：${currentQuestion.value.type || "通用"}
难度：${currentQuestion.value.difficulty || "中等"}

您可以开始回答，我会为您提供实时帮助和评估。`;
          interviewStarted.value = true;
        } catch (error) {
          formatAppLog("error", "at pages/interview-simulation/interview-simulation.vue:289", "开始面试失败:", error);
          errorMessage.value = "开始面试失败，请检查网络连接后重试";
        } finally {
          loading.value = false;
        }
      };
      const generateInterviewQuestions = async () => {
        try {
          if (aiEnabled.value) {
            const response = await uni.request({
              url: config.baseUrl + "/interview/generate-questions",
              method: "POST",
              data: {
                resume_text: getResumeText(),
                job_title: interviewData2.value.position,
                job_requirements: getJobRequirements(),
                question_count: 5
              }
            });
            if (response.data.success) {
              aiGeneratedQuestions.value = response.data.data.interview_questions || [];
            } else {
              throw new Error("智能体生成问题失败");
            }
          }
          if (!aiGeneratedQuestions.value.length) {
            aiGeneratedQuestions.value = getDefaultQuestions();
          }
        } catch (error) {
          formatAppLog("error", "at pages/interview-simulation/interview-simulation.vue:325", "生成面试问题失败:", error);
          aiGeneratedQuestions.value = getDefaultQuestions();
        }
      };
      const getDefaultQuestions = () => {
        const position = interviewData2.value.position;
        const defaultQuestions = {
          "前端开发工程师": [
            {
              question: "请介绍一下Vue.js和React的主要区别？",
              type: "技术",
              difficulty: "中等",
              answer_hint: "可以从响应式原理、组件化方式、生态等方面回答"
            },
            {
              question: "如何优化前端性能？",
              type: "技术",
              difficulty: "困难",
              answer_hint: "包括代码分割、懒加载、缓存策略等"
            }
          ],
          "后端开发工程师": [
            {
              question: "请解释一下RESTful API的设计原则？",
              type: "技术",
              difficulty: "中等",
              answer_hint: "包括无状态、统一接口、资源导向等"
            },
            {
              question: "如何处理高并发场景？",
              type: "技术",
              difficulty: "困难",
              answer_hint: "包括负载均衡、缓存、数据库优化等"
            }
          ]
        };
        return defaultQuestions[position] || [
          {
            question: "请做一个简单的自我介绍？",
            type: "通用",
            difficulty: "简单",
            answer_hint: "包括教育背景、工作经验、技能特长等"
          },
          {
            question: "为什么选择我们公司？",
            type: "业务",
            difficulty: "中等",
            answer_hint: "可以从公司文化、发展前景、个人匹配度等方面回答"
          }
        ];
      };
      const evaluateAnswer = async () => {
        if (!userAnswer.value) {
          aiResponse.value = "请先输入您的回答，然后我可以为您提供专业的评估和建议。";
          return;
        }
        evaluating.value = true;
        errorMessage.value = "";
        try {
          if (aiEnabled.value) {
            const response = await uni.request({
              url: config.baseUrl + "/interview/evaluate-answer",
              method: "POST",
              data: {
                question: currentQuestion.value.question,
                user_answer: userAnswer.value,
                expected_answer: currentQuestion.value.answer_hint || "请根据问题内容提供专业回答"
              }
            });
            if (response.data.success) {
              evaluation.value = response.data.data;
              evaluationCompleted.value = true;
              userAnswers.value[currentQuestionIndex.value] = userAnswer.value;
              aiResponse.value = `评估完成！您的得分为 ${evaluation.value.score} 分。

${evaluation.value.overall_feedback || "请继续努力！"}`;
            } else {
              throw new Error("智能体评估失败");
            }
          } else {
            await evaluateAnswerDefault();
          }
        } catch (error) {
          formatAppLog("error", "at pages/interview-simulation/interview-simulation.vue:423", "评估回答失败:", error);
          errorMessage.value = "评估失败，请稍后重试";
          await evaluateAnswerDefault();
        } finally {
          evaluating.value = false;
        }
      };
      const evaluateAnswerDefault = async () => {
        const answerLength = userAnswer.value.length;
        const score = Math.min(100, Math.floor(answerLength / 5) + 60);
        evaluation.value = {
          score,
          quality: answerLength > 50 ? "良好" : "一般",
          professionalism: "基本符合要求",
          suggestions: "建议提供更具体的例子和细节",
          detailed_analysis: "回答内容基本完整，可以进一步丰富细节"
        };
        evaluationCompleted.value = true;
        userAnswers.value[currentQuestionIndex.value] = userAnswer.value;
        aiResponse.value = `默认评估完成！您的得分为 ${score} 分。

建议提供更具体的例子和细节来丰富您的回答。`;
      };
      const nextQuestion = () => {
        if (isLastQuestion.value) {
          completeInterview();
        } else {
          currentQuestionIndex.value++;
          userAnswer.value = "";
          evaluationCompleted.value = false;
          evaluation.value = {};
          aiResponse.value = `进入第 ${currentQuestionIndex.value + 1} 题：${currentQuestion.value.type || "通用"} 类型问题
难度：${currentQuestion.value.difficulty || "中等"}`;
        }
      };
      const completeInterview = () => {
        const totalScore = Object.values(userAnswers.value).reduce((sum, answer, index) => {
          return sum + (evaluation.value.score || 70);
        }, 0) / totalQuestions.value;
        uni.showModal({
          title: "面试完成",
          content: `恭喜您完成面试！平均得分：${Math.round(totalScore)}/100`,
          showCancel: false,
          success: () => {
            uni.navigateBack();
          }
        });
      };
      const __returned__ = { parseMarkdown, interviewData: interviewData2, aiEnabled, interviewStarted, loading, evaluating, errorMessage, aiGeneratedQuestions, currentQuestionIndex, userAnswer, userAnswers, evaluationCompleted, evaluation, aiResponse, currentQuestion, totalQuestions, isLastQuestion, checkAIService, getResumeText, getJobRequirements, startInterview, generateInterviewQuestions, getDefaultQuestions, evaluateAnswer, evaluateAnswerDefault, nextQuestion, completeInterview, ref: vue.ref, onMounted: vue.onMounted, computed: vue.computed, get onLoad() {
        return onLoad;
      }, get config() {
        return config;
      } };
      Object.defineProperty(__returned__, "__isScriptSetup", { enumerable: false, value: true });
      return __returned__;
    }
  };
  function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
    return vue.openBlock(), vue.createElementBlock("view", { class: "container" }, [
      vue.createCommentVNode(" 页面头部 "),
      vue.createElementVNode("view", { class: "page-header" }, [
        vue.createElementVNode("view", { class: "header-content" }, [
          vue.createElementVNode("text", { class: "page-badge" }, "🤖 智能面试模拟"),
          vue.createElementVNode(
            "text",
            { class: "page-title" },
            vue.toDisplayString($setup.interviewData.position) + " - " + vue.toDisplayString($setup.interviewData.company),
            1
            /* TEXT */
          ),
          vue.createElementVNode("text", { class: "page-subtitle" }, "AI智能体将为您提供个性化的面试体验")
        ])
      ]),
      vue.createCommentVNode(" AI状态显示 "),
      vue.createElementVNode("view", { class: "ai-status-section" }, [
        vue.createElementVNode(
          "view",
          {
            class: vue.normalizeClass(["ai-status", { "ai-enabled": $setup.aiEnabled, "ai-disabled": !$setup.aiEnabled }])
          },
          [
            vue.createElementVNode(
              "text",
              { class: "status-icon" },
              vue.toDisplayString($setup.aiEnabled ? "🤖" : "⚠️"),
              1
              /* TEXT */
            ),
            vue.createElementVNode(
              "text",
              { class: "status-text" },
              vue.toDisplayString($setup.aiEnabled ? "智能体已就绪" : "智能体服务不可用"),
              1
              /* TEXT */
            ),
            !$setup.aiEnabled ? (vue.openBlock(), vue.createElementBlock("text", {
              key: 0,
              class: "status-hint"
            }, "（将使用默认面试模式）")) : vue.createCommentVNode("v-if", true)
          ],
          2
          /* CLASS */
        )
      ]),
      vue.createCommentVNode(" 面试准备阶段 "),
      !$setup.interviewStarted ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 0,
        class: "preparation-section"
      }, [
        vue.createElementVNode("view", { class: "preparation-card" }, [
          vue.createElementVNode("text", { class: "preparation-title" }, "面试准备"),
          vue.createElementVNode("text", { class: "preparation-desc" }, "AI智能体将基于您的简历和岗位要求，生成个性化的面试问题"),
          vue.createElementVNode("view", { class: "preparation-info" }, [
            vue.createElementVNode("view", { class: "info-item" }, [
              vue.createElementVNode("text", { class: "info-label" }, "目标岗位："),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($setup.interviewData.position),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "info-item" }, [
              vue.createElementVNode("text", { class: "info-label" }, "目标公司："),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($setup.interviewData.company),
                1
                /* TEXT */
              )
            ]),
            vue.createElementVNode("view", { class: "info-item" }, [
              vue.createElementVNode("text", { class: "info-label" }, "面试形式："),
              vue.createElementVNode(
                "text",
                { class: "info-value" },
                vue.toDisplayString($setup.interviewData.type || "智能模拟面试"),
                1
                /* TEXT */
              )
            ])
          ]),
          vue.createElementVNode("button", {
            class: "start-interview-btn",
            onClick: $setup.startInterview,
            disabled: $setup.loading
          }, [
            $setup.loading ? (vue.openBlock(), vue.createElementBlock("text", {
              key: 0,
              class: "btn-loading"
            }, "⏳")) : (vue.openBlock(), vue.createElementBlock("text", {
              key: 1,
              class: "btn-icon"
            }, "🚀")),
            vue.createElementVNode(
              "text",
              { class: "btn-text" },
              vue.toDisplayString($setup.loading ? "智能体正在准备..." : "开始智能面试"),
              1
              /* TEXT */
            )
          ], 8, ["disabled"])
        ])
      ])) : (vue.openBlock(), vue.createElementBlock(
        vue.Fragment,
        { key: 1 },
        [
          vue.createCommentVNode(" 面试进行中 "),
          vue.createElementVNode("view", { class: "interview-section" }, [
            vue.createCommentVNode(" 当前问题 "),
            vue.createElementVNode("view", { class: "current-question-section" }, [
              vue.createElementVNode("view", { class: "question-header" }, [
                vue.createElementVNode(
                  "text",
                  { class: "question-number" },
                  "问题 " + vue.toDisplayString($setup.currentQuestionIndex + 1) + "/" + vue.toDisplayString($setup.totalQuestions),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "question-type" },
                  vue.toDisplayString($setup.currentQuestion.type || "通用"),
                  1
                  /* TEXT */
                ),
                vue.createElementVNode(
                  "text",
                  { class: "question-difficulty" },
                  vue.toDisplayString($setup.currentQuestion.difficulty || "中等"),
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "question-content" }, [
                vue.createElementVNode(
                  "text",
                  { class: "question-text" },
                  vue.toDisplayString($setup.currentQuestion.question),
                  1
                  /* TEXT */
                )
              ]),
              vue.createCommentVNode(" 回答区域 "),
              vue.createElementVNode("view", { class: "answer-section" }, [
                vue.createElementVNode("text", { class: "answer-label" }, "您的回答："),
                vue.withDirectives(vue.createElementVNode("textarea", {
                  "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => $setup.userAnswer = $event),
                  class: "answer-input",
                  placeholder: "请在此输入您的回答...",
                  maxlength: 1e3,
                  disabled: $setup.evaluating
                }, null, 8, ["disabled"]), [
                  [vue.vModelText, $setup.userAnswer]
                ]),
                vue.createElementVNode(
                  "text",
                  { class: "answer-length" },
                  vue.toDisplayString($setup.userAnswer.length) + "/1000",
                  1
                  /* TEXT */
                )
              ]),
              vue.createCommentVNode(" 操作按钮 "),
              vue.createElementVNode("view", { class: "action-buttons" }, [
                vue.createElementVNode("button", {
                  class: "action-btn evaluate-btn",
                  onClick: $setup.evaluateAnswer,
                  disabled: !$setup.userAnswer || $setup.evaluating
                }, [
                  $setup.evaluating ? (vue.openBlock(), vue.createElementBlock("text", {
                    key: 0,
                    class: "btn-loading"
                  }, "⏳")) : (vue.openBlock(), vue.createElementBlock("text", {
                    key: 1,
                    class: "btn-icon"
                  }, "📊")),
                  vue.createElementVNode(
                    "text",
                    { class: "btn-text" },
                    vue.toDisplayString($setup.evaluating ? "AI评估中..." : "AI评估回答"),
                    1
                    /* TEXT */
                  )
                ], 8, ["disabled"]),
                vue.createElementVNode("button", {
                  class: "action-btn next-btn",
                  onClick: $setup.nextQuestion,
                  disabled: !$setup.evaluationCompleted
                }, [
                  vue.createElementVNode("text", { class: "btn-icon" }, "➡️"),
                  vue.createElementVNode(
                    "text",
                    { class: "btn-text" },
                    vue.toDisplayString($setup.isLastQuestion ? "完成面试" : "下一题"),
                    1
                    /* TEXT */
                  )
                ], 8, ["disabled"])
              ])
            ]),
            vue.createCommentVNode(" AI评估结果 "),
            $setup.evaluationCompleted ? (vue.openBlock(), vue.createElementBlock("view", {
              key: 0,
              class: "evaluation-section"
            }, [
              vue.createElementVNode("view", { class: "evaluation-header" }, [
                vue.createElementVNode("text", { class: "evaluation-title" }, "AI智能评估"),
                vue.createElementVNode(
                  "text",
                  { class: "evaluation-score" },
                  "得分：" + vue.toDisplayString($setup.evaluation.score) + "/100",
                  1
                  /* TEXT */
                )
              ]),
              vue.createElementVNode("view", { class: "evaluation-content" }, [
                vue.createElementVNode("view", { class: "evaluation-item" }, [
                  vue.createElementVNode("text", { class: "item-label" }, "回答优点："),
                  vue.createElementVNode(
                    "text",
                    { class: "item-value" },
                    vue.toDisplayString($setup.evaluation.strengths ? $setup.evaluation.strengths.join("，") : "无"),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "evaluation-item" }, [
                  vue.createElementVNode("text", { class: "item-label" }, "回答不足："),
                  vue.createElementVNode(
                    "text",
                    { class: "item-value" },
                    vue.toDisplayString($setup.evaluation.weaknesses ? $setup.evaluation.weaknesses.join("，") : "无"),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "evaluation-item" }, [
                  vue.createElementVNode("text", { class: "item-label" }, "改进建议："),
                  vue.createElementVNode(
                    "text",
                    { class: "item-value" },
                    vue.toDisplayString($setup.evaluation.improvement_suggestions ? $setup.evaluation.improvement_suggestions.join("，") : "无"),
                    1
                    /* TEXT */
                  )
                ]),
                vue.createElementVNode("view", { class: "evaluation-item" }, [
                  vue.createElementVNode("text", { class: "item-label" }, "总体评价："),
                  vue.createElementVNode(
                    "text",
                    { class: "item-value" },
                    vue.toDisplayString($setup.evaluation.overall_feedback || "无"),
                    1
                    /* TEXT */
                  )
                ])
              ])
            ])) : vue.createCommentVNode("v-if", true),
            vue.createCommentVNode(" AI助手对话 "),
            vue.createElementVNode("view", { class: "ai-assistant-section" }, [
              vue.createElementVNode("view", { class: "assistant-header" }, [
                vue.createElementVNode("text", { class: "assistant-title" }, "AI面试助手")
              ]),
              vue.createElementVNode("view", { class: "assistant-content" }, [
                vue.createElementVNode("rich-text", {
                  class: "assistant-message",
                  nodes: $setup.parseMarkdown($setup.aiResponse)
                }, null, 8, ["nodes"])
              ])
            ])
          ])
        ],
        2112
        /* STABLE_FRAGMENT, DEV_ROOT_FRAGMENT */
      )),
      vue.createCommentVNode(" 加载状态 "),
      $setup.loading ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 2,
        class: "loading-overlay"
      }, [
        vue.createElementVNode("view", { class: "loading-content" }, [
          vue.createElementVNode("view", { class: "loading-spinner" }),
          vue.createElementVNode("text", { class: "loading-text" }, "AI智能体正在工作...")
        ])
      ])) : vue.createCommentVNode("v-if", true),
      vue.createCommentVNode(" 错误提示 "),
      $setup.errorMessage ? (vue.openBlock(), vue.createElementBlock("view", {
        key: 3,
        class: "error-message"
      }, [
        vue.createElementVNode("text", { class: "error-icon" }, "⚠️"),
        vue.createElementVNode(
          "text",
          { class: "error-text" },
          vue.toDisplayString($setup.errorMessage),
          1
          /* TEXT */
        )
      ])) : vue.createCommentVNode("v-if", true)
    ]);
  }
  const PagesInterviewSimulationInterviewSimulation = /* @__PURE__ */ _export_sfc(_sfc_main$1, [["render", _sfc_render], ["__scopeId", "data-v-299bdcf8"], ["__file", "D:/计算机编程/A13/app端/pages/interview-simulation/interview-simulation.vue"]]);
  __definePage("pages/login/login", PagesLoginLogin);
  __definePage("pages/index/index", PagesIndexIndex);
  __definePage("pages/ai-assistant/ai-assistant", PagesAiAssistantAiAssistant);
  __definePage("pages/job-explore/job-explore", PagesJobExploreJobExplore);
  __definePage("pages/student-profile/student-profile", PagesStudentProfileStudentProfile);
  __definePage("pages/user-center/user-center", PagesUserCenterUserCenter);
  __definePage("pages/job-detail/job-detail", PagesJobDetailJobDetail);
  __definePage("pages/upload-resume/upload-resume", PagesUploadResumeUploadResume);
  __definePage("pages/edit-profile/edit-profile", PagesEditProfileEditProfile);
  __definePage("pages/career-plan/career-plan", PagesCareerPlanCareerPlan);
  __definePage("pages/interview-prep/interview-prep", PagesInterviewPrepInterviewPrep);
  __definePage("pages/my-applications/my-applications", PagesMyApplicationsMyApplications);
  __definePage("pages/my-favorites/my-favorites", PagesMyFavoritesMyFavorites);
  __definePage("pages/interview-questions/interview-questions", PagesInterviewQuestionsInterviewQuestions);
  __definePage("pages/my-interview/my-interview", PagesMyInterviewMyInterview);
  __definePage("pages/interview-simulation/interview-simulation", PagesInterviewSimulationInterviewSimulation);
  const _sfc_main = {
    onLaunch: function() {
      formatAppLog("log", "at App.vue:4", "App Launch");
      const token = uni.getStorageSync("token");
      if (!token) {
        uni.reLaunch({
          url: "/pages/login/login"
        });
      }
    },
    onShow: function() {
      formatAppLog("log", "at App.vue:16", "App Show");
    },
    onHide: function() {
      formatAppLog("log", "at App.vue:19", "App Hide");
    }
  };
  const App = /* @__PURE__ */ _export_sfc(_sfc_main, [["__file", "D:/计算机编程/A13/app端/App.vue"]]);
  function createApp() {
    const app = vue.createVueApp(App);
    app.config.globalProperties.$baseUrl = config.baseUrl;
    return {
      app
    };
  }
  const { app: __app__, Vuex: __Vuex__, Pinia: __Pinia__ } = createApp();
  uni.Vuex = __Vuex__;
  uni.Pinia = __Pinia__;
  __app__.provide("__globalStyles", __uniConfig.styles);
  __app__._component.mpType = "app";
  __app__._component.render = () => {
  };
  __app__.mount("#app");
})(Vue);
