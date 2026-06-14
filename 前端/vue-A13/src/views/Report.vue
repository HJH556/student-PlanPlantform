<template>
  <div class="report">
    <!-- Page Header -->
    <section class="page-header">
      <div class="page-header-bg">
        <div class="page-header-pattern"></div>
      </div>
      <div class="page-header-particles">
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
        <div class="page-header-particle"></div>
      </div>
      <div class="page-header-energy"></div>
      <div class="page-header-content">
        <span class="page-badge">📄 报告中心</span>
        <h1 class="page-title">职业规划报告</h1>
        <p class="page-subtitle">保存规划成果，随时查看和分享</p>
      </div>
    </section>

    <!-- Report Content -->
    <section class="report-content">
      <div class="content-card">
        <div class="card-header">
          <div class="card-icon">📊</div>
          <div class="card-title-wrapper">
            <h3 class="card-title">报告预览</h3>
            <p class="card-desc">查看报告内容，确认无误后导出</p>
          </div>
        </div>
        <div id="report-preview-content" class="report-preview">
          <div class="preview-header">
            <h2>职业规划报告</h2>
            <p>生成日期: {{ currentDate }}</p>
          </div>
          <div class="preview-body">
            <!-- 个人信息部分 -->
            <div class="preview-section" v-if="profileData.basicInfo">
              <h4>个人信息</h4>
              <div class="info-grid">
                <div class="info-item" v-for="(value, key) in profileData.basicInfo" :key="key">
                  <span class="info-label">{{ key }}:</span>
                  <span class="info-value">{{ value }}</span>
                </div>
              </div>
            </div>

            <!-- 能力评估部分 -->
            <div class="preview-section" v-if="profileData.abilityAssessment">
              <h4>能力评估</h4>
              <div class="ability-grid">
                <div class="ability-item" v-for="(ability, name) in profileData.abilityAssessment" :key="name">
                  <div class="ability-header">
                    <span class="ability-name">{{ name }}</span>
                    <span class="ability-score">{{ ability.score }}分</span>
                  </div>
                  <p class="ability-description">{{ ability.description }}</p>
                  <div class="ability-details" v-if="ability.details && ability.details.length > 0">
                    <span class="details-label">具体技能:</span>
                    <div class="skill-tags">
                      <span class="skill-tag" v-for="skill in ability.details" :key="skill">{{ skill }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 职业倾向部分 -->
            <div class="preview-section" v-if="profileData.careerTendency">
              <h4>职业倾向</h4>
              <div class="career-grid">
                <!-- 过滤掉匹配岗位，只显示其他职业倾向信息 -->
                <div class="career-item" v-for="(value, key) in filteredCareerTendency" :key="key">
                  <span class="career-label">{{ key }}:</span>
                  <span class="career-value">{{ value }}</span>
                </div>
              </div>
              
              <!-- 推荐岗位（使用匹配岗位数据） -->
              <div class="match-positions" v-if="profileData.careerTendency.匹配岗位 && profileData.careerTendency.匹配岗位.length > 0">
                <h5>推荐岗位</h5>
                <div class="position-list">
                  <div class="position-item" v-for="position in profileData.careerTendency.匹配岗位" :key="position.name">
                    <div class="position-header">
                      <span class="position-name">{{ position.name }}</span>
                      <span class="position-score">{{ position.match_score }}分</span>
                    </div>
                    <p class="position-reason">{{ position.reason }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 匹配度分析部分 -->
            <div class="preview-section" v-if="profileData.matchAnalysis">
              <h4>匹配度分析</h4>
              <div class="match-analysis">
                <div class="match-item">
                  <span class="match-label">总体匹配度:</span>
                  <span class="match-value">{{ profileData.matchAnalysis.总体匹配度 }}分</span>
                </div>
                <div class="match-item">
                  <span class="match-label">优势分析:</span>
                  <span class="match-value">{{ profileData.matchAnalysis.优势分析 }}</span>
                </div>
                <div class="match-item">
                  <span class="match-label">改进建议:</span>
                  <span class="match-value">{{ profileData.matchAnalysis.改进建议 }}</span>
                </div>
              </div>
            </div>

            <!-- 职业发展路径部分 -->
            <div class="preview-section" v-if="careerPlanData">
              <h4>职业发展路径</h4>
              <div class="career-path">
                <div class="path-item">
                  <h5>短期目标 (0-1年)</h5>
                  <p>{{ careerPlanData.短期目标 }}</p>
                </div>
                <div class="path-item">
                  <h5>中期目标 (1-3年)</h5>
                  <p>{{ careerPlanData.中期目标 }}</p>
                </div>
                <div class="path-item">
                  <h5>长期目标 (3-5年)</h5>
                  <p>{{ careerPlanData.长期目标 }}</p>
                </div>
              </div>
            </div>

            <!-- 行动计划部分 -->
            <div class="preview-section" v-if="careerPlanData">
              <h4>行动计划</h4>
              <div class="action-plan">
                <div class="action-item">
                  <h5>当前匹配度</h5>
                  <p>{{ careerPlanData.当前匹配度 }}</p>
                </div>
                <div class="action-item">
                  <h5>需要弥补的差距</h5>
                  <p>{{ careerPlanData.需要弥补的差距 }}</p>
                </div>
                <div class="action-item">
                  <h5>具体行动建议</h5>
                  <p style="white-space: pre-line;">{{ careerPlanData.具体行动建议 }}</p>
                </div>
                <div class="action-item">
                  <h5>技能提升计划</h5>
                  <p>{{ careerPlanData.当前需要提升的技能 }}</p>
                </div>
                <div class="action-item">
                  <h5>学习资源推荐</h5>
                  <p>{{ careerPlanData.学习资源推荐 }}</p>
                </div>
                <div class="action-item">
                  <h5>实践项目建议</h5>
                  <p>{{ careerPlanData.实践项目建议 }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="content-card">
        <div class="card-header">
          <div class="card-icon">⚙️</div>
          <div class="card-title-wrapper">
            <h3 class="card-title">导出选项</h3>
            <p class="card-desc">选择需要包含的报告内容</p>
          </div>
        </div>
        <div class="export-options">
          <div class="option-item">
            <input type="checkbox" id="include-profile" checked />
            <label for="include-profile">包含个人信息</label>
          </div>
          <div class="option-item">
            <input type="checkbox" id="include-match" checked />
            <label for="include-match">包含匹配结果</label>
          </div>
          <div class="option-item">
            <input type="checkbox" id="include-path" checked />
            <label for="include-path">包含发展路径</label>
          </div>
          <div class="option-item">
            <input type="checkbox" id="include-action" checked />
            <label for="include-action">包含行动计划</label>
          </div>
          <div class="export-buttons">
            <button class="btn-primary" @click="handleExportPDF">
              <span class="btn-text">导出PDF</span>
              <svg class="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
            <button class="btn-secondary" @click="handleExportWord">
              <span class="btn-text">导出Word</span>
              <svg class="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
            </button>
            <button class="btn-secondary" @click="handleShareReport">
              <span class="btn-text">分享报告</span>
              <svg class="btn-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                <polyline points="16 6 12 2 8 6"/>
                <line x1="12" y1="2" x2="12" y2="15"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="content-card">
        <div class="card-header">
          <div class="card-icon">📋</div>
          <div class="card-title-wrapper">
            <h3 class="card-title">历史报告</h3>
            <p class="card-desc">查看和管理您的历史报告</p>
          </div>
          <div class="card-actions">
            <button class="btn-text" @click="saveCurrentReport">
              <span class="btn-icon">💾</span>
              保存当前报告
            </button>
            <button class="btn-text" @click="toggleHistoryPanel">
              <span class="btn-icon">{{ isHistoryPanelOpen ? '📂' : '📁' }}</span>
              {{ isHistoryPanelOpen ? '收起' : '展开' }}
            </button>
          </div>
        </div>
        
        <div class="history-section" :class="{ 'history-section-collapsed': !isHistoryPanelOpen }">
          <!-- 当前报告状态 -->
          <div class="current-report-status" v-if="activeReport">
            <div class="status-badge">
              <span class="status-icon">📄</span>
              <span class="status-text">当前查看: {{ activeReport.title }}</span>
            </div>
            <button class="btn-text" @click="loadProfileData">
              <span class="btn-icon">🔄</span>
              返回最新报告
            </button>
          </div>
          
          <!-- 历史报告列表 -->
          <div class="history-list" v-if="historyReports.length > 0">
            <div 
              class="history-item" 
              v-for="report in historyReports" 
              :key="report.id"
              :class="{ 'history-item-active': activeReportId === report.id }"
            >
              <div class="history-info">
                <h4>{{ report.title }}</h4>
                <p>生成日期: {{ report.date }}</p>
                <div class="report-meta">
                  <span class="meta-item">{{ report.exportFormat }}</span>
                  <span class="meta-item">{{ report.fileSize }}</span>
                </div>
              </div>
              <div class="history-actions">
                <button 
                  class="btn-text" 
                  @click="viewHistoryReport(report.id)"
                  :disabled="activeReportId === report.id"
                >
                  <span class="btn-icon">👁️</span>
                  查看
                </button>
                <div class="export-dropdown">
                  <button class="btn-text">
                    <span class="btn-icon">📥</span>
                    导出
                  </button>
                  <div class="dropdown-menu">
                    <button class="dropdown-item" @click="exportHistoryReport(report.id, 'pdf')">
                      <span class="dropdown-icon">📄</span>
                      PDF格式
                    </button>
                    <button class="dropdown-item" @click="exportHistoryReport(report.id, 'word')">
                      <span class="dropdown-icon">📝</span>
                      Word格式
                    </button>
                  </div>
                </div>
                <button 
                  class="btn-text danger" 
                  @click="deleteHistoryReport(report.id)"
                >
                  <span class="btn-icon">🗑️</span>
                  删除
                </button>
              </div>
            </div>
          </div>
          
          <!-- 空状态 -->
          <div class="history-empty" v-else>
            <div class="empty-icon">📋</div>
            <h4>暂无历史报告</h4>
            <p>保存当前报告后，将在这里显示历史记录</p>
            <button class="btn-primary" @click="saveCurrentReport">
              <span class="btn-icon">💾</span>
              保存当前报告
            </button>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { exportToPDF, exportToWord, shareReport } from '@/utils/export'
import { ElMessage } from 'element-plus'

const userStore = useUserStore()

// 响应式数据
const currentDate = ref('')
const profileData = ref<{
  basicInfo: Record<string, any>
  abilityAssessment: Record<string, any>
  careerTendency: Record<string, any>
  matchAnalysis: Record<string, any>
}>({
  basicInfo: {},
  abilityAssessment: {},
  careerTendency: {},
  matchAnalysis: {}
})
const careerPlanData = ref<Record<string, any>>({})

// 历史报告相关数据
interface HistoryReport {
  id: string
  title: string
  date: string
  profileData: any
  careerPlanData: any
  exportFormat?: string
  fileSize?: string
}

const historyReports = ref<HistoryReport[]>([])
const activeReportId = ref<string>('')
const isHistoryPanelOpen = ref(false)

// 计算属性：过滤掉匹配岗位的职业倾向信息
const filteredCareerTendency = computed(() => {
  if (!profileData.value || !profileData.value.careerTendency) {
    return {}
  }
  
  // 过滤掉匹配岗位和推荐岗位，只显示其他职业倾向信息
  const filtered = { ...profileData.value.careerTendency }
  delete filtered.匹配岗位
  delete filtered.推荐岗位
  
  return filtered
})

// 计算属性：当前活跃的报告
const activeReport = computed(() => {
  if (activeReportId.value) {
    return historyReports.value.find(report => report.id === activeReportId.value)
  }
  return null
})

// 历史报告管理函数
const saveCurrentReport = () => {
  try {
    const userId = userStore.user?.id || 'unknown'
    const reportId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const newReport: HistoryReport = {
      id: reportId,
      title: `职业规划报告 v${historyReports.value.length + 1}.0`,
      date: currentDate.value,
      profileData: { ...profileData.value },
      careerPlanData: { ...careerPlanData.value },
      exportFormat: '未导出',
      fileSize: '0KB'
    }
    
    historyReports.value.unshift(newReport)
    saveHistoryReportsToStorage(userId)
    
    ElMessage.success('报告已保存到历史记录')
    console.log('保存历史报告:', newReport)
  } catch (error) {
    console.error('保存历史报告失败:', error)
    ElMessage.error('保存报告失败')
  }
}

const loadHistoryReports = (userId: string) => {
  try {
    const storageKey = `history_reports_${userId}`
    const savedReports = localStorage.getItem(storageKey)
    
    if (savedReports) {
      historyReports.value = JSON.parse(savedReports)
      console.log(`加载用户${userId}的历史报告:`, historyReports.value.length, '条')
    }
  } catch (error) {
    console.error('加载历史报告失败:', error)
  }
}

const saveHistoryReportsToStorage = (userId: string) => {
  try {
    const storageKey = `history_reports_${userId}`
    localStorage.setItem(storageKey, JSON.stringify(historyReports.value))
    console.log(`保存用户${userId}的历史报告:`, historyReports.value.length, '条')
  } catch (error) {
    console.error('保存历史报告到存储失败:', error)
  }
}

const viewHistoryReport = (reportId: string) => {
  const report = historyReports.value.find(r => r.id === reportId)
  if (report) {
    activeReportId.value = reportId
    profileData.value = { ...report.profileData }
    careerPlanData.value = { ...report.careerPlanData }
    ElMessage.success(`已切换到报告: ${report.title}`)
    console.log('查看历史报告:', report)
  }
}

const deleteHistoryReport = (reportId: string) => {
  const reportIndex = historyReports.value.findIndex(r => r.id === reportId)
  if (reportIndex !== -1) {
    const reportTitle = historyReports.value[reportIndex].title
    historyReports.value.splice(reportIndex, 1)
    
    // 如果删除的是当前活跃的报告，切换到最新报告
    if (activeReportId.value === reportId) {
      if (historyReports.value.length > 0) {
        viewHistoryReport(historyReports.value[0].id)
      } else {
        activeReportId.value = ''
        loadProfileData() // 重新加载当前数据
      }
    }
    
    saveHistoryReportsToStorage(userStore.user?.id || 'unknown')
    ElMessage.success(`已删除报告: ${reportTitle}`)
    console.log('删除历史报告:', reportId)
  }
}

const exportHistoryReport = (reportId: string, format: 'pdf' | 'word') => {
  const report = historyReports.value.find(r => r.id === reportId)
  if (report) {
    // 临时切换到该报告进行导出
    const currentProfileData = { ...profileData.value }
    const currentCareerPlanData = { ...careerPlanData.value }
    
    profileData.value = { ...report.profileData }
    careerPlanData.value = { ...report.careerPlanData }
    
    setTimeout(() => {
      if (format === 'pdf') {
        handleExportPDF()
      } else {
        handleExportWord()
      }
      
      // 恢复当前数据
      setTimeout(() => {
        profileData.value = currentProfileData
        careerPlanData.value = currentCareerPlanData
      }, 1000)
    }, 100)
  }
}

const toggleHistoryPanel = () => {
  isHistoryPanelOpen.value = !isHistoryPanelOpen.value
}

// 从分析数据中提取技能信息
const _extractSkillsFromAnalysis = (parsedData: any): string => {
  try {
    const skills: string[] = []
    
    // 从能力评估中提取技能
    if (parsedData.ability_assessment) {
      Object.keys(parsedData.ability_assessment).forEach(key => {
        if (key.includes('能力') || key.includes('技能')) {
          skills.push(key)
        }
      })
    }
    
    // 从技能匹配中提取技能
    if (parsedData.match_analysis && parsedData.match_analysis.技能匹配) {
      parsedData.match_analysis.技能匹配.forEach((skill: any) => {
        if (skill.技能 && !skills.includes(skill.技能)) {
          skills.push(skill.技能)
        }
      })
    }
    
    // 从基本信息中提取技能特长
    if (parsedData.basic_info && parsedData.basic_info.技能特长) {
      const skillStr = parsedData.basic_info.技能特长.toString()
      const extractedSkills = skillStr.split(/[、，,]/).map((s: string) => s.trim()).filter(Boolean)
      extractedSkills.forEach((skill: string) => {
        if (!skills.includes(skill)) {
          skills.push(skill)
        }
      })
    }
    
    // 如果没有任何技能，返回默认技能
    if (skills.length === 0) {
      return 'Vue.js、React、Node.js、数据库设计、系统架构'
    }
    
    // 返回前5个技能
    return skills.slice(0, 5).join('、')
  } catch (error) {
    console.error('提取技能信息失败:', error)
    return 'Vue.js、React、Node.js、数据库设计、系统架构'
  }
}

// 加载个人画像数据
const loadProfileData = () => {
  try {
    const userId = userStore.user?.id || 'unknown'
    console.log(`=== 开始加载报告数据 ===`)
    console.log(`用户ID: ${userId}`)
    console.log(`用户信息:`, userStore.user)
    
    const analysisData = localStorage.getItem(`resume_analysis_${userId}`)
    console.log(`简历分析数据是否存在: ${!!analysisData}`)
    
    if (analysisData) {
      console.log(`原始分析数据长度: ${analysisData.length}`)
      const parsedData = JSON.parse(analysisData)
      console.log(`解析后的数据结构:`, Object.keys(parsedData))
      console.log('详细字段检查:')
      console.log('- career_planning:', parsedData.career_planning)
      console.log('- career_plan:', parsedData.career_plan)
      console.log('- match_analysis:', parsedData.match_analysis)
      console.log('- career_tendency:', parsedData.career_tendency)
      console.log('- basic_info:', parsedData.basic_info)
      console.log('- ability_assessment:', parsedData.ability_assessment)
      
      // 设置个人画像数据
      profileData.value = {
        basicInfo: parsedData.basic_info || {},
        abilityAssessment: parsedData.ability_assessment || {},
        careerTendency: parsedData.career_tendency || {},
        matchAnalysis: parsedData.match_analysis || {}
      }
      
      // 设置职业规划数据 - 使用智能体分析的真实数据
      let careerPlanningData = null
      
      // 检查不同的数据结构
      if (parsedData.analysis && parsedData.analysis.career_planning) {
        // 新的嵌套结构：analysis.career_planning
        careerPlanningData = parsedData.analysis.career_planning
        console.log('使用嵌套结构职业规划数据')
      } else if (parsedData.career_planning && parsedData.career_planning.career_planning) {
        // 嵌套的career_planning结构
        careerPlanningData = parsedData.career_planning.career_planning
        console.log('使用嵌套的career_planning结构')
      } else if (parsedData.career_planning && Object.keys(parsedData.career_planning).length > 0) {
        // 直接访问career_planning
        careerPlanningData = parsedData.career_planning
        console.log('使用直接结构职业规划数据')
      } else if (parsedData.career_plan && Object.keys(parsedData.career_plan).length > 0) {
        // 兼容不同的数据字段名
        careerPlanningData = parsedData.career_plan
        console.log('使用兼容的职业规划数据')
      }
      
      if (careerPlanningData) {
        careerPlanData.value = careerPlanningData
        console.log('职业规划数据设置完成:', careerPlanData.value)
      } else if (parsedData.match_analysis && Object.keys(parsedData.match_analysis).length > 0) {
        // 如果没有专门的职业规划数据，但有关键分析数据，基于分析结果生成个性化建议
        const matchScore = parsedData.match_analysis.总体匹配度 || 0
        const strengths = parsedData.match_analysis.优势分析 || ''
        const improvements = parsedData.match_analysis.改进建议 || ''
        
        // 提取推荐岗位信息
        const recommendedPositions = parsedData.career_tendency?.匹配岗位 || []
        const targetPosition = recommendedPositions.length > 0 ? recommendedPositions[0].name : '技术岗位'
        
        careerPlanData.value = {
          短期目标: `基于您的简历分析（匹配度${matchScore}分），建议在0-1年内专注于${strengths ? strengths.split('，')[0] : '技术能力'}提升和项目实践，为${targetPosition}岗位做准备`,
          中期目标: `在1-3年内，基于${strengths ? '您的优势领域' : '当前能力'}向${targetPosition}方向发展，积累项目经验和团队协作能力`,
          长期目标: `在3-5年内，向${targetPosition}高级岗位或技术管理方向发展，培养领导力和技术决策能力`,
          当前匹配度: `${matchScore}分（基于简历智能分析）`,
          需要弥补的差距: improvements || '需要加强项目经验积累和技术深度',
          具体行动建议: improvements ? `1. ${improvements.split('，')[0] || '完成2-3个完整项目'}\n2. 深入学习${_extractSkillsFromAnalysis(parsedData)}\n3. 参与实际项目实践` : `1. 完成2-3个完整项目\n2. 深入学习${_extractSkillsFromAnalysis(parsedData)}\n3. 参与实际项目实践`,
          当前需要提升的技能: _extractSkillsFromAnalysis(parsedData),
          学习资源推荐: '基于您的技能需求，推荐慕课网、掘金、极客时间等学习平台，重点关注相关技术栈学习',
          实践项目建议: `个人博客系统、电商平台、管理系统等${targetPosition}相关实践项目`
        }
        console.log('基于匹配分析生成职业规划数据')
      } else {
        // 如果没有任何分析数据，生成默认的职业规划数据
        careerPlanData.value = {
          短期目标: '在0-1年内，专注于技术能力提升和项目实践，为技术岗位做准备',
          中期目标: '在1-3年内，向技术方向发展，积累项目经验和团队协作能力',
          长期目标: '在3-5年内，向高级技术岗位或技术管理方向发展，培养领导力和技术决策能力',
          当前匹配度: '待分析',
          需要弥补的差距: '请先上传简历获取详细分析结果',
          具体行动建议: '1. 完成2-3个完整项目\n2. 深入学习相关技术栈\n3. 参与实际项目实践',
          当前需要提升的技能: 'Vue.js、React、Node.js、数据库设计、系统架构',
          学习资源推荐: '推荐慕课网、掘金、极客时间等学习平台，重点关注相关技术栈学习',
          实践项目建议: '个人博客系统、电商平台、管理系统等技术相关实践项目'
        }
        console.log('使用默认职业规划数据')
      }
    } else {
      console.log(`用户${userId}没有简历分析数据，显示默认报告`)
      // 如果没有数据，显示默认报告
      profileData.value = {
        basicInfo: { 状态: '请先上传简历进行分析' },
        abilityAssessment: {},
        careerTendency: {},
        matchAnalysis: {}
      }
      careerPlanData.value = {
        短期目标: '请先上传简历获取个性化职业规划',
        中期目标: '请先上传简历获取个性化职业规划',
        长期目标: '请先上传简历获取个性化职业规划',
        当前匹配度: '0分',
        需要弥补的差距: '请先上传简历获取分析结果',
        具体行动建议: '请先上传简历获取个性化建议',
        当前需要提升的技能: '请先上传简历获取技能分析',
        学习资源推荐: '请先上传简历获取个性化推荐',
        实践项目建议: '请先上传简历获取项目建议'
      }
    }
  } catch (error) {
    console.error('加载报告数据失败:', error)
    ElMessage.error('加载报告数据失败，请先上传简历进行分析')
  }
}

// 设置当前日期
const setCurrentDate = () => {// 设置当前日期
  const now = new Date()
  currentDate.value = now.toISOString().split('T')[0] || ''
}

// 导出PDF
async function handleExportPDF() {
  try {
    await exportToPDF('report-preview-content', '职业规划报告.pdf')
    ElMessage.success('PDF导出成功')
  } catch (error) {
    console.error('导出PDF失败:', error)
    ElMessage.error('PDF导出失败，请重试')
  }
}

// 导出Word
function handleExportWord() {
  try {
    exportToWord('report-preview-content', '职业规划报告.doc')
    ElMessage.success('Word导出成功')
  } catch (error) {
    console.error('导出Word失败:', error)
    ElMessage.error('Word导出失败，请重试')
  }
}

// 分享报告
function handleShareReport() {
  try {
    shareReport('职业规划报告')
  } catch (error) {
    console.error('分享失败:', error)
    ElMessage.error('分享失败，请重试')
  }
}

// 组件挂载时初始化数据
onMounted(() => {
  setCurrentDate()
  
  // 等待用户信息加载完成后再加载数据
  if (userStore.user?.id) {
    loadProfileData()
    loadHistoryReports(userStore.user.id)
  } else {
    // 如果用户信息还未准备好，等待一下再加载
    setTimeout(() => {
      loadProfileData()
      loadHistoryReports(userStore.user?.id || 'unknown')
    }, 500)
  }
})
</script>

<style scoped>
.report {
  width: 100%;
  min-height: 100vh;
}

/* Page Header - Dark Blue Theme */
.page-header {
  position: relative;
  background: linear-gradient(135deg, #1a237e 0%, #283593 30%, #3949ab 60%, #3f51b5 100%);
  color: white;
  padding: 1.33rem 0;
  margin: -2rem -2rem 2rem 0rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
}

.page-header-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.page-header-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(240, 147, 251, 0.2) 0%, transparent 50%);
  animation: patternFloat 10s ease-in-out infinite;
}

@keyframes patternFloat {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translate(-15px, 10px) scale(1.05);
    opacity: 1;
  }
}

.page-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, 
    transparent 30%, 
    rgba(255, 255, 255, 0.05) 50%, 
    transparent 70%);
  animation: shimmer 4s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 添加粒子效果 */
