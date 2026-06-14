<template>
  <div class="excel-upload">
    <div class="upload-container">
      <h3 class="upload-title">📊 上传岗位数据</h3>
      <p class="upload-desc">上传Excel文件，系统将自动清洗数据并导入到岗位探索中</p>
      
      <div class="file-upload-area">
        <input 
          type="file" 
          ref="fileInput" 
          accept=".xlsx,.xls" 
          class="file-input"
          @change="handleFileUpload"
        />
        <div class="upload-icon">📁</div>
        <p class="upload-text">点击或拖拽文件到此处</p>
        <p class="upload-hint">支持 .xlsx 和 .xls 格式</p>
      </div>
      
      <div v-if="rawData.length" class="file-info">
        <div class="info-item">
          <span class="info-label">文件名称：</span>
          <span class="info-value">{{ fileName }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">原始数据：</span>
          <span class="info-value">{{ rawData.length }} 条记录</span>
        </div>
        <button 
          class="btn-primary" 
          @click="startCleaning"
          :disabled="!rawData.length"
        >
          开始清洗数据
        </button>
      </div>
      
      <div v-if="cleanedData.length" class="cleaned-info">
        <h4 class="cleaned-title">清洗结果</h4>
        <div class="info-item">
          <span class="info-label">清洗后数据：</span>
          <span class="info-value">{{ cleanedData.length }} 条记录</span>
        </div>
        <div class="info-item">
          <span class="info-label">处理时间：</span>
          <span class="info-value">{{ processingTime }} ms</span>
        </div>
        <div class="action-buttons">
          <button 
            class="btn-primary" 
            @click="loadToJobExplore"
          >
            导入到岗位探索
          </button>
          <button 
            class="btn-secondary" 
            @click="exportCleanedData"
          >
            导出清洗后数据
          </button>
        </div>
      </div>
      
      <div v-if="error" class="error-message">
        <span class="error-icon">⚠️</span>
        <span class="error-text">{{ error }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import * as XLSX from 'xlsx'
import { useJobStore } from '@/stores/job'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const fileInput = ref<HTMLInputElement | null>(null)
const rawData = ref<any[]>([])
const cleanedData = ref<any[]>([])
const fileName = ref('')
const processingTime = ref(0)
const error = ref('')
const jobStore = useJobStore()
const router = useRouter()

// 处理文件上传
const handleFileUpload = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  
  fileName.value = file.name
  error.value = ''
  
  const reader = new FileReader()
  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target?.result as ArrayBuffer)
      const workbook = XLSX.read(data, { type: 'array' })
      
      // 获取第一个工作表
      const firstSheetName = workbook.SheetNames[0]
      if (!firstSheetName) {
        error.value = 'Excel文件中没有工作表'
        ElMessage.error('Excel文件中没有工作表')
        return
      }
      const worksheet = workbook.Sheets[firstSheetName]
      if (!worksheet) {
        error.value = '工作表读取失败'
        ElMessage.error('工作表读取失败')
        return
      }
      
      // 转换为JSON格式
      rawData.value = XLSX.utils.sheet_to_json(worksheet)
      cleanedData.value = []
      
      ElMessage.success('文件读取成功！')
    } catch (err) {
      error.value = '文件读取失败，请检查文件格式'
      ElMessage.error('文件读取失败')
    }
  }
  reader.readAsArrayBuffer(file)
}

// 开始数据清洗
const startCleaning = () => {
  if (rawData.value.length === 0) return
  
  const startTime = performance.now()
  
  try {
    // 1. 处理空值
    const step1 = rawData.value.map(row => {
      const cleanedRow: any = {}
      for (const [key, value] of Object.entries(row)) {
        cleanedRow[key] = (value === '' || value === null || value === undefined) ? 'N/A' : value
      }
      return cleanedRow
    }).filter(row => {
      // 删除全为空值的行
      return Object.values(row).some(val => val !== 'N/A')
    })
    
    // 2. 去重（假设岗位名称+公司名称为唯一标识）
    const seen = new Set()
    const step2 = step1.filter(row => {
      const key = `${row['岗位名称'] || row['职位'] || ''}-${row['公司名称'] || row['公司'] || ''}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    
    // 3. 格式统一
    const step3 = step2.map(row => {
      const cleanedRow: any = {}
      for (const [key, value] of Object.entries(row)) {
        if (typeof value === 'string') {
          cleanedRow[key] = value.trim()
        } else if (typeof value === 'number') {
          // 处理Excel日期（从1900年1月1日开始的天数）
          if (key.includes('日期') && value > 59) {
            const date = XLSX.SSF.parse_date_code(value)
            cleanedRow[key] = new Date(date.y, date.m - 1, date.d).toISOString().split('T')[0]
          } else {
            cleanedRow[key] = value
          }
        } else {
          cleanedRow[key] = value
        }
      }
      return cleanedRow
    })
    
    cleanedData.value = step3
    processingTime.value = Math.round(performance.now() - startTime)
    
    ElMessage.success(`数据清洗完成！处理了 ${rawData.value.length} 条记录，清洗后剩余 ${cleanedData.value.length} 条`)
  } catch (err) {
    error.value = '数据清洗失败，请检查数据格式'
    ElMessage.error('数据清洗失败')
  }
}

// 导入到岗位探索
const loadToJobExplore = () => {
  if (cleanedData.value.length === 0) return
  
  jobStore.loadJobsFromCleanedData(cleanedData.value)
  ElMessage.success('数据导入成功！')
  
  // 跳转到岗位探索页面
  router.push('/job-explore')
}

// 导出清洗后的数据
const exportCleanedData = () => {
  if (cleanedData.value.length === 0) return
  
  try {
    const worksheet = XLSX.utils.json_to_sheet(cleanedData.value)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cleaned Data')
    XLSX.writeFile(workbook, `cleaned_jobs_${Date.now()}.xlsx`)
    
    ElMessage.success('清洗后的数据已导出')
  } catch (err) {
    ElMessage.error('导出失败')
  }
}
</script>

<style scoped>
.excel-upload {
  padding: 2rem;
  background: #f8fafc;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  max-width: 600px;
  margin: 0 auto;
}

.upload-container {
  text-align: center;
}

.upload-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1a237e;
  margin-bottom: 0.5rem;
}

.upload-desc {
  color: #64748b;
  margin-bottom: 2rem;
  font-size: 0.95rem;
}

.file-upload-area {
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  padding: 3rem 2rem;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
}

.file-upload-area:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
}

.file-input {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0;
  cursor: pointer;
  z-index: 1;
}

.upload-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.upload-text {
  font-size: 1.1rem;
  font-weight: 500;
  color: #475569;
  margin-bottom: 0.5rem;
}

.upload-hint {
  font-size: 0.85rem;
  color: #94a3b8;
  margin: 0;
}

.file-info, .cleaned-info {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  text-align: left;
}

.info-item {
  margin-bottom: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  color: #64748b;
  font-size: 0.9rem;
}

.info-value {
  font-weight: 600;
  color: #1e293b;
}

.cleaned-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin-top: 0;
  margin-bottom: 1rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #6366f1 100%);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: white;
  color: #3b82f6;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 600;
  border: 2px solid #3b82f6;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.btn-secondary:hover {
  background: #f0f9ff;
  transform: translateY(-1px);
}

.error-message {
  background: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 6px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.error-icon {
  font-size: 1.2rem;
}

.error-text {
  color: #dc2626;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .excel-upload {
    padding: 1.5rem;
  }
  
  .file-upload-area {
    padding: 2rem 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>