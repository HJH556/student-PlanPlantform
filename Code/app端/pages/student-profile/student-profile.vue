<template>
    <view class="container">
        <view class="profile-header">
            <view class="avatar-section">
                <view class="avatar">
                    <text class="avatar-text">{{ initial }}</text>
                </view>
                <view class="user-info">
                    <text class="user-name">{{ userName }}</text>
                    <text class="user-role">{{ userRole }}</text>
                </view>
            </view>
        </view>
        
        <view class="progress-section">
            <view class="section-title">画像进度</view>
            <view class="progress-steps">
                <view 
                    v-for="(step, index) in steps" 
                    :key="index"
                    class="step-item"
                    :class="{ completed: index <= currentStep, active: index === currentStep }"
                >
                    <view class="step-icon">{{ step.icon }}</view>
                    <text class="step-text">{{ step.text }}</text>
                </view>
            </view>
        </view>
        
        <!-- 个人画像概览 -->
        <view class="profile-overview" v-if="resumeAnalysis && resumeAnalysis.basic_info">
            <view class="section-title">个人画像概览</view>
            <view class="overview-grid">
                <view class="overview-card" v-if="resumeAnalysis.basic_info.姓名">
                    <text class="overview-icon">👤</text>
                    <text class="overview-label">姓名</text>
                    <text class="overview-value">{{ resumeAnalysis.basic_info.姓名 }}</text>
                </view>
                <view class="overview-card" v-if="resumeAnalysis.basic_info.学历">
                    <text class="overview-icon">🎓</text>
                    <text class="overview-label">学历</text>
                    <text class="overview-value">{{ resumeAnalysis.basic_info.学历 }}</text>
                </view>
                <view class="overview-card" v-if="resumeAnalysis.basic_info.专业">
                    <text class="overview-icon">📚</text>
                    <text class="overview-label">专业</text>
                    <text class="overview-value">{{ resumeAnalysis.basic_info.专业 }}</text>
                </view>
                <view class="overview-card" v-if="resumeAnalysis.basic_info.工作经验">
                    <text class="overview-icon">💼</text>
                    <text class="overview-label">经验</text>
                    <text class="overview-value">{{ resumeAnalysis.basic_info.工作经验 }}</text>
                </view>
            </view>
        </view>

        <!-- 能力评估卡片 -->
        <view class="ability-cards" v-if="resumeAnalysis && resumeAnalysis.ability_assessment">
            <view class="section-title">能力评估</view>
            <view class="cards-container">
                <view class="ability-card" v-if="resumeAnalysis.ability_assessment.技术能力">
                    <view class="ability-header">
                        <text class="ability-name">技术能力</text>
                        <text class="ability-score" v-if="resumeAnalysis.ability_assessment.技术能力.score">{{ resumeAnalysis.ability_assessment.技术能力.score }}分</text>
                    </view>
                    <view class="ability-progress" v-if="resumeAnalysis.ability_assessment.技术能力.score">
                        <view class="progress-bar">
                            <view class="progress-fill" :style="{ width: resumeAnalysis.ability_assessment.技术能力.score + '%' }"></view>
                        </view>
                    </view>
                    <text class="ability-desc" v-if="resumeAnalysis.ability_assessment.技术能力.description">{{ resumeAnalysis.ability_assessment.技术能力.description }}</text>
                </view>
                
                <!-- 显示可视化数据中的进度条 -->
                <view class="ability-card" v-if="resumeAnalysis.visualization_data && resumeAnalysis.visualization_data.progress_bars">
                    <view class="ability-header">
                        <text class="ability-name">技能掌握度</text>
                    </view>
                    <view class="skill-progress-list">
                        <view class="skill-progress-item" v-for="(skill, index) in resumeAnalysis.visualization_data.progress_bars" :key="index">
                            <view class="skill-header">
                                <text class="skill-name">{{ skill.name }}</text>
                                <text class="skill-percent">{{ skill.progress }}%</text>
                            </view>
                            <view class="skill-progress">
                                <view class="progress-bar">
                                    <view class="progress-fill" :style="{ width: skill.progress + '%' }"></view>
                                </view>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <!-- 职业倾向分析 -->
        <view class="career-section" v-if="resumeAnalysis && resumeAnalysis.career_tendency">
            <view class="section-title">职业倾向分析</view>
            <view class="career-content">
                <view class="career-item">
                    <view class="career-header">
                        <text class="career-label">兴趣领域</text>
                    </view>
                    <text class="career-desc" v-if="resumeAnalysis.career_tendency.兴趣领域">{{ resumeAnalysis.career_tendency.兴趣领域 }}</text>
                </view>
                <view class="career-item">
                    <view class="career-header">
                        <text class="career-label">职业目标</text>
                    </view>
                    <text class="career-desc" v-if="resumeAnalysis.career_tendency.职业目标">{{ resumeAnalysis.career_tendency.职业目标 }}</text>
                </view>
                <view class="career-item">
                    <view class="career-header">
                        <text class="career-label">期望岗位</text>
                    </view>
                    <text class="career-desc" v-if="resumeAnalysis.career_tendency.期望岗位">{{ resumeAnalysis.career_tendency.期望岗位 }}</text>
                </view>
                
                <!-- 匹配岗位列表 -->
                <view class="career-item" v-if="resumeAnalysis.career_tendency.匹配岗位 && resumeAnalysis.career_tendency.匹配岗位.length > 0">
                    <view class="career-header">
                        <text class="career-label">推荐岗位</text>
                    </view>
                    <view class="match-job-list">
                        <view class="match-job-item" v-for="(job, index) in resumeAnalysis.career_tendency.匹配岗位" :key="index">
                            <view class="job-header">
                                <text class="job-name">{{ job.name }}</text>
                                <text class="job-score">{{ job.match_score }}分</text>
                            </view>
                            <text class="job-reason" v-if="job.reason">{{ job.reason }}</text>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <!-- 岗位匹配度 -->
        <view class="match-section" v-if="resumeAnalysis && resumeAnalysis.match_analysis">
            <view class="section-title">岗位匹配度</view>
            <view class="match-list">
                <view class="match-item">
                    <view class="match-header">
                        <text class="match-position">总体匹配度</text>
                        <text class="match-percent" v-if="resumeAnalysis.match_analysis.总体匹配度">{{ resumeAnalysis.match_analysis.总体匹配度 }}分</text>
                    </view>
                    <view class="match-reason" v-if="resumeAnalysis.match_analysis.优势分析">
                        <text class="reason-text">{{ resumeAnalysis.match_analysis.优势分析 }}</text>
                    </view>
                </view>
                
                <!-- 技能匹配度 -->
                <view class="match-item" v-if="resumeAnalysis.match_analysis.技能匹配 && resumeAnalysis.match_analysis.技能匹配.length > 0">
                    <view class="match-header">
                        <text class="match-position">技能匹配度</text>
                    </view>
                    <view class="skill-match-list">
                        <view class="skill-match-item" v-for="(skill, index) in resumeAnalysis.match_analysis.技能匹配" :key="index">
                            <view class="skill-match-header">
                                <text class="skill-name">{{ skill.技能 }}</text>
                                <text class="skill-match-percent">{{ skill.匹配度 }}%</text>
                            </view>
                            <text class="skill-importance" v-if="skill.重要性">重要性: {{ skill.重要性 }}</text>
                        </view>
                    </view>
                </view>
            </view>
        </view>

        <!-- 职业规划建议 -->
        <view class="career-plan-section" v-if="resumeAnalysis && resumeAnalysis.career_planning">
            <view class="section-title">职业规划建议</view>
            <view class="plan-timeline">
                <view class="plan-stage">
                    <view class="stage-header">
                        <text class="stage-title">短期目标 (0-1年)</text>
                    </view>
                    <view class="stage-content">
                        <text class="stage-goal" v-if="resumeAnalysis.career_planning.短期目标">{{ resumeAnalysis.career_planning.短期目标 }}</text>
                    </view>
                </view>
                <view class="plan-stage">
                    <view class="stage-header">
                        <text class="stage-title">中期目标 (1-3年)</text>
                    </view>
                    <view class="stage-content">
                        <text class="stage-goal" v-if="resumeAnalysis.career_planning.中期目标">{{ resumeAnalysis.career_planning.中期目标 }}</text>
                    </view>
                </view>
                <view class="plan-stage">
                    <view class="stage-header">
                        <text class="stage-title">长期目标 (3-5年)</text>
                    </view>
                    <view class="stage-content">
                        <text class="stage-goal" v-if="resumeAnalysis.career_planning.长期目标">{{ resumeAnalysis.career_planning.长期目标 }}</text>
                    </view>
                </view>
                
                <!-- 行动建议 -->
                <view class="plan-stage">
                    <view class="stage-header">
                        <text class="stage-title">行动建议</text>
                    </view>
                    <view class="stage-content">
                        <text class="stage-action" v-if="resumeAnalysis.career_planning.具体行动建议">{{ resumeAnalysis.career_planning.具体行动建议 }}</text>
                    </view>
                </view>
            </view>
        </view>

        <!-- 能力雷达图 -->
        <view class="ability-section" v-if="resumeAnalysis && resumeAnalysis.ability_radar">
            <view class="section-title">能力雷达图</view>
            <view class="radar-container">
                <view class="radar-placeholder">
                    <text class="placeholder-icon">📊</text>
                    <text class="placeholder-text">能力雷达图开发中</text>
                </view>
                <view class="radar-legend" v-if="resumeAnalysis.ability_radar">
                    <text class="legend-title">能力分布</text>
                    <view class="legend-items">
                        <view class="legend-item" v-for="(score, ability) in resumeAnalysis.ability_radar" :key="ability">
                            <view class="legend-color"></view>
                            <text class="legend-label">{{ ability }}</text>
                            <text class="legend-score">{{ score }}分</text>
                        </view>
                    </view>
                </view>
            </view>
        </view>
        
        <view class="action-section">
            <view class="section-title">快捷操作</view>
            <view class="action-list">
                <view class="action-card" @click="uploadResume">
                    <text class="action-icon">📄</text>
                    <view class="action-content">
                        <text class="action-title">上传简历</text>
                        <text class="action-desc">AI智能分析你的简历</text>
                    </view>
                    <text class="action-arrow">›</text>
                </view>
                <view class="action-card" @click="editProfile">
                    <text class="action-icon">✏️</text>
                    <view class="action-content">
                        <text class="action-title">编辑画像</text>
                        <text class="action-desc">完善你的个人信息</text>
                    </view>
                    <text class="action-arrow">›</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import { useUserStore } from '@/stores/user.js'

