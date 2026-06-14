<template>
    <view class="container">
        <!-- 页面头部 -->
        <view class="page-header">
            <view class="header-content">
                <text class="page-badge">💼 面试准备</text>
                <text class="page-title">职业面试问题</text>
                <text class="page-subtitle">根据您的职业匹配度，获取个性化的面试问题和答案建议</text>
            </view>
        </view>

        <!-- 职业选择 -->
        <view class="job-selection">
            <view class="section-title">人岗匹配结果</view>
            <text class="section-desc">根据您的个人特质和技能，以下是最匹配的职业</text>
            
            <view class="job-buttons">
                <view 
                    v-for="job in matchResults" 
                    :key="job.id"
                    class="job-btn"
                    :class="{ active: selectedJob === job.id }"
                    @click="selectJob(job.id)"
                >
                    <text class="job-title">{{ job.title }}</text>
                    <text class="match-score">{{ job.score }}%</text>
                </view>
            </view>
        </view>

        <!-- 面试问题列表 -->
        <view v-if="selectedJob" class="questions-container">
            <view class="questions-header">
                <view class="section-title">面试问题</view>
                <text class="section-desc">针对 {{ getSelectedJobTitle() }} 职位的常见面试问题</text>
                
                <!-- 智能体状态显示 -->
                <view class="ai-status">
                    <text class="status-badge" :class="{ 'ai-enabled': aiEnabled, 'ai-disabled': !aiEnabled }">
                        {{ aiEnabled ? '🤖 智能体模式' : '📝 默认模式' }}
                    </text>
                    <text v-if="!aiEnabled" class="status-hint">（智能体服务不可用，使用默认问题）</text>
                </view>
                
                <!-- 错误信息 -->
                <text v-if="errorMessage" class="error-message">⚠️ {{ errorMessage }}</text>
            </view>
            
            <!-- 加载状态 -->
            <view v-if="loading" class="loading-container">
                <view class="loading-spinner"></view>
                <text>智能体正在生成个性化面试问题...</text>
            </view>
            
            <view v-else class="questions-list">
                <view 
                    v-for="(question, index) in interviewQuestions" 
                    :key="index"
                    class="question-card"
                >
                    <view class="question-header" @click="toggleQuestion(index)">
                        <text class="question-number">{{ index + 1 }}</text>
                        <text class="question-text">{{ question.question }}</text>
                        <text class="toggle-icon" :class="{ 'rotated': expandedQuestions.has(index) }">
                            ▼
                        </text>
                    </view>
                    
                    <view v-if="expandedQuestions.has(index)" class="question-content">
                        <view class="question-meta">
                            <text class="question-type">{{ question.type }}</text>
                            <text class="question-difficulty">难度：{{ question.difficulty || '中等' }}</text>
                        </view>
                        
                        <!-- 用户回答区域 -->
                        <view class="user-answer-section">
                            <text class="answer-title">💬 您的回答：</text>
                            <textarea 
                                v-model="userAnswers[index]" 
                                class="answer-input" 
                                placeholder="请输入您的回答..."
                                maxlength="1000"
                            ></textarea>
                            
                            <view class="answer-actions">
                                <button 
                                    class="evaluate-btn" 
                                    @click="evaluateAnswer(index)"
                                    :disabled="!userAnswers[index]"
                                >
                                    📊 评估回答
                                </button>
                                <text class="answer-length">{{ userAnswers[index]?.length || 0 }}/1000</text>
                            </view>
                        </view>
                        
                        <!-- 参考答案 -->
                        <view class="reference-answer">
                            <text class="answer-title">💡 参考答案：</text>
                            <view class="answer-content">
                                {{ question.answer || question.answerHint || '暂无参考答案' }}
                            </view>
                        </view>
                        
                        <!-- 评估结果 -->
                        <view v-if="answerEvaluations[index]" class="evaluation-result">
                            <text class="evaluation-title">📈 评估结果：</text>
                            <view class="evaluation-content">
                                <view class="score-section">
                                    <text class="score-label">综合评分：</text>
                                    <text class="score-value">{{ answerEvaluations[index].score }}/100</text>
                                </view>
                                
                                <view v-if="answerEvaluations[index].strengths" class="strengths-section">
                                    <text class="section-label">👍 优点：</text>
                                    <text class="section-content">{{ answerEvaluations[index].strengths.join('、') }}</text>
                                </view>
                                
                                <view v-if="answerEvaluations[index].weaknesses" class="weaknesses-section">
                                    <text class="section-label">👎 改进建议：</text>
                                    <text class="section-content">{{ answerEvaluations[index].weaknesses.join('、') }}</text>
                                </view>
                                
                                <view v-if="answerEvaluations[index].suggestions" class="suggestions-section">
                                    <text class="section-label">💡 优化建议：</text>
                                    <text class="section-content">{{ answerEvaluations[index].suggestions.join('、') }}</text>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </view>
        
        <!-- 无匹配职业提示 -->
        <view v-else class="no-job-selected">
            <view class="no-job-content">
                <text class="no-job-icon">💼</text>
                <text class="no-job-title">请先选择职业</text>
                <text class="no-job-desc">选择上方匹配的职业开始获取面试问题</text>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 响应式数据
