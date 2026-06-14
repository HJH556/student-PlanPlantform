"use strict";
const common_vendor = require("../../common/vendor.js");
require("../../stores/user.js");
const _sfc_main = {
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
      common_vendor.index.navigateTo({
        url: "/pages/upload-resume/upload-resume"
      });
    },
    editProfile() {
      common_vendor.index.navigateTo({
        url: "/pages/edit-profile/edit-profile"
      });
    },
    loadResumeAnalysis() {
      var _a, _b, _c;
      try {
        const userStore = ((_b = (_a = this.$store) == null ? void 0 : _a.state) == null ? void 0 : _b.user) || {};
        const userId = ((_c = userStore.user) == null ? void 0 : _c.id) || "unknown";
        const storageKey = `resume_analysis_${userId}`;
        common_vendor.index.__f__("log", "at pages/student-profile/student-profile.vue:315", `加载用户${userId}的简历分析数据，存储键: ${storageKey}`);
        const analysisData = common_vendor.index.getStorageSync(storageKey);
        common_vendor.index.__f__("log", "at pages/student-profile/student-profile.vue:318", "从本地存储加载的数据结构:", Object.keys(analysisData || {}));
        if (analysisData) {
          this.resumeAnalysis = analysisData;
          common_vendor.index.__f__("log", "at pages/student-profile/student-profile.vue:322", "设置到页面的简历分析结果:", Object.keys(this.resumeAnalysis || {}));
          if (this.resumeAnalysis) {
            this.currentStep = 2;
            common_vendor.index.__f__("log", "at pages/student-profile/student-profile.vue:327", "进度步骤已更新为:", this.currentStep);
          }
        } else {
          common_vendor.index.__f__("log", "at pages/student-profile/student-profile.vue:330", `用户${userId}没有简历分析数据，显示默认状态`);
          this.resumeAnalysis = {
            basic_info: { 状态: "请先上传简历进行分析" },
            ability_assessment: {},
            career_tendency: {},
            match_analysis: {}
          };
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/student-profile/student-profile.vue:339", "加载简历分析结果失败:", err);
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
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_vendor.t($data.initial),
    b: common_vendor.t($data.userName),
    c: common_vendor.t($data.userRole),
    d: common_vendor.f($data.steps, (step, index, i0) => {
      return {
        a: common_vendor.t(step.icon),
        b: common_vendor.t(step.text),
        c: index,
        d: index <= $data.currentStep ? 1 : "",
        e: index === $data.currentStep ? 1 : ""
      };
    }),
    e: $data.resumeAnalysis && $data.resumeAnalysis.basic_info
  }, $data.resumeAnalysis && $data.resumeAnalysis.basic_info ? common_vendor.e({
    f: $data.resumeAnalysis.basic_info.姓名
  }, $data.resumeAnalysis.basic_info.姓名 ? {
    g: common_vendor.t($data.resumeAnalysis.basic_info.姓名)
  } : {}, {
    h: $data.resumeAnalysis.basic_info.学历
  }, $data.resumeAnalysis.basic_info.学历 ? {
    i: common_vendor.t($data.resumeAnalysis.basic_info.学历)
  } : {}, {
    j: $data.resumeAnalysis.basic_info.专业
  }, $data.resumeAnalysis.basic_info.专业 ? {
    k: common_vendor.t($data.resumeAnalysis.basic_info.专业)
  } : {}, {
    l: $data.resumeAnalysis.basic_info.工作经验
  }, $data.resumeAnalysis.basic_info.工作经验 ? {
    m: common_vendor.t($data.resumeAnalysis.basic_info.工作经验)
  } : {}) : {}, {
    n: $data.resumeAnalysis && $data.resumeAnalysis.ability_assessment
  }, $data.resumeAnalysis && $data.resumeAnalysis.ability_assessment ? common_vendor.e({
    o: $data.resumeAnalysis.ability_assessment.技术能力
  }, $data.resumeAnalysis.ability_assessment.技术能力 ? common_vendor.e({
    p: $data.resumeAnalysis.ability_assessment.技术能力.score
  }, $data.resumeAnalysis.ability_assessment.技术能力.score ? {
    q: common_vendor.t($data.resumeAnalysis.ability_assessment.技术能力.score)
  } : {}, {
    r: $data.resumeAnalysis.ability_assessment.技术能力.score
  }, $data.resumeAnalysis.ability_assessment.技术能力.score ? {
    s: $data.resumeAnalysis.ability_assessment.技术能力.score + "%"
  } : {}, {
    t: $data.resumeAnalysis.ability_assessment.技术能力.description
  }, $data.resumeAnalysis.ability_assessment.技术能力.description ? {
    v: common_vendor.t($data.resumeAnalysis.ability_assessment.技术能力.description)
  } : {}) : {}, {
    w: $data.resumeAnalysis.visualization_data && $data.resumeAnalysis.visualization_data.progress_bars
  }, $data.resumeAnalysis.visualization_data && $data.resumeAnalysis.visualization_data.progress_bars ? {
    x: common_vendor.f($data.resumeAnalysis.visualization_data.progress_bars, (skill, index, i0) => {
      return {
        a: common_vendor.t(skill.name),
        b: common_vendor.t(skill.progress),
        c: skill.progress + "%",
        d: index
      };
    })
  } : {}) : {}, {
    y: $data.resumeAnalysis && $data.resumeAnalysis.career_tendency
  }, $data.resumeAnalysis && $data.resumeAnalysis.career_tendency ? common_vendor.e({
    z: $data.resumeAnalysis.career_tendency.兴趣领域
  }, $data.resumeAnalysis.career_tendency.兴趣领域 ? {
    A: common_vendor.t($data.resumeAnalysis.career_tendency.兴趣领域)
  } : {}, {
    B: $data.resumeAnalysis.career_tendency.职业目标
  }, $data.resumeAnalysis.career_tendency.职业目标 ? {
    C: common_vendor.t($data.resumeAnalysis.career_tendency.职业目标)
  } : {}, {
    D: $data.resumeAnalysis.career_tendency.期望岗位
  }, $data.resumeAnalysis.career_tendency.期望岗位 ? {
    E: common_vendor.t($data.resumeAnalysis.career_tendency.期望岗位)
  } : {}, {
    F: $data.resumeAnalysis.career_tendency.匹配岗位 && $data.resumeAnalysis.career_tendency.匹配岗位.length > 0
  }, $data.resumeAnalysis.career_tendency.匹配岗位 && $data.resumeAnalysis.career_tendency.匹配岗位.length > 0 ? {
    G: common_vendor.f($data.resumeAnalysis.career_tendency.匹配岗位, (job, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(job.name),
        b: common_vendor.t(job.match_score),
        c: job.reason
      }, job.reason ? {
        d: common_vendor.t(job.reason)
      } : {}, {
        e: index
      });
    })
  } : {}) : {}, {
    H: $data.resumeAnalysis && $data.resumeAnalysis.match_analysis
  }, $data.resumeAnalysis && $data.resumeAnalysis.match_analysis ? common_vendor.e({
    I: $data.resumeAnalysis.match_analysis.总体匹配度
  }, $data.resumeAnalysis.match_analysis.总体匹配度 ? {
    J: common_vendor.t($data.resumeAnalysis.match_analysis.总体匹配度)
  } : {}, {
    K: $data.resumeAnalysis.match_analysis.优势分析
  }, $data.resumeAnalysis.match_analysis.优势分析 ? {
    L: common_vendor.t($data.resumeAnalysis.match_analysis.优势分析)
  } : {}, {
    M: $data.resumeAnalysis.match_analysis.技能匹配 && $data.resumeAnalysis.match_analysis.技能匹配.length > 0
  }, $data.resumeAnalysis.match_analysis.技能匹配 && $data.resumeAnalysis.match_analysis.技能匹配.length > 0 ? {
    N: common_vendor.f($data.resumeAnalysis.match_analysis.技能匹配, (skill, index, i0) => {
      return common_vendor.e({
        a: common_vendor.t(skill.技能),
        b: common_vendor.t(skill.匹配度),
        c: skill.重要性
      }, skill.重要性 ? {
        d: common_vendor.t(skill.重要性)
      } : {}, {
        e: index
      });
    })
  } : {}) : {}, {
    O: $data.resumeAnalysis && $data.resumeAnalysis.career_planning
  }, $data.resumeAnalysis && $data.resumeAnalysis.career_planning ? common_vendor.e({
    P: $data.resumeAnalysis.career_planning.短期目标
  }, $data.resumeAnalysis.career_planning.短期目标 ? {
    Q: common_vendor.t($data.resumeAnalysis.career_planning.短期目标)
  } : {}, {
    R: $data.resumeAnalysis.career_planning.中期目标
  }, $data.resumeAnalysis.career_planning.中期目标 ? {
    S: common_vendor.t($data.resumeAnalysis.career_planning.中期目标)
  } : {}, {
    T: $data.resumeAnalysis.career_planning.长期目标
  }, $data.resumeAnalysis.career_planning.长期目标 ? {
    U: common_vendor.t($data.resumeAnalysis.career_planning.长期目标)
  } : {}, {
    V: $data.resumeAnalysis.career_planning.具体行动建议
  }, $data.resumeAnalysis.career_planning.具体行动建议 ? {
    W: common_vendor.t($data.resumeAnalysis.career_planning.具体行动建议)
  } : {}) : {}, {
    X: $data.resumeAnalysis && $data.resumeAnalysis.ability_radar
  }, $data.resumeAnalysis && $data.resumeAnalysis.ability_radar ? common_vendor.e({
    Y: $data.resumeAnalysis.ability_radar
  }, $data.resumeAnalysis.ability_radar ? {
    Z: common_vendor.f($data.resumeAnalysis.ability_radar, (score, ability, i0) => {
      return {
        a: common_vendor.t(ability),
        b: common_vendor.t(score),
        c: ability
      };
    })
  } : {}) : {}, {
    aa: common_vendor.o((...args) => $options.uploadResume && $options.uploadResume(...args)),
    ab: common_vendor.o((...args) => $options.editProfile && $options.editProfile(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-c6fc90ce"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/student-profile/student-profile.js.map
