import { defineStore } from 'pinia'
import { ref } from 'vue'
import request from '@/utils/request'

export interface GraphNode {
  name: string
  type: 'Job' | 'Skill' | 'Level' | 'Company' | 'City' | 'Industry'
}

export interface GraphLink {
  source: string
  target: string
  type: 'PROMOTES_TO' | 'TRANSFERS_TO' | 'RELATED_TO' | 'HAS_JOB' | 'LOCATED_IN'
}

export interface GraphData {
  nodes: GraphNode[]
  links: GraphLink[]
}

const generateMockGlobalGraph = (): GraphData => {
  const nodes: GraphNode[] = [
    { name: '前端开发', type: 'Job' },
    { name: '高级前端开发', type: 'Job' },
    { name: '前端架构师', type: 'Job' },
    { name: '大前端技术总监', type: 'Job' },
    { name: '后端开发', type: 'Job' },
    { name: '高级后端开发', type: 'Job' },
    { name: '后端架构师', type: 'Job' },
    { name: '技术总监', type: 'Job' },
    { name: '全栈开发', type: 'Job' },
    { name: '高级全栈开发', type: 'Job' },
    { name: '产品经理', type: 'Job' },
    { name: '高级产品经理', type: 'Job' },
    { name: '产品总监', type: 'Job' },
    { name: 'UI设计师', type: 'Job' },
    { name: '高级UI设计师', type: 'Job' },
    { name: '设计总监', type: 'Job' },
    { name: '测试工程师', type: 'Job' },
    { name: '高级测试工程师', type: 'Job' },
    { name: '测试经理', type: 'Job' },
    { name: '数据分析师', type: 'Job' },
    { name: '高级数据分析师', type: 'Job' },
    { name: '运营专员', type: 'Job' },
    { name: '高级运营专员', type: 'Job' },
    { name: '运营经理', type: 'Job' },
    { name: 'JavaScript', type: 'Skill' },
    { name: 'TypeScript', type: 'Skill' },
    { name: 'React', type: 'Skill' },
    { name: 'Vue', type: 'Skill' },
    { name: 'Angular', type: 'Skill' },
    { name: 'Node.js', type: 'Skill' },
    { name: 'Python', type: 'Skill' },
    { name: 'Java', type: 'Skill' },
    { name: 'Go', type: 'Skill' },
    { name: 'MySQL', type: 'Skill' },
    { name: 'Redis', type: 'Skill' },
    { name: 'Docker', type: 'Skill' },
    { name: 'Kubernetes', type: 'Skill' },
    { name: 'Figma', type: 'Skill' },
    { name: 'Sketch', type: 'Skill' },
    { name: 'Photoshop', type: 'Skill' },
    { name: '腾讯', type: 'Company' },
    { name: '阿里巴巴', type: 'Company' },
    { name: '字节跳动', type: 'Company' },
    { name: '百度', type: 'Company' },
    { name: '美团', type: 'Company' },
    { name: '京东', type: 'Company' },
    { name: '网易', type: 'Company' },
    { name: '小米', type: 'Company' },
    { name: '华为', type: 'Company' },
    { name: '北京', type: 'City' },
    { name: '上海', type: 'City' },
    { name: '深圳', type: 'City' },
    { name: '杭州', type: 'City' },
    { name: '广州', type: 'City' },
    { name: '成都', type: 'City' },
    { name: '武汉', type: 'City' },
    { name: '南京', type: 'City' },
    { name: '互联网', type: 'Industry' },
    { name: '金融', type: 'Industry' },
    { name: '教育', type: 'Industry' },
    { name: '医疗', type: 'Industry' },
    { name: '电商', type: 'Industry' },
    { name: '社交', type: 'Industry' },
    { name: '游戏', type: 'Industry' },
    { name: '初级', type: 'Level' },
    { name: '中级', type: 'Level' },
    { name: '高级', type: 'Level' },
    { name: '专家', type: 'Level' },
    { name: '总监', type: 'Level' }
  ]

  const links: GraphLink[] = [
    { source: '前端开发', target: '高级前端开发', type: 'PROMOTES_TO' },
    { source: '高级前端开发', target: '前端架构师', type: 'PROMOTES_TO' },
    { source: '前端架构师', target: '大前端技术总监', type: 'PROMOTES_TO' },
    { source: '后端开发', target: '高级后端开发', type: 'PROMOTES_TO' },
    { source: '高级后端开发', target: '后端架构师', type: 'PROMOTES_TO' },
    { source: '后端架构师', target: '技术总监', type: 'PROMOTES_TO' },
    { source: '全栈开发', target: '高级全栈开发', type: 'PROMOTES_TO' },
    { source: '高级全栈开发', target: '技术总监', type: 'PROMOTES_TO' },
    { source: '产品经理', target: '高级产品经理', type: 'PROMOTES_TO' },
    { source: '高级产品经理', target: '产品总监', type: 'PROMOTES_TO' },
    { source: 'UI设计师', target: '高级UI设计师', type: 'PROMOTES_TO' },
    { source: '高级UI设计师', target: '设计总监', type: 'PROMOTES_TO' },
    { source: '测试工程师', target: '高级测试工程师', type: 'PROMOTES_TO' },
    { source: '高级测试工程师', target: '测试经理', type: 'PROMOTES_TO' },
    { source: '数据分析师', target: '高级数据分析师', type: 'PROMOTES_TO' },
    { source: '运营专员', target: '高级运营专员', type: 'PROMOTES_TO' },
    { source: '高级运营专员', target: '运营经理', type: 'PROMOTES_TO' },
    { source: '前端开发', target: '全栈开发', type: 'TRANSFERS_TO' },
    { source: '前端开发', target: '产品经理', type: 'TRANSFERS_TO' },
    { source: '前端开发', target: 'UI设计师', type: 'TRANSFERS_TO' },
    { source: '后端开发', target: '全栈开发', type: 'TRANSFERS_TO' },
    { source: '后端开发', target: '数据分析师', type: 'TRANSFERS_TO' },
    { source: '后端开发', target: '产品经理', type: 'TRANSFERS_TO' },
    { source: '全栈开发', target: '技术总监', type: 'TRANSFERS_TO' },
    { source: '全栈开发', target: '产品经理', type: 'TRANSFERS_TO' },
    { source: '产品经理', target: '运营经理', type: 'TRANSFERS_TO' },
    { source: '产品经理', target: '设计总监', type: 'TRANSFERS_TO' },
    { source: 'UI设计师', target: '产品经理', type: 'TRANSFERS_TO' },
    { source: 'UI设计师', target: '运营专员', type: 'TRANSFERS_TO' },
    { source: '测试工程师', target: '后端开发', type: 'TRANSFERS_TO' },
    { source: '测试工程师', target: '产品经理', type: 'TRANSFERS_TO' },
    { source: '数据分析师', target: '产品经理', type: 'TRANSFERS_TO' },
    { source: '数据分析师', target: '运营经理', type: 'TRANSFERS_TO' },
    { source: '运营专员', target: '产品经理', type: 'TRANSFERS_TO' },
    { source: '运营专员', target: '数据分析师', type: 'TRANSFERS_TO' },
    { source: '前端开发', target: 'JavaScript', type: 'RELATED_TO' },
    { source: '前端开发', target: 'TypeScript', type: 'RELATED_TO' },
    { source: '前端开发', target: 'React', type: 'RELATED_TO' },
    { source: '前端开发', target: 'Vue', type: 'RELATED_TO' },
    { source: '前端开发', target: 'Angular', type: 'RELATED_TO' },
    { source: '高级前端开发', target: 'Node.js', type: 'RELATED_TO' },
    { source: '高级前端开发', target: 'TypeScript', type: 'RELATED_TO' },
    { source: '前端架构师', target: 'Docker', type: 'RELATED_TO' },
    { source: '前端架构师', target: 'Kubernetes', type: 'RELATED_TO' },
    { source: '后端开发', target: 'Java', type: 'RELATED_TO' },
    { source: '后端开发', target: 'Python', type: 'RELATED_TO' },
    { source: '后端开发', target: 'Go', type: 'RELATED_TO' },
    { source: '后端开发', target: 'MySQL', type: 'RELATED_TO' },
    { source: '后端开发', target: 'Redis', type: 'RELATED_TO' },
    { source: '高级后端开发', target: 'Docker', type: 'RELATED_TO' },
    { source: '全栈开发', target: 'JavaScript', type: 'RELATED_TO' },
    { source: '全栈开发', target: 'Python', type: 'RELATED_TO' },
    { source: '全栈开发', target: 'Node.js', type: 'RELATED_TO' },
    { source: '全栈开发', target: 'React', type: 'RELATED_TO' },
    { source: 'UI设计师', target: 'Figma', type: 'RELATED_TO' },
    { source: 'UI设计师', target: 'Sketch', type: 'RELATED_TO' },
    { source: 'UI设计师', target: 'Photoshop', type: 'RELATED_TO' },
    { source: '测试工程师', target: 'Python', type: 'RELATED_TO' },
    { source: '数据分析师', target: 'Python', type: 'RELATED_TO' },
    { source: '腾讯', target: '前端开发', type: 'HAS_JOB' },
    { source: '腾讯', target: '后端开发', type: 'HAS_JOB' },
    { source: '腾讯', target: '产品经理', type: 'HAS_JOB' },
    { source: '腾讯', target: 'UI设计师', type: 'HAS_JOB' },
    { source: '阿里巴巴', target: '前端开发', type: 'HAS_JOB' },
    { source: '阿里巴巴', target: '后端开发', type: 'HAS_JOB' },
    { source: '阿里巴巴', target: '全栈开发', type: 'HAS_JOB' },
    { source: '阿里巴巴', target: '产品经理', type: 'HAS_JOB' },
    { source: '字节跳动', target: '前端开发', type: 'HAS_JOB' },
    { source: '字节跳动', target: '后端开发', type: 'HAS_JOB' },
    { source: '字节跳动', target: '数据分析师', type: 'HAS_JOB' },
    { source: '字节跳动', target: '运营专员', type: 'HAS_JOB' },
    { source: '百度', target: '前端开发', type: 'HAS_JOB' },
    { source: '百度', target: '后端开发', type: 'HAS_JOB' },
    { source: '百度', target: '测试工程师', type: 'HAS_JOB' },
    { source: '美团', target: '产品经理', type: 'HAS_JOB' },
    { source: '美团', target: '运营专员', type: 'HAS_JOB' },
    { source: '京东', target: '全栈开发', type: 'HAS_JOB' },
    { source: '网易', target: 'UI设计师', type: 'HAS_JOB' },
    { source: '北京', target: '腾讯', type: 'LOCATED_IN' },
    { source: '北京', target: '百度', type: 'LOCATED_IN' },
    { source: '北京', target: '字节跳动', type: 'LOCATED_IN' },
    { source: '北京', target: '小米', type: 'LOCATED_IN' },
    { source: '上海', target: '字节跳动', type: 'LOCATED_IN' },
    { source: '上海', target: '美团', type: 'LOCATED_IN' },
    { source: '上海', target: '拼多多', type: 'LOCATED_IN' },
    { source: '深圳', target: '腾讯', type: 'LOCATED_IN' },
    { source: '深圳', target: '华为', type: 'LOCATED_IN' },
    { source: '杭州', target: '阿里巴巴', type: 'LOCATED_IN' },
    { source: '杭州', target: '网易', type: 'LOCATED_IN' },
    { source: '广州', target: '腾讯', type: 'LOCATED_IN' },
    { source: '成都', target: '腾讯', type: 'LOCATED_IN' },
    { source: '武汉', target: '小米', type: 'LOCATED_IN' },
    { source: '南京', target: '华为', type: 'LOCATED_IN' },
    { source: '互联网', target: '前端开发', type: 'RELATED_TO' },
    { source: '互联网', target: '后端开发', type: 'RELATED_TO' },
    { source: '互联网', target: '全栈开发', type: 'RELATED_TO' },
    { source: '互联网', target: '产品经理', type: 'RELATED_TO' },
    { source: '互联网', target: 'UI设计师', type: 'RELATED_TO' },
    { source: '互联网', target: '测试工程师', type: 'RELATED_TO' },
    { source: '互联网', target: '数据分析师', type: 'RELATED_TO' },
    { source: '金融', target: '产品经理', type: 'RELATED_TO' },
    { source: '金融', target: '数据分析师', type: 'RELATED_TO' },
    { source: '电商', target: '产品经理', type: 'RELATED_TO' },
    { source: '电商', target: '运营专员', type: 'RELATED_TO' },
    { source: '社交', target: '产品经理', type: 'RELATED_TO' },
    { source: '社交', target: 'UI设计师', type: 'RELATED_TO' },
    { source: '游戏', target: '前端开发', type: 'RELATED_TO' },
    { source: '游戏', target: '后端开发', type: 'RELATED_TO' },
    { source: '初级', target: '前端开发', type: 'RELATED_TO' },
    { source: '初级', target: '后端开发', type: 'RELATED_TO' },
    { source: '初级', target: 'UI设计师', type: 'RELATED_TO' },
    { source: '初级', target: '测试工程师', type: 'RELATED_TO' },
    { source: '中级', target: '高级前端开发', type: 'RELATED_TO' },
    { source: '中级', target: '高级后端开发', type: 'RELATED_TO' },
    { source: '中级', target: '高级UI设计师', type: 'RELATED_TO' },
    { source: '高级', target: '前端架构师', type: 'RELATED_TO' },
    { source: '高级', target: '后端架构师', type: 'RELATED_TO' },
    { source: '高级', target: '高级产品经理', type: 'RELATED_TO' },
    { source: '专家', target: '大前端技术总监', type: 'RELATED_TO' },
    { source: '专家', target: '技术总监', type: 'RELATED_TO' },
    { source: '总监', target: '产品总监', type: 'RELATED_TO' },
    { source: '总监', target: '设计总监', type: 'RELATED_TO' }
  ]

  return { nodes, links }
}

