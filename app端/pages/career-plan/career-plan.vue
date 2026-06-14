<template>
    <view class="container">
        <view class="header-card">
            <text class="header-title">🎯 职业规划</text>
            <text class="header-desc">基于AI智能分析，为你定制专属职业发展路径</text>
        </view>
        
        <view class="section">
            <view class="section-title">推荐路径</view>
            <view class="path-list">
                <view class="path-card" v-for="(path, index) in paths" :key="index">
                    <view class="path-header">
                        <text class="path-name">{{ path.name }}</text>
                        <view class="path-match" :style="{ background: path.color }">
                            {{ path.match }}
                        </view>
                    </view>
                    <text class="path-desc">{{ path.desc }}</text>
                    <view class="path-steps">
                        <view v-for="(step, i) in path.steps" :key="i" class="step-tag">
                            {{ step }}
                        </view>
                    </view>
                </view>
            </view>
        </view>
        
        <view class="section">
            <view class="section-title">发展阶段</view>
            <view class="stage-list">
                <view class="stage-item" v-for="(stage, index) in stages" :key="index">
                    <view class="stage-dot"></view>
                    <view class="stage-content">
                        <text class="stage-title">{{ stage.title }}</text>
                        <text class="stage-time">{{ stage.time }}</text>
                        <text class="stage-desc">{{ stage.desc }}</text>
                    </view>
                </view>
            </view>
        </view>
        
        <view class="section">
            <view class="section-title">技能提升建议</view>
            <view class="skill-list">
                <view class="skill-card" v-for="(skill, index) in skills" :key="index">
                    <text class="skill-name">{{ skill.name }}</text>
                    <view class="skill-bar">
                        <view class="skill-progress" :style="{ width: skill.progress + '%', background: skill.color }"></view>
                    </view>
                    <text class="skill-percent">{{ skill.progress }}%</text>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
export default {
    data() {
        return {
            resumeAnalysis: null,
            paths: [],
            stages: [],
            skills: []
        }
    },
    
    onLoad() {
        this.loadResumeAnalysis()
    },
    
    onShow() {
        this.loadResumeAnalysis()
    },
    
    methods: {
        loadResumeAnalysis() {
            try {
                const analysisData = uni.getStorageSync('resume_analysis')
                if (analysisData) {
                    this.resumeAnalysis = analysisData
                    console.log('加载简历分析结果:', this.resumeAnalysis)
                    this.generateCareerPlan()
                }
            } catch (err) {
                console.error('加载简历分析结果失败:', err)
                // 如果没有简历分析数据，使用默认数据
                this.setDefaultData()
            }
        },
        
        generateCareerPlan() {
            if (!this.resumeAnalysis) {
                this.setDefaultData()
                return
            }
            
            // 基于简历分析结果生成职业规划
            const careerTendency = this.resumeAnalysis.career_tendency || {}
            const matchAnalysis = this.resumeAnalysis.match_analysis || {}
            const abilityAssessment = this.resumeAnalysis.ability_assessment || {}
            
            // 生成推荐路径
            this.paths = this.generatePaths(careerTendency, matchAnalysis)
            
            // 生成发展阶段
            this.stages = this.generateStages()
            
            // 生成技能提升建议
            this.skills = this.generateSkills(abilityAssessment)
        },
        
        generatePaths(careerTendency, matchAnalysis) {
            const paths = []
            
            // 基于职业倾向生成推荐路径
            if (careerTendency['期望岗位']) {
                const positions = careerTendency['期望岗位'].split('、')
                positions.forEach((position, index) => {
                    paths.push({
                        name: position.trim(),
                        match: `${85 + index * 5}% 匹配`,
                        desc: `基于你的${careerTendency['兴趣领域'] || '技术背景'}，${position}是最适合你的发展方向`,
                        color: index === 0 ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 
                               index === 1 ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' :
                               'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                        steps: ['入门阶段', '成长阶段', '高级阶段', '专家阶段']
                    })
                })
            }
            
            // 如果没有数据，使用默认路径
            if (paths.length === 0) {
                paths.push({
                    name: '技术开发工程师',
                    match: '90% 匹配',
                    desc: '基于你的技术背景，技术开发是最适合你的发展方向',
                    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    steps: ['初级开发', '中级开发', '高级开发', '技术专家']
                })
            }
            
            return paths
        },
        
        generateStages() {
            return [
                {
                    title: '入门阶段',
                    time: '0-6个月',
                    desc: '掌握基础技能，完成基础项目'
                },
                {
                    title: '成长阶段',
                    time: '6-18个月',
                    desc: '深入学习核心技术，参与复杂项目'
                },
                {
                    title: '成熟阶段',
                    time: '18-36个月',
                    desc: '具备独立解决问题能力，成为技术骨干'
                }
            ]
        },
        
        generateSkills(abilityAssessment) {
            const skills = []
            
            // 基于能力评估生成技能提升建议
            if (abilityAssessment['技术能力']) {
                skills.push({ name: '核心技术', progress: 85, color: '#667eea' })
            }
            if (abilityAssessment['沟通能力']) {
                skills.push({ name: '沟通表达', progress: 70, color: '#61dafb' })
            }
            if (abilityAssessment['团队协作']) {
                skills.push({ name: '团队协作', progress: 80, color: '#f7df1e' })
            }
            if (abilityAssessment['学习能力']) {
                skills.push({ name: '学习能力', progress: 90, color: '#3178c6' })
            }
            
            // 如果没有数据，使用默认技能
            if (skills.length === 0) {
                skills.push(
                    { name: '技术能力', progress: 85, color: '#667eea' },
                    { name: '沟通能力', progress: 70, color: '#61dafb' },
                    { name: '团队协作', progress: 80, color: '#f7df1e' },
                    { name: '学习能力', progress: 90, color: '#3178c6' }
                )
            }
            
            return skills
        },
        
        setDefaultData() {
            this.paths = [
                {
                    name: '技术开发工程师',
                    match: '90% 匹配',
                    desc: '基于你的技术背景，技术开发是最适合你的发展方向',
                    color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    steps: ['初级开发', '中级开发', '高级开发', '技术专家']
                }
            ]
            this.stages = this.generateStages()
            this.skills = [
                { name: '技术能力', progress: 85, color: '#667eea' },
                { name: '沟通能力', progress: 70, color: '#61dafb' },
                { name: '团队协作', progress: 80, color: '#f7df1e' },
                { name: '学习能力', progress: 90, color: '#3178c6' }
            ]
        }
    }
}
</script>