.page-header-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.page-header-particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: headerParticleFloat 6s ease-in-out infinite;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
}

.page-header-particle:nth-child(1) { left: 5%; top: 30%; animation-delay: 0s; }
.page-header-particle:nth-child(2) { left: 15%; top: 70%; animation-delay: 0.8s; }
.page-header-particle:nth-child(3) { left: 25%; top: 50%; animation-delay: 1.5s; }
.page-header-particle:nth-child(4) { left: 35%; top: 80%; animation-delay: 0.3s; }
.page-header-particle:nth-child(5) { left: 45%; top: 40%; animation-delay: 2s; }
.page-header-particle:nth-child(6) { left: 55%; top: 60%; animation-delay: 1s; }
.page-header-particle:nth-child(7) { left: 65%; top: 30%; animation-delay: 2.5s; }
.page-header-particle:nth-child(8) { left: 75%; top: 70%; animation-delay: 0.5s; }
.page-header-particle:nth-child(9) { left: 85%; top: 50%; animation-delay: 1.8s; }
.page-header-particle:nth-child(10) { left: 95%; top: 80%; animation-delay: 1.2s; }

@keyframes headerParticleFloat {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-15px) scale(1.3);
    opacity: 0.9;
  }
}

/* 添加能量环 */
.page-header-energy {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: energyRing 4s ease-out infinite;
}