const matchResults = ref([])
const selectedJob = ref('')
const interviewQuestions = ref([])
const userAnswers = ref({})
const answerEvaluations = ref({})
const expandedQuestions = ref(new Set())
const loading = ref(false)
const errorMessage = ref('')
const aiEnabled = ref(false)

// 页面加载
onLoad(() => {
    loadRecommendedJobs()
    checkAIService()
})

// 加载推荐职业
const loadRecommendedJobs = () => {
    try {
        // 从本地存储加载简历分析结果
        const resumeAnalysis = uni.getStorageSync('resume_analysis')
        if (resumeAnalysis && resumeAnalysis.match_results) {
            matchResults.value = resumeAnalysis.match_results
        } else {
            // 默认职业数据
            matchResults.value = [
                { id: 'frontend', title: '前端开发工程师', score: 85 },
                { id: 'backend', title: '后端开发工程师', score: 78 },
                { id: 'fullstack', title: '全栈开发工程师', score: 72 }
            ]
        }
    } catch (error) {
        console.error('加载推荐职业失败:', error)
        matchResults.value = [
            { id: 'frontend', title: '前端开发工程师', score: 85 },
            { id: 'backend', title: '后端开发工程师', score: 78 },
            { id: 'fullstack', title: '全栈开发工程师', score: 72 }
        ]
    }
}

// 检查智能体服务
const checkAIService = async () => {
    try {
        const response = await uni.request({
                url: this.$baseUrl + '/interview/health',
                method: 'GET'
            })
        aiEnabled.value = response.data.success
    } catch (error) {
        aiEnabled.value = false
        console.error('检查智能体服务失败:', error)
    }
}

// 选择职业
const selectJob = (jobId) => {
    selectedJob.value = jobId
    loadInterviewQuestions(jobId)
}

// 获取选中职业标题
const getSelectedJobTitle = () => {
    const job = matchResults.value.find(job => job.id === selectedJob.value)
    return job ? job.title : ''
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
    const jobTitle = getSelectedJobTitle()
    const requirementsMap = {
        '前端开发工程师': '熟悉HTML/CSS/JavaScript，掌握Vue/React框架，有响应式设计经验',
        '后端开发工程师': '熟悉Java/Python/Go等后端语言，掌握数据库设计，有API开发经验',
        '全栈开发工程师': '具备前后端开发能力，熟悉完整项目开发流程，有全栈项目经验'
    }
    return requirementsMap[jobTitle] || '具备良好的学习能力和团队协作精神'
}

// 加载面试问题
const loadInterviewQuestions = async (jobId) => {
    loading.value = true
    errorMessage.value = ''
    
    try {
        if (aiEnabled.value) {
            // 使用智能体生成问题
            const response = await uni.request({
                    url: this.$baseUrl + '/interview/generate-questions',
                    method: 'POST',
                    data: {
                        resume_text: getResumeText(),
                        job_title: interviewData.value.position,
                        job_requirements: getJobRequirements(),
                        question_count: 5
                    }
                })
            
            if (response.data.success) {
                interviewQuestions.value = response.data.data.questions || []
            } else {
                throw new Error('智能体生成问题失败')
            }
        }
        
        // 如果智能体不可用或生成失败，使用默认问题
        if (!interviewQuestions.value.length) {
            interviewQuestions.value = getDefaultQuestions(jobId)
        }
        
        // 重置用户回答和评估结果
        userAnswers.value = {}
        answerEvaluations.value = {}
        expandedQuestions.value = new Set()
        
    } catch (error) {
        console.error('加载面试问题失败:', error)
        errorMessage.value = '加载面试问题失败，请稍后重试'
        interviewQuestions.value = getDefaultQuestions(jobId)
    } finally {
        loading.value = false
    }
}

// 获取默认问题
const getDefaultQuestions = (jobId) => {
    const defaultQuestions = {
        frontend: [
            {
                question: '请介绍一下您在前端开发方面的经验和技术栈',
                type: '技术能力',
                difficulty: '中等',
                answerHint: '可以从项目经验、技术栈掌握程度、解决问题的能力等方面回答'
            },
            {
                question: '您如何处理浏览器兼容性问题？',
                type: '技术问题',
                difficulty: '中等',
                answerHint: '可以提到使用polyfill、特性检测、渐进增强等策略'
            }
        ],
        backend: [
            {
                question: '请介绍一下您在后端开发方面的经验',
                type: '技术能力',
                difficulty: '中等',
                answerHint: '可以从数据库设计、API开发、性能优化等方面回答'
            }
        ],
        fullstack: [
            {
                question: '作为全栈工程师，您如何平衡前后端开发工作？',
                type: '综合能力',
                difficulty: '中等',
                answerHint: '可以提到时间管理、技术栈选择、团队协作等方面'
            }
        ]
    }
    
    return defaultQuestions[jobId] || []
}

