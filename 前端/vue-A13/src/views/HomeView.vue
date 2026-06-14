<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useJobStore } from '../stores/job'
import { ref, onMounted, onUnmounted, computed } from 'vue'

const jobStore = useJobStore()
const isLoading = ref(true)

// 就业市场分析数据
const selectedCareer = ref('software')
const selectedChart = ref('salary') // 当前显示的图表类型: salary, demand, skills, prediction
const autoSwitchTimer = ref<number | null>(null) // 自动切换定时器
const isHovering = ref(false) // 是否鼠标悬停在图表上

const careers = ref([
  { value: 'software', label: '软件工程师' },
  { value: 'product', label: '产品经理' },
  { value: 'data', label: '数据分析师' },
  { value: 'design', label: '设计师' },
  { value: 'marketing', label: '市场营销' }
])

const marketData = ref({
  software: {
    salary: {
      2022: 15000,
      2023: 16500,
      2024: 18000,
      2025: 19500,
      2026: 21000
    },
    demand: {
      2022: 100000,
      2023: 120000,
      2024: 140000,
      2025: 160000,
      2026: 180000
    },
    skills: [
      { name: 'Python', value: 90 },
      { name: 'JavaScript', value: 85 },
      { name: 'React', value: 80 },
      { name: 'Node.js', value: 75 },
      { name: 'Java', value: 70 }
    ],
    prediction: '预计未来3年需求将增长30%，薪资涨幅约15%'
  },
  product: {
    salary: {
      2022: 16000,
      2023: 17500,
      2024: 19000,
      2025: 20500,
      2026: 22000
    },
    demand: {
      2022: 80000,
      2023: 95000,
      2024: 110000,
      2025: 125000,
      2026: 140000
    },
    skills: [
      { name: '产品规划', value: 95 },
      { name: '用户研究', value: 90 },
      { name: '数据分析', value: 85 },
      { name: '项目管理', value: 80 },
      { name: '沟通能力', value: 75 }
    ],
    prediction: '预计未来3年需求将增长25%，薪资涨幅约12%'
  },
  data: {
    salary: {
      2022: 14000,
      2023: 15500,
      2024: 17000,
      2025: 18500,
      2026: 20000
    },
    demand: {
      2022: 70000,
      2023: 90000,
      2024: 110000,
      2025: 130000,
      2026: 150000
    },
    skills: [
      { name: 'SQL', value: 95 },
      { name: 'Python', value: 90 },
      { name: 'Excel', value: 85 },
      { name: 'Tableau', value: 80 },
      { name: '统计学', value: 75 }
    ],
    prediction: '预计未来3年需求将增长40%，薪资涨幅约18%'
  },
  design: {
    salary: {
      2022: 13000,
      2023: 14000,
      2024: 15000,
      2025: 16000,
      2026: 17000
    },
    demand: {
      2022: 60000,
      2023: 70000,
      2024: 80000,
      2025: 90000,
      2026: 100000
    },
    skills: [
      { name: 'Figma', value: 90 },
      { name: 'UI设计', value: 85 },
      { name: 'UX设计', value: 80 },
      { name: '原型设计', value: 75 },
      { name: '动效设计', value: 70 }
    ],
    prediction: '预计未来3年需求将增长20%，薪资涨幅约10%'
  },
  marketing: {
    salary: {
      2022: 12000,
      2023: 13000,
      2024: 14000,
      2025: 15000,
      2026: 16000
    },
    demand: {
      2022: 90000,
      2023: 100000,
      2024: 110000,
      2025: 120000,
      2026: 130000
    },
    skills: [
      { name: '数字营销', value: 90 },
      { name: '内容创作', value: 85 },
      { name: '社交媒体', value: 80 },
      { name: '数据分析', value: 75 },
      { name: '品牌管理', value: 70 }
    ],
    prediction: '预计未来3年需求将增长15%，薪资涨幅约8%'
  }
})

const currentMarketData = computed(() => {
  return marketData.value[selectedCareer.value as keyof typeof marketData.value]
})