.page-header-energy::before,
.page-header-energy::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.page-header-energy::before {
  width: 300px;
  height: 300px;
  animation: energyRing 4s ease-out infinite 0.5s;
}

.page-header-energy::after {
  width: 400px;
  height: 400px;
  animation: energyRing 4s ease-out infinite 1s;
}

@keyframes energyRing {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

.page-header-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  padding: 0 2rem;
}

.page-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 0.3rem 0.8rem;
  border-radius: 50px;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
}

/* Report Content */
.report-content {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  padding: 0 2rem 4rem;
}

.content-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.content-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

/* Card Header */
.card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  border-bottom: 1px solid #f0f0f0;
  background: #f9fafb;
}

.card-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  border-radius: 12px;
  font-size: 1.5rem;
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.card-title-wrapper {
  flex: 1;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.5rem;
  padding: 0;
  border: none;
}

.card-desc {
  font-size: 1rem;
  color: #64748b;
  margin: 0;
  line-height: 1.5;
}

/* Report Preview */
.report-preview {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  margin: 2rem;
}

.preview-header {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.preview-header h2 {
  margin: 0 0 0.5rem;
  font-size: 1.75rem;
  font-weight: 600;
}

.preview-header p {
  margin: 0;
  opacity: 0.9;
  font-size: 1rem;
}

.preview-body {
  padding: 2rem;
  background: white;
}

.preview-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.preview-section:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.preview-section h4 {
  font-size: 1.25rem;
  color: #1e293b;
  margin-bottom: 1rem;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

/* 新增报告预览样式 - 与个人画像页面一致 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.info-label {
  font-weight: 600;
  color: #1a1a1a;
  min-width: 80px;
}

.info-value {
  color: #666;
  text-align: right;
  flex: 1;
}

.ability-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.ability-item {
  padding: 1rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.ability-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.ability-name {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 1rem;
}

.ability-score {
  background: #667eea;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.ability-description {
  color: #666;
  margin: 0.5rem 0;
  line-height: 1.5;
}

.ability-details {
  margin-top: 0.5rem;
}

.details-label {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.875rem;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.skill-tag {
  background: #e3f2fd;
  color: #1976d2;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.career-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.career-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #f3e5f5;
  border-radius: 8px;
}

.career-label {
  font-weight: 600;
  color: #1a1a1a;
  min-width: 100px;
}

.career-value {
  color: #666;
  text-align: right;
  flex: 1;
}

.match-positions {
  margin-top: 1rem;
}

.match-positions h5 {
  color: #1a1a1a;
  margin-bottom: 0.75rem;
  font-size: 1.125rem;
}

.position-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.position-item {
  padding: 0.75rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.position-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.position-name {
  font-weight: 600;
  color: #1a1a1a;
}

.position-score {
  background: #4caf50;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.position-reason {
  color: #666;
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.4;
}

.match-analysis {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.match-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: #e8f5e8;
  border-radius: 8px;
}

.match-label {
  font-weight: 600;
  color: #1a1a1a;
  min-width: 120px;
}

.match-value {
  color: #666;
  text-align: right;
  flex: 1;
}

.career-path {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.path-item {
  padding: 1rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.path-item h5 {
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
}

.path-item p {
  color: #666;
  margin: 0;
  line-height: 1.5;
}

.action-plan {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.action-item {
  padding: 1rem;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.action-item h5 {
  color: #1a1a1a;
  margin-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
}

.action-item p {
  color: #666;
  margin: 0;
  line-height: 1.5;
}

/* 导出选项样式保持不变 */
.export-options {
  padding: 2rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.option-item:last-child {
  margin-bottom: 0;
}

.option-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #3b82f6;
}

.option-item label {
  font-size: 1rem;
  color: #1e293b;
  cursor: pointer;
}

.export-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
  flex-wrap: wrap;
}

.btn-primary, .btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.btn-secondary {
  background: white;
  color: #64748b;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
  transform: translateY(-2px);
}

.btn-text {
  font-size: 0.9rem;
}

.btn-icon {
  width: 16px;
  height: 16px;
}

/* 历史报告样式 */
.card-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.history-section {
  padding: 2rem;
  transition: all 0.3s ease;
}

.history-section-collapsed {
  display: none;
}

.current-report-status {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid #bbdefb;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-icon {
  font-size: 1.2rem;
}

.status-text {
  font-weight: 600;
  color: #1565c0;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.history-item:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.history-item-active {
  background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
  border-color: #81c784;
}

.history-info {
  flex: 1;
}

.history-info h4 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
  color: #1e293b;
  font-weight: 600;
}

