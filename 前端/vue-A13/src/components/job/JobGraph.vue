<template>
  <div class="job-graph" :class="{ 'compact-mode': compactMode, 'detail-mode': detailMode }">
    <h3 v-if="!compactMode" class="graph-title">
      {{ detailMode ? `${job?.title} - 职业发展图谱` : '岗位知识图谱' }}
    </h3>
    <div v-if="isLoading" class="loading-state">
      <p>加载中...</p>
    </div>
    <div v-else-if="!hasData" class="empty-state">
      <p>暂无图谱数据</p>
    </div>
    <div v-else class="graph-container" ref="graphRef"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import * as echarts from 'echarts'
import { useKnowledgeGraphStore } from '@/stores/knowledgeGraph'

interface Job {
  id: string
  title: string
  company: string
  industry: string
  location: string
  salary: string
  salaryMin: number
  salaryMax: number
  experience: string
  education: string
  description: string
  requirements: string[]
  tags: string[]
  isFavorite: boolean
  publishDate: string
}

const props = defineProps<{
  job?: Job | null
  compactMode?: boolean
  detailMode?: boolean
}>()

const graphStore = useKnowledgeGraphStore()
const graphRef = ref<HTMLElement>()
let chart: echarts.ECharts | null = null

const isLoading = computed(() => graphStore.isLoading)

const hasData = computed(() => {
  if (props.detailMode && props.job) {
    return true
  }
  return graphStore.globalGraph.nodes.length > 0
})

const getNodeColor = (type: string) => {
  const colorMap: Record<string, string> = {
    Job: '#4a90d9',
    Skill: '#52c41a',
    Level: '#eb2f96',
    Company: '#eb2f96',
    City: '#4a90d9',
    Industry: '#722ed1'
  }
  return colorMap[type] || '#666'
}

const getLinkColor = (type: string) => {
  const colorMap: Record<string, string> = {
    PROMOTES_TO: '#52c41a',
    TRANSFERS_TO: '#1890ff',
    RELATED_TO: '#faad14',
    HAS_JOB: '#722ed1',
    LOCATED_IN: '#13c2c2'
  }
  return colorMap[type] || '#999'
}

const getLinkLabel = (type: string) => {
  const labelMap: Record<string, string> = {
    PROMOTES_TO: '晋升',
    TRANSFERS_TO: '转岗',
    RELATED_TO: '关联',
    HAS_JOB: '招聘',
    LOCATED_IN: '位于'
  }
  return labelMap[type] || type
}

const getNodeSymbol = (type: string) => {
  return 'circle'
}

