<!--
管理端页面

功能：
- 用户管理（查看、编辑、删除用户）
- 岗位管理（查看、编辑、删除岗位）
- 管理员权限验证

技术特点：
- 响应式布局
- 数据表格
- 模态框编辑
- 与后端API集成
-->

<template>
  <div class="admin-container">
    <!-- 侧边栏 -->
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <h2>管理中心</h2>
        <div class="admin-avatar">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
      </div>
      <nav class="sidebar-nav">
        <button 
          :class="['nav-item', { active: activeTab === 'users' }]"
          @click="activeTab = 'users'"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          <span>用户管理</span>
        </button>
        <button 
          :class="['nav-item', { active: activeTab === 'jobs' }]"
          @click="activeTab = 'jobs'"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
          <span>岗位管理</span>
        </button>
        <button 
          :class="['nav-item', { active: activeTab === 'pages' }]"
          @click="activeTab = 'pages'"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <line x1="3" y1="9" x2="21" y2="9"/>
            <line x1="9" y1="21" x2="9" y2="9"/>
          </svg>
          <span>页面管理</span>
        </button>
        <button 
          class="nav-item logout"
          @click="handleLogout"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
            <polyline points="16,17 21,12 16,7"/>
            <line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>退出登录</span>
        </button>
      </nav>
    </aside>

    <!-- 主内容区 -->
    <main class="admin-main">
      <!-- 用户管理 -->
      <div v-if="activeTab === 'users'" class="tab-content">
        <div class="content-header">
          <h1>用户管理</h1>
          <button class="btn-primary" @click="openAddUserModal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>添加用户</span>
          </button>
        </div>
        
        <div class="data-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>用户名</th>
                <th>邮箱</th>
                <th>姓名</th>
                <th>角色</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.username }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.name }}</td>
                <td>
                  <span :class="['role-badge', user.role]">
                    {{ user.role === 'admin' ? '管理员' : '普通用户' }}
                  </span>
                </td>
                <td class="action-buttons">
                  <button class="btn-edit" @click="openEditUserModal(user)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button class="btn-delete" @click="deleteUser(user.id)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1 2-2h4a2,2 0 0,1 2,2v2"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 岗位管理 -->
      <div v-else-if="activeTab === 'jobs'" class="tab-content">
        <div class="content-header">
          <h1>岗位管理</h1>
          <button class="btn-primary" @click="openAddJobModal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>添加岗位</span>
          </button>
        </div>
        
        <div class="data-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>职位</th>
                <th>公司</th>
                <th>薪资</th>
                <th>地点</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="job in jobs" :key="job.id">
                <td>{{ job.id }}</td>
                <td>{{ job.title }}</td>
                <td>{{ job.company }}</td>
                <td>{{ job.salary }}</td>
                <td>{{ job.location }}</td>
                <td class="action-buttons">
                  <button class="btn-edit" @click="openEditJobModal(job)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button class="btn-delete" @click="deleteJob(job.id)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1 2-2h4a2,2 0 0,1 2,2v2"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 页面管理 -->
      <div v-else-if="activeTab === 'pages'" class="tab-content">
        <div class="content-header">
          <h1>页面管理</h1>
          <button class="btn-primary" @click="openAddPageModal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            <span>添加页面</span>
          </button>
        </div>
        
        <div class="data-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>名称</th>
                <th>标题</th>
                <th>路由</th>
                <th>状态</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="page in pages" :key="page.id">
                <td>{{ page.id }}</td>
                <td>{{ page.name }}</td>
                <td>{{ page.title }}</td>
                <td>{{ page.route }}</td>
                <td>
                  <span :class="['status-badge', page.is_enabled ? 'enabled' : 'disabled']">
                    {{ page.is_enabled ? '启用' : '禁用' }}
                  </span>
                </td>
                <td class="action-buttons">
                  <button class="btn-toggle" @click="togglePageStatus(page.id, !page.is_enabled)">
                    <svg v-if="page.is_enabled" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M18 6L6 18"/>
                      <path d="M6 6l12 12"/>
                    </svg>
                    <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                  </button>
                  <button class="btn-edit" @click="openEditPageModal(page)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button class="btn-delete" @click="deletePage(page.id)">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3,6 5,6 21,6"/>
                      <path d="M19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1 2-2h4a2,2 0 0,1 2,2v2"/>
                    </svg>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- 添加/编辑用户模态框 -->
    <div v-if="showUserModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingUser ? '编辑用户' : '添加用户' }}</h3>
          <button class="close-btn" @click="showUserModal = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form @submit.prevent="saveUser">
          <div class="form-group">
            <label>用户名</label>
            <input v-model="userForm.username" type="text" required/>
          </div>
          <div class="form-group">
            <label>密码</label>
            <input v-model="userForm.password" type="password" :required="!editingUser"/>
          </div>
          <div class="form-group">
            <label>邮箱</label>
            <input v-model="userForm.email" type="email" required/>
          </div>
          <div class="form-group">
            <label>姓名</label>
            <input v-model="userForm.name" type="text" required/>
          </div>
          <div class="form-group">
            <label>角色</label>
            <select v-model="userForm.role">
              <option value="user">普通用户</option>
              <option value="admin">管理员</option>
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="showUserModal = false">取消</button>
            <button type="submit" class="btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 添加/编辑岗位模态框 -->
    <div v-if="showJobModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingJob ? '编辑岗位' : '添加岗位' }}</h3>
          <button class="close-btn" @click="showJobModal = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form @submit.prevent="saveJob">
          <div class="form-group">
            <label>职位</label>
            <input v-model="jobForm.title" type="text" required/>
          </div>
          <div class="form-group">
            <label>公司</label>
            <input v-model="jobForm.company" type="text" required/>
          </div>
          <div class="form-group">
            <label>薪资</label>
            <input v-model="jobForm.salary" type="text" required/>
          </div>
          <div class="form-group">
            <label>地点</label>
            <input v-model="jobForm.location" type="text" required/>
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="jobForm.description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>要求</label>
            <textarea v-model="jobForm.requirements" rows="3"></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="showJobModal = false">取消</button>
            <button type="submit" class="btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 添加/编辑页面模态框 -->
    <div v-if="showPageModal" class="modal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ editingPage ? '编辑页面' : '添加页面' }}</h3>
          <button class="close-btn" @click="showPageModal = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <form @submit.prevent="savePage">
          <div class="form-group">
            <label>名称</label>
            <input v-model="pageForm.name" type="text" required/>
          </div>
          <div class="form-group">
            <label>标题</label>
            <input v-model="pageForm.title" type="text" required/>
          </div>
          <div class="form-group">
            <label>路由</label>
            <input v-model="pageForm.route" type="text" required/>
          </div>
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="pageForm.description" rows="3"></textarea>
          </div>
          <div class="form-group">
            <label>状态</label>
            <div class="checkbox-group">
              <input type="checkbox" id="isEnabled" v-model="pageForm.is_enabled"/>
              <label for="isEnabled">启用</label>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn-secondary" @click="showPageModal = false">取消</button>
            <button type="submit" class="btn-primary">保存</button>
          </div>
        </form>
      </div>
    </div>

    <!-- 确认删除弹窗 -->
    <div v-if="showConfirmModal" class="modal">
      <div class="modal-content confirm-modal">
        <div class="modal-header">
          <h3>确认删除</h3>
          <button class="close-btn" @click="showConfirmModal = false">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="confirm-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <p class="confirm-message">{{ confirmMessage }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn-secondary" @click="showConfirmModal = false">取消</button>
          <button type="button" class="btn-danger" @click="confirmDelete">确认删除</button>
        </div>
      </div>
    </div>

    <!-- 通知弹窗 -->
    <div v-if="showNotification" class="notification" :class="notificationType">
      <div class="notification-icon">
        <svg v-if="notificationType === 'success'" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <div class="notification-content">
        <h4>{{ notificationTitle }}</h4>
        <p>{{ notificationMessage }}</p>
      </div>
      <button class="close-notification" @click="showNotification = false">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref('users')
