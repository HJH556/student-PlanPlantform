"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
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
      common_vendor.index.switchTab({
        url: "/pages/ai-assistant/ai-assistant"
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
    b: $data.activeTab === 0
  }, $data.activeTab === 0 ? {
    c: common_vendor.f($data.questions, (item, index, i0) => {
      return {
        a: common_vendor.t(index + 1),
        b: common_vendor.t(item.question),
        c: common_vendor.t(item.answer),
        d: item.expanded ? 1 : "",
        e: common_vendor.t(item.expanded ? "▲" : "▼"),
        f: index,
        g: common_vendor.o(($event) => $options.toggleAnswer(index), index)
      };
    })
  } : {}, {
    d: $data.activeTab === 1
  }, $data.activeTab === 1 ? {} : {}, {
    e: $data.activeTab === 2
  }, $data.activeTab === 2 ? {
    f: common_vendor.o((...args) => $options.startSimulation && $options.startSimulation(...args))
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-39f6a714"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/interview-prep/interview-prep.js.map