const salaryTrend = computed(() => {
  return Object.entries(currentMarketData.value.salary).map(([year, value]) => ({
    year,
    value
  }))
})

const demandTrend = computed(() => {
  return Object.entries(currentMarketData.value.demand).map(([year, value]) => ({
    year,
    value
  }))
})

// 计算薪资趋势的SVG点（小图）
const salaryTrendPoints = computed(() => {
  return salaryTrend.value.map((item, index) => {
    const x = 40 + (index * (240 / (salaryTrend.value.length - 1)));
    const y = 180 - ((item.value / 25000) * 160);
    return `${x},${y}`;
  }).join(' ');
});

// 计算薪资趋势的SVG点（大图）
const salaryTrendPointsLarge = computed(() => {
  return salaryTrend.value.map((item, index) => {
    const x = 80 + (index * (480 / (salaryTrend.value.length - 1)));
    const y = 360 - ((item.value / 25000) * 320);
    return `${x},${y}`;
  }).join(' ');
});

// 计算需求趋势的SVG点（小图）
const demandTrendPoints = computed(() => {
  return demandTrend.value.map((item, index) => {
    const x = 40 + (index * (240 / (demandTrend.value.length - 1)));
    const y = 180 - ((item.value / 200000) * 160);
    return `${x},${y}`;
  }).join(' ');
});

// 计算需求趋势的SVG点（大图）
const demandTrendPointsLarge = computed(() => {
  return demandTrend.value.map((item, index) => {
    const x = 80 + (index * (480 / (demandTrend.value.length - 1)));
    const y = 360 - ((item.value / 200000) * 320);
    return `${x},${y}`;
  }).join(' ');
});

// 图表类型数组
const chartTypes = ['salary', 'demand', 'skills', 'prediction'];

// 自动切换图表
const startAutoSwitch = () => {
  if (autoSwitchTimer.value) {
    clearInterval(autoSwitchTimer.value);
  }
  
  autoSwitchTimer.value = window.setInterval(() => {
    if (!isHovering.value) {
      const currentIndex = chartTypes.indexOf(selectedChart.value);
      const nextIndex = (currentIndex + 1) % chartTypes.length;
      selectedChart.value = chartTypes[nextIndex] as 'salary' | 'demand' | 'skills' | 'prediction';
    }
  }, 3000); // 每3秒切换一次
};

// 停止自动切换
const stopAutoSwitch = () => {
  if (autoSwitchTimer.value) {
    clearInterval(autoSwitchTimer.value);
    autoSwitchTimer.value = null;
  }
};

onMounted(async () => {
  // 等待岗位数据加载完成
  if (jobStore.jobs.length === 0) {
    await jobStore.fetchJobs()
  }
  // 延迟一点时间，确保页面整体加载完成
  setTimeout(() => {
    isLoading.value = false
    // 启动自动切换
    startAutoSwitch()
  }, 500)
})

// 组件卸载时清除定时器
onUnmounted(() => {
  stopAutoSwitch()
})
</script>

