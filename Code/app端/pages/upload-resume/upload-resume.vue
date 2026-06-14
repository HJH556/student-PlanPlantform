<template>
    <view class="container">
        <view class="upload-section">
            <view class="upload-area" @click="chooseFile">
                <text v-if="!selectedFile" class="upload-icon">📄</text>
                <text v-if="!selectedFile" class="upload-text">点击上传简历</text>
                <text v-if="!selectedFile" class="upload-desc">支持PDF、DOC、DOCX格式</text>
                <view v-if="selectedFile" class="file-info">
                    <text class="file-icon">📎</text>
                    <view class="file-detail">
                        <text class="file-name">{{ selectedFile.name }}</text>
                        <text class="file-size">{{ formatFileSize(selectedFile.size) }}</text>
                    </view>
                    <text class="file-remove" @click.stop="removeFile">✕</text>
                </view>
            </view>
        </view>
        
        <view class="tips-section">
            <view class="section-title">上传提示</view>
            <view class="tips-list">
                <view class="tip-item">
                    <text class="tip-icon">✅</text>
                    <text class="tip-text">建议使用最新版本的简历</text>
                </view>
                <view class="tip-item">
                    <text class="tip-icon">✅</text>
                    <text class="tip-text">确保简历包含完整的教育和工作经历</text>
                </view>
                <view class="tip-item">
                    <text class="tip-icon">✅</text>
                    <text class="tip-text">文件大小不超过10MB</text>
                </view>
                <view class="tip-item">
                    <text class="tip-icon">✅</text>
                    <text class="tip-text">上传后AI将自动分析你的简历</text>
                </view>
            </view>
        </view>
        
        <view class="action-section" v-if="selectedFile">
            <button 
                class="btn btn-primary"
                :class="{ loading: isUploading }"
                @click="uploadResume"
                :disabled="isUploading"
            >
                {{ isUploading ? '分析中...' : '开始分析' }}
            </button>
        </view>
    </view>
</template>

<script>
import appConfig from '@/config/index.js'
import { ResumeExtractor } from '@/utils/resumeExtractor.js'

