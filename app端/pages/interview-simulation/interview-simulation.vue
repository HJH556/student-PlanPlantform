<template>
    <view class="container">
        <!-- 页面头部 -->
        <view class="page-header">
            <view class="header-content">
                <text class="page-badge">🤖 智能面试模拟</text>
                <text class="page-title">{{ interviewData.position }} - {{ interviewData.company }}</text>
                <text class="page-subtitle">AI智能体将为您提供个性化的面试体验</text>
            </view>
        </view>

        <!-- AI状态显示 -->
        <view class="ai-status-section">
            <view class="ai-status" :class="{ 'ai-enabled': aiEnabled, 'ai-disabled': !aiEnabled }">
                <text class="status-icon">{{ aiEnabled ? '🤖' : '⚠️' }}</text>
                <text class="status-text">{{ aiEnabled ? '智能体已就绪' : '智能体服务不可用' }}</text>
                <text v-if="!aiEnabled" class="status-hint">（将使用默认面试模式）</text>
            </view>
        </view>

        <!-- 面试准备阶段 -->
        <view v-if="!interviewStarted" class="preparation-section">
            <view class="preparation-card">
                <text class="preparation-title">面试准备</text>
                <text class="preparation-desc">AI智能体将基于您的简历和岗位要求，生成个性化的面试问题</text>
                
                <view class="preparation-info">
                    <view class="info-item">
                        <text class="info-label">目标岗位：</text>
                        <text class="info-value">{{ interviewData.position }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">目标公司：</text>
                        <text class="info-value">{{ interviewData.company }}</text>
                    </view>
                    <view class="info-item">
                        <text class="info-label">面试形式：</text>
                        <text class="info-value">{{ interviewData.type || '智能模拟面试' }}</text>
                    </view>
                </view>

                <button class="start-interview-btn" @click="startInterview" :disabled="loading">
                    <text v-if="loading" class="btn-loading">⏳</text>
                    <text v-else class="btn-icon">🚀</text>
                    <text class="btn-text">{{ loading ? '智能体正在准备...' : '开始智能面试' }}</text>
                </button>
            </view>
        </view>

        <!-- 面试进行中 -->
        <view v-else class="interview-section">
            <!-- 当前问题 -->
            <view class="current-question-section">
                <view class="question-header">
                    <text class="question-number">问题 {{ currentQuestionIndex + 1 }}/{{ totalQuestions }}</text>
                    <text class="question-type">{{ currentQuestion.type || '通用' }}</text>
                    <text class="question-difficulty">{{ currentQuestion.difficulty || '中等' }}</text>
                </view>
                
                <view class="question-content">
                    <text class="question-text">{{ currentQuestion.question }}</text>
                </view>

                <!-- 回答区域 -->
                <view class="answer-section">
                    <text class="answer-label">您的回答：</text>
                    <textarea 
                        v-model="userAnswer" 
                        class="answer-input" 
                        placeholder="请在此输入您的回答..."
                        :maxlength="1000"
                        :disabled="evaluating"
                    ></textarea>
                    <text class="answer-length">{{ userAnswer.length }}/1000</text>
                </view>

                <!-- 操作按钮 -->
                <view class="action-buttons">
                    <button 
                        class="action-btn evaluate-btn" 
                        @click="evaluateAnswer" 
                        :disabled="!userAnswer || evaluating"
                    >
                        <text v-if="evaluating" class="btn-loading">⏳</text>
                        <text v-else class="btn-icon">📊</text>
                        <text class="btn-text">{{ evaluating ? 'AI评估中...' : 'AI评估回答' }}</text>
                    </button>
                    
                    <button 
                        class="action-btn next-btn" 
                        @click="nextQuestion" 
                        :disabled="!evaluationCompleted"
                    >
                        <text class="btn-icon">➡️</text>
                        <text class="btn-text">{{ isLastQuestion ? '完成面试' : '下一题' }}</text>
                    </button>
                </view>
            </view>

            <!-- AI评估结果 -->
            <view v-if="evaluationCompleted" class="evaluation-section">
                <view class="evaluation-header">
                    <text class="evaluation-title">AI智能评估</text>
                    <text class="evaluation-score">得分：{{ evaluation.score }}/100</text>
                </view>
                
                <view class="evaluation-content">
                    <view class="evaluation-item">
                        <text class="item-label">回答优点：</text>
                        <text class="item-value">{{ evaluation.strengths ? evaluation.strengths.join('，') : '无' }}</text>
                    </view>
                    <view class="evaluation-item">
                        <text class="item-label">回答不足：</text>
                        <text class="item-value">{{ evaluation.weaknesses ? evaluation.weaknesses.join('，') : '无' }}</text>
                    </view>
                    <view class="evaluation-item">
                        <text class="item-label">改进建议：</text>
                        <text class="item-value">{{ evaluation.improvement_suggestions ? evaluation.improvement_suggestions.join('，') : '无' }}</text>
                    </view>
                    <view class="evaluation-item">
                        <text class="item-label">总体评价：</text>
                        <text class="item-value">{{ evaluation.overall_feedback || '无' }}</text>
                    </view>
                </view>
            </view>

            <!-- AI助手对话 -->
            <view class="ai-assistant-section">
                <view class="assistant-header">
                    <text class="assistant-title">AI面试助手</text>
                </view>
                <view class="assistant-content">
                    <rich-text class="assistant-message" :nodes="parseMarkdown(aiResponse)"></rich-text>
                </view>
            </view>
        </view>

        <!-- 加载状态 -->
        <view v-if="loading" class="loading-overlay">
            <view class="loading-content">
                <view class="loading-spinner"></view>
                <text class="loading-text">AI智能体正在工作...</text>
            </view>
        </view>

        <!-- 错误提示 -->
        <view v-if="errorMessage" class="error-message">
            <text class="error-icon">⚠️</text>
            <text class="error-text">{{ errorMessage }}</text>
        </view>
    </view>
</template>
<script setup>
import { ref, onMounted, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import config from '../../config/index.js'

// 简单Markdown解析器
const parseMarkdown = (text) => {
    if (!text) return ''
    
    // 处理粗体
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // 处理斜体
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>')
    
    // 处理代码块
    text = text.replace(/`(.*?)`/g, '<code>$1</code>')
    
    // 处理换行
    text = text.replace(/\n/g, '<br/>')
    
    // 处理列表
    text = text.replace(/^\s*[-*]\s+(.*)$/gm, '<li>$1</li>')
    text = text.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    
    return text
}

// 响应式数据
const interviewData = ref({
    position: '',
    company: '',
    type: '智能模拟面试'
})

const aiEnabled = ref(false)
const interviewStarted = ref(false)
const loading = ref(false)
const evaluating = ref(false)
const errorMessage = ref('')

// 面试问题相关
const aiGeneratedQuestions = ref([])
const currentQuestionIndex = ref(0)
const userAnswer = ref('')
const userAnswers = ref({})
const evaluationCompleted = ref(false)

// AI评估结果
const evaluation = ref({
    score: 0,
    quality: '',
    professionalism: '',
    suggestions: '',
    detailed_analysis: ''
})

const aiResponse = ref('欢迎使用智能面试模拟系统！我将为您提供个性化的面试体验。')

// 计算属性
const currentQuestion = computed(() => {
    return aiGeneratedQuestions.value[currentQuestionIndex.value] || {}
})

const totalQuestions = computed(() => {
    return aiGeneratedQuestions.value.length
})

const isLastQuestion = computed(() => {
    return currentQuestionIndex.value === totalQuestions.value - 1
})

// 页面加载
onLoad((options) => {
    if (options.position) {
        interviewData.value.position = decodeURIComponent(options.position)
    }
    if (options.company) {
        interviewData.value.company = decodeURIComponent(options.company)
    }
    
    checkAIService()
})

// 检查AI服务
const checkAIService = async () => {
    try {
        const response = await uni.request({
                url: config.baseUrl + '/interview/health',
                method: 'GET'
            })
        aiEnabled.value = response.data.success
    } catch (error) {
        console.error('检查智能体服务失败:', error)
        aiEnabled.value = false
    }
}

// 获取简历文本
const getResumeText = () => {
    try {
        const resumeAnalysis = uni.getStorageSync('resume_analysis')
        return resumeAnalysis?.resume_text || '计算机专业学生，具备扎实的编程基础和项目经验'
    } catch (error) {
        return '计算机专业学生，具备扎实的编程基础和项目经验'
    }
}

// 获取岗位要求
const getJobRequirements = () => {
    const position = interviewData.value.position
    const requirementsMap = {
        '前端开发工程师': '熟悉HTML/CSS/JavaScript，掌握Vue/React框架，有响应式设计经验',
        '后端开发工程师': '熟悉Java/Python/Go等后端语言，掌握数据库设计，有API开发经验',
        '全栈开发工程师': '具备前后端开发能力，熟悉完整项目开发流程，有全栈项目经验',
        '产品经理': '具备产品设计、需求分析、项目管理能力，熟悉用户研究',
        'UI设计师': '熟悉UI设计规范，掌握设计工具，具备良好的审美能力'
    }
    return requirementsMap[position] || '具备良好的学习能力和团队协作精神'
}

// 开始面试
const startInterview = async () => {
    loading.value = true
    errorMessage.value = ''
    
    try {
        // 生成智能面试问题
        await generateInterviewQuestions()
        
        // 更新AI助手欢迎消息
        aiResponse.value = `面试已开始！我将为您提供${totalQuestions.value}个问题。\n\n当前问题类型：${currentQuestion.value.type || '通用'}\n难度：${currentQuestion.value.difficulty || '中等'}\n\n您可以开始回答，我会为您提供实时帮助和评估。`;
        
        interviewStarted.value = true;
        
    } catch (error) {
        console.error('开始面试失败:', error)
        errorMessage.value = '开始面试失败，请检查网络连接后重试'
    } finally {
        loading.value = false
    }
}

// 生成面试问题
const generateInterviewQuestions = async () => {
    try {
        if (aiEnabled.value) {
            // 使用智能体生成问题
            const response = await uni.request({
                    url: config.baseUrl + '/interview/generate-questions',
                    method: 'POST',
                    data: {
                        resume_text: getResumeText(),
                        job_title: interviewData.value.position,
                        job_requirements: getJobRequirements(),
                        question_count: 5
                    }
                })
            
            if (response.data.success) {
                aiGeneratedQuestions.value = response.data.data.interview_questions || []
            } else {
                throw new Error('智能体生成问题失败')
            }
        }
        
        // 如果智能体不可用或生成失败，使用默认问题
        if (!aiGeneratedQuestions.value.length) {
            aiGeneratedQuestions.value = getDefaultQuestions()
        }
        
    } catch (error) {
        console.error('生成面试问题失败:', error)
        aiGeneratedQuestions.value = getDefaultQuestions()
    }
}

// 获取默认问题
const getDefaultQuestions = () => {
    const position = interviewData.value.position
    
    const defaultQuestions = {
        '前端开发工程师': [
            {
                question: '请介绍一下Vue.js和React的主要区别？',
                type: '技术',
                difficulty: '中等',
                answer_hint: '可以从响应式原理、组件化方式、生态等方面回答'
            },
            {
                question: '如何优化前端性能？',
                type: '技术',
                difficulty: '困难',
                answer_hint: '包括代码分割、懒加载、缓存策略等'
            }
        ],
        '后端开发工程师': [
            {
                question: '请解释一下RESTful API的设计原则？',
                type: '技术',
                difficulty: '中等',
                answer_hint: '包括无状态、统一接口、资源导向等'
            },
            {
                question: '如何处理高并发场景？',
                type: '技术',
                difficulty: '困难',
                answer_hint: '包括负载均衡、缓存、数据库优化等'
            }
        ]
    }
    
    return defaultQuestions[position] || [
        {
            question: '请做一个简单的自我介绍？',
            type: '通用',
            difficulty: '简单',
            answer_hint: '包括教育背景、工作经验、技能特长等'
        },
        {
            question: '为什么选择我们公司？',
            type: '业务',
            difficulty: '中等',
            answer_hint: '可以从公司文化、发展前景、个人匹配度等方面回答'
        }
    ]
}

// 评估回答
const evaluateAnswer = async () => {
    if (!userAnswer.value) {
        aiResponse.value = '请先输入您的回答，然后我可以为您提供专业的评估和建议。'
        return
    }
    
    evaluating.value = true
    errorMessage.value = ''
    
    try {
        if (aiEnabled.value) {
            // 使用智能体进行专业评估
            const response = await uni.request({
                    url: config.baseUrl + '/interview/evaluate-answer',
                    method: 'POST',
                    data: {
                        question: currentQuestion.value.question,
                        user_answer: userAnswer.value,
                        expected_answer: currentQuestion.value.answer_hint || '请根据问题内容提供专业回答'
                    }
                })
            
            if (response.data.success) {
                evaluation.value = response.data.data
                evaluationCompleted.value = true
                
                // 保存用户回答
                userAnswers.value[currentQuestionIndex.value] = userAnswer.value
                
                // 更新AI助手消息
                aiResponse.value = `评估完成！您的得分为 ${evaluation.value.score} 分。\n\n${evaluation.value.overall_feedback || '请继续努力！'}`
                
            } else {
                throw new Error('智能体评估失败')
            }
        } else {
            // 默认评估逻辑
            await evaluateAnswerDefault()
        }
        
    } catch (error) {
        console.error('评估回答失败:', error)
        errorMessage.value = '评估失败，请稍后重试'
        await evaluateAnswerDefault()
    } finally {
        evaluating.value = false
    }
}

// 默认评估逻辑
const evaluateAnswerDefault = async () => {
    // 简单的评分逻辑
    const answerLength = userAnswer.value.length
    const score = Math.min(100, Math.floor(answerLength / 5) + 60)
    
    evaluation.value = {
        score: score,
        quality: answerLength > 50 ? '良好' : '一般',
        professionalism: '基本符合要求',
        suggestions: '建议提供更具体的例子和细节',
        detailed_analysis: '回答内容基本完整，可以进一步丰富细节'
    }
    
    evaluationCompleted.value = true
    userAnswers.value[currentQuestionIndex.value] = userAnswer.value
    
    aiResponse.value = `默认评估完成！您的得分为 ${score} 分。\n\n建议提供更具体的例子和细节来丰富您的回答。`
}

// 下一题
const nextQuestion = () => {
    if (isLastQuestion.value) {
        // 完成面试
        completeInterview()
    } else {
        // 进入下一题
        currentQuestionIndex.value++
        userAnswer.value = ''
        evaluationCompleted.value = false
        evaluation.value = {}
        
        // 更新AI助手消息
        aiResponse.value = `进入第 ${currentQuestionIndex.value + 1} 题：${currentQuestion.value.type || '通用'} 类型问题\n难度：${currentQuestion.value.difficulty || '中等'}`
    }
}

// 完成面试
const completeInterview = () => {
    // 计算总分
    const totalScore = Object.values(userAnswers.value).reduce((sum, answer, index) => {
        return sum + (evaluation.value.score || 70)
    }, 0) / totalQuestions.value
    
    uni.showModal({
        title: '面试完成',
        content: `恭喜您完成面试！平均得分：${Math.round(totalScore)}/100`,
        showCancel: false,
        success: () => {
            uni.navigateBack()
        }
    })
}
</script>

<style scoped>
.container {
    min-height: 100vh;
    background: #f5f7fa;
    padding: 20rpx;
}

/* 页面头部 */
.page-header {
    background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
    border-radius: 20rpx;
    padding: 40rpx 30rpx;
    margin-bottom: 30rpx;
    color: white;
}

.header-content {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.page-badge {
    background: rgba(255, 255, 255, 0.2);
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    margin-bottom: 20rpx;
}

.page-title {
    font-size: 32rpx;
    font-weight: 600;
    margin-bottom: 10rpx;
    text-align: center;
}

.page-subtitle {
    font-size: 26rpx;
    opacity: 0.9;
    text-align: center;
}

/* AI状态显示 */
.ai-status-section {
    margin-bottom: 30rpx;
}

.ai-status {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20rpx;
    border-radius: 16rpx;
    font-size: 26rpx;
    gap: 12rpx;
}

.ai-status.ai-enabled {
    background: #d1fae5;
    color: #065f46;
    border: 2rpx solid #10b981;
}

.ai-status.ai-disabled {
    background: #fef3c7;
    color: #92400e;
    border: 2rpx solid #f59e0b;
}

.status-icon {
    font-size: 28rpx;
}

.status-text {
    font-weight: 500;
}

.status-hint {
    font-size: 22rpx;
    opacity: 0.8;
}

/* 准备阶段样式 */
.preparation-section {
    margin-bottom: 30rpx;
}

.preparation-card {
    background: white;
    border-radius: 20rpx;
    padding: 40rpx 30rpx;
    text-align: center;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.preparation-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 16rpx;
}

.preparation-desc {
    font-size: 26rpx;
    color: #64748b;
    margin-bottom: 30rpx;
    line-height: 1.5;
}

.preparation-info {
    background: #f8fafc;
    border-radius: 12rpx;
    padding: 24rpx;
    margin-bottom: 30rpx;
}

.info-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12rpx;
}

.info-item:last-child {
    margin-bottom: 0;
}

.info-label {
    font-size: 26rpx;
    color: #64748b;
    font-weight: 500;
}

.info-value {
    font-size: 26rpx;
    color: #1e293b;
    font-weight: 600;
}

.start-interview-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 24rpx 32rpx;
    border-radius: 16rpx;
    font-size: 28rpx;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 16rpx;
    width: 100%;
}

.start-interview-btn:disabled {
    background: #cbd5e1;
    color: #64748b;
}

/* 面试进行中样式 */
.interview-section {
    display: flex;
    flex-direction: column;
    gap: 30rpx;
}

.current-question-section {
    background: white;
    border-radius: 20rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    padding-bottom: 16rpx;
    border-bottom: 2rpx solid #f1f5f9;
}

.question-number {
    font-size: 24rpx;
    color: #64748b;
    font-weight: 500;
}

.question-type {
    background: #e0f2fe;
    color: #0288d1;
    padding: 4rpx 12rpx;
    border-radius: 12rpx;
    font-size: 20rpx;
}

.question-difficulty {
    background: #fff3e0;
    color: #f57c00;
    padding: 4rpx 12rpx;
    border-radius: 12rpx;
    font-size: 20rpx;
}

.question-content {
    margin-bottom: 30rpx;
}

.question-text {
    font-size: 28rpx;
    color: #1e293b;
    line-height: 1.6;
    font-weight: 500;
}

/* 回答区域 */
.answer-section {
    margin-bottom: 30rpx;
}

.answer-label {
    font-size: 26rpx;
    color: #1e293b;
    font-weight: 500;
    margin-bottom: 12rpx;
    display: block;
}

.answer-input {
    width: 100%;
    min-height: 200rpx;
    background: #f8fafc;
    border: 2rpx solid #e2e8f0;
    border-radius: 12rpx;
    padding: 20rpx;
    font-size: 26rpx;
    line-height: 1.5;
}

.answer-length {
    font-size: 22rpx;
    color: #64748b;
    text-align: right;
    margin-top: 8rpx;
}

/* 操作按钮 */
.action-buttons {
    display: flex;
    gap: 20rpx;
}

.action-btn {
    flex: 1;
    padding: 20rpx 24rpx;
    border: none;
    border-radius: 12rpx;
    font-size: 26rpx;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
}

.evaluate-btn {
    background: #3b82f6;
    color: white;
}

.evaluate-btn:disabled {
    background: #cbd5e1;
    color: #64748b;
}

.next-btn {
    background: #10b981;
    color: white;
}

.next-btn:disabled {
    background: #cbd5e1;
    color: #64748b;
}

/* 评估结果 */
.evaluation-section {
    background: white;
    border-radius: 20rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.evaluation-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
    padding-bottom: 16rpx;
    border-bottom: 2rpx solid #f1f5f9;
}

.evaluation-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1e293b;
}

