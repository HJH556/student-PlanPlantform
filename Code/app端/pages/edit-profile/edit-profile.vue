<template>
    <view class="container">
        <view class="form-section">
            <view class="form-group">
                <text class="form-label">姓名</text>
                <input 
                    v-model="form.name"
                    class="form-input"
                    placeholder="请输入姓名"
                />
            </view>
            
            <view class="form-group">
                <text class="form-label">性别</text>
                <view class="gender-select">
                    <view 
                        v-for="item in genderOptions" 
                        :key="item.value"
                        class="gender-option"
                        :class="{ active: form.gender === item.value }"
                        @click="form.gender = item.value"
                    >
                        <text>{{ item.label }}</text>
                    </view>
                </view>
            </view>
            
            <view class="form-group">
                <text class="form-label">手机号</text>
                <input 
                    v-model="form.phone"
                    class="form-input"
                    type="number"
                    placeholder="请输入手机号"
                    maxlength="11"
                />
            </view>
            
            <view class="form-group">
                <text class="form-label">邮箱</text>
                <input 
                    v-model="form.email"
                    class="form-input"
                    type="email"
                    placeholder="请输入邮箱"
                />
            </view>
            
            <view class="form-group">
                <text class="form-label">学校</text>
                <input 
                    v-model="form.school"
                    class="form-input"
                    placeholder="请输入学校"
                />
            </view>
            
            <view class="form-group">
                <text class="form-label">专业</text>
                <input 
                    v-model="form.major"
                    class="form-input"
                    placeholder="请输入专业"
                />
            </view>
            
            <view class="form-group">
                <text class="form-label">学历</text>
                <picker 
                    mode="selector" 
                    :range="educationOptions" 
                    @change="onEducationChange"
                >
                    <view class="picker">
                        <text :class="{ placeholder: !form.education }">
                            {{ form.education || '请选择学历' }}
                        </text>
                        <text class="picker-arrow">›</text>
                    </view>
                </picker>
            </view>
            
            <view class="form-group">
                <text class="form-label">毕业年份</text>
                <picker 
                    mode="selector" 
                    :range="yearOptions" 
                    @change="onYearChange"
                >
                    <view class="picker">
                        <text :class="{ placeholder: !form.graduationYear }">
                            {{ form.graduationYear || '请选择毕业年份' }}
                        </text>
                        <text class="picker-arrow">›</text>
                    </view>
                </picker>
            </view>
            
            <view class="form-group">
                <text class="form-label">个人简介</text>
                <textarea 
                    v-model="form.bio"
                    class="form-textarea"
                    placeholder="请简单介绍一下自己..."
                    :maxlength="500"
                />
                <text class="char-count">{{ form.bio.length }}/500</text>
            </view>
        </view>
        
        <view class="action-section">
            <button 
                class="btn btn-primary"
                :class="{ loading: isSaving }"
                @click="saveProfile"
                :disabled="isSaving"
            >
                {{ isSaving ? '保存中...' : '保存' }}
            </button>
        </view>
    </view>
</template>

<script>
import userApi from '@/api/user.js'

export default {
    data() {
        const currentYear = new Date().getFullYear()
        const yearOptions = []
        for (let i = currentYear; i <= currentYear + 10; i++) {
            yearOptions.push(i + '年')
        }
        
        return {
            isSaving: false,
            genderOptions: [
                { label: '男', value: 'male' },
                { label: '女', value: 'female' }
            ],
            educationOptions: ['专科', '本科', '硕士', '博士'],
            yearOptions,
            form: {
                name: '',
                gender: '',
                phone: '',
                email: '',
                school: '',
                major: '',
                education: '',
                graduationYear: '',
                bio: ''
            }
        }
    },
    
    onLoad() {
        this.loadProfile()
    },
    
    methods: {
        async loadProfile() {
            try {
                uni.showLoading({ title: '加载中...' })
                const res = await userApi.getUserInfo()
                if (res && res.data) {
                    this.form = { ...this.form, ...res.data }
                }
            } catch (err) {
                console.error('加载个人信息失败:', err)
            } finally {
                uni.hideLoading()
            }
        },
        
        onEducationChange(e) {
            this.form.education = this.educationOptions[e.detail.value]
        },
        
        onYearChange(e) {
            this.form.graduationYear = this.yearOptions[e.detail.value]
        },
        
        async saveProfile() {
            if (!this.form.name) {
                uni.showToast({
                    title: '请输入姓名',
                    icon: 'none'
                })
                return
            }
            
            this.isSaving = true
            
            try {
                await userApi.updateUserInfo(this.form)
                uni.showToast({
                    title: '保存成功',
                    icon: 'success'
                })
                setTimeout(() => {
                    uni.navigateBack()
                }, 1500)
            } catch (err) {
                console.error(err)
                uni.showToast({
                    title: '保存失败',
                    icon: 'none'
                })
            } finally {
                this.isSaving = false
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

.form-section {
    padding: 30rpx;
}

.form-group {
    background: white;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
}

.form-label {
    font-size: 28rpx;
    font-weight: 500;
    color: #333;
    display: block;
    margin-bottom: 20rpx;
}

.form-input {
    width: 100%;
    font-size: 28rpx;
    color: #333;
}

.gender-select {
    display: flex;
    gap: 20rpx;
}

.gender-option {
    flex: 1;
    text-align: center;
    padding: 20rpx;
    border: 2rpx solid #e5e7eb;
    border-radius: 12rpx;
    font-size: 28rpx;
    color: #666;
    transition: all 0.3s ease;
}

.gender-option.active {
    border-color: #667eea;
    background: #f0f2ff;
    color: #667eea;
}

.picker {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10rpx 0;
}

.picker text {
    font-size: 28rpx;
    color: #333;
}

.picker .placeholder {
    color: #ccc;
}

.picker-arrow {
    font-size: 36rpx;
    color: #ccc;
}

.form-textarea {
    width: 100%;
    min-height: 200rpx;
    font-size: 28rpx;
    color: #333;
}

.char-count {
    text-align: right;
    font-size: 24rpx;
    color: #999;
    margin-top: 10rpx;
}

.action-section {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    padding: 20rpx 30rpx;
    padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
    border-top: 1rpx solid #e8e8e8;
}

.btn {
    width: 100%;
    padding: 28rpx;
    border-radius: 16rpx;
    font-size: 30rpx;
    font-weight: 600;
    border: none;
}

.btn-primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.btn:disabled {
    opacity: 0.6;
}
</style>
