<template>
    <view class="container">
        <view class="search-section">
            <view class="search-bar">
                <text class="search-icon">🔍</text>
                <input 
                    v-model="searchKeyword"
                    class="search-input"
                    placeholder="输入关键词搜索岗位名称..."
                    @confirm="handleSearch"
                />
                <view v-if="searchKeyword" class="clear-button" @click="clearSearch">✕</view>
                <view class="search-button" @click="handleSearch">搜索</view>
            </view>
        </view>
        
        <view class="filter-section">
            <scroll-view class="filter-scroll" scroll-x="true">
                <view 
                    v-for="(filter, index) in filters" 
                    :key="index"
                    class="filter-item"
                    :class="{ active: activeFilter === index }"
                    @click="handleFilterChange(index)"
                >
                    {{ filter }}
                </view>
            </scroll-view>
        </view>
        
        <scroll-view 
            class="job-scroll" 
            scroll-y="true"
            @scrolltolower="loadMore"
            :lower-threshold="100"
        >
            <view class="job-list" v-if="jobList.length > 0">
                <view 
                    v-for="job in jobList" 
                    :key="job.id"
                    class="job-card"
                    @click="viewJobDetail(job)"
                >
                    <view class="job-header">
                        <view class="job-title">{{ job.title || '岗位名称' }}</view>
                        <view class="job-salary">{{ job.salary || '薪资面议' }}</view>
                    </view>
                    <view class="job-company">{{ job.company || '公司名称' }}</view>
                    <view class="job-info">
                        <text class="info-tag">{{ job.location || '地点' }}</text>
                        <text class="info-tag">{{ job.experience || '经验不限' }}</text>
                        <text class="info-tag">{{ job.education || '学历不限' }}</text>
                    </view>
                    <view class="job-tags">
                        <text v-for="(tag, i) in parseTags(job.tags)" :key="i" class="tag">{{ tag }}</text>
                    </view>
                </view>
            </view>
            
            <view v-if="loading" class="loading-state">
                <text>加载中...</text>
            </view>
            
            <view v-else-if="jobList.length === 0" class="empty-state">
                <text class="empty-icon">📭</text>
                <text class="empty-text">暂无岗位数据</text>
                <text class="empty-desc">请确保后端服务已启动</text>
            </view>
            
            <view v-else-if="!hasMore" class="no-more-state">
                <text>没有更多数据了</text>
            </view>
        </scroll-view>
    </view>
</template>

<script>
import jobApi from '@/api/job.js'

export default {
    data() {
        return {
            searchKeyword: '',
            activeFilter: 0,
            filters: ['全部', '前端', '后端', '算法', '产品', '运营'],
            jobList: [],
            allJobList: [],
            loading: false,
            hasMore: true,
            page: 1,
            pageSize: 20
        }
    },
    
    onLoad() {
        this.loadJobList()
    },
    
    onPullDownRefresh() {
        this.refresh()
    },
    
    methods: {
        parseTags(tagsStr) {
            if (!tagsStr) return []
            if (Array.isArray(tagsStr)) return tagsStr
            return tagsStr.split(',').filter(t => t.trim())
        },
        
        async loadJobList() {
            if (this.loading) return
            
            this.loading = true
            console.log('开始加载数据, 页码:', this.page, '搜索关键词:', this.searchKeyword)
            
            try {
                const params = {
                    skip: (this.page - 1) * this.pageSize,
                    limit: this.pageSize
                }
                
                if (this.searchKeyword.trim()) {
                    params.keyword = this.searchKeyword.trim()
                }
                
                const response = await jobApi.getJobList(params)
                console.log('岗位列表响应:', response)
                
                if (response && response.data && Array.isArray(response.data)) {
                    const newData = response.data
                    console.log('获取到数据数量:', newData.length)
                    
                    if (this.page === 1) {
                        this.allJobList = newData
                    } else {
                        this.allJobList = [...this.allJobList, ...newData]
                    }
                    
                    this.hasMore = newData.length >= this.pageSize
                    
                    if (this.searchKeyword.trim()) {
                        this.jobList = this.allJobList
                    } else {
                        this.applyFilter()
                    }
                } else {
                    console.log('响应数据格式不正确')
                }
            } catch (error) {
                console.error('加载岗位列表失败:', error)
                if (this.page === 1) {
                    this.allJobList = this.getMockJobs()
                    this.jobList = this.allJobList
                }
            } finally {
                this.loading = false
                uni.stopPullDownRefresh()
            }
        },
        
        getMockJobs() {
            return [
                {
                    id: 1,
                    title: '前端开发工程师',
                    company: '字节跳动',
                    salary: '25-45K',
                    location: '北京',
                    experience: '1-3年',
                    education: '本科',
                    tags: ['Vue', 'React', 'TypeScript']
                },
                {
                    id: 2,
                    title: '后端开发工程师',
                    company: '阿里巴巴',
                    salary: '30-50K',
                    location: '杭州',
                    experience: '3-5年',
                    education: '本科',
                    tags: ['Java', 'Spring', 'MySQL']
                },
                {
                    id: 3,
                    title: '算法工程师',
                    company: '腾讯',
                    salary: '35-60K',
                    location: '深圳',
                    experience: '3-5年',
                    education: '硕士',
                    tags: ['Python', '机器学习', '深度学习']
                }
            ]
        },
        
        async handleSearch() {
            this.page = 1
            this.hasMore = true
            await this.loadJobList()
        },
        
        clearSearch() {
            this.searchKeyword = ''
            this.page = 1
            this.hasMore = true
            this.loadJobList()
        },
        
        handleFilterChange(index) {
            if (this.searchKeyword.trim()) {
                uni.showToast({
                    title: '请先清除搜索再使用筛选',
                    icon: 'none'
                })
                return
            }
            this.activeFilter = index
            this.applyFilter()
        },
        
        applyFilter() {
            if (this.searchKeyword.trim()) {
                this.jobList = this.allJobList
                return
            }
            
            const filter = this.filters[this.activeFilter]
            console.log('应用筛选:', filter)
            
            if (filter === '全部') {
                this.jobList = this.allJobList
            } else {
                this.jobList = this.allJobList.filter(job => {
                    const title = job.title || ''
                    const tags = this.parseTags(job.tags)
                    return title.includes(filter) || tags.includes(filter)
                })
            }
            console.log('筛选后数据数量:', this.jobList.length)
        },
        
        loadMore() {
            if (this.loading || !this.hasMore) {
                console.log('不加载更多:', { loading: this.loading, hasMore: this.hasMore })
                return
            }
            
            console.log('加载更多数据')
            this.page++
            this.loadJobList()
        },
        
        refresh() {
            console.log('刷新数据')
            this.page = 1
            this.hasMore = true
            this.loadJobList()
        },
        
        viewJobDetail(job) {
            uni.navigateTo({
                url: `/pages/job-detail/job-detail?id=${job.id}`
            })
        }
    }
}
</script>