export default {
    data() {
        return {
            userName: '同学',
            userRole: '学生',
            initial: '同',
            currentStep: 1,
            resumeAnalysis: null,
            steps: [
                { icon: '📝', text: '简历分析' },
                { icon: '📊', text: '能力评估' },
                { icon: '🎯', text: '岗位匹配' },
                { icon: '🚀', text: '职业规划' }
            ]
        }
    },
    
    onLoad() {
        // 使用与简历上传页面相同的用户信息获取方式
        const userStore = this.$store?.state?.user || {}
        const user = userStore.user || {}
        
        if (user) {
            this.userName = user.username || user.name || '同学'
            this.userRole = user.role === 'admin' ? '管理员' : '学生'
            this.initial = this.userName.charAt(0).toUpperCase()
        }
        
        // 加载简历分析结果
        this.loadResumeAnalysis()
    },
    
    onShow() {
        // 页面显示时重新加载简历分析结果
        this.loadResumeAnalysis()
    },
    
    methods: {
        uploadResume() {
            uni.navigateTo({
                url: '/pages/upload-resume/upload-resume'
            })
        },
        
        editProfile() {
            uni.navigateTo({
                url: '/pages/edit-profile/edit-profile'
            })
        },
        
        loadResumeAnalysis() {
            try {
                // 获取当前用户ID（使用与简历上传页面相同的方式）
                const userStore = this.$store?.state?.user || {}
                const userId = userStore.user?.id || 'unknown'
                const storageKey = `resume_analysis_${userId}`
                
                console.log(`加载用户${userId}的简历分析数据，存储键: ${storageKey}`)
                
                const analysisData = uni.getStorageSync(storageKey)
                console.log('从本地存储加载的数据结构:', Object.keys(analysisData || {}))
                
                if (analysisData) {
                    this.resumeAnalysis = analysisData
                    console.log('设置到页面的简历分析结果:', Object.keys(this.resumeAnalysis || {}))
                    
                    // 更新进度步骤
                    if (this.resumeAnalysis) {
                        this.currentStep = 2 // 设置为能力评估阶段
                        console.log('进度步骤已更新为:', this.currentStep)
                    }
                } else {
                    console.log(`用户${userId}没有简历分析数据，显示默认状态`)
                    this.resumeAnalysis = {
                        basic_info: { 状态: '请先上传简历进行分析' },
                        ability_assessment: {},
                        career_tendency: {},
                        match_analysis: {}
                    }
                }
            } catch (err) {
                console.error('加载简历分析结果失败:', err)
                this.resumeAnalysis = {
                    basic_info: { 状态: '数据加载失败' },
                    ability_assessment: {},
                    career_tendency: {},
                    match_analysis: {}
                }
            }
        }
    }
}
</script>

