<template>
  <div class="interview-container">
    <!-- 顶部导航栏 -->
    <div class="interview-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>
        <div class="interview-info">
          <h1 class="company-name">{{ interviewData.company }}</h1>
          <div class="position-info">
            <span class="position">{{ interviewData.position }}</span>
            <span class="language">{{ interviewData.language }}</span>
          </div>
        </div>
      </div>
      <div class="header-right">
        <div class="interview-status">
          <span class="status-label" :class="{ 'active': interviewStarted }">
            {{ interviewStarted ? '面试进行中' : '准备开始' }}
          </span>
          <div class="status-indicator" :class="{ 'active': interviewStarted }"></div>
        </div>
        <button 
          class="start-btn" 
          @click="startInterview"
          :disabled="interviewState.loading"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          {{ interviewState.loading ? '准备中...' : interviewStarted ? '重新开始' : '开始面试' }}
        </button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="interview-main">
      <!-- 左侧：问题区域 -->
      <div class="question-section">
        <div class="section-header">
          <h2>面试问题</h2>
          <div class="question-progress">
            <span class="progress-text">
              第 {{ interviewState.currentQuestionIndex + 1 }} 题 / 共 {{ interviewState.totalQuestions }} 题
            </span>
            <div class="progress-bar">
              <div 
                class="progress-fill" 
                :style="{ width: ((interviewState.currentQuestionIndex + 1) / interviewState.totalQuestions) * 100 + '%' }"
              ></div>
            </div>
          </div>
        </div>

        <div class="question-content">
          <div v-if="!interviewStarted" class="welcome-screen">
            <div class="welcome-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <h3>欢迎来到智能面试系统</h3>
            <p>准备好开始您的面试了吗？点击"开始面试"按钮，我们将为您生成个性化的面试问题。</p>
            <div class="feature-list">
              <div class="feature-item">
                <span class="feature-icon">🤖</span>
                <span>AI智能问题生成</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">📊</span>
                <span>实时回答评估</span>
              </div>
              <div class="feature-item">
                <span class="feature-icon">💡</span>
                <span>个性化建议</span>
              </div>
            </div>
          </div>

          <div v-else class="question-display">
            <div class="question-meta">
              <span class="question-type">{{ aiGeneratedQuestions[interviewState.currentQuestionIndex]?.type || '通用' }}</span>
              <span class="question-difficulty">{{ aiGeneratedQuestions[interviewState.currentQuestionIndex]?.difficulty || '中等' }}</span>
            </div>
            <div class="question-text">
              {{ currentQuestion }}
            </div>
            
            <!-- 问题导航 -->
            <div class="question-navigation">
              <button 
                class="nav-btn prev-btn" 
                @click="prevQuestion"
                :disabled="interviewState.currentQuestionIndex === 0 || interviewCompleted"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
                上一题
              </button>
              <button 
                v-if="!interviewCompleted"
                class="nav-btn next-btn" 
                @click="nextQuestion"
                :disabled="interviewState.currentQuestionIndex === interviewState.totalQuestions - 1"
              >
                下一题
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
              <button 
                v-if="interviewState.currentQuestionIndex === interviewState.totalQuestions - 1 && !interviewCompleted"
                class="nav-btn complete-btn" 
                @click="generateOverallEvaluation"
                :disabled="interviewState.loading"
              >
                {{ interviewState.loading ? '评估中...' : '完成面试' }}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <!-- 回答输入区域 -->
        <div v-if="interviewStarted" class="answer-section">
          <div class="answer-header">
            <h3>您的回答</h3>
            <div class="answer-actions">
              <button class="action-btn clear-btn" @click="clearAnswer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                清空
              </button>
              <button class="action-btn save-btn" @click="saveAnswer">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                </svg>
                保存
              </button>
            </div>
          </div>
          <textarea 
            v-model="userAnswers[interviewState.currentQuestionIndex]" 
            placeholder="请在此输入您的回答..."
            rows="6"
            class="answer-input"
          ></textarea>
          
          <!-- 评估按钮 -->
          <button 
            class="evaluate-btn" 
            @click="evaluateAnswer"
            :disabled="!userAnswers[interviewState.currentQuestionIndex] || interviewState.loading"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            {{ interviewState.loading ? '评估中...' : '智能评估' }}
          </button>
        </div>
      </div>

      <!-- 右侧：AI助手区域 -->
      <div class="assistant-section">
        <div class="assistant-header">
          <div class="assistant-avatar">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="8" r="5"/>
              <path d="M20 21a8 8 0 1 0-16 0"/>
            </svg>
          </div>
          <div class="assistant-info">
            <h3>AI面试助手</h3>
            <span class="assistant-status" :class="{ 'online': interviewState.aiEnabled }">
              {{ interviewState.aiEnabled ? '在线' : '离线' }}
            </span>
          </div>
        </div>

        <div class="assistant-content">
          <!-- 面试完成后显示整体评估 -->
          <div v-if="interviewCompleted && overallEvaluation" class="overall-evaluation">
            <div class="overall-header">
              <h4>🎯 整体面试评估</h4>
              <span class="overall-score-badge">{{ overallEvaluation.average_score }}分</span>
            </div>
            
            <!-- 总体评价 -->
            <div class="overall-feedback">
              <p>{{ overallEvaluation.overall_feedback }}</p>
            </div>
            
            <!-- 各类型表现 -->
            <div v-if="overallEvaluation.type_performance && overallEvaluation.type_performance.length > 0" class="type-performance">
              <h5>📊 各类型表现</h5>
              <div class="type-list">
                <div v-for="perf in overallEvaluation.type_performance" :key="perf.type" class="type-item">
                  <span class="type-name">{{ perf.type }}</span>
                  <div class="type-score">
                    <div class="type-progress">
                      <div 
                        class="type-progress-fill" 
                        :style="{ width: Math.min(perf.average_score, 100) + '%' }"
                      ></div>
                    </div>
                    <span class="type-score-value">{{ perf.average_score }}分</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- 核心优势 -->
            <div v-if="overallEvaluation.key_strengths && overallEvaluation.key_strengths.length > 0" class="strengths-section">
              <h5>👍 核心优势</h5>
              <ul>
                <li v-for="strength in overallEvaluation.key_strengths" :key="strength">
                  {{ strength }}
                </li>
              </ul>
            </div>
            
            <!-- 改进建议 -->
            <div v-if="overallEvaluation.areas_for_improvement && overallEvaluation.areas_for_improvement.length > 0" class="improvements-section">
              <h5>💡 改进建议</h5>
              <ul>
                <li v-for="suggestion in overallEvaluation.areas_for_improvement" :key="suggestion">
                  {{ suggestion }}
                </li>
              </ul>
            </div>
            
            <!-- 发展建议 -->
            <div v-if="overallEvaluation.recommendations && overallEvaluation.recommendations.length > 0" class="recommendations-section">
              <h5>📝 发展建议</h5>
              <ul>
                <li v-for="rec in overallEvaluation.recommendations" :key="rec">
                  {{ rec }}
                </li>
              </ul>
            </div>
            
            <!-- 重新开始按钮 -->
            <button class="restart-btn" @click="restartInterview">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              重新开始面试
            </button>
          </div>

          <!-- 面试进行中 -->
          <div v-else-if="!interviewStarted" class="assistant-welcome">
            <div class="welcome-message">
              <p>👋 您好！我是您的AI面试助手。</p>
              <p>在面试过程中，我将为您提供：</p>
              <ul>
                <li>🤖 智能问题生成</li>
                <li>📊 专业回答评估</li>
                <li>💡 个性化改进建议</li>
                <li>⚡ 实时帮助支持</li>
              </ul>
              <p>准备好后请点击"开始面试"按钮。</p>
            </div>
          </div>

          <div v-else class="assistant-chat">
            <div class="chat-messages">
              <div class="message ai-message">
                <div class="message-content">
                  <div class="message-text" v-html="parseMarkdown(aiResponse)"></div>
                  <div class="message-time">{{ new Date().toLocaleTimeString() }}</div>
                </div>
              </div>
            </div>
            
            <!-- 快速操作 -->
            <div class="quick-actions">
              <button class="quick-btn" @click="quickAnswer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
                快速建议
              </button>
              <button class="quick-btn" @click="requestHint">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                获取提示
              </button>
            </div>
          </div>
        </div>

        <!-- 单个题目评估结果展示（面试进行中时显示） -->
        <div v-if="!interviewCompleted && answerEvaluations[interviewState.currentQuestionIndex]" class="evaluation-result">
          <div class="evaluation-header">
            <h4>评估结果</h4>
            <span class="score-badge">{{ answerEvaluations[interviewState.currentQuestionIndex].score }}分</span>
          </div>
          <div class="evaluation-details">
            <div class="strengths">
              <h5>👍 优点</h5>
              <ul>
                <li v-for="strength in answerEvaluations[interviewState.currentQuestionIndex].strengths" :key="strength">
                  {{ strength }}
                </li>
              </ul>
            </div>
            <div class="improvements">
              <h5>💡 改进建议</h5>
              <ul>
                <li v-for="suggestion in answerEvaluations[interviewState.currentQuestionIndex].improvement_suggestions" :key="suggestion">
                  {{ suggestion }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { marked } from 'marked'

const router = useRouter()
const route = useRoute()

// Markdown解析函数
const parseMarkdown = (text: string) => {
  if (!text) return ''
  
  // 配置marked选项
  marked.setOptions({
    breaks: true, // 将换行符转换为<br>
    gfm: true    // 启用GitHub风格的Markdown
  })
  
  // 使用同步版本的marked.parse
  const parsedHtml = marked.parse(text) as string
  
  // 简单的HTML安全过滤
  return parsedHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/javascript:/gi, '')
}