.history-info p {
  margin: 0 0 0.5rem;
  color: #64748b;
  font-size: 0.9rem;
}

.report-meta {
  display: flex;
  gap: 1rem;
}

.meta-item {
  background: #e2e8f0;
  color: #475569;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.history-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-text {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  color: #64748b;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-text:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #475569;
}

.btn-text:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-text.danger {
  border-color: #fecaca;
  color: #dc2626;
}

.btn-text.danger:hover {
  background: #fef2f2;
  border-color: #fca5a5;
  color: #b91c1c;
}

.btn-icon {
  font-size: 0.9rem;
}

.export-dropdown {
  position: relative;
}

.export-dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  padding: 0.5rem;
  min-width: 120px;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease;
  z-index: 10;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: #475569;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: #f1f5f9;
  color: #1e293b;
}

.dropdown-icon {
  font-size: 0.9rem;
}

.history-empty {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.history-empty h4 {
  margin: 0 0 0.5rem;
  color: #64748b;
  font-size: 1.1rem;
}

.history-empty p {
  margin: 0 0 1.5rem;
  color: #94a3b8;
  font-size: 0.9rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .history-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .current-report-status {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .card-actions {
    flex-direction: column;
    gap: 0.5rem;
  }
}

.preview-section p {
  margin: 0.5rem 0;
  color: #64748b;
  line-height: 1.5;
}

/* Export Options */
.export-options {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 2rem;
}

.option-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.option-item:hover {
  background: #f8fafc;
}

.option-item input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #3b82f6;
  cursor: pointer;
}

.option-item label {
  font-size: 1rem;
  color: #1e293b;
  cursor: pointer;
  font-weight: 500;
}

.export-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #f1f5f9;
}