const generateMockJobSubgraph = (jobName: string): GraphData => {
  const baseNodes: GraphNode[] = [
    { name: jobName, type: 'Job' },
    { name: '高级' + jobName, type: 'Job' },
    { name: jobName + '架构师', type: 'Job' },
    { name: '技术总监', type: 'Job' },
    { name: '产品经理', type: 'Job' },
    { name: '全栈开发', type: 'Job' },
    { name: 'UI设计师', type: 'Job' },
    { name: '数据分析师', type: 'Job' },
    { name: '运营专员', type: 'Job' },
    { name: '后端开发', type: 'Job' },
    { name: '测试工程师', type: 'Job' },
    { name: 'JavaScript', type: 'Skill' },
    { name: 'React', type: 'Skill' },
    { name: 'Vue', type: 'Skill' },
    { name: 'TypeScript', type: 'Skill' },
    { name: 'Node.js', type: 'Skill' },
    { name: 'Python', type: 'Skill' },
    { name: 'Java', type: 'Skill' },
    { name: 'Figma', type: 'Skill' },
    { name: '腾讯', type: 'Company' },
    { name: '阿里巴巴', type: 'Company' },
    { name: '字节跳动', type: 'Company' },
    { name: '百度', type: 'Company' },
    { name: '北京', type: 'City' },
    { name: '上海', type: 'City' },
    { name: '深圳', type: 'City' },
    { name: '互联网', type: 'Industry' },
    { name: '金融', type: 'Industry' },
    { name: '中级', type: 'Level' },
    { name: '高级', type: 'Level' },
    { name: '专家', type: 'Level' }
  ]

  const baseLinks: GraphLink[] = [
    { source: jobName, target: '高级' + jobName, type: 'PROMOTES_TO' },
    { source: '高级' + jobName, target: jobName + '架构师', type: 'PROMOTES_TO' },
    { source: jobName + '架构师', target: '技术总监', type: 'PROMOTES_TO' },
    { source: jobName, target: '全栈开发', type: 'TRANSFERS_TO' },
    { source: jobName, target: '产品经理', type: 'TRANSFERS_TO' },
    { source: jobName, target: 'UI设计师', type: 'TRANSFERS_TO' },
    { source: jobName, target: '数据分析师', type: 'TRANSFERS_TO' },
    { source: jobName, target: '后端开发', type: 'TRANSFERS_TO' },
    { source: jobName, target: '测试工程师', type: 'TRANSFERS_TO' },
    { source: jobName, target: 'JavaScript', type: 'RELATED_TO' },
    { source: jobName, target: 'React', type: 'RELATED_TO' },
    { source: jobName, target: 'Vue', type: 'RELATED_TO' },
    { source: '高级' + jobName, target: 'TypeScript', type: 'RELATED_TO' },
    { source: '高级' + jobName, target: 'Node.js', type: 'RELATED_TO' },
    { source: '腾讯', target: jobName, type: 'HAS_JOB' },
    { source: '阿里巴巴', target: jobName, type: 'HAS_JOB' },
    { source: '字节跳动', target: jobName, type: 'HAS_JOB' },
    { source: '百度', target: jobName, type: 'HAS_JOB' },
    { source: '北京', target: '腾讯', type: 'LOCATED_IN' },
    { source: '上海', target: '字节跳动', type: 'LOCATED_IN' },
    { source: '深圳', target: '腾讯', type: 'LOCATED_IN' },
    { source: '互联网', target: jobName, type: 'RELATED_TO' },
    { source: '金融', target: '产品经理', type: 'RELATED_TO' },
    { source: '中级', target: jobName, type: 'RELATED_TO' },
    { source: '高级', target: '高级' + jobName, type: 'RELATED_TO' },
    { source: '专家', target: '技术总监', type: 'RELATED_TO' }
  ]

  return { nodes: baseNodes, links: baseLinks }
}