// 面试数据
const interviewData = ref({
  id: '',
  company: '某某科技公司',
  position: '前端开发工程师',
  language: '中文',
  secondLanguage: '无'
})

// 面试状态
const interviewStarted = ref(false)
const interviewCompleted = ref(false)
const currentQuestion = ref('')
const aiResponse = ref('您好！我是您的AI面试助手。准备好开始面试了吗？')

// 整体评估结果
const overallEvaluation = ref<any>(null)

// 智能体API基础URL
const API_BASE_URL = 'http://localhost:8000'

// 面试状态管理
const interviewState = ref({
  currentQuestionIndex: 0,
  totalQuestions: 0,
  isRecording: false,
  aiEnabled: false,
  loading: false
})

// 智能体生成的面试问题
const aiGeneratedQuestions = ref<any[]>([])

// 用户回答记录
const userAnswers = ref<Record<number, string>>({})

// 评估结果
const answerEvaluations = ref<Record<number, any>>({})

// 智能体状态检测
const checkAIService = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/interview/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    return response.ok
  } catch (error) {
    console.warn('智能体服务检测失败:', error)
    return false
  }
}

// 智能生成面试问题
const generateInterviewQuestions = async () => {
  interviewState.value.loading = true
  
  try {
    // 获取用户简历数据
    const userId = 'unknown'
    const analysisData = localStorage.getItem(`resume_analysis_${userId}`)
    
    let resumeText = ''
    if (analysisData) {
      const parsedData = JSON.parse(analysisData)
      if (parsedData.basic_info) {
        const basicInfo = parsedData.basic_info
        resumeText = `姓名：${basicInfo.姓名 || '未知'}\n学历：${basicInfo.学历 || '未知'}\n专业：${basicInfo.专业 || '未知'}\n工作经验：${basicInfo.工作经验 || '未知'}\n技能特长：${basicInfo.技能特长 || '未知'}`
      }
    }
    
    // 检查智能体服务是否可用
    const aiServiceAvailable = await checkAIService()
    interviewState.value.aiEnabled = aiServiceAvailable
    
    if (!aiServiceAvailable) {
      throw new Error('智能体服务不可用')
    }
    
    // 使用智能体生成个性化面试问题
    const response = await fetch(`${API_BASE_URL}/interview/generate-questions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        resume_text: resumeText,
        job_title: interviewData.value.position,
        job_requirements: `公司：${interviewData.value.company}，语言：${interviewData.value.language}`,
        question_count: 6,
        question_types: ['自我介绍', '技术能力', '项目经验', '职业规划', '团队协作', '问题解决']
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.success && result.data.interview_questions) {
      aiGeneratedQuestions.value = result.data.interview_questions
      interviewState.value.totalQuestions = result.data.interview_questions.length
      console.log(`智能体生成面试问题成功，问题数量: ${result.data.interview_questions.length}`)
    } else {
      throw new Error('智能体生成问题失败')
    }
    
    // 显示第一个问题
    if (aiGeneratedQuestions.value.length > 0) {
      currentQuestion.value = aiGeneratedQuestions.value[0].question
    }
    
  } catch (error) {
    console.error('生成面试问题失败:', error)
    // 问题生成失败时，显示错误信息而不是使用假数据
    aiResponse.value = `❌ **面试问题生成失败**\n\n错误信息：${error instanceof Error ? error.message : String(error)}\n\n请稍后重试或联系技术支持。`
    
    // 不设置问题，保持为空
    aiGeneratedQuestions.value = []
    interviewState.value.totalQuestions = 0
    currentQuestion.value = '面试问题生成失败，请稍后重试'
  } finally {
    interviewState.value.loading = false
  }
}

// 开始面试
const startInterview = async () => {
  interviewStarted.value = true
  interviewState.value.loading = true
  
  // 生成智能面试问题
  await generateInterviewQuestions()
  
  // 更新AI助手欢迎消息
  aiResponse.value = `面试已开始！我将为您提供${interviewState.value.totalQuestions}个问题。\n\n当前问题类型：${aiGeneratedQuestions.value[0]?.type || '通用'}\n难度：${aiGeneratedQuestions.value[0]?.difficulty || '中等'}\n\n您可以开始回答，我会为您提供实时帮助和评估。`
}

// 智能评估回答
const evaluateAnswer = async () => {
  const currentIndex = interviewState.value.currentQuestionIndex
  const userAnswer = userAnswers.value[currentIndex]
  
  if (!userAnswer) {
    aiResponse.value = '请先输入您的回答，然后我可以为您提供专业的评估和建议。'
    return
  }
  
  interviewState.value.loading = true
  
  try {
    const currentQuestionObj = aiGeneratedQuestions.value[currentIndex]
    
    // 使用智能体进行专业评估
    const response = await fetch(`${API_BASE_URL}/interview/evaluate-answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question: currentQuestionObj?.question || currentQuestion.value,
        user_answer: userAnswer,
        expected_answer: currentQuestionObj?.answerHint || '请根据问题内容提供专业回答',
        job_title: interviewData.value.position,
        question_type: currentQuestionObj?.type || '通用',
        difficulty: currentQuestionObj?.difficulty || '中等'
      })
    })
    
    if (!response.ok) {
      throw new Error(`HTTP错误: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.success && result.data) {
      answerEvaluations.value[currentIndex] = result.data
      aiResponse.value = `📊 **评估结果**\n\n**得分：${result.data.score}分**\n\n**优点：**\n${result.data.strengths?.map((s: string) => `✅ ${s}`).join('\n') || '回答基本符合要求'}\n\n**改进建议：**\n${result.data.improvement_suggestions?.map((s: string) => `💡 ${s}`).join('\n') || '继续完善回答内容'}\n\n**总体评价：**\n${result.data.overall_feedback}`
    } else {
      throw new Error('智能体评估失败')
    }
    
  } catch (error) {
    console.error('智能评估失败:', error)
    // 评估失败时，显示错误信息而不是使用假数据
    aiResponse.value = `❌ **评估服务暂时不可用**\n\n错误信息：${error instanceof Error ? error.message : String(error)}\n\n请稍后重试或联系技术支持。`
    
    // 不设置评估结果，保持为空
    answerEvaluations.value[currentIndex] = {
      score: 0,
      strengths: [],
      weaknesses: [],
      improvement_suggestions: ['评估服务暂时不可用，请稍后重试'],
      overall_feedback: '评估服务暂时不可用'
    }
  } finally {
    interviewState.value.loading = false
  }
}

// 下一题
const nextQuestion = () => {
  if (interviewState.value.currentQuestionIndex < interviewState.value.totalQuestions - 1) {
    interviewState.value.currentQuestionIndex++
    const nextQuestionObj = aiGeneratedQuestions.value[interviewState.value.currentQuestionIndex]
    currentQuestion.value = nextQuestionObj?.question || `问题 ${interviewState.value.currentQuestionIndex + 1}`
    
    // 更新AI助手消息
    aiResponse.value = `**第${interviewState.value.currentQuestionIndex + 1}题**\n类型：${nextQuestionObj?.type || '通用'}\n难度：${nextQuestionObj?.difficulty || '中等'}\n\n请开始回答，完成后点击评估按钮获取专业反馈。`
  }
}

// 上一题
const prevQuestion = () => {
  if (interviewState.value.currentQuestionIndex > 0) {
    interviewState.value.currentQuestionIndex--
    const prevQuestionObj = aiGeneratedQuestions.value[interviewState.value.currentQuestionIndex]
    currentQuestion.value = prevQuestionObj?.question || `问题 ${interviewState.value.currentQuestionIndex + 1}`
    
    // 更新AI助手消息
    aiResponse.value = `**第${interviewState.value.currentQuestionIndex + 1}题**\n类型：${prevQuestionObj?.type || '通用'}\n难度：${prevQuestionObj?.difficulty || '中等'}\n\n您可以继续完善回答或查看之前的评估结果。`
  }
}

// 保存回答
const saveAnswer = () => {
  const currentIndex = interviewState.value.currentQuestionIndex
  const userAnswer = userAnswers.value[currentIndex]
  
  if (!userAnswer) {
    aiResponse.value = '请先输入您的回答，然后才能保存。'
    return
  }
  
  // 保存到本地存储
  const savedData = {
    interviewId: interviewData.value.id,
    questionIndex: currentIndex,
    question: currentQuestion.value,
    answer: userAnswer,
    savedAt: new Date().toISOString()
  }
  
  localStorage.setItem(`interview_answer_${interviewData.value.id}_${currentIndex}`, JSON.stringify(savedData))
  aiResponse.value = '✅ 回答已成功保存！您可以继续回答其他问题或查看评估结果。'
}

// 清空回答
const clearAnswer = () => {
  const currentIndex = interviewState.value.currentQuestionIndex
  userAnswers.value[currentIndex] = ''
  aiResponse.value = '回答已清空，您可以重新输入。'
}

// 重新开始面试
const restartInterview = () => {
  interviewStarted.value = false
  interviewCompleted.value = false
  overallEvaluation.value = null
  interviewState.value.currentQuestionIndex = 0
  userAnswers.value = {}
  answerEvaluations.value = {}
  currentQuestion.value = ''
  aiResponse.value = '您好！我是您的AI面试助手。准备好开始新的面试了吗？'
}

// 生成整体评估
const generateOverallEvaluation = async () => {
  interviewState.value.loading = true
  aiResponse.value = '正在生成整体面试评估...'
  
  try {
    // 准备所有问题和回答的数据
    const allQuestionsAndAnswers = aiGeneratedQuestions.value.map((q, index) => ({
      question: q.question,
      user_answer: userAnswers.value[index] || '',
      evaluation: answerEvaluations.value[index] || null,
      type: q.type,
      difficulty: q.difficulty
    }))
    
    // 计算平均得分
    const scores = Object.values(answerEvaluations.value)
      .filter(e => e && typeof e.score === 'number')
      .map(e => e.score)
    
    const avgScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0
    
    // 检查智能体服务是否可用
    const aiServiceAvailable = await checkAIService()
    
    if (aiServiceAvailable) {
      // 调用智能体API生成整体评估
      const response = await fetch(`${API_BASE_URL}/interview/generate-overall-evaluation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          job_title: interviewData.value.position,
          company: interviewData.value.company,
          questions_and_answers: allQuestionsAndAnswers,
          language: interviewData.value.language
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success && result.data) {
          overallEvaluation.value = result.data
          overallEvaluation.value.average_score = avgScore
          interviewCompleted.value = true
          aiResponse.value = `🎉 面试已完成！\n\n已为您生成整体面试评估，平均得分：${avgScore}分。\n\n请查看右侧的整体评估报告。`
          return
        }
      }
    }
    
    // 智能体服务不可用时，使用本地计算生成评估
    generateLocalOverallEvaluation(allQuestionsAndAnswers, avgScore)
    
  } catch (error) {
    console.error('生成整体评估失败:', error)
    // 使用本地评估作为后备
    const allQuestionsAndAnswers = aiGeneratedQuestions.value.map((q, index) => ({
      question: q.question,
      user_answer: userAnswers.value[index] || '',
      evaluation: answerEvaluations.value[index] || null,
      type: q.type,
      difficulty: q.difficulty
    }))
    
    const scores = Object.values(answerEvaluations.value)
      .filter(e => e && typeof e.score === 'number')
      .map(e => e.score)
    
    const avgScore = scores.length > 0 
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0
    
    generateLocalOverallEvaluation(allQuestionsAndAnswers, avgScore)
  } finally {
    interviewState.value.loading = false
  }
}