const users = ref<any[]>([])
const jobs = ref<any[]>([])
const showUserModal = ref(false)
const showJobModal = ref(false)
const editingUser = ref<any>(null)
const editingJob = ref<any>(null)

const userForm = reactive({
  username: '',
  password: '',
  email: '',
  name: '',
  role: 'user'
})

const jobForm = reactive({
  title: '',
  company: '',
  salary: '',
  location: '',
  description: '',
  requirements: ''
})

// 页面管理
const pages = ref<any[]>([])
const showPageModal = ref(false)
const editingPage = ref<any>(null)

const pageForm = reactive({
  name: '',
  title: '',
  route: '',
  description: '',
  is_enabled: true
})

// 确认删除弹窗
const showConfirmModal = ref(false)
const confirmMessage = ref('')
let deleteCallback: (() => void) | null = null

// 通知弹窗
const showNotification = ref(false)
const notificationTitle = ref('')
const notificationMessage = ref('')
const notificationType = ref<'success' | 'error'>('success')

// 加载用户数据
const loadUsers = async () => {
  try {
    // 调用管理端API获取用户列表
    const response = await fetch('http://localhost:8000/admin/users', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (response.ok) {
      users.value = await response.json()
    } else {
      console.error('获取用户列表失败')
    }
  } catch (error) {
    console.error('加载用户数据失败:', error)
  }
}

// 加载岗位数据
const loadJobs = async () => {
  try {
    // 调用管理端API获取岗位列表
    const response = await fetch('http://localhost:8000/admin/jobs', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (response.ok) {
      jobs.value = await response.json()
    } else {
      console.error('获取岗位列表失败')
    }
  } catch (error) {
    console.error('加载岗位数据失败:', error)
  }
}

// 打开添加用户模态框
const openAddUserModal = () => {
  editingUser.value = null
  userForm.username = ''
  userForm.password = ''
  userForm.email = ''
  userForm.name = ''
  userForm.role = 'user'
  showUserModal.value = true
}

// 打开编辑用户模态框
const openEditUserModal = (user: any) => {
  editingUser.value = user
  userForm.username = user.username
  userForm.password = ''
  userForm.email = user.email
  userForm.name = user.name
  userForm.role = user.role
  showUserModal.value = true
}

// 保存用户
const saveUser = async () => {
  try {
    const url = editingUser.value 
      ? `http://localhost:8000/admin/users/${editingUser.value.id}`
      : 'http://localhost:8000/admin/users'
    
    const method = editingUser.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(userForm)
    })
    
    if (response.ok) {
      showUserModal.value = false
      loadUsers()
    } else {
      console.error('保存用户失败')
    }
  } catch (error) {
    console.error('保存用户失败:', error)
  }
}

