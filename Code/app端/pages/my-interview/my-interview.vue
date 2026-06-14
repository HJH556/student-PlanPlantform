<template>
    <view class="container">
        <!-- 页面头部 -->
        <view class="page-header">
            <view class="header-content">
                <text class="page-badge">🎯 面试管理</text>
                <text class="page-title">我的面试</text>
                <text class="page-subtitle">管理您的面试记录，追踪面试进度</text>
            </view>
        </view>

        <!-- 操作栏 -->
        <view class="action-bar">
            <button class="smart-create-btn" @click="showSmartCreateModal = true">
                <text class="btn-icon">✨</text>
                <text class="btn-text">智能创建面试</text>
            </button>
        </view>

        <!-- 面试列表 -->
        <view class="interview-list">
            <view v-if="interviews.length > 0" class="cards-container">
                <view 
                    v-for="interview in interviews" 
                    :key="interview.id"
                    class="interview-card"
                    :class="'status-' + interview.status"
                    @click="goToInterviewDetail(interview.id)"
                >
                    <view class="card-header">
                        <view class="company-info">
                            <view class="company-logo">
                                <text class="logo-text">{{ interview.company.charAt(0) }}</text>
                            </view>
                            <view class="company-details">
                                <text class="company-name">{{ interview.company }}</text>
                                <text class="position-name">{{ interview.position }}</text>
                            </view>
                        </view>
                        <text class="status-badge" :class="'status-' + interview.status">
                            {{ getStatusText(interview.status) }}
                        </text>
                    </view>
                    
                    <view class="card-body">
                        <view class="info-row">
                            <text class="label">面试时间：</text>
                            <text class="value">{{ interview.date }}</text>
                        </view>
                        <view class="info-row">
                            <text class="label">面试形式：</text>
                            <text class="value">{{ interview.type }}</text>
                        </view>
                        <view v-if="interview.interviewer" class="info-row">
                            <text class="label">面试官：</text>
                            <text class="value">{{ interview.interviewer }}</text>
                        </view>
                        <view v-if="interview.remark" class="info-row">
                            <text class="label">备注：</text>
                            <text class="value">{{ interview.remark }}</text>
                        </view>
                    </view>
                    
                    <view class="card-actions">
                        <button class="action-btn simulate" @click.stop="startSimulation(interview)">
                            <text class="action-icon">🎭</text>
                            <text class="action-text">智能模拟</text>
                        </button>
                        <button class="action-btn edit" @click.stop="editInterview(interview)">
                            <text class="action-icon">✏️</text>
                            <text class="action-text">编辑</text>
                        </button>
                        <button class="action-btn delete" @click.stop="deleteInterview(interview)">
                            <text class="action-icon">🗑️</text>
                            <text class="action-text">删除</text>
                        </button>
                    </view>
                </view>
            </view>
            
            <!-- 空状态 -->
            <view v-else class="empty-state">
                <view class="empty-icon">
                    <text>📋</text>
                </view>
                <text class="empty-title">暂无面试记录</text>
                <text class="empty-desc">开始您的第一个面试吧！</text>
                <button class="smart-create-btn large" @click="showSmartCreateModal = true">
                    <text class="btn-icon">✨</text>
                    <text class="btn-text">智能创建第一个面试</text>
                </button>
            </view>
        </view>

        <!-- 智能创建模态框 -->
        <view v-if="showSmartCreateModal" class="modal-overlay" @click="closeSmartCreateModal">
            <view class="modal smart-create-modal" @click.stop>
                <view class="modal-header">
                    <text class="modal-title">智能创建面试</text>
                    <button class="close-btn" @click="closeSmartCreateModal">
                        <text class="close-icon">✕</text>
                    </button>
                </view>
                
                <view class="modal-body">
                    <view class="smart-create-form">
                        <!-- 职业分类选择 -->
                        <view class="form-group">
                            <text class="form-label">职业分类</text>
                            <view class="career-categories">
                                <view 
                                    v-for="category in careerCategories" 
                                    :key="category.id"
                                    class="category-card"
                                    :class="{ 'selected': smartCreateData.selectedCategory === category.id }"
                                    @click="selectCategory(category.id)"
                                >
                                    <text class="category-icon">{{ category.icon }}</text>
                                    <text class="category-name">{{ category.name }}</text>
                                    <text class="category-count">{{ category.positions.length }}个职位</text>
                                </view>
                            </view>
                        </view>
                        
                        <!-- 具体职位选择 -->
                        <view v-if="smartCreateData.selectedCategory" class="form-group">
                            <text class="form-label">具体职位</text>
                            <picker 
                                :range="getCategoryPositions(smartCreateData.selectedCategory)" 
                                @change="onPositionChange"
                                class="form-picker"
                            >
                                <view class="picker-display">
                                    <text>{{ smartCreateData.selectedPosition || '请选择职位' }}</text>
                                    <text class="picker-arrow">▼</text>
                                </view>
                            </picker>
                        </view>
                        
                        <!-- 公司名称 -->
                        <view class="form-group">
                            <text class="form-label">
                                公司名称
                                <text class="info-hint">（可选）</text>
                            </text>
                            <input 
                                v-model="smartCreateData.company" 
                                class="form-input" 
                                placeholder="不填写将使用智能推荐"
                            />
                        </view>
                        
                        <!-- 面试时间 -->
                        <view class="form-group">
                            <text class="form-label">面试时间</text>
                            <picker 
                                mode="date" 
                                :value="smartCreateData.date" 
                                @change="onDateChange"
                                class="form-picker"
                            >
                                <view class="picker-display">
                                    <text>{{ smartCreateData.date || '请选择面试日期' }}</text>
                                    <text class="picker-arrow">▼</text>
                                </view>
                            </picker>
                        </view>
                        
                        <!-- 面试形式 -->
                        <view class="form-group">
                            <text class="form-label">面试形式</text>
                            <picker 
                                :range="interviewTypes" 
                                @change="onTypeChange"
                                class="form-picker"
                            >
                                <view class="picker-display">
                                    <text>{{ smartCreateData.type || '请选择面试形式' }}</text>
                                    <text class="picker-arrow">▼</text>
                                </view>
                            </picker>
                        </view>
                    </view>
                </view>
                
                <view class="modal-footer">
                    <button class="btn-cancel" @click="closeSmartCreateModal">取消</button>
                    <button class="btn-confirm" @click="createInterview" :disabled="!canCreateInterview">
                        创建面试
                    </button>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

