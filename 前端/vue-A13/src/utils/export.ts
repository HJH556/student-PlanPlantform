// 数据导出工具函数

// 导出为 JSON
export function exportToJSON(data: unknown, filename: string = 'data.json'): void {
  const jsonStr = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonStr], { type: 'application/json' })
  downloadBlob(blob, filename)
}

// 导出为 CSV
export function exportToCSV(
  data: Record<string, unknown>[],
  filename: string = 'data.csv'
): void {
  if (data.length === 0) return

  const firstItem = data[0]
  if (!firstItem || typeof firstItem !== 'object') return

  const headers = Object.keys(firstItem)
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers
        .map(header => {
          const value = row[header]
          // 处理包含逗号或引号的值
          const stringValue = String(value ?? '')
          if (stringValue.includes(',') || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`
          }
          return stringValue
        })
        .join(',')
    )
  ].join('\n')

  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  downloadBlob(blob, filename)
}

// 导出为 TXT
export function exportToTXT(content: string, filename: string = 'report.txt'): void {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' })
  downloadBlob(blob, filename)
}

// 行动计划类型定义
interface ActionPlan {
  title: string
  tasks: Array<{
    text: string
    completed: boolean
  }>
}

// 生成简单的 HTML 报告
export function generateHTMLReport(data: {
  title: string
  profile: Record<string, string>
  matchResult: Record<string, unknown>
  careerPath: Array<Record<string, unknown>>
  actionPlan: ActionPlan[]
}): string {
  const { title, profile, matchResult, careerPath, actionPlan } = data

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
    h2 { color: #667eea; margin-top: 30px; }
    .section { margin: 20px 0; }
    .info-item { margin: 10px 0; }
    .label { font-weight: bold; color: #666; }
    .value { color: #333; }
    .score { font-size: 24px; color: #667eea; font-weight: bold; }
    .path-item { margin: 15px 0; padding: 10px; background: #f5f5f5; border-radius: 5px; }
    .task-item { margin: 8px 0; }
    .completed { text-decoration: line-through; color: #999; }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <p>生成日期: ${new Date().toLocaleDateString('zh-CN')}</p>

  <div class="section">
    <h2>个人信息</h2>
    ${Object.entries(profile)
      .map(([key, value]) => `
        <div class="info-item">
          <span class="label">${key}:</span>
          <span class="value">${value}</span>
        </div>
      `)
      .join('')}
  </div>

  <div class="section">
    <h2>人岗匹配结果</h2>
    ${Object.entries(matchResult)
      .map(([key, value]) => `
        <div class="info-item">
          <span class="label">${key}:</span>
          <span class="value">${JSON.stringify(value)}</span>
        </div>
      `)
      .join('')}
  </div>

  <div class="section">
    <h2>职业发展路径</h2>
    ${careerPath
      .map(
        (path, index) => `
      <div class="path-item">
        <strong>阶段 ${index + 1}</strong>
        <pre>${JSON.stringify(path, null, 2)}</pre>
      </div>
    `
      )
      .join('')}
  </div>

  <div class="section">
    <h2>行动计划</h2>
    ${actionPlan
      .map(
        plan => `
      <div class="path-item">
        <strong>${plan.title || '计划'}</strong>
        ${(plan.tasks || [])
            .map(
              (task) => `
          <div class="task-item ${task.completed ? 'completed' : ''}">
            ${task.completed ? '✓' : '○'} ${task.text || ''}
          </div>
        `
            )
            .join('')}
      </div>
    `
      )
      .join('')}
  </div>
</body>
</html>`
}

// 导出为 HTML
export function exportToHTML(htmlContent: string, filename: string = 'report.html'): void {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8;' })
  downloadBlob(blob, filename)
}

// 下载 Blob 文件
function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

// 打印报告
export function printReport(elementId: string): void {
  const element = document.getElementById(elementId)
  if (!element) return

  const printWindow = window.open('', '_blank')
  if (!printWindow) return

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>打印报告</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        @media print { .no-print { display: none; } }
      </style>
    </head>
    <body>
      ${element.innerHTML}
      <div class="no-print" style="margin-top: 20px; text-align: center;">
        <button onclick="window.print()">打印</button>
        <button onclick="window.close()">关闭</button>
      </div>
    </body>
    </html>
  `)
  printWindow.document.close()
}

// 导出为 PDF
export async function exportToPDF(elementId: string, filename: string = 'report.pdf'): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) return

  try {
    // 动态导入 html2pdf.js
    const html2pdf = (await import('html2pdf.js')).default

    const opt = {
      margin: 10,
      filename: filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
    }

    await html2pdf().set(opt).from(element).save()
  } catch (error) {
    console.error('导出 PDF 失败:', error)
    throw error
  }
}

// 导出为 Word
export function exportToWord(elementId: string, filename: string = 'report.doc'): void {
  const element = document.getElementById(elementId)
  if (!element) return

  // 构建简单的HTML结构，使用Word 97-2003兼容格式
  const htmlContent = `
    <html>
    <head>
      <meta charset='utf-8'>
      <title>${filename}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { color: #333; border-bottom: 2px solid #667eea; padding-bottom: 10px; }
        h4 { color: #333; margin-top: 20px; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
        p { margin: 10px 0; line-height: 1.5; }
        .section { margin: 20px 0; }
      </style>
    </head>
    <body>
      <h1>职业规划报告</h1>
      <p>生成日期: ${new Date().toLocaleDateString('zh-CN')}</p>
      
      <div class="section">
        <h4>个人信息</h4>
        <p>姓名: 张三</p>
        <p>专业: 计算机科学与技术</p>
        <p>学校: 某大学</p>
      </div>
      
      <div class="section">
        <h4>人岗匹配结果</h4>
        <p>匹配度: 85%</p>
        <p>目标岗位: 前端开发工程师</p>
      </div>
      
      <div class="section">
        <h4>职业发展路径</h4>
        <p>1. 前端开发工程师 (0-2年)</p>
        <p>2. 高级前端工程师 (2-5年)</p>
        <p>3. 前端技术专家 (5年以上)</p>
      </div>
      
      <div class="section">
        <h4>行动计划</h4>
        <p>短期计划 (1-3个月):</p>
        <p>- 学习HTML、CSS和JavaScript基础</p>
        <p>- 完成前端开发入门项目</p>
        <p>中期计划 (3-6个月):</p>
        <p>- 学习Vue.js框架</p>
        <p>- 参与实际项目开发</p>
        <p>长期计划 (6-12个月):</p>
        <p>- 学习前端工程化工具</p>
        <p>- 构建个人作品集</p>
      </div>
    </body>
    </html>
  `

  // 使用Word 97-2003兼容的MIME类型
  const blob = new Blob([htmlContent], { type: 'application/msword' })
  downloadBlob(blob, filename)
}

// 分享报告
export function shareReport(title: string, url: string = window.location.href): void {
  if (navigator.share) {
    // 使用 Web Share API
    navigator.share({
      title: title,
      text: '查看我的职业规划报告',
      url: url
    }).catch((error) => {
      console.error('分享失败:', error)
      fallbackShare(title, url)
    })
  } else {
    // 降级方案：复制链接到剪贴板
    fallbackShare(title, url)
  }
}

// 分享降级方案
function fallbackShare(title: string, url: string): void {
  // 复制链接到剪贴板
  navigator.clipboard.writeText(url).then(() => {
    alert('链接已复制到剪贴板，请粘贴分享给好友！')
  }).catch(() => {
    // 手动复制提示
    prompt('请复制以下链接分享:', url)
  })
}