<template>
  <div>
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>正在加载数据...</p>
    </div>
    <Transition v-else name="page-enter" appear>
      <div class="home">
        <!-- Page Header - Dark Blue Theme -->
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
            <div class="page-header-particle"></div>
            <div class="page-header-particle"></div>
          </div>
          <div class="page-header-energy"></div>
          <div class="page-header-content">
            <span class="page-badge">🏠 首页</span>
            <h1 class="page-title">智能职业规划平台</h1>
            <p class="page-subtitle">AI驱动的职业发展解决方案，助您开启成功职业生涯</p>
          </div>
        </section>

        <!-- Hero Actions -->
        <section class="hero-actions-section">
          <div class="container">
            <div class="hero-actions-content">
              <div class="hero-actions-text">
                <h2 class="hero-actions-title">为什么选择我们？</h2>
                <p class="hero-actions-desc">我们的智能职业规划平台通过AI技术，为您提供个性化的职业发展解决方案，帮助您在竞争激烈的就业市场中脱颖而出。</p>
              </div>
              <div class="hero-actions">
                <RouterLink to="/student-profile" class="btn-primary">
                  开始职业规划
                </RouterLink>
                <RouterLink to="/my-interview" class="btn-outline">
                  模拟面试
                </RouterLink>
              </div>
              <div class="hero-stats">
                <div class="stat-item">
                  <span class="stat-number">10,000+</span>
                  <span class="stat-label">用户</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">95%</span>
                  <span class="stat-label">满意度</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">80%</span>
                  <span class="stat-label">面试通过率提升</span>
                </div>
                <div class="stat-item">
                  <span class="stat-number">500+</span>
                  <span class="stat-label">合作企业</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 核心功能 Section -->
        <section class="core-features">
          <div class="container">
            <h2 class="section-title">核心功能</h2>
            <div class="features-grid">
              <!-- 左侧功能卡片 -->
              <div class="feature-cards">
                <div class="feature-row">
                  <RouterLink to="/student-profile" class="feature-card">
                    <div class="feature-icon purple">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </div>
                    <h3 class="feature-title">学生画像</h3>
                    <p class="feature-desc">创建您的职业画像，发现自身优势</p>
                  </RouterLink>
                  
                  <RouterLink to="/job-explore" class="feature-card">
                    <div class="feature-icon orange">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                      </svg>
                    </div>
                    <h3 class="feature-title">岗位探索</h3>
                    <p class="feature-desc">浏览最新岗位信息，了解市场趋势</p>
                  </RouterLink>
                </div>
                
                <div class="feature-row">
                  <RouterLink to="/career-plan" class="feature-card">
                    <div class="feature-icon blue">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                      </svg>
                    </div>
                    <h3 class="feature-title">职业规划</h3>
                    <p class="feature-desc">定制专属职业发展路径</p>
                  </RouterLink>
                  
                  <RouterLink to="/interview-questions" class="feature-card">
                    <div class="feature-icon green">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                        <line x1="6" y1="1" x2="6" y2="4"/>
                        <line x1="10" y1="1" x2="10" y2="4"/>
                        <line x1="14" y1="1" x2="14" y2="4"/>
                      </svg>
                    </div>
                    <h3 class="feature-title">面试问题</h3>
                    <p class="feature-desc">获取个性化面试问题和答案建议</p>
                  </RouterLink>
                </div>
                
                <div class="feature-row">
                  <RouterLink to="/my-interview" class="feature-card">
                    <div class="feature-icon pink">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 8h1a4 4 0 0 1 0 8h-1"/>
                        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/>
                        <line x1="6" y1="1" x2="6" y2="4"/>
                        <line x1="10" y1="1" x2="10" y2="4"/>
                        <line x1="14" y1="1" x2="14" y2="4"/>
                      </svg>
                    </div>
                    <h3 class="feature-title">我的面试</h3>
                    <p class="feature-desc">管理和记录您的面试过程</p>
                  </RouterLink>
                  
                  <RouterLink to="/my-written-test" class="feature-card">
                    <div class="feature-icon cyan">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14,2 14,8 20,8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                      </svg>
                    </div>
                    <h3 class="feature-title">面试准备</h3>
                    <p class="feature-desc">全面了解面试所需准备，提升面试通过率</p>
                  </RouterLink>
                </div>
              </div>
              
              <!-- 右侧功能说明 -->
              <div class="features-description">
                <div class="description-header">
                  <h3>功能亮点</h3>
                  <p>我们提供全方位的职业发展服务，从自我认知到面试准备</p>
                </div>
                <div class="description-list">
                  <div class="description-item">
                    <div class="desc-icon">🎯</div>
                    <div class="desc-content">
                      <h4>AI智能匹配</h4>
                      <p>基于您的个人特质，智能推荐最适合的职业方向</p>
                    </div>
                  </div>
                  <div class="description-item">
                    <div class="desc-icon">📊</div>
                    <div class="desc-content">
                      <h4>市场数据分析</h4>
                      <p>实时掌握行业趋势和薪资水平，做出明智决策</p>
                    </div>
                  </div>
                  <div class="description-item">
                    <div class="desc-icon">💼</div>
                    <div class="desc-content">
                      <h4>面试模拟</h4>
                      <p>真实模拟面试场景，提升面试技巧和信心</p>
                    </div>
                  </div>
                  <div class="description-item">
                    <div class="desc-icon">📈</div>
                    <div class="desc-content">
                      <h4>职业规划</h4>
                      <p>制定长期职业发展计划，实现职业目标</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 就业市场分析 Section -->
        <section class="market-analysis">
          <div class="container">
            <h2 class="section-title">就业市场分析</h2>
            <div class="analysis-content">
              <!-- 职业选择 -->
              <div class="career-selector">
                <h3>选择职业</h3>
                <div class="career-dropdown">
                  <select v-model="selectedCareer" class="dropdown-select">
                    <option v-for="career in careers" :key="career.value" :value="career.value">
                      {{ career.label }}
                    </option>
                  </select>
                </div>
              </div>
              
              <!-- 数据展示 -->
              <div class="data-display">
                <!-- 大图展示区域 -->
                <div 
                  class="large-chart-card"
                  @mouseenter="isHovering = true"
                  @mouseleave="isHovering = false"
                >
                  <!-- 薪资趋势 -->
                  <div v-if="selectedChart === 'salary'" class="chart-content" :class="{ active: selectedChart === 'salary' }">
                    <h4>薪资趋势</h4>
                    <div class="trend-chart">
                      <div class="line-chart">
                        <svg width="100%" height="100%" viewBox="0 0 600 400">
                          <!-- 网格线 -->
                          <line x1="80" y1="40" x2="80" y2="360" stroke="#e2e8f0" stroke-width="1" />
                          <line x1="80" y1="200" x2="560" y2="200" stroke="#e2e8f0" stroke-width="1" />
                          <line x1="80" y1="360" x2="560" y2="360" stroke="#e2e8f0" stroke-width="1" />
                          
                          <!-- 数据线 -->
                          <polyline 
                            :points="salaryTrendPointsLarge"
                            stroke="#6366f1" 
                            stroke-width="3" 
                            fill="none"
                          />
                          
                          <!-- 数据点 -->
                          <circle 
                            v-for="(item, index) in salaryTrend" 
                            :key="item.year"
                            :cx="80 + (index * (480 / (salaryTrend.length - 1)))"
                            :cy="360 - ((item.value / 25000) * 320)"
                            r="6" 
                            fill="#6366f1"
                          />
                          
                          <!-- 年份标签 -->
                          <text 
                            v-for="(item, index) in salaryTrend" 
                            :key="item.year"
                            :x="80 + (index * (480 / (salaryTrend.length - 1)))"
                            y="385"
                            text-anchor="middle"
                            font-size="14"
                            fill="#64748b"
                          >
                            {{ item.year }}
                          </text>
                          
                          <!-- 数值标签 -->
                          <text 
                            v-for="(item, index) in salaryTrend" 
                            :key="item.year"
                            :x="80 + (index * (480 / (salaryTrend.length - 1)))"
                            :y="360 - ((item.value / 25000) * 320) - 15"
                            text-anchor="middle"
                            font-size="14"
                            fill="#6366f1"
                            font-weight="bold"
                          >
                            {{ (item.value / 1000).toFixed(0) }}k
                          </text>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 需求趋势 -->
                  <div v-else-if="selectedChart === 'demand'" class="chart-content" :class="{ active: selectedChart === 'demand' }">
                    <h4>需求趋势</h4>
                    <div class="trend-chart">
                      <div class="line-chart">
                        <svg width="100%" height="100%" viewBox="0 0 600 400">
                          <!-- 网格线 -->
                          <line x1="80" y1="40" x2="80" y2="360" stroke="#e2e8f0" stroke-width="1" />
                          <line x1="80" y1="200" x2="560" y2="200" stroke="#e2e8f0" stroke-width="1" />
                          <line x1="80" y1="360" x2="560" y2="360" stroke="#e2e8f0" stroke-width="1" />
                          
                          <!-- 数据线 -->
                          <polyline 
                            :points="demandTrendPointsLarge"
                            stroke="#10b981" 
                            stroke-width="3" 
                            fill="none"
                          />
                          
                          <!-- 数据点 -->
                          <circle 
                            v-for="(item, index) in demandTrend" 
                            :key="item.year"
                            :cx="80 + (index * (480 / (demandTrend.length - 1)))"
                            :cy="360 - ((item.value / 200000) * 320)"
                            r="6" 
                            fill="#10b981"
                          />
                          
                          <!-- 年份标签 -->
                          <text 
                            v-for="(item, index) in demandTrend" 
                            :key="item.year"
                            :x="80 + (index * (480 / (demandTrend.length - 1)))"
                            y="385"
                            text-anchor="middle"
                            font-size="14"
                            fill="#64748b"
                          >
                            {{ item.year }}
                          </text>
                          
                          <!-- 数值标签 -->
                          <text 
                            v-for="(item, index) in demandTrend" 
                            :key="item.year"
                            :x="80 + (index * (480 / (demandTrend.length - 1)))"
                            :y="360 - ((item.value / 200000) * 320) - 15"
                            text-anchor="middle"
                            font-size="14"
                            fill="#10b981"
                            font-weight="bold"
                          >
                            {{ (item.value / 10000).toFixed(1) }}万
                          </text>
                        </svg>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 热门技能 -->
                  <div v-else-if="selectedChart === 'skills'" class="chart-content" :class="{ active: selectedChart === 'skills' }">
                    <h4>热门技能</h4>
                    <div class="skills-list">
                      <div 
                        v-for="skill in currentMarketData.skills" 
                        :key="skill.name"
                        class="skill-item"
                      >
                        <div class="skill-name">{{ skill.name }}</div>
                        <div class="skill-bar-container">
                          <div 
                            class="skill-bar" 
                            :style="{ width: `${skill.value}%` }"
                          ></div>
                        </div>
                        <div class="skill-value">{{ skill.value }}%</div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- 未来预测 -->
                  <div v-else-if="selectedChart === 'prediction'" class="chart-content" :class="{ active: selectedChart === 'prediction' }">
                    <h4>未来预测</h4>
                    <div class="prediction-content">
                      <p>{{ currentMarketData.prediction }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 面试准备亮点 Section -->
        <section class="interview-highlights">
          <div class="container">
            <h2 class="section-title">面试准备亮点</h2>
            <div class="highlights-grid">
              <div class="highlight-card">
                <div class="highlight-icon">📚</div>
                <h3>技术准备</h3>
                <p>巩固计算机基础、数据结构、算法等核心知识，应对技术面试</p>
              </div>
              <div class="highlight-card">
                <div class="highlight-icon">🎤</div>
                <h3>行为面试</h3>
                <p>准备自我介绍、常见问题回答，提升沟通表达能力</p>
              </div>
              <div class="highlight-card">
                <div class="highlight-icon">🏢</div>
                <h3>公司调研</h3>
                <p>了解目标公司业务、文化和面试团队，做到知己知彼</p>
              </div>
              <div class="highlight-card">
                <div class="highlight-icon">🎯</div>
                <h3>模拟面试</h3>
                <p>通过真实模拟面试场景，提前适应面试环境和流程</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Testimonial Section -->
        <section class="testimonial">
          <div class="container">
            <div class="testimonial-content">
              <svg class="quote-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 17h6M6 17h6"/>
                <path d="M9 17a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-3a2 2 0 0 0-2 2 2 2 0 0 0 2 2 2 2 0 0 1 2 2"/>
              </svg>
              <p class="testimonial-text">"这个平台帮助我找到了理想的职业方向，面试模拟功能让我在真实面试中更加自信。现在我已经在心仪的公司工作，薪资提升了30%。"</p>
              <div class="testimonial-author">
                <div class="author-avatar">
                  <div class="avatar-name">张</div>
                </div>
                <div class="author-info">
                  <h4>张先生</h4>
                  <p>数据分析师</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- CTA Section -->
        <section class="cta">
          <div class="container">
            <h2>准备好开始您的职业之旅了吗？</h2>
            <p>立即行动，开启您的职业规划之路</p>
            <div class="cta-buttons">
              <RouterLink to="/student-profile" class="btn-primary">
                开始规划
              </RouterLink>
              <RouterLink to="/my-written-test" class="btn-secondary">
                面试准备
              </RouterLink>
            </div>
          </div>
        </section>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* Page Enter Animation */
.page-enter-enter-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-enter-from {
  opacity: 0;
  transform: translateY(30px);
}

.page-enter-enter-to {
  opacity: 1;
  transform: translateY(0);
}

/* Loading State */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: #f8fafc;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #6366f1;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-container p {
  font-size: 1.1rem;
  color: #64748b;
  font-weight: 500;
}