// 响应式数据
const interviews = ref([])
const showSmartCreateModal = ref(false)
const careerCategories = ref([
    {
        id: 'technology',
        name: '技术类',
        icon: '💻',
        positions: ['前端开发工程师', '后端开发工程师', '全栈开发工程师', '移动开发工程师', '测试工程师']
    },
    {
        id: 'product',
        name: '产品类',
        icon: '📱',
        positions: ['产品经理', '产品助理', '产品运营']
    },
    {
        id: 'design',
        name: '设计类',
        icon: '🎨',
        positions: ['UI设计师', 'UX设计师', '平面设计师']
    },
    {
        id: 'operation',
        name: '运营类',
        icon: '📊',
        positions: ['运营专员', '内容运营', '用户运营']
    }
])
const interviewTypes = ref(['线上面试', '线下面试', '电话面试', '视频面试'])

const smartCreateData = ref({
    selectedCategory: '',
    selectedPosition: '',
    company: '',
    date: '',
    type: ''
})

// 计算属性
const canCreateInterview = computed(() => {
    return smartCreateData.value.selectedCategory && 
           smartCreateData.value.selectedPosition && 
           smartCreateData.value.date && 
           smartCreateData.value.type
})

// 页面加载
onLoad(() => {
    loadInterviews()
})

// 加载面试记录
const loadInterviews = () => {
    try {
        const savedInterviews = uni.getStorageSync('my_interviews')
        interviews.value = savedInterviews || []
    } catch (error) {
        console.error('加载面试记录失败:', error)
        interviews.value = getDefaultInterviews()
    }
}

// 获取默认面试记录
const getDefaultInterviews = () => {
    return [
        {
            id: '1',
            company: '腾讯科技',
            position: '前端开发工程师',
            date: '2024-04-15',
            type: '线上面试',
            status: 'pending',
            interviewer: '张经理',
            remark: '技术面第一轮'
        },
        {
            id: '2',
            company: '阿里巴巴',
            position: '后端开发工程师',
            date: '2024-04-20',
            type: '线下面试',
            status: 'completed',
            interviewer: '李总监',
            remark: '已通过技术面'
        }
    ]
}

// 获取状态文本
const getStatusText = (status) => {
    const statusMap = {
        'pending': '待面试',
        'completed': '已完成',
        'offer': '已录用',
        'rejected': '未通过'
    }
    return statusMap[status] || '未知状态'
}

// 选择职业分类
const selectCategory = (categoryId) => {
    smartCreateData.value.selectedCategory = categoryId
    smartCreateData.value.selectedPosition = ''
}

// 获取分类下的职位列表
const getCategoryPositions = (categoryId) => {
    const category = careerCategories.value.find(cat => cat.id === categoryId)
    return category ? category.positions : []
}

// 职位选择变化
const onPositionChange = (e) => {
    const positions = getCategoryPositions(smartCreateData.value.selectedCategory)
    smartCreateData.value.selectedPosition = positions[e.detail.value]
}

