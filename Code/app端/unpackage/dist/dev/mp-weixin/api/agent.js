"use strict";
const utils_request = require("../utils/request.js");
const agentApi = {
  sendMessage(userId, message) {
    return utils_request.request.post("/agent/send-message", null, {
      params: {
        user_id: userId,
        message
      }
    });
  },
  // 分析简历
  analyzeResume(resumeText, userId) {
    return utils_request.request.post("/langchain/analyze-resume", {
      resume_text: resumeText,
      user_id: userId
    }, {
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    });
  }
};
exports.agentApi = agentApi;
//# sourceMappingURL=../../.sourcemap/mp-weixin/api/agent.js.map