.home {
  width: 100%;
}

/* Page Header - Dark Blue Theme */
.page-header {
  position: relative;
  background: linear-gradient(135deg, #1a237e 0%, #283593 30%, #3949ab 60%, #3f51b5 100%);
  color: white;
  padding: 1.33rem 0;
  margin: -2rem -2rem 2rem 0rem;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
}

.page-header-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.page-header-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    radial-gradient(circle at 20% 80%, rgba(102, 126, 234, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 80% 20%, rgba(118, 75, 162, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 40% 40%, rgba(240, 147, 251, 0.2) 0%, transparent 50%);
  animation: patternFloat 10s ease-in-out infinite;
}

@keyframes patternFloat {
  0%, 100% {
    transform: translate(0, 0) scale(1);
    opacity: 0.8;
  }
  50% {
    transform: translate(-15px, 10px) scale(1.05);
    opacity: 1;
  }
}

.page-header::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(45deg, 
    transparent 30%, 
    rgba(255, 255, 255, 0.05) 50%, 
    transparent 70%);
  animation: shimmer 4s ease-in-out infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* 添加粒子效果 */
.page-header-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.page-header-particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: rgba(255, 255, 255, 0.6);
  border-radius: 50%;
  animation: headerParticleFloat 6s ease-in-out infinite;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
}

.page-header-particle:nth-child(1) { left: 5%; top: 30%; animation-delay: 0s; }
.page-header-particle:nth-child(2) { left: 15%; top: 70%; animation-delay: 0.8s; }
.page-header-particle:nth-child(3) { left: 25%; top: 50%; animation-delay: 1.5s; }
.page-header-particle:nth-child(4) { left: 35%; top: 80%; animation-delay: 0.3s; }
.page-header-particle:nth-child(5) { left: 45%; top: 40%; animation-delay: 2s; }
.page-header-particle:nth-child(6) { left: 55%; top: 60%; animation-delay: 1s; }
.page-header-particle:nth-child(7) { left: 65%; top: 30%; animation-delay: 2.5s; }
.page-header-particle:nth-child(8) { left: 75%; top: 70%; animation-delay: 0.5s; }
.page-header-particle:nth-child(9) { left: 85%; top: 50%; animation-delay: 1.8s; }
.page-header-particle:nth-child(10) { left: 95%; top: 80%; animation-delay: 1.2s; }

@keyframes headerParticleFloat {
  0%, 100% {
    transform: translateY(0) scale(1);
    opacity: 0.3;
  }
  50% {
    transform: translateY(-15px) scale(1.3);
    opacity: 0.9;
  }
}

/* 添加能量环 */
.page-header-energy {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 200px;
  height: 200px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  animation: energyRing 4s ease-out infinite;
}

.page-header-energy::before,
.page-header-energy::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
}

