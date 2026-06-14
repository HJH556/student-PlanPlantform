<template>
    <view class="container">
        <view class="content-section" v-if="!isLoading">
            <view v-if="favoritesList.length > 0" class="favorites-list">
                <view 
                    v-for="(item, index) in favoritesList" 
                    :key="index"
                    class="favorite-card"
                    @click="viewJobDetail(item)"
                >
                    <view class="card-header">
                        <view class="job-info">
                            <text class="job-title">{{ item.title }}</text>
                            <text class="job-salary">{{ item.salary }}</text>
                        </view>
                        <view class="favorite-icon" @click.stop="removeFavorite(item, index)">
                            <text class="icon-text">❤️</text>
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
                    <view class="job-tags">
                        <text v-for="(tag, i) in item.tags" :key="i" class="tag">{{ tag }}</text>
                    </view>
                    <view class="card-actions">
                        <button class="action-btn apply-btn" @click.stop="applyJob(item)">
                            立即申请
                        </button>
                    </view>
                </view>
            </view>
            
            <view v-else class="empty-state">
                <text class="empty-icon">⭐</text>
                <text class="empty-text">暂无收藏</text>
                <text class="empty-desc">去岗位探索收藏心仪的岗位吧~</text>
                <button class="go-btn" @click="goToJobExplore">去探索</button>
            </view>
        </view>
        
        <view v-else class="loading-state">
            <text class="loading-text">加载中...</text>
        </view>
    </view>
</template>

<script>
import jobApi from '@/api/job.js'

export default {
    data() {
        return {
            isLoading: true,
            favoritesList: []
        }
    },
    
    onLoad() {
        this.loadFavorites()
    },
    
    onPullDownRefresh() {
        this.loadFavorites()
        setTimeout(() => {
            uni.stopPullDownRefresh()
        }, 1000)
    },
    
    methods: {
        async loadFavorites() {
            this.isLoading = true
            try {
                const res = await jobApi.getFavorites()
                if (res && res.data) {
                    this.favoritesList = res.data
                } else {
                    this.favoritesList = this.getMockData()
                }
            } catch (err) {
                console.error(err)
                this.favoritesList = this.getMockData()
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
                    tags: ['Vue', 'React', 'TypeScript']
                },
                {
                    id: 2,
                    title: '后端开发工程师',
                    salary: '20-35K',
                    company: '阿里巴巴',
                    location: '杭州',
                    experience: '3-5年',
                    education: '本科',
                    tags: ['Java', 'Spring', 'MySQL']
                },
                {
                    id: 3,
                    title: '算法工程师',
                    salary: '30-50K',
                    company: '腾讯',
                    location: '深圳',
                    experience: '3-5年',
                    education: '硕士',
                    tags: ['Python', '机器学习', '深度学习']
                }
            ]
        },
        
        viewJobDetail(item) {
            uni.navigateTo({
                url: `/pages/job-detail/job-detail?id=${item.id}`
            })
        },
        
        async removeFavorite(item, index) {
            uni.showModal({
                title: '提示',
                content: '确定要取消收藏吗？',
                success: async (res) => {
                    if (res.confirm) {
                        try {
                            uni.showLoading({ title: '处理中...' })
                            await jobApi.removeFavorite(item.id)
                            this.favoritesList.splice(index, 1)
                            uni.showToast({
                                title: '已取消收藏',
                                icon: 'success'
                            })
                        } catch (err) {
                            console.error(err)
                            this.favoritesList.splice(index, 1)
                            uni.showToast({
                                title: '已取消收藏',
                                icon: 'success'
                            })
                        } finally {
                            uni.hideLoading()
                        }
                    }
                }
            })
        },
        
        async applyJob(item) {
            try {
                uni.showLoading({ title: '申请中...' })
                await jobApi.applyJob(item.id)
                uni.showToast({
                    title: '申请成功',
                    icon: 'success'
                })
            } catch (err) {
                console.error(err)
                uni.showToast({
                    title: '申请失败',
                    icon: 'none'
                })
            } finally {
                uni.hideLoading()
            }
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

.content-section {
    padding: 30rpx;
}

.favorites-list {
    display: flex;
    flex-direction: column;
    gap: 20rpx;
}

.favorite-card {
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

.favorite-icon {
    padding: 10rpx;
    flex-shrink: 0;
}

.icon-text {
    font-size: 40rpx;
}

.job-company {
    font-size: 26rpx;
    color: #666;
    margin-bottom: 16rpx;
}

.job-meta {
    display: flex;
    align-items: center;
    margin-bottom: 20rpx;
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

.job-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
    margin-bottom: 20rpx;
}

.tag {
    padding: 8rpx 16rpx;
    background: rgba(102, 126, 234, 0.1);
    color: #667eea;
    border-radius: 8rpx;
    font-size: 22rpx;
}

.card-actions {
    display: flex;
    justify-content: flex-end;
    padding-top: 20rpx;
    border-top: 1rpx solid #f0f0f0;
}

.action-btn {
    padding: 16rpx 40rpx;
    border-radius: 40rpx;
    font-size: 26rpx;
    border: none;
}

.apply-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
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
