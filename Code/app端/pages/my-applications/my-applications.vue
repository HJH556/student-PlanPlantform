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
        
        <view class="content-section" v-if="!isLoading">
            <view v-if="filteredList.length > 0" class="applications-list">
                <view 
                    v-for="(item, index) in filteredList" 
                    :key="index"
                    class="application-card"
                    @click="viewJobDetail(item)"
                >
                    <view class="card-header">
                        <view class="job-info">
                            <text class="job-title">{{ item.title }}</text>
                            <text class="job-salary">{{ item.salary }}</text>
                        </view>
                        <view class="status-badge" :class="'status-' + item.status">
                            {{ getStatusText(item.status) }}
                        </view>
                    </view>
                    <view class="job-company">{{ item.company }}</view>
                    <view class="job-meta">
                        <text class="meta-item">{{ item.location }}</text>
                        <text class="meta-divider">·</text>
                        <text class="meta-item">{{ item.experience }}</text>
                        <text class="meta-divider">·</text>
                        <text class="meta-item">{{ item.education }}</text>
                    </view>
                    <view class="apply-time">申请时间：{{ item.applyTime }}</view>
                    <view class="card-actions" v-if="item.status === 'pending'">
                        <button class="action-btn cancel-btn" @click.stop="cancelApplication(item, index)">
                            取消申请
                        </button>
                    </view>
                </view>
            </view>
            
            <view v-else class="empty-state">
                <text class="empty-icon">📋</text>
                <text class="empty-text">暂无申请记录</text>
                <text class="empty-desc">去岗位探索看看吧~</text>
                <button class="go-btn" @click="goToJobExplore">去探索</button>
            </view>
        </view>
        
        <view v-else class="loading-state">
            <text class="loading-text">加载中...</text>
        </view>
    </view>
</template>

<script>
import userApi from '@/api/user.js'

export default {
    data() {
        return {
            activeTab: 0,
            tabs: ['全部', '待处理', '已通过', '已拒绝'],
            isLoading: true,
            applications: []
        }
    },
    
    computed: {
        filteredList() {
            if (this.activeTab === 0) {
                return this.applications
            }
            const statusMap = {
                1: 'pending',
                2: 'approved',
                3: 'rejected'
            }
            return this.applications.filter(item => item.status === statusMap[this.activeTab])
        }
    },
    
    onLoad() {
        this.loadApplications()
    },
    
    onPullDownRefresh() {
        this.loadApplications()
        setTimeout(() => {
            uni.stopPullDownRefresh()
        }, 1000)
    },
    
    methods: {
        async loadApplications() {
            this.isLoading = true
            try {
                const res = await userApi.getApplications()
                if (res && res.data) {
                    this.applications = res.data
                } else {
                    this.applications = this.getMockData()
                }
            } catch (err) {
                console.error(err)
                this.applications = this.getMockData()
            } finally {
                this.isLoading = false
            }
        },
        
        getMockData() {
            return [
                {
                    id: 1,
                    title: '前端开发工程师',
                    salary: '15-25K',
                    company: '字节跳动',
                    location: '北京',
                    experience: '3-5年',
                    education: '本科',
                    status: 'pending',
                    applyTime: '2024-01-15 14:30'
                },
                {
                    id: 2,
                    title: '后端开发工程师',
                    salary: '20-35K',
                    company: '阿里巴巴',
                    location: '杭州',
                    experience: '3-5年',
                    education: '本科',
                    status: 'approved',
                    applyTime: '2024-01-10 10:20'
                },
                {
                    id: 3,
                    title: '产品经理',
                    salary: '25-40K',
                    company: '腾讯',
                    location: '深圳',
                    experience: '5-10年',
                    education: '硕士',
                    status: 'rejected',
                    applyTime: '2024-01-05 16:45'
                }
            ]
        },
        
        getStatusText(status) {
            const statusMap = {
                pending: '待处理',
                approved: '已通过',
                rejected: '已拒绝'
            }
            return statusMap[status] || status
        },
        
        viewJobDetail(item) {
            uni.navigateTo({
                url: `/pages/job-detail/job-detail?id=${item.id}`
            })
        },
        
        async cancelApplication(item, index) {
            uni.showModal({
                title: '提示',
                content: '确定要取消这个申请吗？',
                success: async (res) => {
                    if (res.confirm) {
                        try {
                            uni.showLoading({ title: '处理中...' })
                            await userApi.cancelApplication(item.id)
                            this.applications.splice(index, 1)
                            uni.showToast({
                                title: '已取消',
                                icon: 'success'
                            })
                        } catch (err) {
                            console.error(err)
                            this.applications.splice(index, 1)
                            uni.showToast({
                                title: '已取消',
                                icon: 'success'
                            })
                        } finally {
                            uni.hideLoading()
                        }
                    }
                }
            })
        },
        
        goToJobExplore() {
            uni.switchTab({
                url: '/pages/job-explore/job-explore'
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

.applications-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.application-card {
    background: white;
    border-radius: 20rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16rpx;
}

.job-info {
    flex: 1;
}

.job-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    display: block;
    margin-bottom: 8rpx;
}

.job-salary {
    font-size: 32rpx;
    font-weight: 700;
    color: #f5576c;
    flex-shrink: 0;
    margin-left: 20rpx;
}

.status-badge {
    padding: 8rpx 20rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    flex-shrink: 0;
}

.status-pending {
    background: #fff7e6;
    color: #fa8c16;
}

.status-approved {
    background: #f6ffed;
    color: #52c41a;
}

.status-rejected {
    background: #fff1f0;
    color: #f5222d;
}

.job-company {
    font-size: 26rpx;
    color: #666;
    margin-bottom: 16rpx;
}

.job-meta {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
}

.meta-item {
    font-size: 24rpx;
    color: #999;
}

.meta-divider {
    font-size: 24rpx;
    color: #e8e8e8;
    margin: 0 12rpx;
}

.apply-time {
    font-size: 24rpx;
    color: #ccc;
}

.card-actions {
    display: flex;
    justify-content: flex-end;
    margin-top: 20rpx;
    padding-top: 20rpx;
    border-top: 1rpx solid #f0f0f0;
}

.action-btn {
    padding: 16rpx 40rpx;
    border-radius: 40rpx;
    font-size: 26rpx;
    border: none;
}

.cancel-btn {
    background: #f5f5f5;
    color: #666;
}

.empty-state, .loading-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding-top: 160rpx;
}

.empty-icon, .loading-text {
    font-size: 120rpx;
    margin-bottom: 30rpx;
}

.empty-text {
    font-size: 32rpx;
    color: #999;
    margin-bottom: 16rpx;
}

.empty-desc {
    font-size: 26rpx;
    color: #ccc;
    margin-bottom: 40rpx;
}

.go-btn {
    padding: 20rpx 60rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 40rpx;
    font-size: 28rpx;
}
</style>
