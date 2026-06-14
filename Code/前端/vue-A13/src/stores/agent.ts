import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { agentApi } from '@/api/agent'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export const useAgentStore = defineStore('agent', () => {
  const messages = ref<ChatMessage[]>([])
  const isConnected = ref(false)
  const isTyping = ref(false)
  const isLoading = ref(false)
  const userId = ref('user_' + Date.now())

  const sortedMessages = computed(() => {
    return [...messages.value].sort((a, b) =>
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    )
  })

  async function connect() {
    try {
      isLoading.value = true
      const data = await agentApi.connect()
      if (data.message) {
        isConnected.value = true
        return { success: true, message: '智能体连接成功' }
      } else {
        throw new Error('连接失败')
      }
    } catch (error) {
      console.error('连接失败:', error)
      isConnected.value = false
      return { success: false, message: '连接失败，请确保智能体服务已配置正确' }
    } finally {
      isLoading.value = false
    }
  }

  async function disconnect() {
    try {
      await agentApi.disconnect()
      isConnected.value = false
      return { success: true, message: '已断开连接' }
    } catch (error) {
      console.error('断开连接失败:', error)
      return { success: false, message: '断开连接失败' }
    }
  }

  async function sendMessage(content: string) {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    }

    messages.value.push(userMessage)
    isTyping.value = true

    try {
      const response = await agentApi.sendMessage(content, userId.value)
      const data = response

      let assistantContent = ''
      if (data.response) {
        assistantContent = data.response
      } else if (data.choices && data.choices.length > 0) {
        assistantContent = data.choices[0].message?.content || data.choices[0].text || ''
      } else if (data.content) {
        assistantContent = data.content
      } else if (typeof data === 'string') {
        assistantContent = data
      } else {
        assistantContent = JSON.stringify(data)
      }

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantContent,
        timestamp: new Date().toISOString()
      }

      messages.value.push(assistantMessage)

      return { success: true }
    } catch (error) {
      console.error('发送消息失败:', error)

      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，智能体服务暂时无法响应。请稍后再试。',
        timestamp: new Date().toISOString()
      }
      messages.value.push(errorMessage)

      return { success: false, message: '发送失败' }
    } finally {
      isTyping.value = false
    }
  }

  async function clearChatHistory() {
    try {
      await agentApi.clearChatHistory(userId.value)
      messages.value = []
      return { success: true, message: '已清空对话历史' }
    } catch (error) {
      console.error('清空历史失败:', error)
      messages.value = []
      return { success: false, message: '清空历史失败' }
    }
  }

  async function loadChatHistory() {
    // Coze API不保存历史，每次重新开始
    messages.value = []
  }

  function loadFromLocalStorage() {
    loadChatHistory()
  }

  function saveToLocalStorage() {
  }

  return {
    messages,
    isConnected,
    isTyping,
    isLoading,
    sortedMessages,
    connect,
    disconnect,
    sendMessage,
    clearChatHistory,
    loadChatHistory,
    loadFromLocalStorage,
    saveToLocalStorage,
    userId
  }
})