// 删除用户
const deleteUser = (userId: number) => {
  showConfirm('确定要删除这个用户吗？', async () => {
    try {
      const response = await fetch(`http://localhost:8000/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        loadUsers()
        showNotify('删除成功', '用户删除成功！', 'success')
      } else {
        const errorData = await response.json()
        console.error('删除用户失败:', errorData)
        showNotify('删除失败', errorData.detail || '未知错误', 'error')
      }
    } catch (error) {
      console.error('删除用户失败:', error)
      showNotify('删除失败', '请检查网络连接', 'error')
    }
  })
}

// 打开添加岗位模态框
const openAddJobModal = () => {
  editingJob.value = null
  jobForm.title = ''
  jobForm.company = ''
  jobForm.salary = ''
  jobForm.location = ''
  jobForm.description = ''
  jobForm.requirements = ''
  showJobModal.value = true
}

// 打开编辑岗位模态框
const openEditJobModal = (job: any) => {
  editingJob.value = job
  jobForm.title = job.title
  jobForm.company = job.company
  jobForm.salary = job.salary
  jobForm.location = job.location
  jobForm.description = job.description
  jobForm.requirements = job.requirements
  showJobModal.value = true
}

// 保存岗位
const saveJob = async () => {
  try {
    const url = editingJob.value 
      ? `http://localhost:8000/admin/jobs/${editingJob.value.id}`
      : 'http://localhost:8000/admin/jobs'
    
    const method = editingJob.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(jobForm)
    })
    
    if (response.ok) {
      showJobModal.value = false
      loadJobs()
    } else {
      console.error('保存岗位失败')
    }
  } catch (error) {
    console.error('保存岗位失败:', error)
  }
}

// 删除岗位
const deleteJob = (jobId: number) => {
  showConfirm('确定要删除这个岗位吗？', async () => {
    try {
      const response = await fetch(`http://localhost:8000/admin/jobs/${jobId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        loadJobs()
        showNotify('删除成功', '岗位删除成功！', 'success')
      } else {
        console.error('删除岗位失败')
        showNotify('删除失败', '未知错误', 'error')
      }
    } catch (error) {
      console.error('删除岗位失败:', error)
      showNotify('删除失败', '请检查网络连接', 'error')
    }
  })
}

// 退出登录
const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

// 显示确认删除弹窗
const showConfirm = (message: string, callback: () => void) => {
  confirmMessage.value = message
  deleteCallback = callback
  showConfirmModal.value = true
}

// 确认删除
const confirmDelete = () => {
  if (deleteCallback) {
    deleteCallback()
  }
  showConfirmModal.value = false
  deleteCallback = null
}

// 显示通知弹窗
const showNotify = (title: string, message: string, type: 'success' | 'error' = 'success') => {
  notificationTitle.value = title
  notificationMessage.value = message
  notificationType.value = type
  showNotification.value = true
  
  // 3秒后自动关闭
  setTimeout(() => {
    showNotification.value = false
  }, 3000)
}

// 加载页面数据
const loadPages = async () => {
  try {
    const response = await fetch('http://localhost:8000/admin/pages', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (response.ok) {
      pages.value = await response.json()
    } else {
      console.error('获取页面列表失败')
    }
  } catch (error) {
    console.error('加载页面数据失败:', error)
  }
}

// 打开添加页面模态框
const openAddPageModal = () => {
  editingPage.value = null
  pageForm.name = ''
  pageForm.title = ''
  pageForm.route = ''
  pageForm.description = ''
  pageForm.is_enabled = true
  showPageModal.value = true
}

// 打开编辑页面模态框
const openEditPageModal = (page: any) => {
  editingPage.value = page
  pageForm.name = page.name
  pageForm.title = page.title
  pageForm.route = page.route
  pageForm.description = page.description
  pageForm.is_enabled = page.is_enabled
  showPageModal.value = true
}

// 保存页面
const savePage = async () => {
  try {
    const url = editingPage.value 
      ? `http://localhost:8000/admin/pages/${editingPage.value.id}`
      : 'http://localhost:8000/admin/pages'
    
    const method = editingPage.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(pageForm)
    })
    
    if (response.ok) {
      showPageModal.value = false
      loadPages()
      showNotify('保存成功', editingPage.value ? '页面编辑成功！' : '页面添加成功！', 'success')
    } else {
      console.error('保存页面失败')
      showNotify('保存失败', '未知错误', 'error')
    }
  } catch (error) {
    console.error('保存页面失败:', error)
    showNotify('保存失败', '请检查网络连接', 'error')
  }
}

// 切换页面状态
const togglePageStatus = async (pageId: number, isEnabled: boolean) => {
  try {
    const response = await fetch(`http://localhost:8000/admin/pages/${pageId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ is_enabled: isEnabled })
    })
    
    if (response.ok) {
      loadPages()
      showNotify('状态更新', `页面已${isEnabled ? '启用' : '禁用'}`, 'success')
    } else {
      console.error('更新页面状态失败')
      showNotify('状态更新失败', '未知错误', 'error')
    }
  } catch (error) {
    console.error('更新页面状态失败:', error)
    showNotify('状态更新失败', '请检查网络连接', 'error')
  }
}

// 删除页面
const deletePage = (pageId: number) => {
  showConfirm('确定要删除这个页面吗？', async () => {
    try {
      const response = await fetch(`http://localhost:8000/admin/pages/${pageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        loadPages()
        showNotify('删除成功', '页面删除成功！', 'success')
      } else {
        console.error('删除页面失败')
        showNotify('删除失败', '未知错误', 'error')
      }
    } catch (error) {
      console.error('删除页面失败:', error)
      showNotify('删除失败', '请检查网络连接', 'error')
    }
  })
}