/* Buttons */
.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border: none;
  border-radius: 25px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  text-decoration: none;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-secondary {
  background: white;
  color: #3b82f6;
  border: 2px solid #3b82f6;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
}

.btn-secondary:hover {
  background: #f0f9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.btn-text {
  background: none;
  border: none;
  color: #3b82f6;
  font-weight: 600;
  cursor: pointer;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.btn-text:hover {
  background: #f0f9ff;
}

.btn-text.danger {
  color: #ef4444;
}

.btn-text.danger:hover {
  background: #fef2f2;
}

/* History List */
.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 2rem;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: all 0.3s ease;
  background: white;
}

.history-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border-color: #3b82f6;
  transform: translateY(-2px);
}

.history-info h4 {
  margin: 0 0 0.5rem;
  color: #1e293b;
  font-size: 1.1rem;
  font-weight: 600;
}

.history-info p {
  margin: 0;
  color: #64748b;
  font-size: 0.9rem;
  line-height: 1.5;
}

.history-actions {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

/* Large Screen Layout */
@media (min-width: 1200px) {
  .page-title {
    font-size: 3rem;
  }

  .page-subtitle {
    font-size: 1.25rem;
  }

  .report-content {
    gap: 2.5rem;
  }

  .content-card {
    padding: 0;
  }

  .preview-header {
    padding: 2.5rem;
  }

  .preview-body {
    padding: 2.5rem;
  }

  .export-options {
    padding: 2.5rem;
  }

  .history-list {
    padding: 2.5rem;
  }

  .history-item {
    padding: 2rem;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 1.75rem;
  }

  .report-content {
    padding: 0 1rem 3rem;
    gap: 1.5rem;
  }

  .card-header {
    padding: 1.5rem;
  }

  .card-icon {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }

  .card-title {
    font-size: 1.25rem;
  }

  .report-preview {
    margin: 1.5rem;
  }

  .preview-header {
    padding: 1.5rem;
  }

  .preview-body {
    padding: 1.5rem;
  }

  .export-options {
    padding: 1.5rem;
  }

  .export-buttons {
    flex-direction: column;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }

  .history-list {
    padding: 1.5rem;
  }

  .history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
  }

  .history-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>