<!--简历上传组件-->
<template>
  <div class="resume-upload">
    <h3 class="upload-title">简历上传</h3>
    
    <!-- 上传区域 -->
    <div v-if="!uploadSuccess" class="upload-container">
      <div 
        class="upload-area" 
        :class="{ uploading: isUploading }"
        @click="triggerFileInput"
        @dragover.prevent
        @drop.prevent="handleDrop"
      >
        <div v-if="isUploading" class="uploading-overlay">
          <div class="spinner"></div>
          <p>正在上传并解析...</p>
        </div>
        <div v-else class="upload-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
        </div>
        <h4 v-if="!isUploading" class="upload-text">点击或拖拽文件到此处上传</h4>
        <p v-if="!isUploading" class="upload-hint">支持 PDF、Word、图片格式，文件大小不超过 10MB</p>
        <input 
          ref="fileInput" 
          type="file" 
          class="file-input" 
          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.webp"
          @change="handleFileChange"
        />
      </div>
      
      <!-- 文件信息 -->
      <div v-if="selectedFile" class="file-info">
        <div class="file-details">
          <span class="file-name">{{ selectedFile.name }}</span>
          <span class="file-size">{{ formatFileSize(selectedFile.size) }}</span>
        </div>
        <button class="remove-btn" @click="removeFile">移除</button>
      </div>
    </div>
    
    <!-- 上传成功提示 -->
    <div v-else class="upload-success-message">
      <div class="success-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <h4 class="success-title">上传成功！</h4>
      <p class="success-desc">您的简历已成功上传并解析，点击下方按钮查看个人画像。</p>
      
      <!-- 解析结果预览 -->
      <div v-if="parsedData" class="parsed-preview">
        <h5>解析结果预览：</h5>
        <div class="parsed-content" v-html="formatParsedData(parsedData)"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { ResumeExtractor } from '@/utils/resumeExtractor'
import { useUserStore } from '@/stores/user'

const emit = defineEmits<{
  'upload-success': [data: any]
}>()

const props = defineProps<{
  reset?: boolean
}>()

const fileInput = ref<HTMLInputElement>()
const selectedFile = ref<File | null>(null)
const uploadSuccess = ref(false)
const isUploading = ref(false)
const parsedData = ref<any>(null)
const userStore = useUserStore()

watch(
  () => props.reset,
  (newValue) => {
    if (newValue) {
      resetUpload()
    }
  }
)

function resetUpload() {
  selectedFile.value = null
  uploadSuccess.value = false
  isUploading.value = false
  parsedData.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const triggerFileInput = () => {
  if (!isUploading.value) {
    fileInput.value?.click()
  }
}

const uploadToBackend = async (file: File) => {
  isUploading.value = true
  
  try {
    // 第一步：提取简历文本内容
    console.log('开始提取简历文本内容...')
    const resumeText = await ResumeExtractor.extractTextFromFile(file)

    // console.log('提取到的原始文本:', resumeText)
    
    // 验证提取的文本是否有效
    if (!ResumeExtractor.validateResumeText(resumeText)) {
      throw new Error('简历文本提取失败或内容无效，请检查文件格式和内容')
    }
    
    // 清理和格式化文本
    const cleanedText = ResumeExtractor.cleanResumeText(resumeText)
    console.log('简历文本提取成功，长度:', cleanedText.length)
    
    // 第二步：上传文件到后端（用于存储）
    const formData = new FormData()
    formData.append('file', file)
    
    const uploadResponse = await fetch('http://localhost:8000/student/upload-resume', {
      method: 'POST',
      body: formData
    })
    
    if (!uploadResponse.ok) {
      throw new Error('文件上传失败')
    }
    
    const uploadResult = await uploadResponse.json()
    
    if (uploadResult.success) {
      console.log('文件上传成功，开始调用智能体分析简历文本内容')
      
      // 第三步：调用智能体分析简历文本内容
      const handleAnalyzeResultDirectly = (result: any) => {
        if (result.success) {
          // 保存智能体分析结果
          parsedData.value = result.data.analysis
          uploadSuccess.value = true
          
          // 保存到本地存储，供其他页面使用（使用用户ID隔离）
          const userId = userStore.user?.id || 'unknown'
          localStorage.setItem(`resume_analysis_${userId}`, JSON.stringify(result.data.analysis))
          
          emit('upload-success', {
            ...uploadResult,
            analysis: result.data.analysis
          })
        } else {
          // 智能体分析失败，但文件上传成功，仍然视为成功
          console.warn('智能体分析失败，但文件上传成功:', result.message)
          parsedData.value = uploadResult.parsed || {}
          uploadSuccess.value = true
          
          // 保存上传结果到本地存储（使用用户ID隔离）
          const userId = userStore.user?.id || 'unknown'
          localStorage.setItem(`resume_analysis_${userId}`, JSON.stringify(uploadResult.parsed || {}))
          
          emit('upload-success', uploadResult)
          
          // 显示警告信息而不是错误
          ElMessage.warning('文件上传成功，但AI分析暂时不可用，请稍后重试')
        }
      }
      
      try {
        const analyzeResponse = await fetch('http://localhost:8000/langchain/analyze-resume', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            'resume_text': cleanedText,
            'user_id': '1'
          })
        })
        
        console.log('智能体API响应状态:', analyzeResponse.status)
        
        if (!analyzeResponse.ok) {
          console.warn('智能体API调用失败，状态码:', analyzeResponse.status)
          // 不抛出错误，继续处理
          const errorText = await analyzeResponse.text()
          console.warn('智能体API错误响应:', errorText)
          
          // 使用上传结果作为分析结果
          const fallbackResult = {
            success: true,
            message: '文件上传成功，智能体分析暂时不可用',
            data: {
              analysis: uploadResult.parsed || {
                basic_info: { 状态: '文件已上传，AI分析服务暂时不可用' },
                ability_assessment: { 分析状态: '请稍后重试AI分析功能' }
              }
            }
          }
          
          handleAnalyzeResultDirectly(fallbackResult)
          return
        }
        
        const analyzeResult = await analyzeResponse.json()
        console.log('智能体分析结果:', analyzeResult)
        
        handleAnalyzeResultDirectly(analyzeResult)
        
      } catch (analyzeError) {
        console.error('调用智能体API异常:', analyzeError)
        // 智能体调用异常，但文件上传成功，仍然视为成功
        const fallbackResult = {
          success: true,
          message: '文件上传成功，智能体分析服务异常',
          data: {
            analysis: uploadResult.parsed || {
              basic_info: { 状态: '文件已上传，AI分析服务异常' },
              ability_assessment: { 分析状态: '请检查网络连接后重试' }
            }
          }
        }
        
        handleAnalyzeResultDirectly(fallbackResult)
      }
    } else {
      ElMessage.error(uploadResult.message || '上传失败')
    }
  } catch (error: any) {
    console.error('上传错误:', error)
    ElMessage.error('上传失败: ' + error.message)
  } finally {
    isUploading.value = false
  }
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0]
    uploadToBackend(target.files[0])
  }
}