// 日期选择变化
const onDateChange = (e) => {
    smartCreateData.value.date = e.detail.value
}

// 面试形式选择变化
const onTypeChange = (e) => {
    smartCreateData.value.type = interviewTypes.value[e.detail.value]
}

// 关闭模态框
const closeSmartCreateModal = () => {
    showSmartCreateModal.value = false
    resetSmartCreateData()
}

// 重置智能创建数据
const resetSmartCreateData = () => {
    smartCreateData.value = {
        selectedCategory: '',
        selectedPosition: '',
        company: '',
        date: '',
        type: ''
    }
}

// 创建面试
const createInterview = () => {
    if (!canCreateInterview.value) {
        uni.showToast({
            title: '请填写完整信息',
            icon: 'none'
        })
        return
    }
    
    const newInterview = {
        id: Date.now().toString(),
        company: smartCreateData.value.company || getSmartCompany(smartCreateData.value.selectedPosition),
        position: smartCreateData.value.selectedPosition,
        date: smartCreateData.value.date,
        type: smartCreateData.value.type,
        status: 'pending',
        interviewer: getSmartInterviewer(),
        remark: '智能创建的面试记录'
    }
    
    interviews.value.unshift(newInterview)
    saveInterviews()
    
    uni.showToast({
        title: '面试创建成功',
        icon: 'success'
    })
    
    closeSmartCreateModal()
}

// 智能推荐公司
const getSmartCompany = (position) => {
    const companyMap = {
        '前端开发工程师': '字节跳动',
        '后端开发工程师': '阿里巴巴',
        '全栈开发工程师': '腾讯科技',
        '产品经理': '美团',
        'UI设计师': '网易',
        '运营专员': '京东'
    }
    return companyMap[position] || '知名互联网公司'
}

// 智能推荐面试官
const getSmartInterviewer = () => {
    const interviewers = ['张经理', '李总监', '王主管', '刘工程师']
    return interviewers[Math.floor(Math.random() * interviewers.length)]
}

// 保存面试记录
const saveInterviews = () => {
    try {
        uni.setStorageSync('my_interviews', interviews.value)
    } catch (error) {
        console.error('保存面试记录失败:', error)
    }
}

// 跳转到面试详情
const goToInterviewDetail = (interviewId) => {
    const interview = interviews.value.find(item => item.id === interviewId)
    if (interview) {
        uni.navigateTo({
            url: `/pages/interview-simulation/interview-simulation?position=${encodeURIComponent(interview.position)}&company=${encodeURIComponent(interview.company)}`
        })
    }
}

// 开始智能模拟
const startSimulation = (interview) => {
    uni.showModal({
        title: '智能模拟面试',
        content: `即将开始 ${interview.position} 职位的智能模拟面试`,
        success: (res) => {
            if (res.confirm) {
                uni.navigateTo({
                    url: `/pages/interview-simulation/interview-simulation?position=${encodeURIComponent(interview.position)}&company=${encodeURIComponent(interview.company)}`
                })
            }
        }
    })
}

// 编辑面试
const editInterview = (interview) => {
    uni.showModal({
        title: '编辑面试',
        content: '编辑功能开发中',
        showCancel: false
    })
}

// 删除面试
const deleteInterview = (interview) => {
    uni.showModal({
        title: '确认删除',
        content: `确定要删除 ${interview.company} 的面试记录吗？`,
        success: (res) => {
            if (res.confirm) {
                interviews.value = interviews.value.filter(item => item.id !== interview.id)
                saveInterviews()
                uni.showToast({
                    title: '删除成功',
                    icon: 'success'
                })
            }
        }
    })
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

/* 操作栏 */
.action-bar {
    margin-bottom: 30rpx;
}

.smart-create-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 24rpx 32rpx;
    border-radius: 16rpx;
    font-size: 28rpx;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 16rpx;
    width: 100%;
    justify-content: center;
}

.smart-create-btn.large {
    padding: 32rpx 40rpx;
    font-size: 32rpx;
}

.btn-icon {
    font-size: 32rpx;
}

.btn-text {
    flex: 1;
    text-align: center;
}

/* 面试列表 */
.cards-container {
    display: flex;
    flex-direction: column;
    gap: 30rpx;
}

.interview-card {
    background: white;
    border-radius: 20rpx;
    padding: 30rpx;
    border-left: 8rpx solid #e2e8f0;
    box-shadow: 0 4rpx 20rpx rgba(0, 0, 0, 0.08);
}

.interview-card.status-pending {
    border-left-color: #f59e0b;
}

.interview-card.status-completed {
    border-left-color: #10b981;
}

.interview-card.status-offer {
    border-left-color: #3b82f6;
}

.interview-card.status-rejected {
    border-left-color: #ef4444;
}

/* 卡片头部 */
.card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 20rpx;
}

