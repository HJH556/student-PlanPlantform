"use strict";
const common_vendor = require("../../common/vendor.js");
const api_job = require("../../api/job.js");
const _sfc_main = {
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
      common_vendor.index.__f__("log", "at pages/job-explore/job-explore.vue:114", "开始加载数据, 页码:", this.page, "搜索关键词:", this.searchKeyword);
      try {
        const params = {
          skip: (this.page - 1) * this.pageSize,
          limit: this.pageSize
        };
        if (this.searchKeyword.trim()) {
          params.keyword = this.searchKeyword.trim();
        }
        const response = await api_job.jobApi.getJobList(params);
        common_vendor.index.__f__("log", "at pages/job-explore/job-explore.vue:127", "岗位列表响应:", response);
        if (response && response.data && Array.isArray(response.data)) {
          const newData = response.data;
          common_vendor.index.__f__("log", "at pages/job-explore/job-explore.vue:131", "获取到数据数量:", newData.length);
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
          common_vendor.index.__f__("log", "at pages/job-explore/job-explore.vue:147", "响应数据格式不正确");
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/job-explore/job-explore.vue:150", "加载岗位列表失败:", error);
        if (this.page === 1) {
          this.allJobList = this.getMockJobs();
          this.jobList = this.allJobList;
        }
      } finally {
        this.loading = false;
        common_vendor.index.stopPullDownRefresh();
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
        common_vendor.index.showToast({
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
      common_vendor.index.__f__("log", "at pages/job-explore/job-explore.vue:228", "应用筛选:", filter);
      if (filter === "全部") {
        this.jobList = this.allJobList;
      } else {
        this.jobList = this.allJobList.filter((job) => {
          const title = job.title || "";
          const tags = this.parseTags(job.tags);
          return title.includes(filter) || tags.includes(filter);
        });
      }
      common_vendor.index.__f__("log", "at pages/job-explore/job-explore.vue:239", "筛选后数据数量:", this.jobList.length);
    },
    loadMore() {
      if (this.loading || !this.hasMore) {
        common_vendor.index.__f__("log", "at pages/job-explore/job-explore.vue:244", "不加载更多:", { loading: this.loading, hasMore: this.hasMore });
        return;
      }
      common_vendor.index.__f__("log", "at pages/job-explore/job-explore.vue:248", "加载更多数据");
      this.page++;
      this.loadJobList();
    },
    refresh() {
      common_vendor.index.__f__("log", "at pages/job-explore/job-explore.vue:254", "刷新数据");
      this.page = 1;
      this.hasMore = true;
      this.loadJobList();
    },
    viewJobDetail(job) {
      common_vendor.index.navigateTo({
        url: `/pages/job-detail/job-detail?id=${job.id}`
      });
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.o((...args) => $options.handleSearch && $options.handleSearch(...args)),
    b: $data.searchKeyword,
    c: common_vendor.o(($event) => $data.searchKeyword = $event.detail.value),
    d: $data.searchKeyword
  }, $data.searchKeyword ? {
    e: common_vendor.o((...args) => $options.clearSearch && $options.clearSearch(...args))
  } : {}, {
    f: common_vendor.o((...args) => $options.handleSearch && $options.handleSearch(...args)),
    g: common_vendor.f($data.filters, (filter, index, i0) => {
      return {
        a: common_vendor.t(filter),
        b: index,
        c: $data.activeFilter === index ? 1 : "",
        d: common_vendor.o(($event) => $options.handleFilterChange(index), index)
      };
    }),
    h: $data.jobList.length > 0
  }, $data.jobList.length > 0 ? {
    i: common_vendor.f($data.jobList, (job, k0, i0) => {
      return {
        a: common_vendor.t(job.title || "岗位名称"),
        b: common_vendor.t(job.salary || "薪资面议"),
        c: common_vendor.t(job.company || "公司名称"),
        d: common_vendor.t(job.location || "地点"),
        e: common_vendor.t(job.experience || "经验不限"),
        f: common_vendor.t(job.education || "学历不限"),
        g: common_vendor.f($options.parseTags(job.tags), (tag, i, i1) => {
          return {
            a: common_vendor.t(tag),
            b: i
          };
        }),
        h: job.id,
        i: common_vendor.o(($event) => $options.viewJobDetail(job), job.id)
      };
    })
  } : {}, {
    j: $data.loading
  }, $data.loading ? {} : $data.jobList.length === 0 ? {} : !$data.hasMore ? {} : {}, {
    k: $data.jobList.length === 0,
    l: !$data.hasMore,
    m: common_vendor.o((...args) => $options.loadMore && $options.loadMore(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-71ef44db"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/job-explore/job-explore.js.map
