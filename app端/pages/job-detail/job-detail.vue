<template>
    <view class="container">
        <view class="job-header">
            <view class="job-info">
                <text class="job-title">{{ job.title }}</text>
                <view class="job-tags">
                    <text v-for="(tag, index) in parseTags(job.tags)" :key="index" class="job-tag">{{ tag }}</text>
                </view>
            </view>
            <view class="job-salary">{{ job.salary }}</view>
        </view>
        
        <view class="section">
            <view class="section-title">岗位信息</view>
            <view class="info-grid">
                <view class="info-item">
                    <text class="info-label">公司</text>
                    <text class="info-value">{{ job.company }}</text>
                </view>
                <view class="info-item">
                    <text class="info-label">地点</text>
                    <text class="info-value">{{ job.location }}</text>
                </view>
                <view class="info-item">
                    <text class="info-label">经验</text>
                    <text class="info-value">{{ job.experience }}</text>
                </view>
                <view class="info-item">
                    <text class="info-label">学历</text>
                    <text class="info-value">{{ job.education }}</text>
                </view>
            </view>
        </view>
        
        <view class="section">
            <view class="section-title">岗位详情</view>
            <view class="content-box">
                <view v-if="job.requirements || job.description" class="content-text">
                    <text v-for="(line, index) in splitText(job.requirements || job.description)" :key="index">
                        {{ line }}
                        <text v-if="index < splitText(job.requirements || job.description).length - 1">\n</text>
                    </text>
                </view>
                <text v-else class="content-placeholder">暂无信息</text>
            </view>
        </view>
        
        <view class="section" v-if="job.benefits && job.benefits.length > 0">
            <view class="section-title">福利待遇</view>
            <view class="benefits-list">
                <view v-for="(benefit, index) in job.benefits" :key="index" class="benefit-item">
                    <text class="benefit-icon">🎁</text>
                    <text class="benefit-text">{{ benefit }}</text>
                </view>
            </view>
        </view>
        
        <view class="bottom-actions">
            <button class="btn btn-secondary" @click="toggleFavorite">
                {{ isFavorite ? '已收藏' : '收藏' }}
            </button>
            <button class="btn btn-primary" @click="applyJob">
                {{ job.applied ? '已申请' : '立即申请' }}
            </button>
        </view>
    </view>
</template>

<script>
import jobApi from '@/api/job.js'

export default {
    data() {
        return {
            jobId: null,
            job: {
                title: '前端开发工程师',
                salary: '15-25K',
                company: '字节跳动',
                location: '北京',
                experience: '3-5年',
                education: '本科',
                tags: [],
                responsibilities: '',
                requirements: '',
                benefits: [],
                applied: false
            },
            isFavorite: false,
            appliedJobIds: new Set()
        }
    },
    
    onLoad(options) {
        if (options.id) {
            this.jobId = options.id
            this.loadJobDetail()
            this.loadApplications()
        }
    },
    
    methods: {
        parseTags(tagsStr) {
            if (!tagsStr) return []
            if (Array.isArray(tagsStr)) return tagsStr
            return tagsStr.split(',').filter(t => t.trim())
        },
        
        splitText(text) {
            if (!text) return []
            return text.replace(/<br\s*\/?>/gi, '\n').replace(/<br>/gi, '\n').split('\n').filter(line => line.trim())
        },
        
        async loadApplications() {
            try {
                const response = await jobApi.getApplications()
                console.log('申请列表响应:', response)
                if (response && response.data && Array.isArray(response.data)) {
                    this.appliedJobIds = new Set(response.data.map(app => app.job_id || app.jobId))
                    this.checkIfApplied()
                }
            } catch (err) {
                console.error('获取申请列表失败:', err)
            }
        },
        
        checkIfApplied() {
            if (this.jobId && this.appliedJobIds.has(Number(this.jobId))) {
                this.job.applied = true
            }
        },
        
        async loadJobDetail() {
            try {
                uni.showLoading({ title: '加载中...' })
                const response = await jobApi.getJobDetail(this.jobId)
                console.log('岗位详情响应:', response)
                if (response && response.data) {
                    this.job = response.data
                    this.job.applied = false
                    if (!this.job.tags) {
                        this.job.tags = []
                    }
                    if (!this.job.benefits) {
                        this.job.benefits = []
                    }
                    this.checkIfApplied()
                }
            } catch (err) {
                console.error(err)
                uni.showToast({
                    title: '加载失败',
                    icon: 'none'
                })
            } finally {
                uni.hideLoading()
            }
        },
        
        async toggleFavorite() {
            try {
                if (this.isFavorite) {
                    await jobApi.removeFavorite(this.jobId)
                    this.isFavorite = false
                    uni.showToast({ title: '取消收藏', icon: 'success' })
                } else {
                    await jobApi.addFavorite(this.jobId)
                    this.isFavorite = true
                    uni.showToast({ title: '收藏成功', icon: 'success' })
                }
            } catch (err) {
                console.error(err)
                uni.showToast({ title: '操作失败', icon: 'none' })
            }
        },
        
        async applyJob() {
            if (this.job.applied) {
                uni.showToast({
                    title: '岗位已申请',
                    icon: 'none'
                })
                return
            }
            
            try {
                uni.showLoading({ title: '申请中...' })
                await jobApi.applyJob(this.jobId)
                this.job.applied = true
                this.appliedJobIds.add(Number(this.jobId))
                uni.showToast({
                    title: '申请成功',
                    icon: 'success'
                })
            } catch (err) {
                console.error(err)
                uni.showToast({
                    title: err?.message || err?.data?.detail || '申请失败',
                    icon: 'none'
                })
            } finally {
                uni.hideLoading()
            }
        }
    }
}
</script>

