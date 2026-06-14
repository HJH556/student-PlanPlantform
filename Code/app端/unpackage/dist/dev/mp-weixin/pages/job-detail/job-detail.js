"use strict";
const common_vendor = require("../../common/vendor.js");
const api_job = require("../../api/job.js");
const _sfc_main = {
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
        const response = await api_job.jobApi.getApplications();
        common_vendor.index.__f__("log", "at pages/job-detail/job-detail.vue:117", "申请列表响应:", response);
        if (response && response.data && Array.isArray(response.data)) {
          this.appliedJobIds = new Set(response.data.map((app) => app.job_id || app.jobId));
          this.checkIfApplied();
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/job-detail/job-detail.vue:123", "获取申请列表失败:", err);
      }
    },
    checkIfApplied() {
      if (this.jobId && this.appliedJobIds.has(Number(this.jobId))) {
        this.job.applied = true;
      }
    },
    async loadJobDetail() {
      try {
        common_vendor.index.showLoading({ title: "加载中..." });
        const response = await api_job.jobApi.getJobDetail(this.jobId);
        common_vendor.index.__f__("log", "at pages/job-detail/job-detail.vue:137", "岗位详情响应:", response);
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
        common_vendor.index.__f__("error", "at pages/job-detail/job-detail.vue:150", err);
        common_vendor.index.showToast({
          title: "加载失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    },
    async toggleFavorite() {
      try {
        if (this.isFavorite) {
          await api_job.jobApi.removeFavorite(this.jobId);
          this.isFavorite = false;
          common_vendor.index.showToast({ title: "取消收藏", icon: "success" });
        } else {
          await api_job.jobApi.addFavorite(this.jobId);
          this.isFavorite = true;
          common_vendor.index.showToast({ title: "收藏成功", icon: "success" });
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/job-detail/job-detail.vue:172", err);
        common_vendor.index.showToast({ title: "操作失败", icon: "none" });
      }
    },
    async applyJob() {
      var _a;
      if (this.job.applied) {
        common_vendor.index.showToast({
          title: "岗位已申请",
          icon: "none"
        });
        return;
      }
      try {
        common_vendor.index.showLoading({ title: "申请中..." });
        await api_job.jobApi.applyJob(this.jobId);
        this.job.applied = true;
        this.appliedJobIds.add(Number(this.jobId));
        common_vendor.index.showToast({
          title: "申请成功",
          icon: "success"
        });
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/job-detail/job-detail.vue:196", err);
        common_vendor.index.showToast({
          title: (err == null ? void 0 : err.message) || ((_a = err == null ? void 0 : err.data) == null ? void 0 : _a.detail) || "申请失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.job.title),
    b: common_vendor.f($options.parseTags($data.job.tags), (tag, index, i0) => {
      return {
        a: common_vendor.t(tag),
        b: index
      };
    }),
    c: common_vendor.t($data.job.salary),
    d: common_vendor.t($data.job.company),
    e: common_vendor.t($data.job.location),
    f: common_vendor.t($data.job.experience),
    g: common_vendor.t($data.job.education),
    h: $data.job.requirements || $data.job.description
  }, $data.job.requirements || $data.job.description ? {
    i: common_vendor.f($options.splitText($data.job.requirements || $data.job.description), (line, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(line),
        b: index < $options.splitText($data.job.requirements || $data.job.description).length - 1
      }, index < $options.splitText($data.job.requirements || $data.job.description).length - 1 ? {} : {}, {
        c: index
      });
    })
  } : {}, {
    j: $data.job.benefits && $data.job.benefits.length > 0
  }, $data.job.benefits && $data.job.benefits.length > 0 ? {
    k: common_vendor.f($data.job.benefits, (benefit, index, i0) => {
      return {
        a: common_vendor.t(benefit),
        b: index
      };
    })
  } : {}, {
    l: common_vendor.t($data.isFavorite ? "已收藏" : "收藏"),
    m: common_vendor.o((...args) => $options.toggleFavorite && $options.toggleFavorite(...args)),
    n: common_vendor.t($data.job.applied ? "已申请" : "立即申请"),
    o: common_vendor.o((...args) => $options.applyJob && $options.applyJob(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-2bde8e2a"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/job-detail/job-detail.js.map
