"use strict";
const common_vendor = require("../../common/vendor.js");
const api_agent = require("../../api/agent.js");
const _sfc_main = {
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
      const systemInfo = common_vendor.index.getSystemInfoSync();
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
        const response = await api_agent.agentApi.sendMessage(userId, userMessage);
        common_vendor.index.__f__("log", "at pages/ai-assistant/ai-assistant.vue:131", "API响应:", response);
        if (response && response.data) {
          const aiResponse = ((_a = response.data) == null ? void 0 : _a.response) || ((_b = response.data) == null ? void 0 : _b.message) || "抱歉，我现在无法回答你的问题。";
          this.messages.push({
            isUser: false,
            content: aiResponse
          });
          this.scrollToBottom();
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/ai-assistant/ai-assistant.vue:142", "请求错误:", err);
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
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: $data.messages.length === 0
  }, $data.messages.length === 0 ? {} : {}, {
    b: common_vendor.f($data.messages, (msg, index, i0) => {
      return common_vendor.e({
        a: msg.isUser
      }, msg.isUser ? {} : {}, {
        b: common_vendor.t(msg.content),
        c: index,
        d: "msg-" + index,
        e: msg.isUser ? 1 : "",
        f: !msg.isUser ? 1 : ""
      });
    }),
    c: $data.bottomPadding,
    d: $data.scrollIntoView,
    e: common_vendor.f($data.quickMessages, (msg, index, i0) => {
      return {
        a: common_vendor.t(msg),
        b: index,
        c: common_vendor.o(($event) => $options.sendQuickMessage(msg), index)
      };
    }),
    f: common_vendor.o((...args) => $options.sendMessage && $options.sendMessage(...args)),
    g: $data.isLoading,
    h: $data.inputText,
    i: common_vendor.o(($event) => $data.inputText = $event.detail.value),
    j: common_vendor.t($data.isLoading ? "..." : "发送"),
    k: !$data.inputText.trim() || $data.isLoading ? 1 : "",
    l: common_vendor.o((...args) => $options.sendMessage && $options.sendMessage(...args))
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-8303b4fc"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/ai-assistant/ai-assistant.js.map