.page-header-energy::before {
  width: 300px;
  height: 300px;
  animation: energyRing 4s ease-out infinite 0.5s;
}

.page-header-energy::after {
  width: 400px;
  height: 400px;
  animation: energyRing 4s ease-out infinite 1s;
}

@keyframes energyRing {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 0.5;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

.page-header-content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  padding: 0 2rem;
}

.page-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  padding: 0.3rem 0.8rem;
  border-radius: 50px;
  font-size: 0.8rem;
  margin-bottom: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  line-height: 1.2;
}

.page-subtitle {
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
}

/* Hero Actions Section */
.hero-actions-section {
  padding: 3rem 2rem;
  background: white;
  border-bottom: 1px solid #e2e8f0;
}

.hero-actions-content {
  max-width: 1000px;
  margin: 0 auto;
  text-align: center;
}

.hero-actions-text {
  margin-bottom: 2.5rem;
}

.hero-actions-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 1rem;
}

.hero-actions-desc {
  font-size: 1.1rem;
  color: #64748b;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3rem;
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.stat-item {
  text-align: center;
}

.stat-number {
  display: block;
  font-size: 2rem;
  font-weight: 700;
  color: #6366f1;
  margin-bottom: 0.5rem;
}

.stat-label {
  display: block;
  font-size: 0.95rem;
  color: #64748b;
  font-weight: 500;
}

/* Buttons */
.btn-primary {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-primary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.5);
}