// 生成本地整体评估
const generateLocalOverallEvaluation = (qaData: any[], avgScore: number) => {
  // 统计各类型问题的表现
  const typeStats: Record<string, { count: number; totalScore: number }> = {}
  let allStrengths: string[] = []
  let allImprovements: string[] = []
  
  qaData.forEach(qa => {
    if (qa.evaluation) {
      const type = qa.type || '通用'
      if (!typeStats[type]) {
        typeStats[type] = { count: 0, totalScore: 0 }
      }
      typeStats[type].count++
      typeStats[type].totalScore += qa.evaluation.score || 0
      
      if (qa.evaluation.strengths) {
        allStrengths = [...allStrengths, ...qa.evaluation.strengths.slice(0, 2)]
      }
      if (qa.evaluation.improvement_suggestions) {
        allImprovements = [...allImprovements, ...qa.evaluation.improvement_suggestions.slice(0, 2)]
      }
    }
  })
  
  // 生成总体评价
  let overallFeedback = ''
  if (avgScore >= 85) {
    overallFeedback = '面试表现优秀！您展现了扎实的专业基础和良好的表达能力，对问题的理解和分析能力都很强。建议继续保持优势，深入学习更前沿的技术。'
  } else if (avgScore >= 70) {
    overallFeedback = '面试表现良好！您具备基本的专业知识和技能，能够应对大多数面试问题。建议针对不足的地方进行针对性提升，增强回答的深度和广度。'
  } else if (avgScore >= 60) {
    overallFeedback = '面试表现一般，还有较大提升空间。建议加强专业知识的学习，多进行面试模拟练习，提高表达能力和应变能力。'
  } else {
    overallFeedback = '面试表现需要改进。建议从基础开始学习，系统提升专业技能，同时注重面试技巧的训练，争取下次有更好的表现。'
  }
  
  overallEvaluation.value = {
    average_score: avgScore,
    type_performance: Object.entries(typeStats).map(([type, stats]) => ({
      type: type,
      average_score: stats.count > 0 ? Math.round(stats.totalScore / stats.count) : 0,
      question_count: stats.count
    })),
    key_strengths: [...new Set(allStrengths)].slice(0, 5),
    areas_for_improvement: [...new Set(allImprovements)].slice(0, 5),
    overall_feedback: overallFeedback,
    recommendations: [
      '继续巩固专业基础知识',
      '多进行面试模拟练习',
      '关注行业最新动态和技术趋势',
      '准备更多项目经验和案例',
      '提升沟通表达能力'
    ]
  }
  
  interviewCompleted.value = true
  aiResponse.value = `🎉 面试已完成！\n\n已为您生成整体面试评估，平均得分：${avgScore}分。\n\n请查看右侧的整体评估报告。`
}