.company-info {
    display: flex;
    align-items: center;
    gap: 20rpx;
}

.company-logo {
    width: 80rpx;
    height: 80rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 32rpx;
    font-weight: 600;
}

.company-details {
    display: flex;
    flex-direction: column;
}

.company-name {
    font-size: 32rpx;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 4rpx;
}

.position-name {
    font-size: 26rpx;
    color: #64748b;
}

.status-badge {
    padding: 8rpx 16rpx;
    border-radius: 20rpx;
    font-size: 24rpx;
    font-weight: 500;
}

.status-badge.status-pending {
    background: #fef3c7;
    color: #92400e;
}

.status-badge.status-completed {
    background: #d1fae5;
    color: #065f46;
}

.status-badge.status-offer {
    background: #dbeafe;
    color: #1e40af;
}

.status-badge.status-rejected {
    background: #fee2e2;
    color: #991b1b;
}

/* 卡片内容 */
.card-body {
    margin-bottom: 20rpx;
}

.info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12rpx;
}

.label {
    font-size: 26rpx;
    color: #64748b;
    font-weight: 500;
}

.value {
    font-size: 26rpx;
    color: #1e293b;
}

/* 卡片操作 */
.card-actions {
    display: flex;
    gap: 20rpx;
}

.action-btn {
    flex: 1;
    padding: 16rpx 24rpx;
    border: 2rpx solid #e2e8f0;
    border-radius: 12rpx;
    background: white;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8rpx;
    font-size: 24rpx;
}

.action-btn.simulate {
    border-color: #3b82f6;
    color: #3b82f6;
}

.action-btn.edit {
    border-color: #10b981;
    color: #10b981;
}

.action-btn.delete {
    border-color: #ef4444;
    color: #ef4444;
}

.action-icon {
    font-size: 24rpx;
}

.action-text {
    font-size: 24rpx;
}

/* 空状态 */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 0;
    text-align: center;
}

.empty-icon {
    font-size: 120rpx;
    margin-bottom: 30rpx;
    opacity: 0.5;
}

.empty-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 10rpx;
}

.empty-desc {
    font-size: 26rpx;
    color: #64748b;
    margin-bottom: 40rpx;
}

/* 模态框 */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.smart-create-modal {
    background: white;
    border-radius: 20rpx;
    width: 90vw;
    max-height: 80vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 30rpx;
    border-bottom: 2rpx solid #f1f5f9;
}

.modal-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1e293b;
}

.close-btn {
    background: none;
    border: none;
    font-size: 32rpx;
    color: #64748b;
    padding: 8rpx;
}

.modal-body {
    flex: 1;
    padding: 30rpx;
    overflow-y: auto;
}

/* 表单样式 */
.form-group {
    margin-bottom: 30rpx;
}

.form-label {
    font-size: 28rpx;
    font-weight: 600;
    color: #1e293b;
    margin-bottom: 16rpx;
    display: block;
}

.info-hint {
    font-size: 24rpx;
    color: #64748b;
    font-weight: normal;
}

/* 职业分类 */
.career-categories {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20rpx;
}

.category-card {
    background: #f8fafc;
    border: 2rpx solid #e2e8f0;
    border-radius: 16rpx;
    padding: 24rpx;
    text-align: center;
    transition: all 0.3s ease;
}

.category-card.selected {
    background: #1a237e;
    border-color: #1a237e;
    color: white;
}

.category-icon {
    font-size: 40rpx;
    margin-bottom: 8rpx;
}

.category-name {
    font-size: 26rpx;
    font-weight: 600;
    margin-bottom: 4rpx;
}

.category-count {
    font-size: 22rpx;
    opacity: 0.7;
}

/* 选择器样式 */
.form-picker {
    width: 100%;
}

.picker-display {
    background: #f8fafc;
    border: 2rpx solid #e2e8f0;
    border-radius: 12rpx;
    padding: 20rpx;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 26rpx;
}

.picker-arrow {
    color: #64748b;
    font-size: 20rpx;
}

/* 输入框样式 */
.form-input {
    width: 100%;
    background: #f8fafc;
    border: 2rpx solid #e2e8f0;
    border-radius: 12rpx;
    padding: 20rpx;
    font-size: 26rpx;
}

/* 模态框底部 */
.modal-footer {
    display: flex;
    gap: 20rpx;
    padding: 30rpx;
    border-top: 2rpx solid #f1f5f9;
}

.btn-cancel {
    flex: 1;
    background: #f1f5f9;
    border: none;
    padding: 24rpx;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #64748b;
}

.btn-confirm {
    flex: 1;
    background: #1a237e;
    border: none;
    padding: 24rpx;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: white;
}

.btn-confirm:disabled {
    background: #cbd5e1;
    color: #64748b;
}
</style>