const renderChart = async () => {
  if (!graphRef.value) {
    return
  }

  if (chart) {
    chart.dispose()
    chart = null
  }

  let graphData
  if (props.detailMode && props.job) {
    graphData = graphStore.getJobSubgraph(props.job.title)
  } else {
    if (graphStore.globalGraph.nodes.length === 0) {
      await graphStore.fetchGlobalGraph()
    }
    graphData = graphStore.globalGraph
  }

  if (!graphData || graphData.nodes.length === 0) {
    console.log('No graph data available')
    return
  }

  chart = echarts.init(graphRef.value)

  const isCompact = props.compactMode === true
  const isDetail = props.detailMode === true

  const data = graphData.nodes.map((node, index) => ({
    name: node.name,
    type: node.type,
    itemStyle: {
      color: getNodeColor(node.type)
    },
    symbol: getNodeSymbol(node.type),
    symbolSize: isCompact 
      ? (node.type === 'Job' ? 35 : 25 + Math.random() * 8) 
      : (node.type === 'Job' ? 55 : 40 + Math.random() * 15),
    label: {
      show: true,
      position: 'right',
      fontSize: isCompact ? 9 : (isDetail ? 13 : 11),
      color: '#333',
      fontWeight: node.type === 'Job' ? 'bold' : 'normal'
    }
  }))

  const links = graphData.links.map(link => ({
    source: link.source,
    target: link.target,
    type: link.type,
    label: {
      show: isDetail,
      formatter: getLinkLabel(link.type),
      fontSize: 10,
      color: '#666',
      backgroundColor: '#fff'
    },
    lineStyle: {
      color: getLinkColor(link.type),
      curveness: isCompact ? 0.15 : 0.25,
      width: isCompact ? 1.2 : (isDetail ? 2.5 : 2)
    }
  }))

  const option = {
    title: isCompact ? undefined : {
      text: isDetail ? `${props.job?.title} - 职业发展路径` : '岗位知识体系',
      left: 'center',
      textStyle: {
        fontSize: isDetail ? 16 : 14,
        fontWeight: 'bold',
        color: '#333'
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.dataType === 'edge') {
          return `${params.data.source} → ${params.data.target}<br/>关系: ${getLinkLabel(params.data.type)}`
        }
        return `${params.name}<br/>类型: ${params.data.type}`
      }
    },
    animation: true,
    animationDurationUpdate: isCompact ? 600 : (isDetail ? 1200 : 1000),
    series: [
      {
        type: 'graph',
        layout: 'force',
        force: isCompact ? {
          repulsion: 350,
          edgeLength: [40, 80],
          gravity: 0.25,
          friction: 0.35
        } : isDetail ? {
          repulsion: 800,
          edgeLength: [80, 160],
          gravity: 0.15,
          friction: 0.25
        } : {
          repulsion: 600,
          edgeLength: [60, 140],
          gravity: 0.18,
          friction: 0.28
        },
        roam: !isCompact,
        zoom: isCompact ? 0.9 : 1,
        center: isCompact ? ['50%', '55%'] : ['50%', '50%'],
        label: {
          show: true,
          position: 'right',
          formatter: '{b}'
        },
        data,
        links,
        emphasis: {
          lineStyle: {
            width: isCompact ? 2 : 4
          },
          itemStyle: {
            shadowBlur: isCompact ? 8 : 15,
            shadowColor: 'rgba(0, 0, 0, 0.4)'
          }
        }
      }
    ]
  }

  chart.setOption(option)

  setTimeout(() => chart?.resize(), 100)
  setTimeout(() => chart?.resize(), 300)
  setTimeout(() => chart?.resize(), 500)
}

onMounted(() => {
  nextTick(async () => {
    if (graphStore.globalGraph.nodes.length === 0) {
      await graphStore.fetchGlobalGraph()
    }
    setTimeout(() => renderChart(), 200)
  })
})

watch([() => props.job, () => props.detailMode, () => graphStore.globalGraph.nodes.length], () => {
  nextTick(() => {
    setTimeout(() => renderChart(), 200)
  })
})

onUnmounted(() => {
  chart?.dispose()
})
</script>

<style scoped>
.job-graph {
  width: 100%;
}

.graph-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 1rem;
  text-align: center;
}

.loading-state,
.empty-state {
  text-align: center;
  padding: 2rem;
  color: #999;
  background: #f9f9f9;
  border-radius: 8px;
}

.graph-container {
  width: 100%;
  height: 380px;
  min-height: 380px;
  border-radius: 12px;
  overflow: hidden;
  background: linear-gradient(135deg, #fafbfc 0%, #f0f2f5 100%);
  border: 1px solid #e8ecf1;
}

/* 紧凑模式样式 */
.job-graph.compact-mode .graph-container {
  height: 200px;
  min-height: 200px;
  border-radius: 8px;
}

.job-graph.compact-mode .loading-state,
.job-graph.compact-mode .empty-state {
  padding: 1rem;
  font-size: 0.85rem;
}

/* 详情模式样式 */
.job-graph.detail-mode .graph-container {
  height: 450px;
  min-height: 450px;
  background: linear-gradient(135deg, #f8fafc 0%, #eef2f7 100%);
}

@media (max-width: 768px) {
  .graph-container {
    height: 320px;
    min-height: 320px;
  }
  
  .job-graph.compact-mode .graph-container {
    height: 180px;
    min-height: 180px;
  }
  
  .job-graph.detail-mode .graph-container {
    height: 380px;
    min-height: 380px;
  }
}
</style>