<style scoped>
.container {
    min-height: 100vh;
    background: #f5f7fa;
    padding-bottom: 40rpx;
}

.profile-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 60rpx 30rpx;
}

.avatar-section {
    display: flex;
    align-items: center;
}

.avatar {
    width: 120rpx;
    height: 120rpx;
    border-radius: 60rpx;
    background: rgba(255, 255, 255, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 30rpx;
    border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.avatar-text {
    font-size: 48rpx;
    font-weight: 600;
    color: white;
}

.user-info {
    flex: 1;
}

.user-name {
    font-size: 36rpx;
    font-weight: 600;
    color: white;
    display: block;
    margin-bottom: 8rpx;
}

.user-role {
    font-size: 24rpx;
    color: rgba(255, 255, 255, 0.8);
    display: block;
}

/* 通用样式 */
.profile-overview, .ability-cards, .career-section, .match-section, 
.career-plan-section, .ability-section, .progress-section, .action-section {
    padding: 30rpx;
    margin-top: 20rpx;
}

.section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 30rpx;
    position: relative;
    padding-left: 20rpx;
}

.section-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 8rpx;
    height: 32rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 4rpx;
}

/* 个人画像概览 */
.overview-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20rpx;
}

.overview-card {
    background: white;
    border-radius: 16rpx;
    padding: 30rpx;
    text-align: center;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
    transition: transform 0.3s ease;
}