// 页面加载时检查权限并加载数据
onMounted(async () => {
  // 检查是否已登录
  if (!localStorage.getItem('token')) {
    router.push('/login')
    return
  }
  
  // 检查用户角色
  try {
    const userInfo = userStore.user
    if (!userInfo || userInfo.role !== 'admin') {
      router.push('/')
      return
    }
    
    // 加载数据
    await loadUsers()
    await loadJobs()
    await loadPages()
  } catch (error) {
    console.error('权限检查失败:', error)
    router.push('/login')
  }
})

// 监听选项卡变化，加载对应数据
watch(activeTab, async (newTab) => {
  if (newTab === 'pages') {
    await loadPages()
  }
})
</script>

<style scoped>
.admin-container {
  display: flex;
  min-height: 100vh;
  background: #f8fafc;
}

/* 侧边栏 */
.admin-sidebar {
  width: 200px;
  background: #1a1a2e;
  color: white;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 30px;
  padding: 0 20px;
}

.sidebar-header h2 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 15px;
  text-align: center;
}

.admin-avatar {
  width: 50px;
  height: 50px;
  background: #4a4a8a;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
}

.sidebar-nav {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 20px;
  border-radius: 0;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  font-weight: 500;
  border-left: 3px solid transparent;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: white;
}

.nav-item.active {
  background: rgba(74, 74, 138, 0.3);
  color: white;
  border-left-color: #4a4a8a;
}