<style scoped>
.container {
    min-height: 100vh;
    background: #f5f7fa;
    padding-bottom: 140rpx;
}

.job-header {
    background: white;
    padding: 40rpx 30rpx;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 16rpx solid #f5f7fa;
}

.job-info {
    flex: 1;
    margin-right: 30rpx;
}

.job-title {
    font-size: 36rpx;
    font-weight: 600;
    color: #1a1a1a;
    display: block;
    margin-bottom: 20rpx;
}

.job-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
}

.job-tag {
    padding: 8rpx 20rpx;
    background: #f0f2ff;
    color: #667eea;
    border-radius: 8rpx;
    font-size: 24rpx;
}

.job-salary {
    font-size: 36rpx;
    font-weight: 700;
    color: #f5576c;
    flex-shrink: 0;
}

.section {
    background: white;
    margin-top: 20rpx;
    padding: 30rpx;
}

.section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 24rpx;
}

.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 30rpx;
}

.info-item {
    display: flex;
    flex-direction: column;
}

.info-label {
    font-size: 24rpx;
    color: #999;
    margin-bottom: 12rpx;
}

.info-value {
    font-size: 28rpx;
    color: #333;
    font-weight: 500;
}

.content-box {
    padding: 24rpx;
    background: #f8fafc;
    border-radius: 12rpx;
}

.content-text {
    font-size: 28rpx;
    color: #333;
    line-height: 1.8;
}

.content-placeholder {
    font-size: 28rpx;
    color: #ccc;
}

.benefits-list {
    display: flex;
    flex-wrap: wrap;
    gap: 20rpx;
}

.benefit-item {
    display: flex;
    align-items: center;
    padding: 16rpx 24rpx;
    background: #f8fafc;
    border-radius: 12rpx;
}

.benefit-icon {
    font-size: 32rpx;
    margin-right: 12rpx;
}

.benefit-text {
    font-size: 26rpx;
    color: #333;
}

.bottom-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    padding: 20rpx 30rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    display: flex;
    gap: 20rpx;
    border-top: 1rpx solid #e8e8e8;
}

.btn {
    flex: 1;
    padding: 28rpx;
    border-radius: 16rpx;
    font-size: 30rpx;
    font-weight: 500;
    border: none;
}

.btn-secondary {
    background: #f5f7fa;
    color: #333;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn:disabled {
    opacity: 0.6;
}
</style>
