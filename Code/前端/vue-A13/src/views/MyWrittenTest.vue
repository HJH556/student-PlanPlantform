<template>
  <Transition name="page-enter" appear>
    <div class="interview-prep">
      <!-- Page Header -->
      <section class="page-header">
        <div class="page-header-bg">
          <div class="page-header-pattern"></div>
        </div>
        <div class="page-header-particles">
          <div class="page-header-particle"></div>
          <div class="page-header-particle"></div>
          <div class="page-header-particle"></div>
          <div class="page-header-particle"></div>
          <div class="page-header-particle"></div>
          <div class="page-header-particle"></div>
          <div class="page-header-particle"></div>
          <div class="page-header-particle"></div>
        </div>
        <div class="page-header-energy"></div>
        <div class="page-header-content">
          <span class="page-badge">📚 面试准备</span>
          <h1 class="page-title">面试准备指南</h1>
          <p class="page-subtitle">全面了解面试所需准备，提升面试通过率</p>
        </div>
      </section>

      <!-- Preparation Categories -->
      <section class="prep-categories">
        <div class="container">
          <div class="category-tabs">
            <button 
              v-for="category in categories" 
              :key="category.id"
              class="category-tab"
              :class="{ active: activeCategory === category.id }"
              @click="activeCategory = category.id"
            >
              <span class="category-icon">{{ category.icon }}</span>
              <span class="category-name">{{ category.name }}</span>
            </button>
          </div>

          <div class="category-content">
            <div class="content-header">
              <h2>{{ getCurrentCategory()?.name || '' }}</h2>
              <p class="category-description">{{ getCurrentCategory()?.description || '' }}</p>
            </div>

            <div class="prep-items-grid">
              <div 
                v-for="(item, index) in getCurrentCategory()?.items || []" 
                :key="index"
                class="prep-card"
                @click="toggleItem(index)"
              >
                <div class="prep-card-header">
                  <div class="prep-icon">{{ item.icon }}</div>
                  <div class="prep-info">
                    <h3>{{ item.title }}</h3>
                    <p class="prep-desc">{{ item.shortDesc }}</p>
                  </div>
                  <span class="expand-icon" :class="{ 'rotated': expandedItems.has(index) }">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </span>
                </div>
                
                <div class="prep-card-content" :class="{ 'expanded': expandedItems.has(index) }">
                  <div class="prep-detail">
                    <h4>详细说明：</h4>
                    <p>{{ item.detail }}</p>
                  </div>
                  
                  <div v-if="item.tips && item.tips.length > 0" class="prep-tips">
                    <h4>准备建议：</h4>
                    <ul>
                      <li v-for="(tip, i) in item.tips" :key="i">{{ tip }}</li>
                    </ul>
                  </div>
                  
                  <div v-if="item.resources" class="prep-resources">
                    <h4>相关资源：</h4>
                    <div class="resource-tags">
                      <span v-for="(resource, i) in item.resources" :key="i" class="resource-tag">{{ resource }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Quick Tips Section -->
      <section class="quick-tips">
        <div class="container">
          <h2>💡 面试小贴士</h2>
          <div class="tips-grid">
            <div class="tip-card">
              <div class="tip-icon">⏰</div>
              <h3>提前到达</h3>
              <p>提前 10-15 分钟到达面试地点，展现您的时间观念和重视程度</p>
            </div>
            <div class="tip-card">
              <div class="tip-icon">👔</div>
              <h3>着装得体</h3>
              <p>根据公司文化选择合适的着装，保持整洁专业的形象</p>
            </div>
            <div class="tip-card">
              <div class="tip-icon">📱</div>
              <h3>关闭手机</h3>
              <p>面试前将手机调至静音或关闭，避免干扰</p>
            </div>
            <div class="tip-card">
              <div class="tip-icon">🙏</div>
              <h3>礼貌待人</h3>
              <p>对每个人都保持礼貌，从前台到面试官</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Common Questions Preview -->
      <section class="common-questions">
        <div class="container">
          <h2>🎯 常见面试问题</h2>
          <p class="section-desc">这些问题在大多数面试中都会出现，提前准备好答案</p>
          <div class="questions-list">
            <div class="question-item">
              <div class="question-number">01</div>
              <div class="question-content">
                <h4>请做一个简单的自我介绍</h4>
                <p>建议时长：2-3 分钟，突出与职位相关的经验和技能</p>
              </div>
            </div>
            <div class="question-item">
              <div class="question-number">02</div>
              <div class="question-content">
                <h4>你为什么选择我们公司？</h4>
                <p>展示你对公司的了解和加入的诚意</p>
              </div>
            </div>
            <div class="question-item">
              <div class="question-number">03</div>
              <div class="question-content">
                <h4>你的优缺点是什么？</h4>
                <p>诚实回答，缺点要说明改进计划</p>
              </div>
            </div>
            <div class="question-item">
              <div class="question-number">04</div>
              <div class="question-content">
                <h4>你遇到过的最大挑战是什么？如何解决的？</h4>
                <p>用 STAR 法则（情境、任务、行动、结果）来组织答案</p>
              </div>
            </div>
            <div class="question-item">
              <div class="question-number">05</div>
              <div class="question-content">
                <h4>你的职业规划是什么？</h4>
                <p>展示你的上进心和与公司的长期发展意愿</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeCategory = ref('technical')
const expandedItems = ref(new Set<number>())

const categories = [
  {
    id: 'technical',
    name: '技术准备',
    icon: '💻',
    description: '技术面试是程序员面试的核心环节，需要充分准备专业知识和项目经验',
    items: [
      {
        icon: '📖',
        title: '复习基础知识',
        shortDesc: '巩固计算机基础、数据结构、算法等核心知识',
        detail: '技术面试通常会从基础知识开始，包括数据结构（数组、链表、树、图等）、算法（排序、查找、动态规划等）、操作系统、计算机网络、数据库等。建议系统性地复习这些核心知识点，确保能够清晰地解释概念并解决相关问题。',
        tips: [
          '制定复习计划，每天复习 1-2 个知识点',
          '做 LeetCode 或牛客网的编程练习题',
          '重点复习目标职位技术要求中提到的技能',
          '准备一些经典算法题的多种解法'
        ],
        resources: ['LeetCode', '牛客网', '《剑指 Offer》', '《程序员面试金典》']
      },
      {
        icon: '🚀',
        title: '准备项目经验',
        shortDesc: '深入理解自己的项目，能够清晰阐述技术选型和难点',
        detail: '面试官会深入了解你的项目经验。你需要准备 2-3 个代表性项目，能够清晰地说明项目背景、你的角色、技术选型原因、遇到的挑战和解决方案。最好能用数据量化你的贡献，比如性能提升了多少、用户增长了多少等。',
        tips: [
          '使用 STAR 法则准备项目介绍（情境、任务、行动、结果）',
          '准备项目的技术架构图',
          '思考项目中可以优化的地方',
          '准备可能被问到的技术问题'
        ],
        resources: ['项目文档', '代码仓库', '技术博客']
      },
      {
        icon: '🔧',
        title: '熟悉技术栈',
        shortDesc: '深入了解目标公司使用的技术栈',
        detail: '研究目标公司的技术栈，确保你对其核心技术有深入理解。如果不熟悉某些技术，至少要了解基本概念和使用场景。面试官可能会问及相关技术的问题，或者让你比较不同技术的优劣。',
        tips: [
          '查看公司官网和技术博客了解技术栈',
          '学习相关技术的官方文档',
          '准备技术对比问题的答案（如 Vue vs React）',
          '了解技术的最新发展和趋势'
        ],
        resources: ['官方文档', '技术社区', 'GitHub 项目']
      },
      {
        icon: '💡',
        title: '编程题练习',
        shortDesc: '保持手感，提高解题速度和准确率',
        detail: '很多技术面试会包含现场编程环节。建议每天保持一定的编程练习量，熟悉常用数据结构的实现和常见算法的应用。练习时要注意代码规范、边界条件和时间复杂度。',
        tips: [
          '每天至少做 2-3 道编程题',
          '限时练习，模拟面试环境',
          '总结解题思路和套路',
          '重视代码质量和注释'
        ],
        resources: ['LeetCode Hot 100', '剑指 Offer', '公司面经题库']
      }
    ]
  },
  {
    id: 'behavioral',
    name: '行为面试',
    icon: '',
    description: '行为面试考察你的软技能、沟通能力和文化匹配度',
    items: [
      {
        icon: '',
        title: '准备自我介绍',
        shortDesc: '2-3 分钟的精炼自我介绍，突出亮点',
        detail: '自我介绍是面试的第一个环节，好的开始很重要。准备 1 分钟和 3 分钟两个版本，内容包括：基本信息、教育背景、工作经历、项目经验、技能特长、求职意向。要突出与应聘职位相关的优势和成就。',
        tips: [
          '开头简洁明了，介绍姓名和背景',
          '重点突出与职位匹配的经验',
          '用具体数据和成果支撑',
          '结尾表达对该职位的兴趣'
        ],
        resources: ['自我介绍模板', '优秀案例']
      },
      {
        icon: '🎯',
        title: '准备常见问题',
        shortDesc: '准备行为面试的标准答案',
        detail: '行为面试问题通常围绕领导力、团队合作、解决问题、抗压能力等方面。准备一些通用故事，可以灵活应对不同类型的问题。使用 STAR 法则组织答案，让回答更有逻辑性和说服力。',
        tips: [
          '准备 5-8 个通用故事',
          '每个故事突出不同能力',
          '用数据量化成果',
          '练习自然流畅地表达'
        ],
        resources: ['常见行为面试问题清单', 'STAR 法则指南']
      },
      {
        icon: '❓',
        title: '准备提问环节',
        shortDesc: '准备 3-5 个有深度的问题',
        detail: '面试结束前，面试官通常会问"你有什么问题吗？"。这是展示你思考深度和对职位兴趣的好机会。准备一些关于团队、项目、技术、发展等方面的问题，避免问薪资、加班等敏感话题。',
        tips: [
          '准备技术相关问题（如技术栈、架构）',
          '准备团队相关问题（如团队规模、协作方式）',
          '准备发展相关问题（如晋升机制、培训）',
          '根据面试官角色调整问题'
        ],
        resources: ['面试提问清单']
      }
    ]
  },
  {
    id: 'company',
    name: '公司调研',
    icon: '🏢',
    description: '了解目标公司，展现你的诚意和匹配度',
    items: [
      {
        icon: '📊',
        title: '了解公司业务',
        shortDesc: '熟悉公司的主营业务和产品',
        detail: '深入了解公司的业务范围、主要产品或服务、目标客户、商业模式等。这不仅能帮助你在面试中更好地回答问题，也能让面试官感受到你的诚意和热情。',
        tips: [
          '浏览公司官网，了解产品介绍',
          '查看公司年报或融资信息',
          '了解公司在行业中的地位',
          '关注公司最新动态和新闻'
        ],
        resources: ['公司官网', '天眼查', 'IT 桔子', '36 氪']
      },
      {
        icon: '🌟',
        title: '了解公司文化',
        shortDesc: '理解公司的价值观和工作氛围',
        detail: '每个公司都有独特的文化和价值观。了解这些信息可以帮助你判断是否适合这家公司，也能在面试中展现你的匹配度。可以通过官网、社交媒体、员工评价等渠道了解。',
        tips: [
          '查看公司官网的文化价值观页面',
          '阅读员工在脉脉、知乎的评价',
          '关注公司公众号和社交媒体',
          '了解公司的工作节奏和氛围'
        ],
        resources: ['公司官网', '脉脉', '知乎', 'Glassdoor']
      },
      {
        icon: '👥',
        title: '了解面试团队',
        shortDesc: '如果可能，了解面试官的背景',
        detail: '如果提前知道面试官的信息，可以查看他们的 LinkedIn、GitHub 或个人博客，了解他们的技术背景和研究方向。这有助于你在面试中找到共同话题，建立良好的沟通。',
        tips: [
          '查看面试官的技术博客',
          '了解面试官的研究方向',
          '准备相关的技术话题',
          '但不要刻意讨好'
        ],
        resources: ['LinkedIn', 'GitHub', '技术博客']
      }
    ]
  },
  {
    id: 'logistics',
    name: '后勤准备',
    icon: '🎒',
    description: '细节决定成败，做好后勤保障',
    items: [
      {
        icon: '📄',
        title: '准备简历和材料',
        shortDesc: '打印多份简历和相关证书',
        detail: '即使是线上投递的简历，也要准备纸质版。建议打印 3-5 份，放在文件夹中保持平整。如果有作品集、证书、推荐信等材料，也可以一并准备。',
        tips: [
          '使用质量好的纸张打印',
          '检查简历是否有错别字',
          '准备作品集或项目展示',
          '带上笔和笔记本'
        ],
        resources: ['简历模板', '作品集模板']
      },
      {
        icon: '👔',
        title: '准备面试服装',
        shortDesc: '根据公司文化选择合适的着装',
        detail: '着装要符合公司文化和职位要求。互联网公司可以商务休闲，金融、咨询等正式场合需要正装。无论什么风格，都要保持整洁、得体。',
        tips: [
          '提前一天准备好服装',
          '检查衣物是否干净平整',
          '避免过于花哨的配饰',
          '注意个人卫生和形象'
        ],
        resources: []
      },
      {
        icon: '🛤️',
        title: '规划路线时间',
        shortDesc: '提前踩点或测试设备',
        detail: '如果是现场面试，提前查好路线，考虑交通拥堵等因素，预留充足时间。如果是视频面试，提前测试网络、摄像头、麦克风等设备，确保面试顺利进行。',
        tips: [
          '现场面试提前 1-2 天踩点',
          '面试当天提前 30 分钟出发',
          '视频面试提前 30 分钟测试设备',
          '准备备用方案（如手机热点）'
        ],
        resources: ['地图 APP', '设备测试清单']
      }
    ]
  }
]

const getCurrentCategory = () => {
  return categories.find(cat => cat.id === activeCategory.value) || categories[0]
}

const toggleItem = (index: number) => {
  const newSet = new Set(expandedItems.value)
  if (newSet.has(index)) {
    newSet.delete(index)
  } else {
    newSet.add(index)
  }
  expandedItems.value = newSet
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.interview-prep {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding-bottom: 4rem;
}

/* Page Header */
.page-header {
  position: relative;
  background: linear-gradient(135deg, #1a237e 0%, #283593 100%);
  color: white;
  padding: 4rem 2rem 5rem;
  overflow: hidden;
}

.page-header-bg {
  position: absolute;
  inset: 0;
  opacity: 0.1;
}

.page-header-pattern {
  width: 100%;
  height: 100%;
  background-image: radial-gradient(circle, white 1px, transparent 1px);
  background-size: 30px 30px;
}

.page-header-particles {
  position: absolute;
  inset: 0;
}

.page-header-particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  animation: float 6s infinite ease-in-out;
}

.page-header-particle:nth-child(1) { left: 10%; animation-delay: 0s; }
.page-header-particle:nth-child(2) { left: 20%; animation-delay: 1s; }
.page-header-particle:nth-child(3) { left: 30%; animation-delay: 2s; }
.page-header-particle:nth-child(4) { left: 50%; animation-delay: 3s; }
.page-header-particle:nth-child(5) { left: 60%; animation-delay: 4s; }
.page-header-particle:nth-child(6) { left: 70%; animation-delay: 5s; }
.page-header-particle:nth-child(7) { left: 80%; animation-delay: 6s; }
.page-header-particle:nth-child(8) { left: 90%; animation-delay: 7s; }

@keyframes float {
  0%, 100% { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: 1; }
  90% { opacity: 1; }
  100% { transform: translateY(-100vh) translateX(20px); opacity: 0; }
}

.page-header-energy {
  position: absolute;
  bottom: -50%;
  left: 50%;
  transform: translateX(-50%);
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
  animation: pulse 4s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.5; }
  50% { transform: translateX(-50%) scale(1.1); opacity: 0.8; }
}

.page-header-content {
  position: relative;
  z-index: 1;
  text-align: center;
}

.page-badge {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 0.875rem;
  margin-bottom: 1rem;
  backdrop-filter: blur(10px);
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
}

.page-subtitle {
  font-size: 1.125rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Category Tabs */
.prep-categories {
  margin-top: -3rem;
  position: relative;
  z-index: 10;
}

.category-tabs {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.category-tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: white;
  border: 2px solid transparent;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 500;
  color: #666;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.category-tab:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.category-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-color: transparent;
}

.category-icon {
  font-size: 1.25rem;
}

/* Category Content */
.category-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.content-header {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.content-header h2 {
  font-size: 1.75rem;
  color: #1a237e;
  margin-bottom: 0.5rem;
}

.category-description {
  color: #666;
  font-size: 1rem;
  line-height: 1.6;
}

/* Prep Items Grid */
.prep-items-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.prep-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.prep-card:hover {
  background: white;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  border-color: #667eea;
}

.prep-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.prep-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.prep-info {
  flex: 1;
}

.prep-info h3 {
  font-size: 1.125rem;
  color: #1a237e;
  margin-bottom: 0.25rem;
}

.prep-desc {
  color: #666;
  font-size: 0.875rem;
}

.expand-icon {
  color: #999;
  transition: transform 0.3s ease;
}

.expand-icon.rotated {
  transform: rotate(180deg);
}

.prep-card-content {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.5s ease;
  margin-top: 0;
}

.prep-card-content.expanded {
  max-height: 1000px;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.prep-detail h4,
.prep-tips h4,
.prep-resources h4 {
  font-size: 1rem;
  color: #1a237e;
  margin-bottom: 0.75rem;
}

.prep-detail p {
  color: #333;
  line-height: 1.8;
  margin-bottom: 1.5rem;
}

.prep-tips ul {
  list-style: none;
  margin-bottom: 1.5rem;
}

.prep-tips li {
  padding: 0.5rem 0;
  padding-left: 1.5rem;
  position: relative;
  color: #666;
  line-height: 1.6;
}

.prep-tips li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #4caf50;
  font-weight: bold;
}

.prep-resources {
  margin-top: 1rem;
}

.resource-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.resource-tag {
  padding: 0.375rem 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Quick Tips Section */
.quick-tips {
  margin-top: 4rem;
}

.quick-tips h2,
.common-questions h2 {
  font-size: 2rem;
  color: #1a237e;
  text-align: center;
  margin-bottom: 0.5rem;
}

.quick-tips .section-desc,
.common-questions .section-desc {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}

.tips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.tip-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.tip-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.tip-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.tip-card h3 {
  font-size: 1.25rem;
  color: #1a237e;
  margin-bottom: 0.75rem;
}

.tip-card p {
  color: #666;
  line-height: 1.6;
}

/* Common Questions */
.common-questions {
  margin-top: 4rem;
}

.questions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.question-item {
  display: flex;
  gap: 1.5rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.question-item:hover {
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}

.question-number {
  font-size: 2rem;
  font-weight: 700;
  color: #667eea;
  opacity: 0.3;
  flex-shrink: 0;
}

.question-content h4 {
  font-size: 1.125rem;
  color: #1a237e;
  margin-bottom: 0.5rem;
}

.question-content p {
  color: #666;
  font-size: 0.875rem;
  line-height: 1.6;
}

/* Responsive */
@media (max-width: 768px) {
  .page-title {
    font-size: 2rem;
  }
  
  .category-tabs {
    flex-direction: column;
  }
  
  .category-tab {
    width: 100%;
    justify-content: center;
  }
  
  .prep-card-header {
    flex-direction: column;
    text-align: center;
  }
  
  .question-item {
    flex-direction: column;
    gap: 1rem;
  }
  
  .question-number {
    text-align: center;
  }
}
</style>