<style scoped>
.container {
    min-height: 100vh;
    background: #f5f7fa;
    padding-bottom: 40rpx;
}

.header-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin: 30rpx;
    padding: 50rpx 40rpx;
    border-radius: 24rpx;
    color: white;
    box-shadow: 0 10rpx 30rpx rgba(102, 126, 234, 0.3);
}

.header-title {
    font-size: 36rpx;
    font-weight: 700;
    display: block;
    margin-bottom: 12rpx;
}

.header-desc {
    font-size: 26rpx;
    opacity: 0.9;
    display: block;
}

.section {
    padding: 0 30rpx;
    margin-top: 40rpx;
}

.section-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 30rpx;
}

.path-list {
    display: flex;
    flex-direction: column;
    gap: 24rpx;
}

.path-card {
    background: white;
    border-radius: 20rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.path-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;
}

.path-name {
    font-size: 32rpx;
    font-weight: 600;
    color: #1a1a1a;
}

.path-match {
    font-size: 24rpx;
    color: white;
    padding: 8rpx 20rpx;
    border-radius: 30rpx;
    font-weight: 500;
}

.path-desc {
    font-size: 26rpx;
    color: #666;
    display: block;
    margin-bottom: 20rpx;
}

.path-steps {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx;
}

.step-tag {
    font-size: 22rpx;
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
    padding: 8rpx 20rpx;
    border-radius: 30rpx;
}

.stage-list {
    background: white;
    border-radius: 24rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.stage-item {
    display: flex;
    padding: 30rpx 0;
    border-bottom: 1rpx solid #f0f0f0;
}

.stage-item:last-child {
    border-bottom: none;
}

.stage-dot {
    width: 20rpx;
    height: 20rpx;
    border-radius: 10rpx;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    margin-right: 30rpx;
    margin-top: 8rpx;
    flex-shrink: 0;
}

.stage-content {
    flex: 1;
}

.stage-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #1a1a1a;
    display: block;
    margin-bottom: 8rpx;
}

.stage-time {
    font-size: 24rpx;
    color: #667eea;
    display: block;
    margin-bottom: 8rpx;
}

.stage-desc {
    font-size: 24rpx;
    color: #999;
    display: block;
}

.skill-list {
    background: white;
    border-radius: 24rpx;
    padding: 30rpx;
    box-shadow: 0 4rpx 16rpx rgba(0, 0, 0, 0.06);
}

.skill-card {
    display: flex;
    align-items: center;
    padding: 20rpx 0;
}

.skill-name {
    width: 160rpx;
    font-size: 28rpx;
    color: #333;
    flex-shrink: 0;
}

.skill-bar {
    flex: 1;
    height: 12rpx;
    background: #f0f0f0;
    border-radius: 6rpx;
    overflow: hidden;
    margin: 0 20rpx;
}

.skill-progress {
    height: 100%;
    border-radius: 6rpx;
    transition: width 0.5s ease;
}

.skill-percent {
    width: 80rpx;
    font-size: 24rpx;
    color: #666;
    text-align: right;
    flex-shrink: 0;
}
</style>