export default {
    data() {
        return {
            selectedFile: null,
            isUploading: false
        }
    },
    
    methods: {
        chooseFile() {
            uni.chooseMessageFile({
                count: 1,
                type: 'file',
                extension: ['.pdf', '.doc', '.docx'],
                success: (res) => {
                    const file = res.tempFiles[0]
                    this.selectedFile = file
                },
                fail: (err) => {
                    console.error('选择文件失败:', err)
                    uni.showToast({
                        title: '选择文件失败',
                        icon: 'none'
                    })
                }
            })
        },
        
        removeFile() {
            this.selectedFile = null
        },
        
        formatFileSize(bytes) {
            if (bytes === 0) return '0 B'
            const k = 1024
            const sizes = ['B', 'KB', 'MB', 'GB']
            const i = Math.floor(Math.log(bytes) / Math.log(k))
            return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
        },
        
        async uploadResume() {
            if (!this.selectedFile) {
                uni.showToast({
                    title: '请先选择文件',
                    icon: 'none'
                })
                return
            }
            
            this.isUploading = true
            
            try {
                uni.showLoading({ title: '提取简历文本...' })
                
                // 第一步：提取简历文本内容
                console.log('开始提取简历文本内容...')
                const resumeText = await ResumeExtractor.extractTextFromFile(this.selectedFile)
                console.log('简历文本提取成功，长度:', resumeText.length)
                
                // 验证提取的文本是否有效
                if (!ResumeExtractor.validateResumeText(resumeText)) {
                    throw new Error('简历文本提取失败或内容无效，请检查文件格式和内容')
                }
                
                // 清理和格式化文本
                const cleanedText = ResumeExtractor.cleanResumeText(resumeText)
                console.log('简历文本清理完成，长度:', cleanedText.length)
                
                // 确保简历文本长度足够（后端要求至少50字符）
                if (cleanedText.length < 50) {
                    throw new Error('简历内容过短，请确保简历包含完整的个人信息、教育经历和工作经验')
                }
                
                // 第二步：直接调用智能体分析简历文本内容（跳过文件上传）
                uni.showLoading({ title: 'AI分析中...' })
                await this.analyzeResumeWithLangChain(cleanedText, null)
                
            } catch (err) {
                console.error('简历上传和分析失败:', err)
                uni.showToast({
                    title: err.message || '简历上传失败',
                    icon: 'none'
                })
                this.isUploading = false
                uni.hideLoading()
            }
        },
        
        // 上传文件到服务器
        uploadFileToServer(file) {
            return new Promise((resolve, reject) => {
                const uploadTask = uni.uploadFile({
                    url: appConfig.baseUrl + '/student/upload',
                    filePath: file.path,
                    name: 'file',
                    success: (res) => {
                        const data = JSON.parse(res.data)
                        if (res.statusCode === 200 && data.success) {
                            resolve(data.data)
                        } else {
                            reject(new Error(data.msg || '上传失败'))
                        }
                    },
                    fail: (err) => {
                        reject(new Error('上传失败: ' + err.errMsg))
                    }
                })
                
                uploadTask.onProgressUpdate((res) => {
                    console.log('上传进度', res.progress)
                })
            })
        },
        
        async analyzeResumeWithLangChain(resumeText, fileUrl) {
            try {
                // 获取当前用户ID
                const userStore = this.$store?.state?.user || {}
                const userId = userStore.user?.id || 'unknown'
                
                console.log('开始调用智能体分析简历，用户ID:', userId)
                console.log('简历文本前100字符:', resumeText.substring(0, 100))
                
                // 确保user_id是整数类型
                const userIdInt = parseInt(userId) || 1
                
                console.log('调用智能体API，用户ID:', userIdInt, '原始ID:', userId)
                
                // 尝试不同的数据发送方式
                console.log('尝试方法1：直接传递对象数据')
                
                const response = await new Promise((resolve, reject) => {
                    uni.request({
                        url: appConfig.baseUrl + '/langchain/analyze-resume',
                        method: 'POST',
                        header: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        data: {
                            resume_text: resumeText,
                            user_id: userIdInt.toString()
                        },
                        success: (res) => {
                            console.log('方法1响应状态:', res.statusCode)
                            console.log('方法1响应数据:', JSON.stringify(res.data))
                            resolve(res)
                        },
                        fail: (err) => {
                            console.error('方法1调用失败:', err)
                            
                            // 如果方法1失败，尝试方法2：使用JSON格式
                            console.log('尝试方法2：使用JSON格式')
                            uni.request({
                                url: appConfig.baseUrl + '/langchain/analyze-resume',
                                method: 'POST',
                                header: {
                                    'Content-Type': 'application/json'
                                },
                                data: {
                                    resume_text: resumeText,
                                    user_id: userIdInt
                                },
                                success: (res) => {
                                    console.log('方法2响应状态:', res.statusCode)
                                    console.log('方法2响应数据:', JSON.stringify(res.data))
                                    resolve(res)
                                },
                                fail: (err2) => {
                                    console.error('方法2调用失败:', err2)
                                    reject(new Error(`所有方法都失败: ${err.errMsg}, ${err2.errMsg}`))
                                }
                            })
                        }
                    })
                })
                
                console.log('智能体响应状态:', response.statusCode)
                console.log('智能体响应数据:', JSON.stringify(response.data))
                
                if (response.statusCode === 200 && response.data.success) {
                    const analysisData = response.data.data.analysis
                    console.log('简历分析成功，数据结构:', Object.keys(analysisData))
                    
                    uni.showToast({
                        title: '简历分析完成',
                        icon: 'success'
                    })
                    
                    // 保存分析结果到本地存储（使用用户ID隔离）
                    this.saveResumeAnalysis(analysisData, userId)
                    
                    setTimeout(() => {
                        uni.navigateBack()
                    }, 1500)
                } else {
                    // 显示详细的错误信息
                    const errorDetail = response.data.detail ? JSON.stringify(response.data.detail) : '未知错误'
                    console.log('详细错误信息:', errorDetail)
                    throw new Error(`分析失败 (${response.statusCode}): ${response.data.message || errorDetail}`)
                }
                
            } catch (err) {
                console.error('简历分析失败:', err)
                uni.showToast({
                    title: err.message || '简历分析失败',
                    icon: 'none'
                })
                
                // 即使分析失败，也保存分析状态
                const userStore = this.$store?.state?.user || {}
                const userId = userStore.user?.id || 'unknown'
                
                this.saveResumeAnalysis({
                    basic_info: { 状态: 'AI分析暂时不可用，请稍后重试' },
                    ability_assessment: {},
                    career_tendency: {},
                    match_analysis: {},
                    visualization_data: {}
                }, userId)
            } finally {
                this.isUploading = false
                uni.hideLoading()
            }
        },
        
        saveResumeAnalysis(analysisData, userId) {
            try {
                // 保存分析结果到本地存储（使用用户ID隔离）
                const storageKey = `resume_analysis_${userId}`
                uni.setStorageSync(storageKey, analysisData)
                console.log(`简历分析结果已保存到本地存储，用户ID: ${userId}, 存储键: ${storageKey}`)
                
                // 验证保存是否成功
                const savedData = uni.getStorageSync(storageKey)
                console.log('验证保存的数据结构:', Object.keys(savedData || {}))
            } catch (err) {
                console.error('保存分析结果失败:', err)
            }
        }
    }
}
</script>

