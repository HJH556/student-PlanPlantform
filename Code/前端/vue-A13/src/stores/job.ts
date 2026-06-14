import { ref, computed, onMounted } from 'vue'
import { defineStore } from 'pinia'
import { jobApi } from '@/api/job'
import { ElMessage } from 'element-plus'
import * as XLSX from 'xlsx'
import axios from 'axios'
import { useUserStore } from '@/stores/user'

export interface Job {
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
  isApplied: boolean
  publishDate: string
  companyType: string
  companyScale: string
}

export interface JobFilter {
  keyword: string
  industry: string
  salaryRange: string
  location: string
  experience: string
  companyType: string
  companyScale: string
  sortBy: string
}

// API 响应类型
interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export const useJobStore = defineStore('job', () => {
  // State - 从后端获取数据
  const jobs = ref<Job[]>([])
  const filter = ref<JobFilter>({
    keyword: '',
    industry: '',
    salaryRange: '',
    location: '',
    experience: '',
    companyType: '',
    companyScale: '',
    sortBy: 'date'
  })
  const isLoading = ref(false)
  const selectedJob = ref<Job | null>(null)

  // 初始化时自动加载数据
  onMounted(async () => {
    await fetchJobs()
  })

  // Getters
  const filteredJobs = computed(() => {
    let result = jobs.value

    // Keyword filter
    if (filter.value.keyword) {
      const keyword = filter.value.keyword.toLowerCase()
      result = result.filter(job =>
        job.title.toLowerCase().includes(keyword) ||
        job.company.toLowerCase().includes(keyword) ||
        job.industry.toLowerCase().includes(keyword) ||
        job.tags.some(tag => tag.toLowerCase().includes(keyword))
      )
    }

    // Industry filter
    if (filter.value.industry) {
      result = result.filter(job => job.industry === filter.value.industry)
    }

    // Salary range filter
    if (filter.value.salaryRange) {
      const parts = filter.value.salaryRange.split('-')
      const min = parts[0] ? parseInt(parts[0]) * 1000 : 0 // 转换为元
      const max = parts[1] ? parseInt(parts[1]) * 1000 : undefined
      result = result.filter(job => {
        if (max !== undefined && !isNaN(max)) {
          return job.salaryMin >= min && job.salaryMax <= max
        }
        return job.salaryMin >= min
      })
    }

    // Location filter
    if (filter.value.location) {
      result = result.filter(job => job.location === filter.value.location)
    }

    // Experience filter
    if (filter.value.experience) {
      result = result.filter(job => job.experience === filter.value.experience)
    }

    // Company type filter
    if (filter.value.companyType) {
      result = result.filter(job => job.companyType === filter.value.companyType)
    }

    // Company scale filter
    if (filter.value.companyScale) {
      result = result.filter(job => job.companyScale === filter.value.companyScale)
    }

    // Sort
    switch (filter.value.sortBy) {
      case 'salary':
        result = [...result].sort((a, b) => b.salaryMax - a.salaryMax)
        break
      case 'date':
        result = [...result].sort((a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime())
        break
      default:
        break
    }

    return result
  })

  const favoriteJobs = computed(() => {
    return jobs.value.filter(job => job.isFavorite)
  })

  const industries = computed(() => {
    const industrySet = new Set(jobs.value.map(job => job.industry))
    return Array.from(industrySet).filter(industry => industry && industry !== '其他')
  })

  const companyTypes = computed(() => {
    const typeSet = new Set(jobs.value.map(job => job.companyType))
    return Array.from(typeSet).filter(type => type && type !== '其他')
  })

  const companyScales = computed(() => {
    const scaleSet = new Set(jobs.value.map(job => job.companyScale))
    return Array.from(scaleSet).filter(scale => scale && scale !== '其他')
  })

  const locations = computed(() => {
    const locationSet = new Set(jobs.value.map(job => job.location))
    return Array.from(locationSet)
  })

  // Actions

  // 从后端获取岗位列表（分片加载）
  async function fetchJobs() {
    try {
      isLoading.value = true
      console.log('开始获取岗位数据...')

      // 清空当前数据
      jobs.value = []
      console.log('清空当前数据')

      // 首先尝试从后端获取数据（分片加载）
      try {
        console.log('尝试从后端获取数据...')

        // 分片加载参数
        const pageSize = 500
        let currentPage = 0
        let totalJobs: any[] = []
        let hasMoreData = true

        // 循环加载数据，直到没有更多数据
        while (hasMoreData) {
          console.log(`加载第 ${currentPage + 1} 页数据...`)
          const response = await axios.get('http://localhost:8000/jobs', {
            params: {
              skip: currentPage * pageSize,
              limit: pageSize
            },
            headers: {
              'Content-Type': 'application/json'
            },
            timeout: 30000
          })

          console.log(`第 ${currentPage + 1} 页响应状态:`, response.status)
          console.log(`第 ${currentPage + 1} 页数据长度:`, response.data.length)

          if (response.data && Array.isArray(response.data)) {
            // 处理当前页数据
            const processedJobs = response.data.map((job: any) => ({
              ...job,
              id: job.id.toString(),
              isFavorite: false,
              isApplied: false,
              tags: job.tags ? job.tags.split(',') : [],
              requirements: job.requirements ? job.requirements.split('\n') : [],
              salaryMin: 0,
              salaryMax: 0,
              companyType: job.type || '其他',
              companyScale: '其他'
            }))

            // 添加到总数据中
            totalJobs = [...totalJobs, ...processedJobs]

            // 检查是否还有更多数据
            hasMoreData = response.data.length === pageSize
            currentPage++

            // 每加载一页，更新一次 jobs，让用户看到数据正在加载
            jobs.value = [...totalJobs]
            console.log(`已加载 ${totalJobs.length} 条数据`)
          } else {
            hasMoreData = false
          }
        }

        console.log('后端数据加载完成，总长度:', totalJobs.length)
        console.log('前端处理后的数据长度:', jobs.value.length)

        // 加载收藏状态
        await loadFavoritesFromBackend()
        // 加载已申请状态
        await loadAppliedFromBackend()
        console.log('从后端获取数据成功')
        return
      } catch (apiError: any) {
        // 后端不可用，使用Excel数据
        console.log('后端不可用，使用Excel数据:', apiError.message)
        console.log('错误堆栈:', apiError.stack)
        if (apiError.response) {
          console.log('错误响应状态:', apiError.response.status)
          console.log('错误响应数据:', apiError.response.data)
        }
      }

      // 后端不可用时，从Excel文件加载数据
      console.log('从Excel文件加载数据...')
      await loadJobsFromExcel()
      console.log('Excel数据加载完成，数据长度:', jobs.value.length)
    } finally {
      isLoading.value = false
    }
  }

  // 搜索岗位
  async function searchJobs(keyword: string) {
    try {
      isLoading.value = true
      const response = await jobApi.searchJobs(keyword)
      if (response.data && Array.isArray(response.data)) {
        jobs.value = response.data.map((job: any) => ({
          ...job,
          id: job.id.toString(),
          isFavorite: false,
          isApplied: false,
          tags: job.tags ? job.tags.split(',') : [],
          requirements: job.requirements ? job.requirements.split('\n') : [],
          salaryMin: 0,
          salaryMax: 0,
          companyType: job.type || '其他',
          companyScale: '其他'
        }))
        await loadFavoritesFromBackend()
        await loadAppliedFromBackend()
      }
    } catch (error) {
      console.error('搜索岗位失败:', error)
      // 本地搜索
      filter.value.keyword = keyword
    } finally {
      isLoading.value = false
    }
  }

  // 获取岗位详情
  async function fetchJobDetail(jobId: string) {
    try {
      isLoading.value = true
      const response = await jobApi.getJobDetail(jobId)
      if (response.data) {
        // 从后端加载收藏状态和已申请状态
        await loadFavoritesFromBackend()
        await loadAppliedFromBackend()
        selectedJob.value = {
          ...response.data,
          id: response.data.id.toString(),
          isFavorite: jobs.value.find(j => j.id === jobId)?.isFavorite || false,
          isApplied: jobs.value.find(j => j.id === jobId)?.isApplied || false,
          tags: response.data.tags ? response.data.tags.split(',') : [],
          requirements: response.data.requirements ? response.data.requirements.split('\n') : [],
          salaryMin: 0,
          salaryMax: 0,
          companyType: response.data.type || '其他',
          companyScale: '其他'
        }
        return selectedJob.value
      }
    } catch (error) {
      console.error('获取岗位详情失败:', error)
      // 从本地查找
      selectedJob.value = jobs.value.find(j => j.id === jobId) || null
      return selectedJob.value
    } finally {
      isLoading.value = false
    }
  }

  function setFilter(newFilter: Partial<JobFilter>) {
    filter.value = { ...filter.value, ...newFilter }
  }

  async function toggleFavorite(jobId: string) {
    const job = jobs.value.find(j => j.id === jobId)
    if (job) {
      try {
        // 检查 jobId 是否是有效的整数
        const numericJobId = parseInt(jobId)
        if (!isNaN(numericJobId)) {
          if (job.isFavorite) {
            // 取消收藏
            await jobApi.removeFavorite(jobId)
          } else {
            // 添加收藏
            await jobApi.addFavorite(jobId)
          }
        }
        // 更新本地状态
        job.isFavorite = !job.isFavorite
        // 重新从后端加载收藏状态，确保与后端数据一致
        await loadFavoritesFromBackend()
        return true
      } catch (error) {
        console.error('收藏操作失败:', error)
        // 后端失败时，仍然更新本地状态，保证用户体验
        job.isFavorite = !job.isFavorite
        return false
      }
    }
    return false
  }

  async function applyJob(jobId: string) {
    try {
      // 检查 jobId 是否是有效的整数
      const numericJobId = parseInt(jobId)
      if (!isNaN(numericJobId)) {
        // 调用后端API申请岗位
        await jobApi.applyJob(jobId)
        // 申请成功后，更新本地状态
        const job = jobs.value.find(j => j.id === jobId)
        if (job) {
          job.isApplied = true
        }
        // 申请成功后，调用fetchApplications()方法刷新申请记录
        const userStore = useUserStore()
        await userStore.fetchApplications()
      }
      // 可以在这里添加申请成功的逻辑，比如更新申请状态等
      return true
    } catch (error: any) {
      console.error('申请岗位失败:', error)
      // 检查是否是重复申请的错误
      if (error.response?.data?.detail === '已经申请过该岗位') {
        // 更新本地状态
        const job = jobs.value.find(j => j.id === jobId)
        if (job) {
          job.isApplied = true
        }
        throw new Error('already_applied')
      }
      throw error
    }
  }

  function selectJob(job: Job | null) {
    selectedJob.value = job
  }

  async function loadFavoritesFromBackend() {
    try {
      const userStore = useUserStore()
      if (userStore.isLoggedIn) {
        const response = await jobApi.getFavorites()
        if (response.data && Array.isArray(response.data)) {
          const favoriteJobIds = response.data.map((job: any) => job.id.toString())
          jobs.value.forEach(job => {
            job.isFavorite = favoriteJobIds.includes(job.id)
          })
        }
      }
    } catch (error) {
      console.error('从后端加载收藏状态失败:', error)
    }
  }

  async function loadAppliedFromBackend() {
    try {
      const userStore = useUserStore()
      if (userStore.isLoggedIn) {
        const response = await jobApi.getApplications()
        if (response.data && Array.isArray(response.data)) {
          const appliedJobIds = response.data.map((app: any) => app.job_id.toString())
          jobs.value.forEach(job => {
            job.isApplied = appliedJobIds.includes(job.id)
          })
        }
      }
    } catch (error) {
      console.error('从后端加载已申请状态失败:', error)
    }
  }

  function clearFilter() {
    filter.value = {
      keyword: '',
      industry: '',
      salaryRange: '',
      location: '',
      experience: '',
      companyType: '',
      companyScale: '',
      sortBy: 'date'
    }
  }



  // 从清洗后的Excel数据加载岗位
  async function loadJobsFromCleanedData(cleanedData: any[]) {
    jobs.value = cleanedData.map((row, index) => {
      // 解析薪资范围
      const salaryRange = row['薪资范围'] || row.salary || '面议'
      let salaryMin = 0
      let salaryMax = 0

      if (salaryRange !== '面议') {
        // 处理薪资格式，如 "1-2万" 或 "5000-8000"
        const salaryMatch = salaryRange.match(/(\d+)[-\s]*(\d+)?[万千]?/)
        if (salaryMatch) {
          salaryMin = parseInt(salaryMatch[1]) * 10000 // 转换为元
          if (salaryMatch[2]) {
            salaryMax = parseInt(salaryMatch[2]) * 10000
          } else {
            salaryMax = salaryMin
          }
        }
      }

      // 生成标签
      const tags = []
      if (row['所属行业']) tags.push(row['所属行业'])
      if (row['公司规模']) tags.push(row['公司规模'])
      if (row['公司类型']) tags.push(row['公司类型'])

      // 生成整数类型的ID
      const numericId = row.id || row['岗位编码'] || (index + 1)

      return {
        id: numericId.toString(),
        title: row.title || row['岗位名称'] || '未知岗位',
        company: row.company || row['公司名称'] || '未知公司',
        industry: row.industry || row['所属行业'] || '其他',
        location: row.location || row['地址'] || '未知地点',
        salary: salaryRange,
        salaryMin: row.salaryMin || salaryMin,
        salaryMax: row.salaryMax || salaryMax,
        experience: row.experience || '不限',
        education: row.education || '不限',
        description: row.description || row['岗位详情'] || row['公司详情'] || '',
        requirements: row.requirements || [],
        tags: row.tags || tags,
        isFavorite: false,
        isApplied: false,
        publishDate: row.publishDate || row['更新日期'] || new Date().toISOString(),
        companyType: row.companyType || row['公司类型'] || '其他',
        companyScale: row.companyScale || row['公司规模'] || '其他'
      }
    })
    await loadFavoritesFromBackend()
    await loadAppliedFromBackend()
  }

  // 自动加载并清洗XLS文件（分片处理）
  async function loadJobsFromExcel() {
    try {
      // 加载XLS文件
      const response = await fetch('/shuju/a13基于AI的大学生职业规划智能体-JD采样数据 - 副本.xls')
      if (!response.ok) {
        throw new Error('文件加载失败')
      }

      const arrayBuffer = await response.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })

      // 获取第一个工作表
      const sheetName = workbook.SheetNames[0]
      if (!sheetName) {
        throw new Error('工作表名称不存在')
      }
      const worksheet = workbook.Sheets[sheetName]

      if (!worksheet) {
        throw new Error('工作表不存在')
      }

      // 分片处理数据
      const cleanedData = await processExcelInChunks(worksheet)

      // 加载清洗后的数据
      await loadJobsFromCleanedData(cleanedData)
      console.log('Excel数据加载成功，共', cleanedData.length, '条岗位数据')
    } catch (error) {
      console.error('加载Excel文件失败:', error)
      // 加载失败时使用空数组
      jobs.value = []
    }
  }

  // 分片处理Excel数据
  async function processExcelInChunks(worksheet: XLSX.WorkSheet) {
    // 直接解析整个工作表的数据
    const rawData = XLSX.utils.sheet_to_json(worksheet)
    const totalRows = rawData.length

    // 定义分片大小（减小分片大小以减少UI阻塞）
    const chunkSize = 500 // 每片处理500行
    const cleanedData: any[] = []

    console.log('开始分片处理Excel数据，共', totalRows, '条记录')

    // 逐片处理
    for (let startIndex = 0; startIndex < totalRows; startIndex += chunkSize) {
      const endIndex = Math.min(startIndex + chunkSize, totalRows)
      console.log(`处理分片: 记录 ${startIndex + 1} 到 ${endIndex}`)

      // 获取当前分片的数据
      const chunkData = rawData.slice(startIndex, endIndex)

      // 清洗当前分片的数据
      const cleanedChunk = chunkData.filter((row: any) => {
        return row && (row['岗位名称'] || row.title)
      })

      // 将清洗后的数据添加到结果中
      cleanedData.push(...cleanedChunk)

      // 增加处理延迟，让浏览器有更多时间响应UI事件
      await new Promise(resolve => setTimeout(resolve, 20))
    }

    console.log('分片处理完成，共清洗', cleanedData.length, '条数据')
    return cleanedData
  }

  return {
    jobs,
    filter,
    isLoading,
    selectedJob,
    filteredJobs,
    favoriteJobs,
    industries,
    companyTypes,
    companyScales,
    locations,
    fetchJobs,
    searchJobs,
    fetchJobDetail,
    setFilter,
    toggleFavorite,
    applyJob,
    selectJob,
    loadFavoritesFromBackend,
    loadAppliedFromBackend,
    clearFilter,
    loadJobsFromCleanedData,
    loadJobsFromExcel
  }
})