// 快速回答建议
const quickAnswer = () => {
  const currentIndex = interviewState.value.currentQuestionIndex
  const currentQuestionObj = aiGeneratedQuestions.value[currentIndex]
  
  aiResponse.value = `💡 **快速回答建议**\n\n针对"${currentQuestionObj?.question || currentQuestion.value}"这个问题，建议您从以下几个方面来回答：\n\n1. **核心要点**：明确回答问题的关键点\n2. **技术细节**：展示相关的技术知识和经验\n3. **实际案例**：结合具体项目或经历说明\n4. **个人思考**：表达您的理解和见解\n\n您可以根据这些方向组织您的回答，完成后我可以为您提供详细的评估。`
}

// 获取提示
const requestHint = () => {
  const currentIndex = interviewState.value.currentQuestionIndex
  const currentQuestionObj = aiGeneratedQuestions.value[currentIndex]
  
  aiResponse.value = `💡 **问题提示**\n\n针对"${currentQuestionObj?.question || currentQuestion.value}"这个问题，您可以考虑以下角度：\n\n• 结合您的实际经验和技能\n• 展示您的专业知识和理解\n• 提供具体的例子和数据支持\n• 表达您的职业规划和发展方向\n\n如果需要更具体的建议，请告诉我您想了解哪个方面。`
}

