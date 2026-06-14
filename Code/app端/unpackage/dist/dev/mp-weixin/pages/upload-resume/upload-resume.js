"use strict";
const common_vendor = require("../../common/vendor.js");
const config_index = require("../../config/index.js");
const utils_resumeExtractor = require("../../utils/resumeExtractor.js");
const _sfc_main = {
  data() {
    return {
      selectedFile: null,
      isUploading: false
    };
  },
  methods: {
    chooseFile() {
      common_vendor.index.chooseMessageFile({
        count: 1,
        type: "file",
        extension: [".pdf", ".doc", ".docx"],
        success: (res) => {
          const file = res.tempFiles[0];
          this.selectedFile = file;
        },
        fail: (err) => {
          common_vendor.index.__f__("error", "at pages/upload-resume/upload-resume.vue:77", "选择文件失败:", err);
          common_vendor.index.showToast({
            title: "选择文件失败",
            icon: "none"
          });
        }
      });
    },
    removeFile() {
      this.selectedFile = null;
    },
    formatFileSize(bytes) {
      if (bytes === 0)
        return "0 B";
      const k = 1024;
      const sizes = ["B", "KB", "MB", "GB"];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
    },
    async uploadResume() {
      if (!this.selectedFile) {
        common_vendor.index.showToast({
          title: "请先选择文件",
          icon: "none"
        });
        return;
      }
      this.isUploading = true;
      try {
        common_vendor.index.showLoading({ title: "提取简历文本..." });
        common_vendor.index.__f__("log", "at pages/upload-resume/upload-resume.vue:113", "开始提取简历文本内容...");
        const resumeText = await utils_resumeExtractor.ResumeExtractor.extractTextFromFile(this.selectedFile);
        common_vendor.index.__f__("log", "at pages/upload-resume/upload-resume.vue:115", "简历文本提取成功，长度:", resumeText.length);
        if (!utils_resumeExtractor.ResumeExtractor.validateResumeText(resumeText)) {
          throw new Error("简历文本提取失败或内容无效，请检查文件格式和内容");
        }
        const cleanedText = utils_resumeExtractor.ResumeExtractor.cleanResumeText(resumeText);
        common_vendor.index.__f__("log", "at pages/upload-resume/upload-resume.vue:124", "简历文本清理完成，长度:", cleanedText.length);
        if (cleanedText.length < 50) {
          throw new Error("简历内容过短，请确保简历包含完整的个人信息、教育经历和工作经验");
        }
        common_vendor.index.showLoading({ title: "AI分析中..." });
        await this.analyzeResumeWithLangChain(cleanedText, null);
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/upload-resume/upload-resume.vue:136", "简历上传和分析失败:", err);
        common_vendor.index.showToast({
          title: err.message || "简历上传失败",
          icon: "none"
        });
        this.isUploading = false;
        common_vendor.index.hideLoading();
      }
    },
    // 上传文件到服务器
    uploadFileToServer(file) {
      return new Promise((resolve, reject) => {
        const uploadTask = common_vendor.index.uploadFile({
          url: config_index.config.baseUrl + "/student/upload",
          filePath: file.path,
          name: "file",
          success: (res) => {
            const data = JSON.parse(res.data);
            if (res.statusCode === 200 && data.success) {
              resolve(data.data);
            } else {
              reject(new Error(data.msg || "上传失败"));
            }
          },
          fail: (err) => {
            reject(new Error("上传失败: " + err.errMsg));
          }
        });
        uploadTask.onProgressUpdate((res) => {
          common_vendor.index.__f__("log", "at pages/upload-resume/upload-resume.vue:167", "上传进度", res.progress);
        });
      });
    },
    async analyzeResumeWithLangChain(resumeText, fileUrl) {
      var _a, _b, _c, _d, _e, _f;
      try {
        const userStore = ((_b = (_a = this.$store) == null ? void 0 : _a.state) == null ? void 0 : _b.user) || {};
        const userId = ((_c = userStore.user) == null ? void 0 : _c.id) || "unknown";
        common_vendor.index.__f__("log", "at pages/upload-resume/upload-resume.vue:178", "开始调用智能体分析简历，用户ID:", userId);
        common_vendor.index.__f__("log", "at pages/upload-resume/upload-resume.vue:179", "简历文本前100字符:", resumeText.substring(0, 100));
        const userIdInt = parseInt(userId) || 1;
        common_vendor.index.__f__("log", "at pages/upload-resume/upload-resume.vue:184", "调用智能体API，用户ID:", userIdInt, "原始ID:", userId);
        common_vendor.index.__f__("log", "at pages/upload-resume/upload-resume.vue:187", "尝试方法1：直接传递对象数据");
        const response = await new Promise((resolve, reject) => {
          common_vendor.index.request({
            url: config_index.config.baseUrl + "/langchain/analyze-resume",
            method: "POST",
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            data: {
              resume_text: resumeText,
              user_id: userIdInt.toString()
            },
            success: (res) => {
              common_vendor.index.__f__("log", "at pages/upload-resume/upload-resume.vue:201", "方法1响应状态:", res.statusCode);
              common_vendor.index.__f__("log", "at pages/upload-resume/upload-resume.vue:202", "方法1响应数据:", JSON.stringify(res.data));
              resolve(res);
            },
            fail: (err) => {
              common_vendor.index.__f__("error", "at pages/upload-resume/upload-resume.vue:206", "方法1调用失败:", err);
              common_vendor.index.__f__("log", "at pages/upload-resume/upload-resume.vue:209", "尝试方法2：使用JSON格式");
              common_vendor.index.request({
                url: config_index.config.baseUrl + "/langchain/analyze-resume",
                method: "POST",
                header: {
                  "Content-Type": "application/json"
                },
                data: {
                  resume_text: resumeText,
                  user_id: userIdInt
                },
                success: (res) => {
                  common_vendor.index.__f__("log", "at pages/upload-resume/upload-resume.vue:221", "方法2响应状态:", res.statusCode);
                  common_vendor.index.__f__("log", "at pages/upload-resume/upload-resume.vue:222", "方法2响应数据:", JSON.stringify(res.data));
                  resolve(res);
                },
                fail: (err2) => {
                  common_vendor.index.__f__("error", "at pages/upload-resume/upload-resume.vue:226", "方法2调用失败:", err2);
                  reject(new Error(`所有方法都失败: ${err.errMsg}, ${err2.errMsg}`));
                }
              });
            }
          });
        });
        common_vendor.index.__f__("log", "at pages/upload-resume/upload-resume.vue:234", "智能体响应状态:", response.statusCode);
        common_vendor.index.__f__("log", "at pages/upload-resume/upload-resume.vue:235", "智能体响应数据:", JSON.stringify(response.data));
        if (response.statusCode === 200 && response.data.success) {
          const analysisData = response.data.data.analysis;
          common_vendor.index.__f__("log", "at pages/upload-resume/upload-resume.vue:239", "简历分析成功，数据结构:", Object.keys(analysisData));
          common_vendor.index.showToast({
            title: "简历分析完成",
            icon: "success"
          });
          this.saveResumeAnalysis(analysisData, userId);
          setTimeout(() => {
            common_vendor.index.navigateBack();
          }, 1500);
        } else {
          const errorDetail = response.data.detail ? JSON.stringify(response.data.detail) : "未知错误";
          common_vendor.index.__f__("log", "at pages/upload-resume/upload-resume.vue:255", "详细错误信息:", errorDetail);
          throw new Error(`分析失败 (${response.statusCode}): ${response.data.message || errorDetail}`);
        }
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/upload-resume/upload-resume.vue:260", "简历分析失败:", err);
        common_vendor.index.showToast({
          title: err.message || "简历分析失败",
          icon: "none"
        });
        const userStore = ((_e = (_d = this.$store) == null ? void 0 : _d.state) == null ? void 0 : _e.user) || {};
        const userId = ((_f = userStore.user) == null ? void 0 : _f.id) || "unknown";
        this.saveResumeAnalysis({
          basic_info: { 状态: "AI分析暂时不可用，请稍后重试" },
          ability_assessment: {},
          career_tendency: {},
          match_analysis: {},
          visualization_data: {}
        }, userId);
      } finally {
        this.isUploading = false;
        common_vendor.index.hideLoading();
      }
    },
    saveResumeAnalysis(analysisData, userId) {
      try {
        const storageKey = `resume_analysis_${userId}`;
        common_vendor.index.setStorageSync(storageKey, analysisData);
        common_vendor.index.__f__("log", "at pages/upload-resume/upload-resume.vue:288", `简历分析结果已保存到本地存储，用户ID: ${userId}, 存储键: ${storageKey}`);
        const savedData = common_vendor.index.getStorageSync(storageKey);
        common_vendor.index.__f__("log", "at pages/upload-resume/upload-resume.vue:292", "验证保存的数据结构:", Object.keys(savedData || {}));
      } catch (err) {
        common_vendor.index.__f__("error", "at pages/upload-resume/upload-resume.vue:294", "保存分析结果失败:", err);
      }
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: !$data.selectedFile
  }, !$data.selectedFile ? {} : {}, {
    b: !$data.selectedFile
  }, !$data.selectedFile ? {} : {}, {
    c: !$data.selectedFile
  }, !$data.selectedFile ? {} : {}, {
    d: $data.selectedFile
  }, $data.selectedFile ? {
    e: common_vendor.t($data.selectedFile.name),
    f: common_vendor.t($options.formatFileSize($data.selectedFile.size)),
    g: common_vendor.o((...args) => $options.removeFile && $options.removeFile(...args))
  } : {}, {
    h: common_vendor.o((...args) => $options.chooseFile && $options.chooseFile(...args)),
    i: $data.selectedFile
  }, $data.selectedFile ? {
    j: common_vendor.t($data.isUploading ? "分析中..." : "开始分析"),
    k: $data.isUploading ? 1 : "",
    l: common_vendor.o((...args) => $options.uploadResume && $options.uploadResume(...args)),
    m: $data.isUploading
  } : {});
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render], ["__scopeId", "data-v-615e4326"]]);
wx.createPage(MiniProgramPage);
//# sourceMappingURL=../../../.sourcemap/mp-weixin/pages/upload-resume/upload-resume.js.map