<style scoped>
.container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f7fa;
}

.search-section {
    padding: 30rpx;
    background: white;
    flex-shrink: 0;
}

.search-bar {
    display: flex;
    align-items: center;
    background: #f8fafc;
    border-radius: 16rpx;
    padding: 24rpx 30rpx;
    border: 2rpx solid #e2e8f0;
}

.search-icon {
    font-size: 32rpx;
    margin-right: 20rpx;
}

.search-input {
    flex: 1;
    font-size: 28rpx;
}

.search-button {
    margin-left: 20rpx;
    padding: 16rpx 32rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    font-size: 28rpx;
    border-radius: 12rpx;
}

.clear-button {
    width: 48rpx;
    height: 48rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #e2e8f0;
    color: #64748b;
    font-size: 32rpx;
    border-radius: 50%;
    margin-left: 16rpx;
}

.filter-section {
    background: white;
    padding: 20rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
    flex-shrink: 0;
}

.filter-scroll {
    white-space: nowrap;
    padding: 0 30rpx;
}

.filter-item {
    display: inline-block;
    padding: 16rpx 32rpx;
    background: #f0f0f0;
    border-radius: 30rpx;
    font-size: 26rpx;
    color: #666;
    margin-right: 20rpx;
    transition: all 0.3s ease;
}

.filter-item.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.job-scroll {
    flex: 1;
    height: 0;
}

.job-list {
    padding: 30rpx;
}

.job-card {
    background: white;
    border-radius: 20rpx;
    padding: 30rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.job-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 16rpx;
}

.job-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1a1a1a;
    flex: 1;
}

.job-salary {
    font-size: 32rpx;
    font-weight: 700;
    color: #f5576c;
    flex-shrink: 0;
    margin-left: 20rpx;
}

.job-company {
    font-size: 26rpx;
    color: #666;
    margin-bottom: 20rpx;
}

.job-info {
    display: flex;
    gap: 16rpx;
    margin-bottom: 20rpx;
}

.info-tag {
    font-size: 24rpx;
    color: #999;
    background: #f8fafc;
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
}

.job-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
}

.tag {
    font-size: 22rpx;
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    padding: 8rpx 16rpx;
    border-radius: 8rpx;
}

.empty-state, .loading-state, .no-more-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 120rpx 30rpx;
}

.empty-icon {
    font-size: 120rpx;
    margin-bottom: 30rpx;
}

.empty-text {
    font-size: 32rpx;
    color: #999;
    margin-bottom: 10rpx;
}

.empty-desc {
    font-size: 24rpx;
    color: #ccc;
}

.loading-state text, .no-more-state text {
    font-size: 28rpx;
    color: #999;
}
</style>
