"use strict";
const common_vendor = require("../../common/vendor.js");
const api_user = require("../../api/user.js");
const _sfc_main = {
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
        common_vendor.index.showLoading({ title: "加载中..." });
        const res = await api_user.userApi.getUserInfo();
        if (res && res.data) {
          this.form = { ...this.form, ...res.data };
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/edit-profile/edit-profile.vue:170", "加载个人信息失败:", err);
      } finally {
        common_vendor.index.hideLoading();
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
        common_vendor.index.showToast({
          title: "请输入姓名",
          icon: "none"
        });
        return;
      }
      this.isSaving = true;
      try {
        await api_user.userApi.updateUserInfo(this.form);
        common_vendor.index.showToast({
          title: "保存成功",
          icon: "success"
        });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/edit-profile/edit-profile.vue:205", err);
        common_vendor.index.showToast({
          title: "保存失败",
          icon: "none"
        });
      } finally {
        this.isSaving = false;
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: $data.form.name,
    b: common_vendor.o(($event) => $data.form.name = $event.detail.value),
    c: common_vendor.f($data.genderOptions, (item, k0, i0) => {
      return {
        a: common_vendor.t(item.label),
        b: item.value,
        c: $data.form.gender === item.value ? 1 : "",
        d: common_vendor.o(($event) => $data.form.gender = item.value, item.value)
      };
    }),
    d: $data.form.phone,
    e: common_vendor.o(($event) => $data.form.phone = $event.detail.value),
    f: $data.form.email,
    g: common_vendor.o(($event) => $data.form.email = $event.detail.value),
    h: $data.form.school,
    i: common_vendor.o(($event) => $data.form.school = $event.detail.value),
    j: $data.form.major,
    k: common_vendor.o(($event) => $data.form.major = $event.detail.value),
    l: common_vendor.t($data.form.education || "请选择学历"),
    m: !$data.form.education ? 1 : "",
    n: $data.educationOptions,
    o: common_vendor.o((...args) => $options.onEducationChange && $options.onEducationChange(...args)),
    p: common_vendor.t($data.form.graduationYear || "请选择毕业年份"),
    q: !$data.form.graduationYear ? 1 : "",
    r: $data.yearOptions,
    s: common_vendor.o((...args) => $options.onYearChange && $options.onYearChange(...args)),
    t: $data.form.bio,
    v: common_vendor.o(($event) => $data.form.bio = $event.detail.value),
    w: common_vendor.t($data.form.bio.length),
    x: common_vendor.t($data.isSaving ? "保存中..." : "保存"),
    y: $data.isSaving ? 1 : "",
    z: common_vendor.o((...args) => $options.saveProfile && $options.saveProfile(...args)),
    A: $data.isSaving
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c0f45e44"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/edit-profile/edit-profile.js.map
