<template>
    <view class="container">
        <view class="tabs">
            <view 
                v-for="(tab, index) in tabs" 
                :key="index"
                class="tab-item"
                :class="{ active: activeTab === index }"
                @click="activeTab = index"
            >
                {{ tab }}
            </view>
        </view>
        
        <view class="content-section">
            <view v-if="activeTab === 0" class="questions-section">
                <view 
                    v-for="(item, index) in questions" 
                    :key="index"
                    class="question-card"
                    @click="toggleAnswer(index)"
                >
                    <view class="question-header">
                        <text class="question-index">Q{{ index + 1 }}</text>
                        <text class="question-text">{{ item.question }}</text>
                    </view>
                    <view 
                        class="answer-content"
                        :class="{ expanded: item.expanded }"
                    >
                        <text class="answer-text">{{ item.answer }}</text>
                    </view>
                    <text class="toggle-icon">{{ item.expanded ? '▲' : '▼' }}</text>
                </view>
            </view>
            
            <view v-if="activeTab === 1" class="tips-section">
                <view class="tip-card">
                    <text class="tip-icon">🎯</text>
                    <view class="tip-content">
                        <text class="tip-title">面试前准备</text>
                        <text class="tip-desc">了解公司文化和岗位要求</text>
                    </view>
                </view>
                <view class="tip-card">
                    <text class="tip-icon">💬</text>
                    <view class="tip-content">
                        <text class="tip-title">自我介绍</text>
                        <text class="tip-desc">准备2-3分钟的自我介绍</text>
                    </view>
                </view>
                <view class="tip-card">
                    <text class="tip-icon">📚</text>
                    <view class="tip-content">
                        <text class="tip-title">技能复习</text>
                        <text class="tip-desc">复习核心技术知识点</text>
                    </view>
                </view>
                <view class="tip-card">
                    <text class="tip-icon">🎨</text>
                    <view class="tip-content">
                        <text class="tip-title">项目准备</text>
                        <text class="tip-desc">准备2-3个代表性项目</text>
                    </view>
                </view>
            </view>
            
            <view v-if="activeTab === 2" class="simulation-section">
                <view class="simulation-card" @click="startSimulation">
                    <text class="simulation-icon">🎮</text>
                    <text class="simulation-title">开始模拟面试</text>
                    <text class="simulation-desc">AI面试官将与你进行真实对话</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            activeTab: 0,
            tabs: ['常见问题', '面试技巧', '模拟面试'],
            questions: [
                {
                    question: '请简单介绍一下你自己',
                    answer: '这是一个经典的面试开场白。回答时要突出自己的教育背景、相关工作经验和核心技能，保持简洁有条理，2-3分钟为宜。',
                    expanded: false
                },
                {
                    question: '你为什么想加入我们公司？',
                    answer: '这是考察你对公司的了解程度。回答时要结合公司的产品、文化和发展方向，说明自己为什么认同公司的价值观。',
                    expanded: false
                },
                {
                    question: '请描述一个你最有成就感的项目',
                    answer: '使用STAR法则：情境(Situation)、任务(Task)、行动(Action)、结果(Result)。重点突出你在项目中的贡献和学到的东西。',
                    expanded: false
                },
                {
                    question: '你的优点和缺点是什么？',
                    answer: '优点要具体，最好有例子支撑；缺点要说真实但不致命的，并且说明你正在如何改进。',
                    expanded: false
                },
                {
                    question: '你对未来3-5年有什么规划？',
                    answer: '说明你对职业发展的思考，既要体现进取心，又要切合实际，可以结合应聘公司的发展来谈。',
                    expanded: false
                }
            ]
        }
    },
    
    methods: {
        toggleAnswer(index) {
            this.questions[index].expanded = !this.questions[index].expanded
        },
        
        startSimulation() {
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
}

.tabs {
    display: flex;
    background: white;
    padding: 20rpx 30rpx;
    border-bottom: 1rpx solid #e8e8e8;
}

.tab-item {
    flex: 1;
    text-align: center;
    padding: 20rpx;
    font-size: 28rpx;
    color: #666;
    position: relative;
}

.tab-item.active {
    color: #667eea;
    font-weight: 600;
}

.tab-item.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 60rpx;
    height: 6rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 3rpx;
}

.content-section {
    padding: 30rpx;
}

.questions-section {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.question-card {
    background: white;
    border-radius: 20rpx;
    padding: 30rpx;
    position: relative;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.question-header {
    display: flex;
    align-items: flex-start;
    margin-bottom: 20rpx;
}

.question-index {
    width: 60rpx;
    height: 60rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 12rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24rpx;
    font-weight: 600;
    margin-right: 20rpx;
    flex-shrink: 0;
}

.question-text {
    flex: 1;
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
    line-height: 1.6;
}

.answer-content {
    max-height: 0;
    overflow: hidden;
    transition: max-height 0.3s ease;
}

.answer-content.expanded {
    max-height: 1000rpx;
}

.answer-text {
    font-size: 26rpx;
    color: #666;
    line-height: 1.8;
    padding-top: 20rpx;
    border-top: 1rpx solid #f0f0f0;
}

.toggle-icon {
    position: absolute;
    top: 30rpx;
    right: 30rpx;
    font-size: 24rpx;
    color: #999;
}

.tips-section {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.tip-card {
    display: flex;
    align-items: center;
    background: white;
    border-radius: 20rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.tip-icon {
    font-size: 56rpx;
    margin-right: 24rpx;
}

.tip-content {
    flex: 1;
}

.tip-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #333;
    display: block;
    margin-bottom: 8rpx;
}

.tip-desc {
    font-size: 24rpx;
    color: #999;
    display: block;
}

.simulation-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 100rpx;
}

.simulation-card {
    width: 100%;
    background: white;
    border-radius: 24rpx;
    padding: 80rpx 30rpx;
    text-align: center;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.simulation-icon {
    font-size: 120rpx;
    display: block;
    margin-bottom: 30rpx;
}

.simulation-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
    display: block;
    margin-bottom: 16rpx;
}

.simulation-desc {
    font-size: 26rpx;
    color: #999;
    display: block;
}
</style>