.btn-outline {
   background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
}

.btn-outline:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(99, 102, 241, 0.5);
}

.btn-secondary {
  background: white;
  color: #1a237e;
  padding: 1rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 1.1rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-secondary:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

/* Container */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Core Features Section */
.core-features {
  padding: 6rem 2rem;
  background: #f8fafc;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e293b;
  text-align: center;
  margin-bottom: 4rem;
}

.features-grid {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 4rem;
  align-items: start;
}

.feature-cards {
  flex: 1;
}

.feature-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.feature-card {
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  text-decoration: none;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  position: relative;
  overflow: hidden;
}

.feature-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  border-color: #6366f1;
}

.feature-icon {
  width: 72px;
  height: 72px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-bottom: 1.5rem;
  font-size: 1.75rem;
  transition: all 0.3s ease;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1) rotate(5deg);
}

.feature-icon.purple {
  background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
}

.feature-icon.orange {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
}

.feature-icon.green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.feature-icon.blue {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
}

.feature-icon.pink {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
}

.feature-icon.cyan {
  background: linear-gradient(135deg, #06b6d4 0%, #0891b2 100%);
}

.feature-title {
  font-size: 1.35rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.75rem;
}

.feature-desc {
  font-size: 0.95rem;
  color: #64748b;
  line-height: 1.5;
  margin: 0;
}

.features-description {
  background: white;
  border-radius: 12px;
  padding: 3rem;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.description-header h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.75rem;
}

.description-header p {
  color: #64748b;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.description-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.description-item {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.desc-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.desc-content h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.desc-content p {
  color: #64748b;
  line-height: 1.5;
  margin: 0;
  font-size: 0.9rem;
}

/* 就业市场分析 Section */
.market-analysis {
  padding: 8rem 2rem;
  background: white;
}

.analysis-content {
  max-width: 1200px;
  margin: 0 auto;
}

.career-selector {
  margin-bottom: 2rem;
}

.career-selector h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.75rem;
}