export const useKnowledgeGraphStore = defineStore('knowledgeGraph', () => {
  const globalGraph = ref<GraphData>(generateMockGlobalGraph())
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const fetchGlobalGraph = async (): Promise<void> => {
    isLoading.value = true
    error.value = null
    try {
      const [jobsRes, companiesRes, locationsRes] = await Promise.all([
        request.get('/neo4j/jobs?limit=50'),
        request.get('/neo4j/companies?limit=20'),
        request.get('/neo4j/locations?limit=15')
      ])

      const nodes: GraphNode[] = []
      const links: GraphLink[] = []

      const jobNames = new Set<string>()
      if (Array.isArray(jobsRes.data)) {
        jobsRes.data.forEach((job: any) => {
          if (job.name && !jobNames.has(job.name)) {
            jobNames.add(job.name)
            nodes.push({ name: job.name, type: 'Job' })
          }
        })
      }

      if (Array.isArray(companiesRes.data)) {
        companiesRes.data.forEach((company: any) => {
          if (company.name) {
            nodes.push({ name: company.name, type: 'Company' })
          }
        })
      }

      if (Array.isArray(locationsRes.data)) {
        locationsRes.data.forEach((location: any) => {
          if (location.name) {
            nodes.push({ name: location.name, type: 'City' })
          }
        })
      }

      nodes.push(
        { name: '互联网', type: 'Industry' },
        { name: '金融', type: 'Industry' },
        { name: '教育', type: 'Industry' },
        { name: '医疗', type: 'Industry' },
        { name: '设计', type: 'Industry' },
        { name: 'JavaScript', type: 'Skill' },
        { name: 'Python', type: 'Skill' },
        { name: 'Java', type: 'Skill' },
        { name: 'React', type: 'Skill' },
        { name: 'Vue', type: 'Skill' },
        { name: '初级', type: 'Level' },
        { name: '中级', type: 'Level' },
        { name: '高级', type: 'Level' },
        { name: '专家', type: 'Level' }
      )

      const jobList = Array.from(jobNames)
      for (let i = 0; i < Math.min(jobList.length, 10); i++) {
        const current = jobList[i]
        if (i < jobList.length - 1) {
          const next = jobList[i + 1]
          if (current && next) {
            links.push({
              source: current,
              target: next,
              type: 'PROMOTES_TO'
            })
          }
        }
        if (jobList.length >= 4 && i > 1 && i < jobList.length - 2) {
          const transferTarget = jobList[(i + 3) % jobList.length]
          if (current && transferTarget) {
            links.push({
              source: current,
              target: transferTarget,
              type: 'TRANSFERS_TO'
            })
          }
        }
      }

      globalGraph.value = { nodes, links }
    } catch (err) {
      console.error('获取全局知识图谱失败:', err)
      error.value = '获取知识图谱失败'
      globalGraph.value = generateMockGlobalGraph()
    } finally {
      isLoading.value = false
    }
  }

  const getJobSubgraph = (jobName: string): GraphData => {
    if (!globalGraph.value.nodes.length) {
      return generateMockJobSubgraph(jobName)
    }

    const relatedNodes = new Set<string>()
    relatedNodes.add(jobName)

    globalGraph.value.links.forEach(link => {
      if (link.source === jobName || link.target === jobName) {
        relatedNodes.add(link.source)
        relatedNodes.add(link.target)
      }
    })

    const subNodes = globalGraph.value.nodes.filter(node => relatedNodes.has(node.name))
    const subLinks = globalGraph.value.links.filter(
      link => relatedNodes.has(link.source) && relatedNodes.has(link.target)
    )

    if (subNodes.length <= 1) {
      return generateMockJobSubgraph(jobName)
    }

    return { nodes: subNodes, links: subLinks }
  }

  return {
    globalGraph,
    isLoading,
    error,
    fetchGlobalGraph,
    getJobSubgraph
  }
})