// 切换问题展开状态
const toggleQuestion = (index) => {
    if (expandedQuestions.value.has(index)) {
        expandedQuestions.value.delete(index)
    } else {
        expandedQuestions.value.add(index)
    }
}

// 评估回答
const evaluateAnswer = async (index) => {
    if (!userAnswers.value[index]) {
        uni.showToast({
            title: '请先输入您的回答',
            icon: 'none'
        })
        return
    }
    
    const question = interviewQuestions.value[index]
    const userAnswer = userAnswers.value[index]
    
    loading.value = true
    errorMessage.value = ''
    
    try {
        if (aiEnabled.value) {
            // 使用智能体评估
            const response = await uni.request({
                    url: this.$baseUrl + '/interview/evaluate-answer',
                    method: 'POST',
                    data: {
                        question: question.question,
                        user_answer: userAnswer,
                        expected_answer: question.answerHint || ''
                    }
                })
            
            if (response.data.success) {
                answerEvaluations.value[index] = response.data.data.evaluation
                uni.showToast({
                    title: '评估完成',
                    icon: 'success'
                })
                return
            }
        }
        
        // 智能体评估失败或不可用，使用默认评估
        const defaultEvaluation = generateDefaultEvaluation(question, userAnswer)
        answerEvaluations.value[index] = defaultEvaluation
        uni.showToast({
            title: '评估完成',
            icon: 'success'
        })
        
    } catch (error) {
        console.error('评估回答失败:', error)
        errorMessage.value = '评估服务暂时不可用'
        
        // 使用默认评估作为后备
        const defaultEvaluation = generateDefaultEvaluation(question, userAnswer)
        answerEvaluations.value[index] = defaultEvaluation
    } finally {
        loading.value = false
    }
}

// 生成默认评估
const generateDefaultEvaluation = (question, userAnswer) => {
    const answerLength = userAnswer.length
    const hasKeywords = userAnswer.includes('项目') || userAnswer.includes('经验') || userAnswer.includes('技术')
    const hasExamples = userAnswer.includes('例如') || userAnswer.includes('比如')
    
    // 基于回答质量智能评分
    let baseScore = 60
    if (answerLength > 200) baseScore += 10
    if (answerLength > 400) baseScore += 10
    if (hasKeywords) baseScore += 10
    if (hasExamples) baseScore += 10
    
    const score = Math.min(baseScore, 95)
    
    const strengths = []
    const weaknesses = []
    const suggestions = []
    
    if (answerLength > 200) strengths.push('回答内容充实')
    if (hasKeywords) strengths.push('关键词使用恰当')
    if (hasExamples) strengths.push('举例说明清晰')
    
    if (answerLength < 100) weaknesses.push('回答内容较为简略')
    if (!hasExamples) weaknesses.push('缺乏具体案例支撑')
    
    if (answerLength < 200) suggestions.push('建议补充更多细节和案例')
    if (!hasKeywords) suggestions.push('建议突出技术关键词')
    
    return {
        score,
        strengths: strengths.length ? strengths : ['回答结构清晰'],
        weaknesses: weaknesses.length ? weaknesses : ['可以进一步优化表达'],
        suggestions: suggestions.length ? suggestions : ['继续完善回答内容']
    }
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
    font-size: 36rpx;
    font-weight: 600;
    margin-bottom: 10rpx;
}

.page-subtitle {
    font-size: 28rpx;
    opacity: 0.9;
    text-align: center;
}

/* 职业选择 */
.job-selection {
    background: white;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;
}

.section-title {
    font-size: 32rpx;
    font-weight: 600;
    margin-bottom: 10rpx;
    color: #1e293b;
}

.section-desc {
    font-size: 26rpx;
    color: #64748b;
    margin-bottom: 20rpx;
}

