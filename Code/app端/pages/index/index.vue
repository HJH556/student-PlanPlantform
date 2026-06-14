<template>
    <view class="container">
        <view class="header">
            <view class="welcome-card">
                <text class="welcome-text">👋 欢迎回来</text>
                <text class="user-name">{{ userName }}</text>
                <text class="welcome-desc">开始你的职业规划之旅吧！</text>
            </view>
        </view>
        
        <view class="quick-actions">
            <view class="section-title">快捷入口</view>
            <view class="action-grid">
                <view class="action-item" @click="navigateTo('/pages/job-explore/job-explore')">
                    <view class="action-icon job-icon">🔍</view>
                    <text class="action-text">岗位探索</text>
                </view>
                <view class="action-item" @click="navigateTo('/pages/student-profile/student-profile')">
                    <view class="action-icon profile-icon">👤</view>
                    <text class="action-text">学生画像</text>
                </view>
                <view class="action-item" @click="navigateTo('/pages/career-plan/career-plan')">
                    <view class="action-icon career-icon">📊</view>
                    <text class="action-text">职业规划</text>
                </view>
                <view class="action-item" @click="navigateTo('/pages/interview-questions/interview-questions')">
                    <view class="action-icon interview-icon">💼</view>
                    <text class="action-text">面试问题</text>
                </view>
                <view class="action-item" @click="navigateTo('/pages/my-interview/my-interview')">
                    <view class="action-icon my-interview-icon">📋</view>
                    <text class="action-text">我的面试</text>
                </view>
            </view>
        </view>
        
        <view class="ai-assistant-section">
            <view class="ai-card" @click="openAIAssistant">
                <view class="ai-icon">🤖</view>
                <view class="ai-content">
                    <text class="ai-title">AI职业助手</text>
                    <text class="ai-desc">有任何职业问题，随时问我！</text>
                </view>
                <text class="ai-arrow">›</text>
            </view>
        </view>
        
        <view class="features">
            <view class="section-title">功能特点</view>
            <view class="feature-list">
                <view class="feature-item">
                    <view class="feature-icon">🧠</view>
                    <view class="feature-content">
                        <text class="feature-title">AI智能分析</text>
                        <text class="feature-desc">基于大模型的智能职业规划分析</text>
                    </view>
                </view>
                <view class="feature-item">
                    <view class="feature-icon">📈</view>
                    <view class="feature-content">
                        <text class="feature-title">知识图谱</text>
                        <text class="feature-desc">可视化展示岗位关系和技能要求</text>
                    </view>
                </view>
                <view class="feature-item">
                    <view class="feature-icon">🎯</view>
                    <view class="feature-content">
                        <text class="feature-title">精准匹配</text>
                        <text class="feature-desc">智能推荐最适合你的岗位</text>
                    </view>
                </view>
                <view class="feature-item">
                    <view class="feature-icon">💬</view>
                    <view class="feature-content">
                        <text class="feature-title">智能对话</text>
                        <text class="feature-desc">随时与AI助手交流职业问题</text>
                    </view>
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
            userName: '同学'
        }
    },
    
    onLoad() {
        const user = useUserStore.state.user
        if (user && user.username) {
            this.userName = user.username
        }
    },
    
    onShow() {
        const user = useUserStore.state.user
        if (user && user.username) {
            this.userName = user.username
        }
    },
    
    methods: {
        navigateTo(url) {
            uni.switchTab({
                url: url,
                fail: () => {
                    uni.navigateTo({
                        url: url
                    })
                }
            })
        },
        openAIAssistant() {
            uni.switchTab({
                url: '/pages/ai-assistant/ai-assistant'
            })
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

.header {
    padding: 30rpx;
}

.welcome-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 24rpx;
    padding: 50rpx 40rpx;
    color: white;
    box-shadow: 0 10rpx 30rpx rgba(102, 126, 234, 0.3);
}

.welcome-text {
    font-size: 28rpx;
    opacity: 0.9;
    display: block;
    margin-bottom: 10rpx;
}

.user-name {
    font-size: 40rpx;
    font-weight: 700;
    display: block;
    margin-bottom: 10rpx;
}

.welcome-desc {
    font-size: 26rpx;
    opacity: 0.8;
    display: block;
}

.quick-actions, .features {
    padding: 0 30rpx;
    margin-top: 40rpx;
}

.section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 30rpx;
}

.action-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 30rpx;
}

.action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    background: white;
    border-radius: 20rpx;
    padding: 40rpx 20rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
    transition: all 0.3s ease;
}

.action-item:active {
    transform: scale(0.95);
}

.action-icon {
    width: 100rpx;
    height: 100rpx;
    border-radius: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48rpx;
    margin-bottom: 20rpx;
}

.job-icon {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.profile-icon {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.career-icon {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.user-icon {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.interview-icon {
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.action-text {
    font-size: 24rpx;
    color: #333;
    font-weight: 500;
}

.ai-assistant-section {
    padding: 0 30rpx;
    margin-top: 40rpx;
}

.ai-card {
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
    border-radius: 24rpx;
    padding: 40rpx 30rpx;
    box-shadow: 0 10rpx 30rpx rgba(250, 112, 154, 0.3);
}

.ai-card:active {
    opacity: 0.9;
    transform: scale(0.98);
}

.ai-icon {
    width: 100rpx;
    height: 100rpx;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 24rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 56rpx;
    margin-right: 30rpx;
}

.ai-content {
    flex: 1;
}

.ai-title {
    font-size: 32rpx;
    font-weight: 700;
    color: white;
    display: block;
    margin-bottom: 8rpx;
}

.ai-desc {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.9);
    display: block;
}

.ai-arrow {
    font-size: 48rpx;
    color: rgba(255, 255, 255, 0.8);
    font-weight: 300;
}

.feature-list {
    background: white;
    border-radius: 24rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.feature-item {
    display: flex;
    align-items: center;
    padding: 30rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
}

.feature-item:last-child {
    border-bottom: none;
}

.feature-icon {
    width: 80rpx;
    height: 80rpx;
    border-radius: 20rpx;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    margin-right: 30rpx;
    flex-shrink: 0;
}

.feature-content {
    flex: 1;
}

.feature-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1a1a1a;
    display: block;
    margin-bottom: 8rpx;
}

.feature-desc {
    font-size: 24rpx;
    color: #999;
    display: block;
}
</style>
