"use strict";
const common_vendor = require("../common/vendor.js");
const PDFExtractor = {
  async extractTextFromPDF(file) {
    common_vendor.index.__f__("log", "at utils/resumeExtractor.js:9", "PDF文件提取（模拟）:", file.name);
    return `模拟PDF简历内容 - ${file.name}

个人信息
姓名：张三
学历：本科
专业：计算机科学与技术

工作经历
2020-2023 某科技公司 前端开发工程师
- 负责Vue.js项目开发
- 参与移动端应用开发

技能
- JavaScript/TypeScript
- Vue.js/React
- Node.js
- 数据库设计`;
  }
};
const DocxExtractor = {
  async extractTextFromDocx(file) {
    common_vendor.index.__f__("log", "at utils/resumeExtractor.js:35", "Word文件提取（模拟）:", file.name);
    return `模拟Word简历内容 - ${file.name}

个人简介
姓名：李四
学历：硕士
专业：软件工程

项目经验
2021-2023 电商平台项目
- 负责后端API开发
- 数据库设计与优化

专业技能
- Java/Spring Boot
- MySQL/Redis
- 微服务架构`;
  }
};
const ImageExtractor = {
  async extractTextFromImage(file) {
    common_vendor.index.__f__("log", "at utils/resumeExtractor.js:59", "图片文件提取（模拟）:", file.name);
    return `模拟图片简历内容 - ${file.name}

基本信息
姓名：王五
学历：博士
专业：人工智能

研究成果
- 发表论文3篇
- 参与国家级项目

技术能力
- Python/机器学习
- TensorFlow/PyTorch
- 数据分析`;
  }
};
const ResumeExtractor = {
  /**
   * 从文件提取文本内容
   * @param {File} file - 文件对象
   * @returns {Promise<string>} - 提取的文本内容
   */
  async extractTextFromFile(file) {
    if (!file) {
      throw new Error("文件不能为空");
    }
    const fileType = this.getFileType(file.name);
    try {
      let text = "";
      switch (fileType) {
        case "pdf":
          text = await PDFExtractor.extractTextFromPDF(file);
          break;
        case "docx":
        case "doc":
          text = await DocxExtractor.extractTextFromDocx(file);
          break;
        case "image":
          text = await ImageExtractor.extractTextFromImage(file);
          break;
        default:
          throw new Error(`不支持的文件格式: ${fileType}`);
      }
      return this.cleanResumeText(text);
    } catch (error) {
      common_vendor.index.__f__("error", "at utils/resumeExtractor.js:113", "简历文本提取失败:", error);
      throw new Error(`简历解析失败: ${error.message}`);
    }
  },
  /**
   * 获取文件类型
   * @param {string} fileName - 文件名
   * @returns {string} - 文件类型
   */
  getFileType(fileName) {
    const ext = fileName.toLowerCase().split(".").pop();
    if (ext === "pdf")
      return "pdf";
    if (ext === "docx" || ext === "doc")
      return "docx";
    if (["jpg", "jpeg", "png", "gif", "bmp"].includes(ext))
      return "image";
    return "unknown";
  },
  /**
   * 清理和格式化简历文本
   * @param {string} text - 原始文本
   * @returns {string} - 清理后的文本
   */
  cleanResumeText(text) {
    if (!text)
      return "";
    let cleaned = text.replace(/\s+/g, " ").replace(/\n{3,}/g, "\n\n").trim();
    if (cleaned.length < 50) {
      throw new Error("简历内容过短，请检查文件内容");
    }
    return cleaned;
  },
  /**
   * 验证简历文本是否有效
   * @param {string} text - 简历文本
   * @returns {boolean} - 是否有效
   */
  validateResumeText(text) {
    if (!text || text.length < 50)
      return false;
    const keywords = ["姓名", "学历", "专业", "工作", "项目", "技能", "经验"];
    const hasKeywords = keywords.some((keyword) => text.includes(keyword));
    return hasKeywords;
  }
};
exports.ResumeExtractor = ResumeExtractor;
//# sourceMappingURL=../../.sourcemap/mp-weixin/utils/resumeExtractor.js.map
