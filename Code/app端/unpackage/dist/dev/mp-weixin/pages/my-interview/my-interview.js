"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "my-interview",
  setup(__props) {
    const interviews = common_vendor.ref([]);
    const showSmartCreateModal = common_vendor.ref(false);
    const careerCategories = common_vendor.ref([
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
    const interviewTypes = common_vendor.ref(["线上面试", "线下面试", "电话面试", "视频面试"]);
    const smartCreateData = common_vendor.ref({
      selectedCategory: "",
      selectedPosition: "",
      company: "",
      date: "",
      type: ""
    });
    const canCreateInterview = common_vendor.computed(() => {
      return smartCreateData.value.selectedCategory && smartCreateData.value.selectedPosition && smartCreateData.value.date && smartCreateData.value.type;
    });
    common_vendor.onLoad(() => {
      loadInterviews();
    });
    const loadInterviews = () => {
      try {
        const savedInterviews = common_vendor.index.getStorageSync("my_interviews");
        interviews.value = savedInterviews || [];
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/my-interview/my-interview.vue:259", "加载面试记录失败:", error);
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
        common_vendor.index.showToast({
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
      common_vendor.index.showToast({
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
        common_vendor.index.setStorageSync("my_interviews", interviews.value);
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/my-interview/my-interview.vue:402", "保存面试记录失败:", error);
      }
    };
    const goToInterviewDetail = (interviewId) => {
      const interview = interviews.value.find((item) => item.id === interviewId);
      if (interview) {
        common_vendor.index.navigateTo({
          url: `/pages/interview-simulation/interview-simulation?position=${encodeURIComponent(interview.position)}&company=${encodeURIComponent(interview.company)}`
        });
      }
    };
    const startSimulation = (interview) => {
      common_vendor.index.showModal({
        title: "智能模拟面试",
        content: `即将开始 ${interview.position} 职位的智能模拟面试`,
        success: (res) => {
          if (res.confirm) {
            common_vendor.index.navigateTo({
              url: `/pages/interview-simulation/interview-simulation?position=${encodeURIComponent(interview.position)}&company=${encodeURIComponent(interview.company)}`
            });
          }
        }
      });
    };
    const editInterview = (interview) => {
      common_vendor.index.showModal({
        title: "编辑面试",
        content: "编辑功能开发中",
        showCancel: false
      });
    };
    const deleteInterview = (interview) => {
      common_vendor.index.showModal({
        title: "确认删除",
        content: `确定要删除 ${interview.company} 的面试记录吗？`,
        success: (res) => {
          if (res.confirm) {
            interviews.value = interviews.value.filter((item) => item.id !== interview.id);
            saveInterviews();
            common_vendor.index.showToast({
              title: "删除成功",
              icon: "success"
            });
          }
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.o(($event) => showSmartCreateModal.value = true),
        b: interviews.value.length > 0
      }, interviews.value.length > 0 ? {
        c: common_vendor.f(interviews.value, (interview, k0, i0) => {
          return common_vendor.e({
            a: common_vendor.t(interview.company.charAt(0)),
            b: common_vendor.t(interview.company),
            c: common_vendor.t(interview.position),
            d: common_vendor.t(getStatusText(interview.status)),
            e: common_vendor.n("status-" + interview.status),
            f: common_vendor.t(interview.date),
            g: common_vendor.t(interview.type),
            h: interview.interviewer
          }, interview.interviewer ? {
            i: common_vendor.t(interview.interviewer)
          } : {}, {
            j: interview.remark
          }, interview.remark ? {
            k: common_vendor.t(interview.remark)
          } : {}, {
            l: common_vendor.o(($event) => startSimulation(interview), interview.id),
            m: common_vendor.o(($event) => editInterview(), interview.id),
            n: common_vendor.o(($event) => deleteInterview(interview), interview.id),
            o: interview.id,
            p: common_vendor.n("status-" + interview.status),
            q: common_vendor.o(($event) => goToInterviewDetail(interview.id), interview.id)
          });
        })
      } : {
        d: common_vendor.o(($event) => showSmartCreateModal.value = true)
      }, {
        e: showSmartCreateModal.value
      }, showSmartCreateModal.value ? common_vendor.e({
        f: common_vendor.o(closeSmartCreateModal),
        g: common_vendor.f(careerCategories.value, (category, k0, i0) => {
          return {
            a: common_vendor.t(category.icon),
            b: common_vendor.t(category.name),
            c: common_vendor.t(category.positions.length),
            d: category.id,
            e: smartCreateData.value.selectedCategory === category.id ? 1 : "",
            f: common_vendor.o(($event) => selectCategory(category.id), category.id)
          };
        }),
        h: smartCreateData.value.selectedCategory
      }, smartCreateData.value.selectedCategory ? {
        i: common_vendor.t(smartCreateData.value.selectedPosition || "请选择职位"),
        j: getCategoryPositions(smartCreateData.value.selectedCategory),
        k: common_vendor.o(onPositionChange)
      } : {}, {
        l: smartCreateData.value.company,
        m: common_vendor.o(($event) => smartCreateData.value.company = $event.detail.value),
        n: common_vendor.t(smartCreateData.value.date || "请选择面试日期"),
        o: smartCreateData.value.date,
        p: common_vendor.o(onDateChange),
        q: common_vendor.t(smartCreateData.value.type || "请选择面试形式"),
        r: interviewTypes.value,
        s: common_vendor.o(onTypeChange),
        t: common_vendor.o(closeSmartCreateModal),
        v: common_vendor.o(createInterview),
        w: !canCreateInterview.value,
        x: common_vendor.o(() => {
        }),
        y: common_vendor.o(closeSmartCreateModal)
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-10201d82"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/my-interview/my-interview.js.map
