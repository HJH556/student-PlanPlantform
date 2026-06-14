<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useAgentStore } from '@/stores/agent'

// 对话框显示状态
const isDialogOpen = ref(false)

// 用户输入
const userInput = ref('')

// 导入 agentStore
const agentStore = useAgentStore()

// 消息容器引用
const messagesContainer = ref<HTMLElement | null>(null)

// 悬浮球位置
const position = ref({
  top: '50%',
  right: '30px'
})

// 拖动状态
const isDragging = ref(false)
const startX = ref(0)
const startY = ref(0)
const startTop = ref(0)
const startRight = ref(0)

// 切换对话框显示状态
const toggleDialog = () => {
  isDialogOpen.value = !isDialogOpen.value
  // 打开对话框时滚动到底部
  if (isDialogOpen.value) {
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 关闭对话框
const closeDialog = () => {
  isDialogOpen.value = false
}

// 点击对话框外部关闭
const handleClickOutside = (e: MouseEvent) => {
  if (isDialogOpen.value) {
    const dialog = document.querySelector('.agent-dialog') as HTMLElement
    const floatingBall = document.querySelector('.floating-ball') as HTMLElement
    if (dialog && floatingBall && !dialog.contains(e.target as Node) && !floatingBall.contains(e.target as Node)) {
      closeDialog()
    }
  }
}

// 提问方法
const askQuestion = (question: string) => {
  userInput.value = question
  sendMessage()
}

// 发送消息
const sendMessage = async () => {
  if (userInput.value.trim()) {
    const message = userInput.value.trim()
    userInput.value = ''
    
    // 滚动到底部
    scrollToBottom()
    
    // 调用 agentStore 的 sendMessage 方法
    await agentStore.sendMessage(message)
    
    // 发送消息后滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
  }
}

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

// 开始拖动
const startDrag = (e: MouseEvent) => {
  isDragging.value = true
  startX.value = e.clientX
  startY.value = e.clientY
  
  // 解析当前位置
  const currentTop = position.value.top
  const currentRight = position.value.right
  
  // 处理百分比值
  if (typeof currentTop === 'string') {
    if (currentTop.endsWith('%')) {
      const percentage = parseFloat(currentTop)
      startTop.value = (window.innerHeight * percentage) / 100
    } else {
      startTop.value = parseFloat(currentTop)
    }
  } else {
    startTop.value = currentTop
  }
  
  if (typeof currentRight === 'string') {
    if (currentRight.endsWith('%')) {
      const percentage = parseFloat(currentRight)
      startRight.value = (window.innerWidth * percentage) / 100
    } else {
      startRight.value = parseFloat(currentRight)
    }
  } else {
    startRight.value = currentRight
  }
  
  // 阻止默认行为和冒泡
  e.preventDefault()
  e.stopPropagation()
}

// 拖动中
const onDrag = (e: MouseEvent) => {
  if (!isDragging.value) return
  
  const deltaX = e.clientX - startX.value
  const deltaY = e.clientY - startY.value
  
  // 计算新位置
  const newRight = startRight.value - deltaX
  const newTop = startTop.value + deltaY
  
  // 限制在视窗内
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight
  const ballWidth = 60
  const ballHeight = 60
  
  const clampedRight = Math.max(10, Math.min(newRight, viewportWidth - ballWidth - 10))
  const clampedTop = Math.max(10, Math.min(newTop, viewportHeight - ballHeight - 10))
  
  position.value = {
    top: `${clampedTop}px`,
    right: `${clampedRight}px`
  }
}

// 结束拖动
const endDrag = () => {
  isDragging.value = false
}

// 初始化智能体连接
const initAgent = async () => {
  try {
    await agentStore.connect()
    console.log('智能体连接成功')
  } catch (error) {
    console.error('智能体连接失败:', error)
  }
}

// 监听鼠标事件
onMounted(async () => {
  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', endDrag)
  document.addEventListener('click', handleClickOutside)
  
  // 初始化智能体连接
  await initAgent()
})

onUnmounted(() => {
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', endDrag)
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="floating-agent-container" :style="{ top: position.top, right: position.right }">
    <!-- 悬浮球 -->
    <div 
      class="floating-ball" 
      @click="toggleDialog"
      @mousedown="startDrag"
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
      </svg>
    </div>

    <!-- 对话框 -->
    <div class="agent-dialog" :class="{ 'open': isDialogOpen }">
      <div class="dialog-header">
        <h3>IT职业顾问</h3>
        <button class="close-btn" @click="closeDialog">×</button>
      </div>
      <div class="dialog-content">
        <!-- 智能助手内容 -->
        <div class="agent-content">
          <!-- 消息显示区域 -->
          <div class="messages-container" ref="messagesContainer">
            <!-- 系统欢迎消息 -->
            <div class="message system-message">
              <div class="message-avatar">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div class="message-content">
                <div class="message-text">你好！我是IT职业发展顾问，基于知识图谱为你提供职业规划建议。你可以问我关于岗位晋升路径、职业转换方向等问题。</div>
                <div class="message-time">{{ new Date().toLocaleTimeString() }}</div>
              </div>
            </div>

            <!-- 消息列表 -->
            <div 
              v-for="(message, index) in agentStore.messages" 
              :key="message.id"
              :class="['message', message.role === 'user' ? 'user-message' : 'agent-message']"
            >
              <div class="message-avatar">
                <svg v-if="message.role === 'user'" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <svg v-else width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div class="message-content">
                <div class="message-text">{{ message.content }}</div>
                <div class="message-time">{{ new Date(message.timestamp).toLocaleTimeString() }}</div>
              </div>
            </div>

            <!-- 正在输入提示 -->
            <div v-if="agentStore.isTyping" class="message agent-message">
              <div class="message-avatar">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <div class="message-content">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>

          <!-- 快捷信息 -->
          <div class="quick-messages">
            <button class="quick-message-btn" @click="askQuestion('前端开发能晋升到哪些岗位？')">前端开发能晋升到哪些岗位？</button>
            <button class="quick-message-btn" @click="askQuestion('Java可以转岗到哪些方向？')">Java可以转岗到哪些方向？</button>
            <button class="quick-message-btn" @click="askQuestion('C/C++的发展路径？')">C/C++的发展路径？</button>
          </div>

          <!-- 消息输入 -->
          <div class="message-input">
            <input type="text" placeholder="输入你的问题..." v-model="userInput" @keyup.enter="sendMessage">
            <button @click="sendMessage" class="send-btn" :disabled="!userInput.trim()">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.floating-agent-container {
  position: fixed;
  z-index: 1000;
}

.floating-ball {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1a237e 0%, #3f51b5 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.3);
  transition: all 0.3s ease;
  animation: float 3s ease-in-out infinite;
}

.floating-ball:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(26, 35, 126, 0.4);
}

@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.agent-dialog {
  position: absolute;
  top: 50%;
  right: 80px;
  transform: translateY(-50%) scale(0.8);
  width: 700px;
  height: 700px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
}

.agent-dialog.open {
  transform: translateY(-50%) scale(1);
  opacity: 1;
  visibility: visible;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: linear-gradient(135deg, #1a237e 0%, #3f51b5 100%);
  color: white;
}

.dialog-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.close-btn {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.dialog-content {
  padding: 0;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.agent-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* 消息容器 */
.messages-container {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  min-height: 0;
}

/* 消息样式 */
.message {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  animation: messageSlideIn 0.3s ease-out;
  margin-bottom: 0.5rem;
  width: 100%;
  flex-shrink: 0;
}

.user-message {
  flex-direction: row-reverse;
}

.user-message .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  margin-left: 0.75rem;
  margin-right: 0;
}

@keyframes messageSlideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.system-message .message-avatar {
  background: linear-gradient(135deg, #1a237e 0%, #3f51b5 100%);
  color: white;
}

.user-message .message-avatar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.agent-message .message-avatar {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
}

.message-content {
  flex: 1;
  max-width: 70%;
  display: flex;
  flex-direction: column;
}

.user-message .message-content {
  align-items: flex-end;
}

.agent-message .message-content {
  align-items: flex-start;
}

.message-text {
  padding: 0.75rem 1rem;
  border-radius: 18px;
  font-size: 0.9rem;
  line-height: 1.4;
  word-wrap: break-word;
  display: inline-block;
}

.system-message .message-text {
  background: linear-gradient(135deg, rgba(26, 35, 126, 0.1) 0%, rgba(63, 81, 181, 0.1) 100%);
  color: #1e293b;
}

.user-message .message-text {
  background: linear-gradient(135deg, #1a237e 0%, #3f51b5 100%);
  color: white;
  border-bottom-left-radius: 18px;
  border-bottom-right-radius: 4px;
}

.agent-message .message-text {
  background: #f1f5f9;
  color: #1e293b;
  border-bottom-left-radius: 4px;
}

.message-time {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-top: 0.25rem;
  text-align: left;
}

.user-message .message-time {
  text-align: right;
}

/* 正在输入指示器 */
.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 0.75rem 1rem;
  background: #f1f5f9;
  border-radius: 18px;
  border-bottom-left-radius: 4px;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  background: #94a3b8;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
  animation-delay: -0.32s;
}

.typing-indicator span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* 快捷信息 */
.quick-messages {
  display: flex;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
  flex-wrap: wrap;
  justify-content: center;
  border-bottom: 1px solid #e2e8f0;
}

.quick-message-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 0.85rem;
  color: #1a237e;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.quick-message-btn:hover {
  background: linear-gradient(135deg, #1a237e 0%, #3f51b5 100%);
  color: white;
  border-color: transparent;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.2);
}

/* 消息输入 */
.message-input {
  display: flex;
  gap: 0.5rem;
  padding: 1rem;
  background: #f8fafc;
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
}

.message-input input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  background: white;
  min-width: 0;
  box-sizing: border-box;
}

.message-input input:focus {
  outline: none;
  border-color: #1a237e;
  box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
}

.send-btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #1a237e 0%, #3f51b5 100%);
  color: white;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
  box-sizing: border-box;
}

.send-btn:hover:not(:disabled) {
  transform: scale(1.1);
  box-shadow: 0 4px 12px rgba(26, 35, 126, 0.3);
}

.send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.send-btn:disabled:hover {
  transform: none;
  box-shadow: none;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .floating-agent-container {
    bottom: 20px;
    right: 20px;
  }

  .floating-ball {
    width: 50px;
    height: 50px;
  }

  .agent-dialog {
    width: 500px;
    right: -20px;
  }
}

@media (max-width: 480px) {
  .agent-dialog {
    width: 350px;
    right: -30px;
  }
}
</style>