<template>
    <view class="container">
        <scroll-view 
            class="messages-container" 
            :style="{ paddingBottom: bottomPadding }"
            scroll-y="true"
            :scroll-into-view="scrollIntoView"
            :scroll-with-animation="true"
        >
            <view v-if="messages.length === 0" class="empty-state">
                <text class="empty-icon">🤖</text>
                <text class="empty-title">你好！我是AI职业助手</text>
                <text class="empty-desc">有什么职业问题可以问我哦~</text>
            </view>
            
            <view class="messages-list">
                <view 
                    v-for="(msg, index) in messages" 
                    :key="index"
                    :id="'msg-' + index"
                    class="message-item"
                    :class="{ 'user-message': msg.isUser, 'ai-message': !msg.isUser }"
                >
                    <view class="avatar">
                        <text v-if="msg.isUser">👤</text>
                        <text v-else>🤖</text>
                    </view>
                    <view class="message-content">
                        <text class="message-text">{{ msg.content }}</text>
                    </view>
                </view>
            </view>
        </scroll-view>
        
        <view class="quick-messages-container">
            <scroll-view class="quick-messages-scroll" scroll-x="true" show-scrollbar="false">
                <view class="quick-messages">
                    <view 
                        v-for="(msg, index) in quickMessages" 
                        :key="index"
                        class="quick-message-btn"
                        @click="sendQuickMessage(msg)"
                    >
                        <text>{{ msg }}</text>
                    </view>
                </view>
            </scroll-view>
        </view>
        
        <view class="input-area">
            <view class="input-wrapper">
                <input 
                    v-model="inputText"
                    class="input-field"
                    placeholder="输入你的问题..."
                    @confirm="sendMessage"
                    :disabled="isLoading"
                />
                <view 
                    class="send-btn"
                    :class="{ disabled: !inputText.trim() || isLoading }"
                    @click="sendMessage"
                >
                    <text>{{ isLoading ? '...' : '发送' }}</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
import agentApi from '@/api/agent.js'

export default {
    data() {
        return {
            messages: [],
            inputText: '',
            isLoading: false,
            bottomPadding: '20rpx',
            scrollIntoView: '',
            quickMessages: [
                '前端开发能晋升到哪些岗位？',
                'Java可以转岗到哪些方向？',
                'C/C++的发展路径？'
            ]
        }
    },
    
    onLoad() {
        this.setSafeArea()
    },
    
    methods: {
        setSafeArea() {
            const systemInfo = uni.getSystemInfoSync()
            this.bottomPadding = (systemInfo.safeAreaInsets?.bottom || 0) + 20 + 'rpx'
        },
        
        scrollToBottom() {
            this.$nextTick(() => {
                if (this.messages.length > 0) {
                    this.scrollIntoView = 'msg-' + (this.messages.length - 1)
                }
            })
        },
        
        sendQuickMessage(message) {
            this.inputText = message
            this.sendMessage()
        },
        
        async sendMessage() {
            if (!this.inputText.trim() || this.isLoading) return
            
            const userMessage = this.inputText.trim()
            this.inputText = ''
            
            this.messages.push({
                isUser: true,
                content: userMessage
            })
            
            this.scrollToBottom()
            
            this.isLoading = true
            
            try {
                const userId = 'user_' + Date.now()
                const response = await agentApi.sendMessage(userId, userMessage)
                console.log("API响应:", response)
                
                if (response && response.data) {
                    const aiResponse = response.data?.response || response.data?.message || "抱歉，我现在无法回答你的问题。"
                    this.messages.push({
                        isUser: false,
                        content: aiResponse
                    })
                    this.scrollToBottom()
                }
            } catch (err) {
                console.error("请求错误:", err)
                this.messages.push({
                    isUser: false,
                    content: "抱歉，网络连接失败，请检查网络设置。"
                })
                this.scrollToBottom()
            } finally {
                this.isLoading = false
            }
        }
    }
}
</script>

<style scoped>
page {
    height: 100vh;
    overflow: hidden;
}

.container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f7fa;
    overflow: hidden;
}

.messages-container {
    flex: 1;
    padding: 30rpx;
    height: 0;
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 200rpx;
}

.empty-icon {
    font-size: 120rpx;
    margin-bottom: 30rpx;
}

.empty-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #333;
    margin-bottom: 16rpx;
}

.empty-desc {
    font-size: 28rpx;
    color: #999;
}

.quick-messages-container {
    background: white;
    border-top: 1rpx solid #e8e8e8;
    padding: 20rpx 0;
    flex-shrink: 0;
}

.quick-messages-scroll {
    width: 100%;
    white-space: nowrap;
}

.quick-messages {
    display: flex;
    gap: 20rpx;
    padding: 0 30rpx;
    width: max-content;
}

.quick-message-btn {
    background: white;
    border: 2rpx solid #e8e8e8;
    border-radius: 50rpx;
    padding: 16rpx 32rpx;
    text-align: center;
    transition: all 0.3s ease;
    flex-shrink: 0;
}

.quick-message-btn text {
    font-size: 26rpx;
    color: #1a237e;
    font-weight: 500;
    white-space: nowrap;
}

.quick-message-btn:active {
    background: linear-gradient(135deg, #1a237e 0%, #3f51b5 100%);
    border-color: transparent;
}

.quick-message-btn:active text {
    color: white;
}

.messages-list {
    display: flex;
    flex-direction: column;
}

.message-item {
    display: flex;
    margin-bottom: 40rpx;
}

.user-message {
    flex-direction: row-reverse;
}

.ai-message {
    flex-direction: row;
}

.avatar {
    width: 80rpx;
    height: 80rpx;
    border-radius: 50%;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    flex-shrink: 0;
}

.user-message .avatar {
    margin-left: 20rpx;
}

.ai-message .avatar {
    margin-right: 20rpx;
}

.message-content {
    max-width: 70%;
    padding: 24rpx 30rpx;
    border-radius: 20rpx;
}

.user-message .message-content {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-top-right-radius: 4rpx;
}

.ai-message .message-content {
    background: white;
    color: #333;
    border-top-left-radius: 4rpx;
}

.message-text {
    font-size: 28rpx;
    line-height: 1.6;
    word-break: break-all;
}

.input-area {
    background: white;
    border-top: 1rpx solid #e8e8e8;
    padding: 20rpx 30rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
}

.input-wrapper {
    display: flex;
    align-items: center;
    gap: 20rpx;
}

.input-field {
    flex: 1;
    background: #f5f7fa;
    border-radius: 40rpx;
    padding: 20rpx 30rpx;
    font-size: 28rpx;
}

.send-btn {
    padding: 20rpx 40rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 40rpx;
    font-size: 28rpx;
    font-weight: 500;
}

.send-btn.disabled {
    background: #ccc;
}
</style>