.evaluation-score {
    font-size: 26rpx;
    font-weight: 600;
    color: #3b82f6;
}

.evaluation-content {
    display: flex;
    flex-direction: column;
    gap: 16rpx;
}

.evaluation-item {
    display: flex;
    align-items: flex-start;
    gap: 12rpx;
}

.item-label {
    font-size: 24rpx;
    color: #64748b;
    font-weight: 500;
    min-width: 120rpx;
}

.item-value {
    font-size: 24rpx;
    color: #1e293b;
    line-height: 1.5;
    flex: 1;
}

/* AI助手 */
.ai-assistant-section {
    background: white;
    border-radius: 20rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.assistant-header {
    margin-bottom: 16rpx;
}

.assistant-title {
    font-size: 26rpx;
    font-weight: 600;
    color: #1e293b;
}

.assistant-content {
    background: #f8fafc;
    border-radius: 12rpx;
    padding: 20rpx;
}

.assistant-message {
    font-size: 24rpx;
    color: #475569;
    line-height: 1.6;
}

/* Markdown样式 */
.md-h1 {
    font-size: 28rpx;
    font-weight: 600;
    color: #1e293b;
    margin: 20rpx 0 10rpx;
}

.md-h2 {
    font-size: 26rpx;
    font-weight: 600;
    color: #1e293b;
    margin: 16rpx 0 8rpx;
}

.md-h3 {
    font-size: 24rpx;
    font-weight: 600;
    color: #1e293b;
    margin: 12rpx 0 6rpx;
}

.md-p {
    margin: 8rpx 0;
    line-height: 1.6;
}

.md-strong {
    font-weight: 600;
    color: #1e293b;
}

.md-code {
    background: #f1f5f9;
    padding: 4rpx 8rpx;
    border-radius: 4rpx;
    font-family: 'Courier New', monospace;
    font-size: 22rpx;
    color: #475569;
}

.md-li {
    margin: 4rpx 0;
    padding-left: 20rpx;
    position: relative;
}

.md-li::before {
    content: '•';
    position: absolute;
    left: 0;
    color: #64748b;
}

.empty-line {
    height: 8rpx;
}

/* 加载状态 */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.loading-content {
    background: white;
    border-radius: 20rpx;
    padding: 40rpx;
    text-align: center;
}

.loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 4rpx solid #f3f4f6;
    border-top: 4rpx solid #3b82f6;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 20rpx;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

.loading-text {
    font-size: 26rpx;
    color: #64748b;
}

/* 错误提示 */
.error-message {
    background: #fee2e2;
    border: 2rpx solid #ef4444;
    border-radius: 12rpx;
    padding: 20rpx;
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 20rpx;
}

.error-icon {
    font-size: 24rpx;
}

.error-text {
    font-size: 24rpx;
    color: #991b1b;
}

/* 通用样式 */
.btn-icon {
    font-size: 24rpx;
}

.btn-text {
    font-size: 26rpx;
}

.btn-loading {
    font-size: 24rpx;
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
}
</style>