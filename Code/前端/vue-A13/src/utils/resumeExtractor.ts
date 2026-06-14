import * as pdfjsLib from 'pdfjs-dist'
import * as mammoth from 'mammoth'
import Tesseract from 'tesseract.js'

// 配置PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js`

export class ResumeExtractor {
  /**
   * 提取PDF文件文本
   */
  static async extractPDFText(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument(arrayBuffer).promise
      
      let fullText = ''
      
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContent = await page.getTextContent()
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ')
        fullText += pageText + '\n'
      }
      
      return fullText.trim()
    } catch (error) {
      console.error('PDF文本提取失败:', error)
      throw new Error('PDF文件解析失败，请确保文件格式正确')
    }
  }

  /**
   * 提取Word文档文本
   */
  static async extractWordText(file: File): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.extractRawText({ arrayBuffer })
      
      if (result.value) {
        return result.value.trim()
      } else {
        throw new Error('Word文档内容为空')
      }
    } catch (error) {
      console.error('Word文本提取失败:', error)
      throw new Error('Word文档解析失败，请确保文件格式正确')
    }
  }

  /**
   * 提取图片文本（OCR）
   */
  static async extractImageText(file: File): Promise<string> {
    try {
      const result = await Tesseract.recognize(file, 'chi_sim+eng', {
        logger: m => console.log(m)
      })
      
      if (result.data.text) {
        return result.data.text.trim()
      } else {
        throw new Error('图片中未识别到文本')
      }
    } catch (error) {
      console.error('图片OCR失败:', error)
      throw new Error('图片文本识别失败，请确保图片清晰且包含文字')
    }
  }

  /**
   * 根据文件类型提取文本
   */
  static async extractTextFromFile(file: File): Promise<string> {
    const fileName = file.name.toLowerCase()
    
    if (fileName.endsWith('.pdf')) {
      return await this.extractPDFText(file)
    } else if (fileName.endsWith('.doc') || fileName.endsWith('.docx')) {
      return await this.extractWordText(file)
    } else if (fileName.match(/\.(png|jpg|jpeg|gif|webp)$/)) {
      return await this.extractImageText(file)
    } else {
      throw new Error('不支持的文件格式')
    }
  }

  /**
   * 清理和格式化简历文本
   */
  static cleanResumeText(text: string): string {
    if (!text) return ''
    
    // 移除多余的空格和换行
    let cleaned = text
      .replace(/\s+/g, ' ') // 合并多个空格
      .replace(/\n+/g, '\n') // 合并多个换行
      .trim()
    
    // 移除特殊字符但保留中文标点
    cleaned = cleaned.replace(/[^\u4e00-\u9fff\w\s\n\r\u3000-\u303f\uff00-\uffef.,;:!?()\[\]{}<>\-+=*&^%$#@~`'"\\\/]/g, '')
    
    // 确保每行不超过一定长度（避免OCR错误导致的长行）
    const lines = cleaned.split('\n')
    const formattedLines = lines.map(line => {
      if (line.length > 200) {
        // 在适当位置插入换行
        return line.replace(/(.{100}[^。！？.!?]*[。！？.!?])/g, '$1\n')
      }
      return line
    })
    
    return formattedLines.join('\n').trim()
  }

  /**
   * 验证提取的文本是否有效
   */
  static validateResumeText(text: string): boolean {
    if (!text || text.trim().length === 0) {
      return false
    }
    
    // 检查文本长度（至少50个字符）
    if (text.length < 50) {
      return false
    }
    
    // 检查是否包含简历相关关键词
    const keywords = [
      '姓名', '性别', '年龄', '学历', '专业', '工作经验', '技能',
      '项目', '教育', '工作', '简历', '个人', '联系方式', '邮箱',
      '电话', '地址', '求职', '应聘', '职位', '公司', '学校'
    ]
    
    const hasKeywords = keywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    )
    
    return hasKeywords
  }
}