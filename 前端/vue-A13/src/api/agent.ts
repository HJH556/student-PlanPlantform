import request from '@/utils/request'

// 智能体相关API - 通过后端API调用Coze智能体
export const agentApi = {
  // 建立智能体连接
  connect: async () => {
    try {
      const response = await request.post('/agent/connect')
      return response.data
    } catch (error) {
      console.error('连接失败:', error)
      return { success: false, message: '连接失败' }
    }
  },

  // 断开智能体连接
  disconnect: async () => {
    try {
      const response = await request.post('/agent/disconnect')
      return response.data
    } catch (error) {
      console.error('断开连接失败:', error)
      return { success: false, message: '断开连接失败' }
    }
  },

  // 发送消息给智能体
  sendMessage: async (message: string, userId?: string) => {
    try {
      // 如果没有提供userId，生成一个
      const uid = userId || 'user_' + Date.now()

      const response = await request.post('/agent/send-message', null, {
        params: {
          user_id: uid,
          message: message
        }
      })

      return response.data
    } catch (error) {
      console.error('发送消息失败:', error)
      // 返回模拟数据
      return {
        message: message,
        response: '抱歉，我暂时无法回答你的问题。',
        timestamp: new Date().toISOString()
      }
    }
  },

  // 获取智能体对话历史
  getChatHistory: (userId: string) => {
    return request.get(`/agent/chat-history/${userId}`)
  },

  // 清空智能体对话历史
  clearChatHistory: (userId: string) => {
    return request.post(`/agent/clear-history/${userId}`)
  },

  // 获取智能体状态
  getAgentStatus: () => {
    return request.get('/agent/status')
  },

  // 配置智能体参数
  configureAgent: (config: any) => {
    return request.post('/agent/configure', config)
  },

  // 获取智能体推荐
  getAgentRecommendations: async (context?: any) => {
    try {
      const response = await request.post('/agent/recommendations', context)
      return response.data
    } catch (error) {
      console.error('获取推荐失败:', error)
      // 返回模拟数据
      return {
        recommendations: [
          {
            type: 'job',
            id: 1,
            title: '软件工程师',
            score: 0.9
          },
          {
            type: 'course',
            id: 1,
            title: 'Python高级编程',
            score: 0.8
          }
        ]
      }
    }
  }
}