.overview-card:active {
    transform: scale(0.98);
}

.overview-icon {
    font-size: 48rpx;
    display: block;
    margin-bottom: 10rpx;
}

.overview-label {
    font-size: 24rpx;
    color: #666;
    display: block;
    margin-bottom: 8rpx;
}

.overview-value {
    font-size: 28rpx;
    font-weight: 600;
    color: #1a1a1a;
    display: block;
}

/* 能力评估卡片 */
.cards-container {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.ability-card {
    background: white;
    border-radius: 16rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.ability-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20rpx;
}

.ability-name {
    font-size: 28rpx;
    font-weight: 600;
    color: #1a1a1a;
}

.ability-score {
    font-size: 24rpx;
    font-weight: 600;
    color: #667eea;
}

.ability-progress {
    margin-bottom: 15rpx;
}

.progress-bar {
    width: 100%;
    height: 12rpx;
    background: #f0f0f0;
    border-radius: 6rpx;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
    border-radius: 6rpx;
    transition: width 0.5s ease;
}

.ability-desc {
    font-size: 24rpx;
    color: #666;
    line-height: 1.5;
}

/* 技能进度条列表 */
.skill-progress-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.skill-progress-item {
    display: flex;
    flex-direction: column;
    gap: 10rpx;
}

.skill-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.skill-name {
    font-size: 24rpx;
    color: #1a1a1a;
    font-weight: 500;
}

.skill-percent {
    font-size: 22rpx;
    color: #667eea;
    font-weight: 600;
}

.skill-progress {
    margin-bottom: 0;
}

/* 匹配岗位列表 */
.match-job-list {
    display: flex;
    flex-direction: column;
    gap: 15rpx;
}

.match-job-item {
    background: #f8f9fa;
    border-radius: 12rpx;
    padding: 20rpx;
}

.job-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10rpx;
}

.job-name {
    font-size: 26rpx;
    font-weight: 600;
    color: #1a1a1a;
}

.job-score {
    font-size: 22rpx;
    font-weight: 600;
    color: #ff6b6b;
}

.job-reason {
    font-size: 22rpx;
    color: #666;
    line-height: 1.4;
}

/* 技能匹配度列表 */
.skill-match-list {
    display: flex;
    flex-direction: column;
    gap: 15rpx;
}

.skill-match-item {
    background: #f8f9fa;
    border-radius: 12rpx;
    padding: 20rpx;
}

.skill-match-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8rpx;
}

.skill-match-percent {
    font-size: 22rpx;
    font-weight: 600;
    color: #ff6b6b;
}

.skill-importance {
    font-size: 20rpx;
    color: #999;
}

