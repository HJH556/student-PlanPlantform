<template>
    <view class="container">
        <view class="user-header">
            <view class="user-info">
                <view class="avatar">
                    <text class="avatar-text">{{ initial }}</text>
                </view>
                <view class="info">
                    <text class="username">{{ userName }}</text>
                    <text class="role">{{ userRole }}</text>
                </view>
            </view>
        </view>
        
        <view class="menu-section">
            <view class="menu-item" @click="viewMyProfile">
                <text class="menu-icon">👤</text>
                <text class="menu-text">我的画像</text>
                <text class="menu-arrow">›</text>
            </view>
            <view class="menu-item" @click="viewMyApplications">
                <text class="menu-icon">📋</text>
                <text class="menu-text">我的申请</text>
                <text class="menu-arrow">›</text>
            </view>
            <view class="menu-item" @click="viewMyFavorites">
                <text class="menu-icon">⭐</text>
                <text class="menu-text">我的收藏</text>
                <text class="menu-arrow">›</text>
            </view>
        </view>
        
        <view class="menu-section">
            <view class="menu-item" @click="editPersonalInfo">
                <text class="menu-icon">✏️</text>
                <text class="menu-text">编辑个人信息</text>
                <text class="menu-arrow">›</text>
            </view>
            <view class="menu-item" @click="editSettings">
                <text class="menu-icon">⚙️</text>
                <text class="menu-text">设置</text>
                <text class="menu-arrow">›</text>
            </view>
            <view class="menu-item" @click="viewAbout">
                <text class="menu-icon">ℹ️</text>
                <text class="menu-text">关于我们</text>
                <text class="menu-arrow">›</text>
            </view>
            <view class="menu-item" @click="contactSupport">
                <text class="menu-icon">💬</text>
                <text class="menu-text">联系客服</text>
                <text class="menu-arrow">›</text>
            </view>
        </view>
        
        <view class="logout-section">
            <button class="logout-btn" @click="handleLogout">退出登录</button>
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
            initial: '同'
        }
    },
    
    onLoad() {
        const user = useUserStore.state.user
        if (user) {
            this.userName = user.username || user.name || '同学'
            this.userRole = user.role === 'admin' ? '管理员' : '学生'
            this.initial = this.userName.charAt(0).toUpperCase()
        }
    },
    
    methods: {
        viewMyProfile() {
            uni.switchTab({
                url: '/pages/student-profile/student-profile'
            })
        },
        
        viewMyApplications() {
            uni.navigateTo({
                url: '/pages/my-applications/my-applications'
            })
        },
        
        viewMyFavorites() {
            uni.navigateTo({
                url: '/pages/my-favorites/my-favorites'
            })
        },
        
        editPersonalInfo() {
            uni.navigateTo({
                url: '/pages/edit-profile/edit-profile'
            })
        },
        
        editSettings() {
            uni.showToast({
                title: '功能开发中',
                icon: 'none'
            })
        },
        
        viewAbout() {
            uni.showModal({
                title: '关于我们',
                content: '基于AI的大学生职业规划智能体 v1.0.0',
                showCancel: false
            })
        },
        
        contactSupport() {
            uni.showToast({
                title: '功能开发中',
                icon: 'none'
            })
        },
        
        handleLogout() {
            uni.showModal({
                title: '提示',
                content: '确定要退出登录吗？',
                success: (res) => {
                    if (res.confirm) {
                        useUserStore.logout()
                    }
                }
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

.user-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 80rpx 30rpx 60rpx;
}

.user-info {
    display: flex;
    align-items: center;
}

.avatar {
    width: 140rpx;
    height: 140rpx;
    border-radius: 70rpx;
    background: rgba(255, 255, 255, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 30rpx;
    border: 4rpx solid rgba(255, 255, 255, 0.5);
}

.avatar-text {
    font-size: 56rpx;
    font-weight: 600;
    color: white;
}

.info {
    flex: 1;
}

.username {
    font-size: 40rpx;
    font-weight: 600;
    color: white;
    display: block;
    margin-bottom: 12rpx;
}

.role {
    font-size: 26rpx;
    color: rgba(255, 255, 255, 0.8);
    display: block;
}

.menu-section {
    background: white;
    margin-top: 20rpx;
}

.menu-item {
    display: flex;
    align-items: center;
    padding: 30rpx;
    border-bottom: 1rpx solid #f0f0f0;
}

.menu-item:last-child {
    border-bottom: none;
}

.menu-icon {
    font-size: 40rpx;
    margin-right: 24rpx;
}

.menu-text {
    flex: 1;
    font-size: 30rpx;
    color: #333;
}

.menu-arrow {
    font-size: 40rpx;
    color: #ccc;
}

.logout-section {
    padding: 60rpx 30rpx 40rpx;
}

.logout-btn {
    width: 100%;
    padding: 28rpx;
    background: white;
    color: #f5576c;
    border: 2rpx solid #f5576c;
    border-radius: 16rpx;
    font-size: 32rpx;
    font-weight: 500;
}

.logout-btn:active {
    background: #fef2f2;
}
</style>
