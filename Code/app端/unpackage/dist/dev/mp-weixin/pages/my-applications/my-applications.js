"use strict";
const common_vendor = require("../../common/vendor.js");
const api_user = require("../../api/user.js");
const _sfc_main = {
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
      common_vendor.index.stopPullDownRefresh();
    }, 1e3);
  },
  methods: {
    async loadApplications() {
      this.isLoading = true;
      try {
        const res = await api_user.userApi.getApplications();
        if (res && res.data) {
          this.applications = res.data;
        } else {
          this.applications = this.getMockData();
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/my-applications/my-applications.vue:112", err);
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
      common_vendor.index.navigateTo({
        url: `/pages/job-detail/job-detail?id=${item.id}`
      });
    },
    async cancelApplication(item, index) {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要取消这个申请吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({ title: "处理中..." });
              await api_user.userApi.cancelApplication(item.id);
              this.applications.splice(index, 1);
              common_vendor.index.showToast({
                title: "已取消",
                icon: "success"
              });
            } catch (err) {
              common_vendor.index.__f__("error", "at pages/my-applications/my-applications.vue:187", err);
              this.applications.splice(index, 1);
              common_vendor.index.showToast({
                title: "已取消",
                icon: "success"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    },
    goToJobExplore() {
      common_vendor.index.switchTab({
        url: "/pages/job-explore/job-explore"
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.f($data.tabs, (tab, index, i0) => {
      return {
        a: common_vendor.t(tab),
        b: index,
        c: $data.activeTab === index ? 1 : "",
        d: common_vendor.o(($event) => $data.activeTab = index, index)
      };
    }),
    b: !$data.isLoading
  }, !$data.isLoading ? common_vendor.e({
    c: $options.filteredList.length > 0
  }, $options.filteredList.length > 0 ? {
    d: common_vendor.f($options.filteredList, (item, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(item.title),
        b: common_vendor.t(item.salary),
        c: common_vendor.t($options.getStatusText(item.status)),
        d: common_vendor.n("status-" + item.status),
        e: common_vendor.t(item.company),
        f: common_vendor.t(item.location),
        g: common_vendor.t(item.experience),
        h: common_vendor.t(item.education),
        i: common_vendor.t(item.applyTime),
        j: item.status === "pending"
      }, item.status === "pending" ? {
        k: common_vendor.o(($event) => $options.cancelApplication(item, index), index)
      } : {}, {
        l: index,
        m: common_vendor.o(($event) => $options.viewJobDetail(item), index)
      });
    })
  } : {
    e: common_vendor.o((...args) => $options.goToJobExplore && $options.goToJobExplore(...args))
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-0ed30e59"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-applications/my-applications.js.map