.nav-item.logout {
  margin-top: auto;
  color: #f87171;
  border-left-color: transparent;
}

.nav-item.logout:hover {
  background: rgba(248, 113, 113, 0.2);
  color: #fca5a5;
}

/* 主内容区 */
.admin-main {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e2e8f0;
}

.content-header h1 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #4a4a8a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #3a3a6a;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(74, 74, 138, 0.4);
}

/* 数据表格 */
.data-table {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 10px 16px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  color: #334155;
}

th {
  background: #f8fafc;
  font-weight: 600;
  color: #1e293b;
  font-size: 0.875rem;
}

tr:hover {
  background: #f8fafc;
}

.role-badge {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 0.75rem;
  font-weight: 500;
}

.role-badge.user {
  background: #e0f2fe;
  color: #0284c7;
}

.role-badge.admin {
  background: #fef3c7;
  color: #d97706;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-edit, .btn-delete {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
}

.btn-edit {
  background: #e0f2fe;
  color: #0284c7;
}

.btn-edit:hover {
  background: #bae6fd;
}

.btn-delete {
  background: #fef2f2;
  color: #ef4444;
}

.btn-delete:hover {
  background: #fee2e2;
}

/* 模态框 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: #f1f5f9;
  color: #334155;
}

.modal-content form {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  font-weight: 600;
  color: #475569;
  margin-bottom: 6px;
  font-size: 0.875rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #4a4a8a;
  box-shadow: 0 0 0 2px rgba(74, 74, 138, 0.1);
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  margin-top: 10px;
}

.btn-secondary {
  padding: 8px 16px;
  background: #f1f5f9;
  color: #334155;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #e2e8f0;
}

/* 响应式设计 */
/* 确认删除弹窗 */
.confirm-modal .modal-body {
  text-align: center;
  padding: 30px 20px;
}

.confirm-icon {
  margin-bottom: 20px;
  color: #ef4444;
}

.confirm-message {
  font-size: 1rem;
  color: #334155;
  margin: 0;
}

.btn-danger {
  padding: 8px 16px;
  background: #ef4444;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-danger:hover {
  background: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
}

/* 页面管理样式 */
.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-badge.enabled {
  background: #dcfce7;
  color: #166534;
}

.status-badge.disabled {
  background: #fef2f2;
  color: #991b1b;
}

.btn-toggle {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.btn-toggle:hover {
  background: #f1f5f9;
  color: #334155;
}

.checkbox-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-group input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.checkbox-group label {
  cursor: pointer;
  font-weight: normal;
}

/* 通知弹窗 */
.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  padding: 16px 20px;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  min-width: 300px;
  max-width: 400px;
  animation: slideIn 0.3s ease-out;
}

.notification.success {
  background: #f0fdf4;
  color: #15803d;
  border-left: 4px solid #22c55e;
}

.notification.error {
  background: #fef2f2;
  color: #b91c1c;
  border-left: 4px solid #ef4444;
}

.notification-icon {
  flex-shrink: 0;
  margin-top: 2px;
}

.notification-content {
  flex: 1;
}

.notification-content h4 {
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.notification-content p {
  font-size: 0.875rem;
  margin: 0;
  opacity: 0.9;
}

.close-notification {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.close-notification:hover {
  background: rgba(0, 0, 0, 0.1);
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@media (max-width: 768px) {
  .admin-container {
    flex-direction: column;
  }
  
  .admin-sidebar {
    width: 100%;
    padding: 10px 0;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  
  .sidebar-header {
    flex-direction: row;
    gap: 10px;
    margin-bottom: 0;
    padding: 0 15px;
  }
  
  .sidebar-header h2 {
    font-size: 1rem;
    margin-bottom: 0;
  }
  
  .admin-avatar {
    width: 40px;
    height: 40px;
    margin-bottom: 0;
  }
  
  .sidebar-nav {
    flex-direction: row;
    gap: 5px;
    padding: 0 10px;
  }
  
  .nav-item {
    padding: 8px 12px;
    font-size: 0.85rem;
    border-left: none;
    border-radius: 4px;
  }
  
  .nav-item span {
    display: none;
  }
  
  .nav-item.logout {
    margin-top: 0;
  }
  
  .admin-main {
    padding: 15px;
  }
  
  .content-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .data-table {
    overflow-x: auto;
  }
  
  .notification {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>