<style scoped>
.container {
    min-height: 100vh;
    background: #f5f7fa;
    padding: 30rpx;
    padding-bottom: 140rpx;
}

.upload-section {
    background: white;
    border-radius: 24rpx;
    padding: 60rpx 30rpx;
}

.upload-area {
    border: 2rpx dashed #d1d5db;
    border-radius: 16rpx;
    padding: 80rpx 30rpx;
    text-align: center;
    transition: all 0.3s ease;
}

.upload-area:active {
    border-color: #667eea;
    background: #f8fafc;
}

.upload-icon {
    font-size: 100rpx;
    display: block;
    margin-bottom: 20rpx;
}

.upload-text {
    font-size: 32rpx;
    font-weight: 600;
    color: #333;
    display: block;
    margin-bottom: 12rpx;
}

.upload-desc {
    font-size: 24rpx;
    color: #999;
    display: block;
}

.file-info {
    display: flex;
    align-items: center;
    background: #f8fafc;
    border-radius: 12rpx;
    padding: 24rpx;
}

.file-icon {
    font-size: 48rpx;
    margin-right: 20rpx;
}

.file-detail {
    flex: 1;
    text-align: left;
}

.file-name {
    font-size: 28rpx;
    color: #333;
    display: block;
    margin-bottom: 8rpx;
}

.file-size {
    font-size: 24rpx;
    color: #999;
    display: block;
}

.file-remove {
    font-size: 32rpx;
    color: #f5576c;
    padding: 10rpx;
}

.tips-section {
    margin-top: 40rpx;
}

.section-title {
    font-size: 30rpx;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 24rpx;
}

.tips-list {
    background: white;
    border-radius: 24rpx;
    padding: 30rpx;
}

.tip-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 24rpx;
}

.tip-item:last-child {
    margin-bottom: 0;
}

.tip-icon {
    font-size: 28rpx;
    margin-right: 16rpx;
    margin-top: 4rpx;
}

.tip-text {
    flex: 1;
    font-size: 26rpx;
    color: #666;
    line-height: 1.6;
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