// 返回上一页
const goBack = () => {
  router.back()
}

onMounted(() => {
  const interviewId = route.params.id
  if (interviewId) {
    interviewData.value.id = interviewId as string
    
    // 从本地存储获取面试数据
    const savedInterviews = localStorage.getItem('myInterviews')
    if (savedInterviews) {
      const interviews = JSON.parse(savedInterviews)
      const currentInterview = interviews.find((i: any) => i.id === interviewId)
      
      if (currentInterview) {
        // 更新面试数据
        interviewData.value = {
          id: currentInterview.id,
          company: currentInterview.company,
          position: currentInterview.position,
          language: currentInterview.language || '中文',
          secondLanguage: currentInterview.secondLanguage || '无'
        }
      }
    }
  }
})
</script>

<style scoped>
.interview-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
}

/* 头部样式 */
.interview-header {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.back-btn {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: #e9ecef;
  transform: translateX(-2px);
}

.company-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.position-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.position {
  background: #4f46e5;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.language {
  background: #10b981;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.interview-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-label {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.status-label.active {
  color: #10b981;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #6b7280;
}

.status-indicator.active {
  background: #10b981;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.start-btn {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
}

.start-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 主要内容区域 */
.interview-main {
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

/* 问题区域样式 */
.question-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 1rem;
}

.section-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.question-progress {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
}

.progress-text {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

.progress-bar {
  width: 200px;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #4f46e5, #7c3aed);
  transition: width 0.3s ease;
}

/* 欢迎界面 */
.welcome-screen {
  text-align: center;
  padding: 3rem 2rem;
}

.welcome-icon {
  margin-bottom: 1.5rem;
  color: #4f46e5;
}

.welcome-screen h3 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
}

.welcome-screen p {
  font-size: 1.125rem;
  color: #6b7280;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.feature-list {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 2rem;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.feature-icon {
  font-size: 1.5rem;
}

/* 问题显示区域 */
.question-display {
  padding: 1rem 0;
}

.question-meta {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.question-type {
  background: #4f46e5;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.question-difficulty {
  background: #f59e0b;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.question-text {
  font-size: 1.25rem;
  line-height: 1.6;
  color: #2d3748;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid #000;
  margin-bottom: 1.5rem;
}

.question-navigation {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.nav-btn {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.nav-btn:hover:not(:disabled) {
  background: #4f46e5;
  color: white;
  transform: translateY(-1px);
}

.nav-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 回答区域 */
.answer-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e9ecef;
}

.answer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.answer-header h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2d3748;
  margin: 0;
}

.answer-actions {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.action-btn:hover {
  background: #e9ecef;
}

.answer-input {
  width: 100%;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 1rem;
  font-size: 1rem;
  line-height: 1.5;
  resize: vertical;
  margin-bottom: 1rem;
  transition: border-color 0.3s ease;
}

.answer-input:focus {
  outline: none;
  border-color: #4f46e5;
  box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
}

.evaluate-btn {
  width: 100%;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.evaluate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
}

.evaluate-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* AI助手区域 */
.assistant-section {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.assistant-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.assistant-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.assistant-info h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.assistant-status {
  font-size: 0.875rem;
  color: #6b7280;
}

.assistant-status.online {
  color: #10b981;
}

.assistant-welcome {
  padding: 1rem 0;
}

.welcome-message {
  line-height: 1.6;
  color: #4a5568;
}

.welcome-message ul {
  margin: 1rem 0;
  padding-left: 1.5rem;
}

.welcome-message li {
  margin-bottom: 0.5rem;
}

.assistant-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.chat-messages {
  flex: 1;
  min-height: 200px;
}

.message {
  margin-bottom: 1rem;
}

.message-content {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid #000;
}

.message-text {
  line-height: 1.6;
  color: #2d3748;
}

/* Markdown渲染样式 */
.message-text h1,
.message-text h2,
.message-text h3 {
  margin: 1rem 0 0.5rem 0;
  font-weight: 600;
  color: #1e293b;
}

.message-text h1 {
  font-size: 1.25rem;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 0.5rem;
}

.message-text h2 {
  font-size: 1.125rem;
}

.message-text h3 {
  font-size: 1rem;
}

.message-text p {
  margin: 0.75rem 0;
}

.message-text strong {
  font-weight: 600;
  color: #1e293b;
}

.message-text em {
  font-style: italic;
  color: #475569;
}

.message-text code {
  background: #f1f5f9;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  color: #475569;
}

.message-text ul,
.message-text ol {
  margin: 0.75rem 0;
  padding-left: 1.5rem;
}

.message-text li {
  margin: 0.25rem 0;
  line-height: 1.5;
}

.message-text ul li {
  list-style-type: disc;
}

.message-text ol li {
  list-style-type: decimal;
}

.message-text blockquote {
  border-left: 4px solid #e2e8f0;
  padding-left: 1rem;
  margin: 1rem 0;
  color: #64748b;
  font-style: italic;
}

.message-text a {
  color: #3b82f6;
  text-decoration: underline;
}

.message-text a:hover {
  color: #2563eb;
}

.message-text table {
  border-collapse: collapse;
  width: 100%;
  margin: 1rem 0;
}

.message-text th,
.message-text td {
  border: 1px solid #e2e8f0;
  padding: 0.5rem;
  text-align: left;
}

.message-text th {
  background: #f8fafc;
  font-weight: 600;
}

.message-time {
  font-size: 0.75rem;
  color: #6b7280;
  text-align: right;
  margin-top: 0.5rem;
}

.quick-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}

.quick-btn {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.875rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.quick-btn:hover {
  background: #4f46e5;
  color: white;
}

/* 完成面试按钮 */
.complete-btn {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  font-weight: 600;
}

.complete-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
}

/* 整体评估 */
.overall-evaluation {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: 2px solid #f59e0b;
  border-radius: 16px;
  padding: 1.5rem;
}

.overall-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px dashed #f59e0b;
}

.overall-header h4 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #92400e;
  margin: 0;
}

.overall-score-badge {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 24px;
  font-size: 1.25rem;
  font-weight: 700;
}

.overall-feedback {
  background: rgba(255, 255, 255, 0.7);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.overall-feedback p {
  margin: 0;
  color: #78350f;
  line-height: 1.6;
}

.type-performance,
.strengths-section,
.improvements-section,
.recommendations-section {
  margin-bottom: 1.25rem;
}

.type-performance h5,
.strengths-section h5,
.improvements-section h5,
.recommendations-section h5 {
  font-size: 1rem;
  font-weight: 600;
  color: #92400e;
  margin: 0 0 0.75rem 0;
}

.type-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.type-item {
  background: rgba(255, 255, 255, 0.8);
  padding: 0.75rem;
  border-radius: 8px;
}

.type-name {
  font-weight: 600;
  color: #78350f;
  margin-bottom: 0.5rem;
  display: block;
}

.type-score {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.type-progress {
  flex: 1;
  height: 8px;
  background: #fef3c7;
  border-radius: 4px;
  overflow: hidden;
}

.type-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #059669);
  transition: width 0.5s ease;
}

.type-score-value {
  font-weight: 700;
  color: #92400e;
  min-width: 50px;
  text-align: right;
}

.strengths-section ul,
.improvements-section ul,
.recommendations-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.strengths-section li,
.improvements-section li,
.recommendations-section li {
  background: rgba(255, 255, 255, 0.6);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  color: #78350f;
  font-size: 0.9rem;
}

.strengths-section li::before {
  content: "✅ ";
}

.improvements-section li::before {
  content: "💡 ";
}

.recommendations-section li::before {
  content: "📝 ";
}

.restart-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
  transition: all 0.3s ease;
}

.restart-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

/* 评估结果 */
.evaluation-result {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border: 1px solid #bae6fd;
  border-radius: 12px;
  padding: 1.5rem;
}

.evaluation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.evaluation-header h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #0369a1;
  margin: 0;
}

.score-badge {
  background: #10b981;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.evaluation-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.strengths h5,
.improvements h5 {
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.strengths ul,
.improvements ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.strengths li,
.improvements li {
  font-size: 0.875rem;
  color: #4a5568;
  margin-bottom: 0.25rem;
  padding-left: 0;
}

.strengths li::before {
  content: "✅ ";
}

.improvements li::before {
  content: "💡 ";
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .interview-main {
    grid-template-columns: 1fr;
    gap: 1rem;
    padding: 1rem;
  }
  
  .feature-list {
    grid-template-columns: 1fr;
  }
  
  .evaluation-details {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .interview-header {
    padding: 1rem;
    flex-direction: column;
    gap: 1rem;
  }
  
  .header-left,
  .header-right {
    width: 100%;
    justify-content: space-between;
  }
  
  .position-info {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .question-navigation {
    flex-direction: column;
  }
  
  .quick-actions {
    grid-template-columns: 1fr;
  }
}
</style>