.career-dropdown {
  width: 100%;
  max-width: 300px;
}

.dropdown-select {
  width: 100%;
  padding: 0.75rem 1rem;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  background: white;
  font-size: 1rem;
  font-weight: 500;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.3s ease;
}

.dropdown-select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.data-display {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.large-chart-card {
  background: #f8fafc;
  border-radius: 12px;
  padding: 0;
  border: 1px solid #e2e8f0;
  min-height: 500px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.large-chart-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.chart-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 2.5rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
}

.chart-content h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2rem;
}

.chart-content.active {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.trend-chart {
  height: 400px;
}

.skills-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.skill-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.skill-name {
  width: 100px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #1e293b;
}

.skill-bar-container {
  flex: 1;
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
}

.skill-bar {
  height: 100%;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  border-radius: 4px;
  transition: width 0.5s ease;
}

.skill-value {
  width: 50px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1e293b;
  text-align: right;
}

.prediction-content {
  background: #eef2ff;
  padding: 2rem;
  border-radius: 8px;
  border-left: 4px solid #6366f1;
  height: 350px;
  display: flex;
  align-items: center;
}

.prediction-content p {
  margin: 0;
  color: #334155;
  line-height: 1.6;
  font-size: 1.1rem;
}

/* 面试准备亮点 Section */
.interview-highlights {
  padding: 8rem 2rem;
  background: #f8fafc;
}

.highlights-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
}

