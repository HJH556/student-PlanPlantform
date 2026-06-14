"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
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
        const analysisData = common_vendor.index.getStorageSync("resume_analysis");
        if (analysisData) {
          this.resumeAnalysis = analysisData;
          common_vendor.index.__f__("log", "at pages/career-plan/career-plan.vue:82", "加载简历分析结果:", this.resumeAnalysis);
          this.generateCareerPlan();
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/career-plan/career-plan.vue:86", "加载简历分析结果失败:", err);
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
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return {
    a: common_vendor.f($data.paths, (path, index, i0) => {
      return {
        a: common_vendor.t(path.name),
        b: common_vendor.t(path.match),
        c: path.color,
        d: common_vendor.t(path.desc),
        e: common_vendor.f(path.steps, (step, i, i1) => {
          return {
            a: common_vendor.t(step),
            b: i
          };
        }),
        f: index
      };
    }),
    b: common_vendor.f($data.stages, (stage, index, i0) => {
      return {
        a: common_vendor.t(stage.title),
        b: common_vendor.t(stage.time),
        c: common_vendor.t(stage.desc),
        d: index
      };
    }),
    c: common_vendor.f($data.skills, (skill, index, i0) => {
      return {
        a: common_vendor.t(skill.name),
        b: skill.progress + "%",
        c: skill.color,
        d: common_vendor.t(skill.progress),
        e: index
      };
    })
  };
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-f0b5c96f"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/career-plan/career-plan.js.map
