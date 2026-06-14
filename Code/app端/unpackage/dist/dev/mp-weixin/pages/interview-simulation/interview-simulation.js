"use strict";
const common_vendor = require("../../common/vendor.js");
const config_index = require("../../config/index.js");
const _sfc_main = {
  __name: "interview-simulation",
  setup(__props) {
    const parseMarkdown = (text) => {
      if (!text)
        return "";
      text = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      text = text.replace(/\*(.*?)\*/g, "<em>$1</em>");
      text = text.replace(/`(.*?)`/g, "<code>$1</code>");
      text = text.replace(/\n/g, "<br/>");
      text = text.replace(/^\s*[-*]\s+(.*)$/gm, "<li>$1</li>");
      text = text.replace(/(<li>.*<\/li>)/s, "<ul>$1</ul>");
      return text;
    };
    const interviewData = common_vendor.ref({
      position: "",
      company: "",
      type: "智能模拟面试"
    });
    const aiEnabled = common_vendor.ref(false);
    const interviewStarted = common_vendor.ref(false);
    const loading = common_vendor.ref(false);
    const evaluating = common_vendor.ref(false);
    const errorMessage = common_vendor.ref("");
    const aiGeneratedQuestions = common_vendor.ref([]);
    const currentQuestionIndex = common_vendor.ref(0);
    const userAnswer = common_vendor.ref("");
    const userAnswers = common_vendor.ref({});
    const evaluationCompleted = common_vendor.ref(false);
    const evaluation = common_vendor.ref({
      score: 0,
      quality: "",
      professionalism: "",
      suggestions: "",
      detailed_analysis: ""
    });
    const aiResponse = common_vendor.ref("欢迎使用智能面试模拟系统！我将为您提供个性化的面试体验。");
    const currentQuestion = common_vendor.computed(() => {
      return aiGeneratedQuestions.value[currentQuestionIndex.value] || {};
    });
    const totalQuestions = common_vendor.computed(() => {
      return aiGeneratedQuestions.value.length;
    });
    const isLastQuestion = common_vendor.computed(() => {
      return currentQuestionIndex.value === totalQuestions.value - 1;
    });
    common_vendor.onLoad((options) => {
      if (options.position) {
        interviewData.value.position = decodeURIComponent(options.position);
      }
      if (options.company) {
        interviewData.value.company = decodeURIComponent(options.company);
      }
      checkAIService();
    });
    const checkAIService = async () => {
      try {
        const response = await common_vendor.index.request({
          url: config_index.config.baseUrl + "/interview/health",
          method: "GET"
        });
        aiEnabled.value = response.data.success;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/interview-simulation/interview-simulation.vue:246", "检查智能体服务失败:", error);
        aiEnabled.value = false;
      }
    };
    const getResumeText = () => {
      try {
        const resumeAnalysis = common_vendor.index.getStorageSync("resume_analysis");
        return (resumeAnalysis == null ? void 0 : resumeAnalysis.resume_text) || "计算机专业学生，具备扎实的编程基础和项目经验";
      } catch (error) {
        return "计算机专业学生，具备扎实的编程基础和项目经验";
      }
    };
    const getJobRequirements = () => {
      const position = interviewData.value.position;
      const requirementsMap = {
        "前端开发工程师": "熟悉HTML/CSS/JavaScript，掌握Vue/React框架，有响应式设计经验",
        "后端开发工程师": "熟悉Java/Python/Go等后端语言，掌握数据库设计，有API开发经验",
        "全栈开发工程师": "具备前后端开发能力，熟悉完整项目开发流程，有全栈项目经验",
        "产品经理": "具备产品设计、需求分析、项目管理能力，熟悉用户研究",
        "UI设计师": "熟悉UI设计规范，掌握设计工具，具备良好的审美能力"
      };
      return requirementsMap[position] || "具备良好的学习能力和团队协作精神";
    };
    const startInterview = async () => {
      loading.value = true;
      errorMessage.value = "";
      try {
        await generateInterviewQuestions();
        aiResponse.value = `面试已开始！我将为您提供${totalQuestions.value}个问题。

当前问题类型：${currentQuestion.value.type || "通用"}
难度：${currentQuestion.value.difficulty || "中等"}

您可以开始回答，我会为您提供实时帮助和评估。`;
        interviewStarted.value = true;
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/interview-simulation/interview-simulation.vue:289", "开始面试失败:", error);
        errorMessage.value = "开始面试失败，请检查网络连接后重试";
      } finally {
        loading.value = false;
      }
    };
    const generateInterviewQuestions = async () => {
      try {
        if (aiEnabled.value) {
          const response = await common_vendor.index.request({
            url: config_index.config.baseUrl + "/interview/generate-questions",
            method: "POST",
            data: {
              resume_text: getResumeText(),
              job_title: interviewData.value.position,
              job_requirements: getJobRequirements(),
              question_count: 5
            }
          });
          if (response.data.success) {
            aiGeneratedQuestions.value = response.data.data.interview_questions || [];
          } else {
            throw new Error("智能体生成问题失败");
          }
        }
        if (!aiGeneratedQuestions.value.length) {
          aiGeneratedQuestions.value = getDefaultQuestions();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/interview-simulation/interview-simulation.vue:325", "生成面试问题失败:", error);
        aiGeneratedQuestions.value = getDefaultQuestions();
      }
    };
    const getDefaultQuestions = () => {
      const position = interviewData.value.position;
      const defaultQuestions = {
        "前端开发工程师": [
          {
            question: "请介绍一下Vue.js和React的主要区别？",
            type: "技术",
            difficulty: "中等",
            answer_hint: "可以从响应式原理、组件化方式、生态等方面回答"
          },
          {
            question: "如何优化前端性能？",
            type: "技术",
            difficulty: "困难",
            answer_hint: "包括代码分割、懒加载、缓存策略等"
          }
        ],
        "后端开发工程师": [
          {
            question: "请解释一下RESTful API的设计原则？",
            type: "技术",
            difficulty: "中等",
            answer_hint: "包括无状态、统一接口、资源导向等"
          },
          {
            question: "如何处理高并发场景？",
            type: "技术",
            difficulty: "困难",
            answer_hint: "包括负载均衡、缓存、数据库优化等"
          }
        ]
      };
      return defaultQuestions[position] || [
        {
          question: "请做一个简单的自我介绍？",
          type: "通用",
          difficulty: "简单",
          answer_hint: "包括教育背景、工作经验、技能特长等"
        },
        {
          question: "为什么选择我们公司？",
          type: "业务",
          difficulty: "中等",
          answer_hint: "可以从公司文化、发展前景、个人匹配度等方面回答"
        }
      ];
    };
    const evaluateAnswer = async () => {
      if (!userAnswer.value) {
        aiResponse.value = "请先输入您的回答，然后我可以为您提供专业的评估和建议。";
        return;
      }
      evaluating.value = true;
      errorMessage.value = "";
      try {
        if (aiEnabled.value) {
          const response = await common_vendor.index.request({
            url: config_index.config.baseUrl + "/interview/evaluate-answer",
            method: "POST",
            data: {
              question: currentQuestion.value.question,
              user_answer: userAnswer.value,
              expected_answer: currentQuestion.value.answer_hint || "请根据问题内容提供专业回答"
            }
          });
          if (response.data.success) {
            evaluation.value = response.data.data;
            evaluationCompleted.value = true;
            userAnswers.value[currentQuestionIndex.value] = userAnswer.value;
            aiResponse.value = `评估完成！您的得分为 ${evaluation.value.score} 分。

${evaluation.value.overall_feedback || "请继续努力！"}`;
          } else {
            throw new Error("智能体评估失败");
          }
        } else {
          await evaluateAnswerDefault();
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/interview-simulation/interview-simulation.vue:423", "评估回答失败:", error);
        errorMessage.value = "评估失败，请稍后重试";
        await evaluateAnswerDefault();
      } finally {
        evaluating.value = false;
      }
    };
    const evaluateAnswerDefault = async () => {
      const answerLength = userAnswer.value.length;
      const score = Math.min(100, Math.floor(answerLength / 5) + 60);
      evaluation.value = {
        score,
        quality: answerLength > 50 ? "良好" : "一般",
        professionalism: "基本符合要求",
        suggestions: "建议提供更具体的例子和细节",
        detailed_analysis: "回答内容基本完整，可以进一步丰富细节"
      };
      evaluationCompleted.value = true;
      userAnswers.value[currentQuestionIndex.value] = userAnswer.value;
      aiResponse.value = `默认评估完成！您的得分为 ${score} 分。

建议提供更具体的例子和细节来丰富您的回答。`;
    };
    const nextQuestion = () => {
      if (isLastQuestion.value) {
        completeInterview();
      } else {
        currentQuestionIndex.value++;
        userAnswer.value = "";
        evaluationCompleted.value = false;
        evaluation.value = {};
        aiResponse.value = `进入第 ${currentQuestionIndex.value + 1} 题：${currentQuestion.value.type || "通用"} 类型问题
难度：${currentQuestion.value.difficulty || "中等"}`;
      }
    };
    const completeInterview = () => {
      const totalScore = Object.values(userAnswers.value).reduce((sum, answer, index) => {
        return sum + (evaluation.value.score || 70);
      }, 0) / totalQuestions.value;
      common_vendor.index.showModal({
        title: "面试完成",
        content: `恭喜您完成面试！平均得分：${Math.round(totalScore)}/100`,
        showCancel: false,
        success: () => {
          common_vendor.index.navigateBack();
        }
      });
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.t(interviewData.value.position),
        b: common_vendor.t(interviewData.value.company),
        c: common_vendor.t(aiEnabled.value ? "🤖" : "⚠️"),
        d: common_vendor.t(aiEnabled.value ? "智能体已就绪" : "智能体服务不可用"),
        e: !aiEnabled.value
      }, !aiEnabled.value ? {} : {}, {
        f: aiEnabled.value ? 1 : "",
        g: !aiEnabled.value ? 1 : "",
        h: !interviewStarted.value
      }, !interviewStarted.value ? common_vendor.e({
        i: common_vendor.t(interviewData.value.position),
        j: common_vendor.t(interviewData.value.company),
        k: common_vendor.t(interviewData.value.type || "智能模拟面试"),
        l: loading.value
      }, loading.value ? {} : {}, {
        m: common_vendor.t(loading.value ? "智能体正在准备..." : "开始智能面试"),
        n: common_vendor.o(startInterview),
        o: loading.value
      }) : common_vendor.e({
        p: common_vendor.t(currentQuestionIndex.value + 1),
        q: common_vendor.t(totalQuestions.value),
        r: common_vendor.t(currentQuestion.value.type || "通用"),
        s: common_vendor.t(currentQuestion.value.difficulty || "中等"),
        t: common_vendor.t(currentQuestion.value.question),
        v: evaluating.value,
        w: userAnswer.value,
        x: common_vendor.o(($event) => userAnswer.value = $event.detail.value),
        y: common_vendor.t(userAnswer.value.length),
        z: evaluating.value
      }, evaluating.value ? {} : {}, {
        A: common_vendor.t(evaluating.value ? "AI评估中..." : "AI评估回答"),
        B: common_vendor.o(evaluateAnswer),
        C: !userAnswer.value || evaluating.value,
        D: common_vendor.t(isLastQuestion.value ? "完成面试" : "下一题"),
        E: common_vendor.o(nextQuestion),
        F: !evaluationCompleted.value,
        G: evaluationCompleted.value
      }, evaluationCompleted.value ? {
        H: common_vendor.t(evaluation.value.score),
        I: common_vendor.t(evaluation.value.strengths ? evaluation.value.strengths.join("，") : "无"),
        J: common_vendor.t(evaluation.value.weaknesses ? evaluation.value.weaknesses.join("，") : "无"),
        K: common_vendor.t(evaluation.value.improvement_suggestions ? evaluation.value.improvement_suggestions.join("，") : "无"),
        L: common_vendor.t(evaluation.value.overall_feedback || "无")
      } : {}, {
        M: parseMarkdown(aiResponse.value)
      }), {
        N: loading.value
      }, loading.value ? {} : {}, {
        O: errorMessage.value
      }, errorMessage.value ? {
        P: common_vendor.t(errorMessage.value)
      } : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-299bdcf8"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/interview-simulation/interview-simulation.js.map