.highlight-card {
  background: white;
  border-radius: 12px;
  padding: 2.5rem;
  text-align: center;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.highlight-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
  border-color: #6366f1;
}

.highlight-icon {
  font-size: 3rem;
  margin-bottom: 1.5rem;
}

.highlight-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 1rem;
}

.highlight-card p {
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

/* Testimonial Section */
.testimonial {
  padding: 8rem 2rem;
  background: white;
}

.testimonial-content {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
}

.quote-icon {
  color: #6366f1;
  margin-bottom: 2rem;
  opacity: 0.5;
}

.testimonial-text {
  font-size: 1.25rem;
  line-height: 1.6;
  color: #334155;
  margin-bottom: 3rem;
  font-style: italic;
}

.testimonial-author {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.author-avatar {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.5rem;
}

.author-info h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.author-info p {
  color: #64748b;
  font-size: 0.9rem;
}

/* CTA Section */
.cta {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
  padding: 8rem 2rem;
  text-align: center;
}

.cta h2 {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
}

.cta p {
  font-size: 1.1rem;
  margin-bottom: 3rem;
  opacity: 0.9;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.cta-buttons {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  flex-wrap: wrap;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .hero-title {
    font-size: 2.75rem;
  }
  
  .section-title {
    font-size: 2.25rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
  
  .highlights-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .cta h2 {
    font-size: 2rem;
  }
}

@media (max-width: 992px) {
  .page-header {
    padding: 3rem 1.5rem;
    margin: -1.5rem -1.5rem 1.5rem -1.5rem;
  }

  .page-title {
    font-size: 2.25rem;
  }
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.75rem;
  }
  
  .hero-actions-title {
    font-size: 1.5rem;
  }
  
  .hero-actions-desc {
    font-size: 1rem;
  }
  
  .hero-stats {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
  
  .stat-number {
    font-size: 1.5rem;
  }
  
  .hero {
    padding: 8rem 1.5rem;
  }
  
  .hero-title {
    font-size: 2.25rem;
  }
  
  .hero-subtitle {
    font-size: 1.1rem;
  }
  
  .hero-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .btn-primary,
  .btn-outline,
  .btn-secondary {
    width: 100%;
    max-width: 300px;
  }
  
  .core-features,
  .market-analysis,
  .interview-highlights,
  .testimonial,
  .cta {
    padding: 6rem 1.5rem;
  }
  
  .section-title {
    font-size: 2rem;
  }
  
  .feature-row {
    grid-template-columns: 1fr;
  }
  
  .highlights-grid {
    grid-template-columns: 1fr;
  }
  
  .cta h2 {
    font-size: 1.75rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .description-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .testimonial-author {
    flex-direction: column;
    gap: 1rem;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 1.5rem;
  }
  
  .hero-actions-title {
    font-size: 1.25rem;
  }
  
  .hero-stats {
    grid-template-columns: 1fr;
  }
  
  .hero-title {
    font-size: 1.75rem;
  }
  
  .section-title {
    font-size: 1.75rem;
  }
  
  .feature-card {
    padding: 2rem 1.5rem;
  }
  
  .highlight-card {
    padding: 2rem 1.5rem;
  }
  
  .chart-content {
    padding: 1.5rem;
  }
}
</style>