const handleDrop = (event: DragEvent) => {
  const files = event.dataTransfer?.files
  if (files && files[0]) {
    selectedFile.value = files[0]
    uploadToBackend(files[0])
  }
}

const removeFile = () => {
  selectedFile.value = null
  uploadSuccess.value = false
  parsedData.value = null
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatParsedData = (data: any): string => {
  if (!data) return ''
  
  try {
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data)
        return formatParsedData(parsed)
      } catch {
        return data
      }
    }
    
    let html = '<div class="parsed-items">'
    
    if (data.name) {
      html += `<div class="parsed-item"><span class="label">姓名:</span> ${data.name}</div>`
    }
    if (data.email) {
      html += `<div class="parsed-item"><span class="label">邮箱:</span> ${data.email}</div>`
    }
    if (data.phone) {
      html += `<div class="parsed-item"><span class="label">电话:</span> ${data.phone}</div>`
    }
    if (data.skills && Array.isArray(data.skills)) {
      html += `<div class="parsed-item"><span class="label">技能:</span> ${data.skills.join(', ')}</div>`
    }
    if (data.education) {
      const eduStr = typeof data.education === 'string' ? data.education : JSON.stringify(data.education)
      html += `<div class="parsed-item"><span class="label">教育:</span> ${eduStr}</div>`
    }
    if (data.work_experience) {
      const expStr = typeof data.work_experience === 'string' ? data.work_experience : JSON.stringify(data.work_experience)
      html += `<div class="parsed-item"><span class="label">经历:</span> ${expStr}</div>`
    }
    if (data.raw_response) {
      html += `<div class="parsed-item"><span class="label">原始:</span></div><pre>${data.raw_response}</pre>`
    }
    
    html += '</div>'
    return html
  } catch {
    return `<pre>${JSON.stringify(data, null, 2)}</pre>`
  }
}
</script>

<style scoped>
.resume-upload {
  width: 100%;
}

.upload-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
}

.upload-area {
  border: 2px dashed #ddd;
  border-radius: 12px;
  padding: 3rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #f9f9f9;
  position: relative;
  overflow: hidden;
}

.upload-area:hover {
  border-color: #667eea;
  background: #f5f7ff;
}

.upload-area.uploading {
  border-color: #667eea;
  cursor: default;
}

.uploading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.upload-icon {
  color: #667eea;
  margin-bottom: 1rem;
}

.upload-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 0.5rem 0;
}

.upload-hint {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.file-input {
  display: none;
}

.file-info {
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: #f5f5f5;
  border-radius: 8px;
}

.file-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.file-name {
  font-weight: 600;
  color: #333;
}

.file-size {
  font-size: 0.85rem;
  color: #666;
}

.remove-btn {
  background: #ef4444;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
}

.remove-btn:hover {
  background: #dc2626;
  transform: translateY(-1px);
}

.upload-success-message {
  text-align: center;
  padding: 2rem;
  background: #f0fdf4;
  border: 2px solid #dcfce7;
  border-radius: 12px;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.success-icon {
  color: #10b981;
  margin-bottom: 1rem;
  animation: successPulse 1s ease-in-out;
}

@keyframes successPulse {
  0% {
    transform: scale(0.8);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #065f46;
  margin: 0 0 0.5rem 0;
  animation: fadeInUp 0.5s ease-out 0.2s both;
}

.success-desc {
  font-size: 1rem;
  color: #15803d;
  margin: 0;
  animation: fadeInUp 0.5s ease-out 0.4s both;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.parsed-preview {
  margin-top: 1.5rem;
  text-align: left;
  background: white;
  padding: 1rem;
  border-radius: 8px;
}

.parsed-preview h5 {
  margin: 0 0 0.5rem 0;
  color: #333;
  font-size: 0.95rem;
}

.parsed-content {
  font-size: 0.9rem;
  color: #666;
}

.parsed-items {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.parsed-item {
  display: flex;
  gap: 0.5rem;
}

.parsed-item .label {
  font-weight: 600;
  color: #333;
  min-width: 50px;
}

.parsed-content pre {
  background: #f5f5f5;
  padding: 0.5rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.8rem;
}
</style>