/* 职业倾向分析 */
.career-content {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.career-item {
    background: white;
    border-radius: 16rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.career-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15rpx;
}

.career-label {
    font-size: 28rpx;
    font-weight: 600;
    color: #1a1a1a;
}

.career-match {
    font-size: 24rpx;
    color: #667eea;
    font-weight: 600;
}

.career-desc {
    font-size: 24rpx;
    color: #666;
    line-height: 1.5;
}

/* 岗位匹配度 */
.match-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.match-item {
    background: white;
    border-radius: 16rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.match-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15rpx;
}

.match-position {
    font-size: 28rpx;
    font-weight: 600;
    color: #1a1a1a;
}

.match-percent {
    font-size: 24rpx;
    font-weight: 600;
    color: #ff6b6b;
}

.reason-text {
    font-size: 24rpx;
    color: #666;
    line-height: 1.5;
}

/* 职业规划建议 */
.plan-timeline {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.plan-stage {
    background: white;
    border-radius: 16rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
    position: relative;
}

.plan-stage::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50rpx;
    width: 4rpx;
    height: calc(100% - 100rpx);
    background: #e0e0e0;
}

.stage-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15rpx;
}

.stage-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1a1a1a;
}

.stage-duration {
    font-size: 24rpx;
    color: #667eea;
}

.stage-goal {
    font-size: 24rpx;
    color: #1a1a1a;
    font-weight: 500;
    margin-bottom: 10rpx;
    display: block;
}

.stage-action {
    font-size: 24rpx;
    color: #666;
    line-height: 1.5;
}

/* 能力雷达图 */
.radar-container {
    background: white;
    border-radius: 16rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.radar-placeholder {
    text-align: center;
    padding: 60rpx 0;
}

.placeholder-icon {
    font-size: 80rpx;
    display: block;
    margin-bottom: 20rpx;
}

.placeholder-text {
    font-size: 28rpx;
    color: #999;
}

.radar-legend {
    margin-top: 30rpx;
    border-top: 2rpx solid #f0f0f0;
    padding-top: 30rpx;
}

.legend-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 20rpx;
    display: block;
}

.legend-items {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20rpx;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 15rpx;
}

.legend-color {
    width: 20rpx;
    height: 20rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.legend-label {
    font-size: 24rpx;
    color: #666;
    flex: 1;
}

.legend-score {
    font-size: 24rpx;
    font-weight: 600;
    color: #667eea;
}

/* 进度步骤 */
.progress-steps {
    display: flex;
    justify-content: space-between;
    background: white;
    border-radius: 24rpx;
    padding: 40rpx 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.step-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    opacity: 0.4;
}

.step-item.completed {
    opacity: 1;
}

.step-item.active .step-icon {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transform: scale(1.1);
}

.step-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 20rpx;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 36rpx;
    margin-bottom: 16rpx;
    transition: all 0.3s ease;
}

.step-text {
    font-size: 22rpx;
    color: #666;
}

.radar-placeholder {
    background: white;
    border-radius: 24rpx;
    padding: 100rpx 30rpx;
    display: flex;
    flex-direction: column;
    align-items: center;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.placeholder-icon {
    font-size: 100rpx;
    margin-bottom: 30rpx;
}

.placeholder-text {
    font-size: 28rpx;
    color: #999;
}

.resume-analysis-section {
    padding: 30rpx;
    margin-top: 20rpx;
}

.analysis-content {
    background: white;
    border-radius: 24rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.analysis-item {
    margin-bottom: 30rpx;
}

.analysis-item:last-child {
    margin-bottom: 0;
}

.analysis-label {
    font-size: 28rpx;
    font-weight: 600;
    color: #333;
    display: block;
    margin-bottom: 16rpx;
    padding-bottom: 12rpx;
    border-bottom: 2rpx solid #f0f0f0;
}

.analysis-details {
    display: flex;
    flex-direction: column;
    gap: 12rpx;
}

.detail-item {
    font-size: 26rpx;
    color: #666;
    line-height: 1.6;
    padding: 8rpx 0;
}

.action-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.action-card {
    display: flex;
    align-items: center;
    background: white;
    border-radius: 20rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.action-icon {
    font-size: 48rpx;
    margin-right: 24rpx;
}

.action-content {
    flex: 1;
}

.action-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1a1a1a;
    display: block;
    margin-bottom: 8rpx;
}

.action-desc {
    font-size: 24rpx;
    color: #999;
    display: block;
}

.action-arrow {
    font-size: 40rpx;
    color: #ccc;
}
</style>