.job-buttons {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.job-btn {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24rpx 30rpx;
    background: #f8fafc;
    border: 2rpx solid #e2e8f0;
    border-radius: 16rpx;
    transition: all 0.3s ease;
}

.job-btn.active {
    background: #1a237e;
    border-color: #1a237e;
    color: white;
}

.job-title {
    font-size: 28rpx;
    font-weight: 500;
}

.match-score {
    font-size: 24rpx;
    font-weight: 600;
}

.job-btn.active .match-score {
    color: #ffd700;
}

/* 面试问题容器 */
.questions-container {
    background: white;
    border-radius: 20rpx;
    padding: 30rpx;
}

.questions-header {
    margin-bottom: 30rpx;
}

.ai-status {
    display: flex;
    align-items: center;
    gap: 20rpx;
    margin: 20rpx 0;
}

.status-badge {
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    font-weight: 500;
}

.status-badge.ai-enabled {
    background: #d1fae5;
    color: #065f46;
}

.status-badge.ai-disabled {
    background: #fef3c7;
    color: #92400e;
}

.status-hint {
    font-size: 24rpx;
    color: #64748b;
}

.error-message {
    color: #dc2626;
    font-size: 26rpx;
    background: #fef2f2;
    padding: 16rpx 20rpx;
    border-radius: 12rpx;
    border-left: 4rpx solid #dc2626;
}

/* 加载状态 */
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60rpx 0;
}

.loading-spinner {
    width: 60rpx;
    height: 60rpx;
    border: 4rpx solid #e2e8f0;
    border-top: 4rpx solid #1a237e;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 30rpx;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* 问题列表 */
.questions-list {
    display: flex;
    flex-direction: column;
    gap: 30rpx;
}

.question-card {
    border: 2rpx solid #e2e8f0;
    border-radius: 16rpx;
    overflow: hidden;
}

.question-header {
    display: flex;
    align-items: center;
    padding: 24rpx 30rpx;
    background: #f8fafc;
    cursor: pointer;
}

.question-number {
    background: #1a237e;
    color: white;
    width: 40rpx;
    height: 40rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    font-weight: 600;
    margin-right: 20rpx;
}

.question-text {
    flex: 1;
    font-size: 28rpx;
    font-weight: 500;
    color: #1e293b;
}

.toggle-icon {
    font-size: 24rpx;
    color: #64748b;
    transition: transform 0.3s ease;
}

.toggle-icon.rotated {
    transform: rotate(180deg);
}

.question-content {
    padding: 30rpx;
}

.question-meta {
    display: flex;
    gap: 30rpx;
    margin-bottom: 20rpx;
}

.question-type, .question-difficulty {
    font-size: 24rpx;
    color: #64748b;
    background: #f1f5f9;
    padding: 8rpx 16rpx;
    border-radius: 12rpx;
}

/* 用户回答区域 */
.user-answer-section {
    margin: 30rpx 0;
    padding: 20rpx 0;
    border-top: 2rpx solid #f1f5f9;
    border-bottom: 2rpx solid #f1f5f9;
}

.answer-title {
    font-size: 26rpx;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 20rpx;
}

.answer-input {
    width: 100%;
    min-height: 200rpx;
    padding: 20rpx;
    border: 2rpx solid #e2e8f0;
    border-radius: 12rpx;
    font-size: 26rpx;
    background: #f8fafc;
    margin-bottom: 20rpx;
}

.answer-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.evaluate-btn {
    background: #1a237e;
    color: white;
    border: none;
    padding: 16rpx 32rpx;
    border-radius: 12rpx;
    font-size: 26rpx;
    font-weight: 500;
}

.evaluate-btn:disabled {
    background: #cbd5e1;
    color: #64748b;
}

.answer-length {
    font-size: 24rpx;
    color: #64748b;
}

/* 参考答案 */
.reference-answer {
    margin: 30rpx 0;
}

.answer-content {
    background: #f0f9ff;
    padding: 20rpx;
    border-radius: 12rpx;
    border-left: 4rpx solid #0ea5e9;
    font-size: 26rpx;
    line-height: 1.6;
    color: #0369a1;
}

/* 评估结果 */
.evaluation-result {
    background: #f0fdf4;
    padding: 20rpx;
    border-radius: 12rpx;
    border: 2rpx solid #bbf7d0;
}

.evaluation-title {
    font-size: 26rpx;
    font-weight: 600;
    color: #166534;
    margin-bottom: 20rpx;
}

.score-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15rpx;
}

.score-label {
    font-size: 26rpx;
    color: #166534;
}

.score-value {
    font-size: 28rpx;
    font-weight: 600;
    color: #dc2626;
}

.section-label {
    font-size: 24rpx;
    font-weight: 500;
    color: #166534;
    margin-bottom: 8rpx;
}

.section-content {
    font-size: 26rpx;
    color: #15803d;
    line-height: 1.5;
}

.strengths-section, .weaknesses-section, .suggestions-section {
    margin-bottom: 15rpx;
}

/* 无职业选择提示 */
.no-job-selected {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 400rpx;
}

.no-job-content {
    text-align: center;
}

.no-job-icon {
    font-size: 80rpx;
    margin-bottom: 20rpx;
}

.no-job-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 10rpx;
}

.no-job-desc {
    font-size: 26rpx;
    color: #64748b;
}
</style>