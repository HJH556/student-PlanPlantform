"use strict";
const common_vendor = require("../../common/vendor.js");
const api_job = require("../../api/job.js");
const _sfc_main = {
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
      common_vendor.index.stopPullDownRefresh();
    }, 1e3);
  },
  methods: {
    async loadFavorites() {
      this.isLoading = true;
      try {
        const res = await api_job.jobApi.getFavorites();
        if (res && res.data) {
          this.favoritesList = res.data;
        } else {
          this.favoritesList = this.getMockData();
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/my-favorites/my-favorites.vue:86", err);
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
      common_vendor.index.navigateTo({
        url: `/pages/job-detail/job-detail?id=${item.id}`
      });
    },
    async removeFavorite(item, index) {
      common_vendor.index.showModal({
        title: "提示",
        content: "确定要取消收藏吗？",
        success: async (res) => {
          if (res.confirm) {
            try {
              common_vendor.index.showLoading({ title: "处理中..." });
              await api_job.jobApi.removeFavorite(item.id);
              this.favoritesList.splice(index, 1);
              common_vendor.index.showToast({
                title: "已取消收藏",
                icon: "success"
              });
            } catch (err) {
              common_vendor.index.__f__("error", "at pages/my-favorites/my-favorites.vue:149", err);
              this.favoritesList.splice(index, 1);
              common_vendor.index.showToast({
                title: "已取消收藏",
                icon: "success"
              });
            } finally {
              common_vendor.index.hideLoading();
            }
          }
        }
      });
    },
    async applyJob(item) {
      try {
        common_vendor.index.showLoading({ title: "申请中..." });
        await api_job.jobApi.applyJob(item.id);
        common_vendor.index.showToast({
          title: "申请成功",
          icon: "success"
        });
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/my-favorites/my-favorites.vue:172", err);
        common_vendor.index.showToast({
          title: "申请失败",
          icon: "none"
        });
      } finally {
        common_vendor.index.hideLoading();
      }
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
    a: !$data.isLoading
  }, !$data.isLoading ? common_vendor.e({
    b: $data.favoritesList.length > 0
  }, $data.favoritesList.length > 0 ? {
    c: common_vendor.f($data.favoritesList, (item, index, i0) => {
      return {
        a: common_vendor.t(item.title),
        b: common_vendor.t(item.salary),
        c: common_vendor.o(($event) => $options.removeFavorite(item, index), index),
        d: common_vendor.t(item.company),
        e: common_vendor.t(item.location),
        f: common_vendor.t(item.experience),
        g: common_vendor.t(item.education),
        h: common_vendor.f(item.tags, (tag, i, i1) => {
          return {
            a: common_vendor.t(tag),
            b: i
          };
        }),
        i: common_vendor.o(($event) => $options.applyJob(item), index),
        j: index,
        k: common_vendor.o(($event) => $options.viewJobDetail(item), index)
      };
    })
  } : {
    d: common_vendor.o((...args) => $options.goToJobExplore && $options.goToJobExplore(...args))
  }) : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-98a552f5"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-favorites/my-favorites.js.map
