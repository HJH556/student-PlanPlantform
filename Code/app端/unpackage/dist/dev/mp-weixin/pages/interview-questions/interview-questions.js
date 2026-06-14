"use strict";
const common_vendor = require("../../common/vendor.js");
const _sfc_main = {
  __name: "interview-questions",
  setup(__props) {
    const matchResults = common_vendor.ref([]);
    const selectedJob = common_vendor.ref("");
    const interviewQuestions = common_vendor.ref([]);
    const userAnswers = common_vendor.ref({});
    const answerEvaluations = common_vendor.ref({});
    const expandedQuestions = common_vendor.ref(/* @__PURE__ */ new Set());
    const loading = common_vendor.ref(false);
    const errorMessage = common_vendor.ref("");
    const aiEnabled = common_vendor.ref(false);
    common_vendor.onLoad(() => {
      loadRecommendedJobs();
      checkAIService();
    });
    const loadRecommendedJobs = () => {
      try {
        const resumeAnalysis = common_vendor.index.getStorageSync("resume_analysis");
        if (resumeAnalysis && resumeAnalysis.match_results) {
          matchResults.value = resumeAnalysis.match_results;
        } else {
          matchResults.value = [
            { id: "frontend", title: "前端开发工程师", score: 85 },
            { id: "backend", title: "后端开发工程师", score: 78 },
            { id: "fullstack", title: "全栈开发工程师", score: 72 }
          ];
        }
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/interview-questions/interview-questions.vue:183", "加载推荐职业失败:", error);
        matchResults.value = [
          { id: "frontend", title: "前端开发工程师", score: 85 },
          { id: "backend", title: "后端开发工程师", score: 78 },
          { id: "fullstack", title: "全栈开发工程师", score: 72 }
        ];
      }
    };
    const checkAIService = async () => {
      try {
        const response = await common_vendor.index.request({
          url: this.$baseUrl + "/interview/health",
          method: "GET"
        });
        aiEnabled.value = response.data.success;
      } catch (error) {
        aiEnabled.value = false;
        common_vendor.index.__f__("error", "at pages/interview-questions/interview-questions.vue:202", "检查智能体服务失败:", error);
      }
    };
    const selectJob = (jobId) => {
      selectedJob.value = jobId;
      loadInterviewQuestions(jobId);
    };
    const getSelectedJobTitle = () => {
      const job = matchResults.value.find((job2) => job2.id === selectedJob.value);
      return job ? job.title : "";
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
      const jobTitle = getSelectedJobTitle();
      const requirementsMap = {
        "前端开发工程师": "熟悉HTML/CSS/JavaScript，掌握Vue/React框架，有响应式设计经验",
        "后端开发工程师": "熟悉Java/Python/Go等后端语言，掌握数据库设计，有API开发经验",
        "全栈开发工程师": "具备前后端开发能力，熟悉完整项目开发流程，有全栈项目经验"
      };
      return requirementsMap[jobTitle] || "具备良好的学习能力和团队协作精神";
    };
    const loadInterviewQuestions = async (jobId) => {
      loading.value = true;
      errorMessage.value = "";
      try {
        if (aiEnabled.value) {
          const response = await common_vendor.index.request({
            url: this.$baseUrl + "/interview/generate-questions",
            method: "POST",
            data: {
              resume_text: getResumeText(),
              job_title: interviewData.value.position,
              job_requirements: getJobRequirements(),
              question_count: 5
            }
          });
          if (response.data.success) {
            interviewQuestions.value = response.data.data.questions || [];
          } else {
            throw new Error("智能体生成问题失败");
          }
        }
        if (!interviewQuestions.value.length) {
          interviewQuestions.value = getDefaultQuestions(jobId);
        }
        userAnswers.value = {};
        answerEvaluations.value = {};
        expandedQuestions.value = /* @__PURE__ */ new Set();
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/interview-questions/interview-questions.vue:276", "加载面试问题失败:", error);
        errorMessage.value = "加载面试问题失败，请稍后重试";
        interviewQuestions.value = getDefaultQuestions(jobId);
      } finally {
        loading.value = false;
      }
    };
    const getDefaultQuestions = (jobId) => {
      const defaultQuestions = {
        frontend: [
          {
            question: "请介绍一下您在前端开发方面的经验和技术栈",
            type: "技术能力",
            difficulty: "中等",
            answerHint: "可以从项目经验、技术栈掌握程度、解决问题的能力等方面回答"
          },
          {
            question: "您如何处理浏览器兼容性问题？",
            type: "技术问题",
            difficulty: "中等",
            answerHint: "可以提到使用polyfill、特性检测、渐进增强等策略"
          }
        ],
        backend: [
          {
            question: "请介绍一下您在后端开发方面的经验",
            type: "技术能力",
            difficulty: "中等",
            answerHint: "可以从数据库设计、API开发、性能优化等方面回答"
          }
        ],
        fullstack: [
          {
            question: "作为全栈工程师，您如何平衡前后端开发工作？",
            type: "综合能力",
            difficulty: "中等",
            answerHint: "可以提到时间管理、技术栈选择、团队协作等方面"
          }
        ]
      };
      return defaultQuestions[jobId] || [];
    };
    const toggleQuestion = (index) => {
      if (expandedQuestions.value.has(index)) {
        expandedQuestions.value.delete(index);
      } else {
        expandedQuestions.value.add(index);
      }
    };
    const evaluateAnswer = async (index) => {
      if (!userAnswers.value[index]) {
        common_vendor.index.showToast({
          title: "请先输入您的回答",
          icon: "none"
        });
        return;
      }
      const question = interviewQuestions.value[index];
      const userAnswer = userAnswers.value[index];
      loading.value = true;
      errorMessage.value = "";
      try {
        if (aiEnabled.value) {
          const response = await common_vendor.index.request({
            url: this.$baseUrl + "/interview/evaluate-answer",
            method: "POST",
            data: {
              question: question.question,
              user_answer: userAnswer,
              expected_answer: question.answerHint || ""
            }
          });
          if (response.data.success) {
            answerEvaluations.value[index] = response.data.data.evaluation;
            common_vendor.index.showToast({
              title: "评估完成",
              icon: "success"
            });
            return;
          }
        }
        const defaultEvaluation = generateDefaultEvaluation(question, userAnswer);
        answerEvaluations.value[index] = defaultEvaluation;
        common_vendor.index.showToast({
          title: "评估完成",
          icon: "success"
        });
      } catch (error) {
        common_vendor.index.__f__("error", "at pages/interview-questions/interview-questions.vue:379", "评估回答失败:", error);
        errorMessage.value = "评估服务暂时不可用";
        const defaultEvaluation = generateDefaultEvaluation(question, userAnswer);
        answerEvaluations.value[index] = defaultEvaluation;
      } finally {
        loading.value = false;
      }
    };
    const generateDefaultEvaluation = (question, userAnswer) => {
      const answerLength = userAnswer.length;
      const hasKeywords = userAnswer.includes("项目") || userAnswer.includes("经验") || userAnswer.includes("技术");
      const hasExamples = userAnswer.includes("例如") || userAnswer.includes("比如");
      let baseScore = 60;
      if (answerLength > 200)
        baseScore += 10;
      if (answerLength > 400)
        baseScore += 10;
      if (hasKeywords)
        baseScore += 10;
      if (hasExamples)
        baseScore += 10;
      const score = Math.min(baseScore, 95);
      const strengths = [];
      const weaknesses = [];
      const suggestions = [];
      if (answerLength > 200)
        strengths.push("回答内容充实");
      if (hasKeywords)
        strengths.push("关键词使用恰当");
      if (hasExamples)
        strengths.push("举例说明清晰");
      if (answerLength < 100)
        weaknesses.push("回答内容较为简略");
      if (!hasExamples)
        weaknesses.push("缺乏具体案例支撑");
      if (answerLength < 200)
        suggestions.push("建议补充更多细节和案例");
      if (!hasKeywords)
        suggestions.push("建议突出技术关键词");
      return {
        score,
        strengths: strengths.length ? strengths : ["回答结构清晰"],
        weaknesses: weaknesses.length ? weaknesses : ["可以进一步优化表达"],
        suggestions: suggestions.length ? suggestions : ["继续完善回答内容"]
      };
    };
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(matchResults.value, (job, k0, i0) => {
          return {
            a: common_vendor.t(job.title),
            b: common_vendor.t(job.score),
            c: job.id,
            d: selectedJob.value === job.id ? 1 : "",
            e: common_vendor.o(($event) => selectJob(job.id), job.id)
          };
        }),
        b: selectedJob.value
      }, selectedJob.value ? common_vendor.e({
        c: common_vendor.t(getSelectedJobTitle()),
        d: common_vendor.t(aiEnabled.value ? "🤖 智能体模式" : "📝 默认模式"),
        e: aiEnabled.value ? 1 : "",
        f: !aiEnabled.value ? 1 : "",
        g: !aiEnabled.value
      }, !aiEnabled.value ? {} : {}, {
        h: errorMessage.value
      }, errorMessage.value ? {
        i: common_vendor.t(errorMessage.value)
      } : {}, {
        j: loading.value
      }, loading.value ? {} : {
        k: common_vendor.f(interviewQuestions.value, (question, index, i0) => {
          var _a;
          return common_vendor.e({
            a: common_vendor.t(index + 1),
            b: common_vendor.t(question.question),
            c: expandedQuestions.value.has(index) ? 1 : "",
            d: common_vendor.o(($event) => toggleQuestion(index), index),
            e: expandedQuestions.value.has(index)
          }, expandedQuestions.value.has(index) ? common_vendor.e({
            f: common_vendor.t(question.type),
            g: common_vendor.t(question.difficulty || "中等"),
            h: userAnswers.value[index],
            i: common_vendor.o(($event) => userAnswers.value[index] = $event.detail.value, index),
            j: common_vendor.o(($event) => evaluateAnswer(index), index),
            k: !userAnswers.value[index],
            l: common_vendor.t(((_a = userAnswers.value[index]) == null ? void 0 : _a.length) || 0),
            m: common_vendor.t(question.answer || question.answerHint || "暂无参考答案"),
            n: answerEvaluations.value[index]
          }, answerEvaluations.value[index] ? common_vendor.e({
            o: common_vendor.t(answerEvaluations.value[index].score),
            p: answerEvaluations.value[index].strengths
          }, answerEvaluations.value[index].strengths ? {
            q: common_vendor.t(answerEvaluations.value[index].strengths.join("、"))
          } : {}, {
            r: answerEvaluations.value[index].weaknesses
          }, answerEvaluations.value[index].weaknesses ? {
            s: common_vendor.t(answerEvaluations.value[index].weaknesses.join("、"))
          } : {}, {
            t: answerEvaluations.value[index].suggestions
          }, answerEvaluations.value[index].suggestions ? {
            v: common_vendor.t(answerEvaluations.value[index].suggestions.join("、"))
          } : {}) : {}) : {}, {
            w: index
          });
        })
      }) : {});
    };
  }
};
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-5b2a5f3d"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/interview-questions/interview-questions.js.map
