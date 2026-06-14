<!--
学生信息表单组件

功能：
- 收集学生个人基本信息
- 支持表单验证
- 实时显示表单状态
- 提交时保存到全局状态

表单字段：
- 姓名
- 性别
- 专业
- 年级
- 学校
- 联系电话
- 邮箱
- 职业目标

使用场景：
- 学生画像页面的信息填写功能
- 其他需要收集个人信息的场景

技术特点：
- 使用 Element Plus 表单组件
- 集成 Pinia 全局状态管理
- 响应式布局设计
-->

<template>
  <div class="profile-form">
    <h3 class="form-title">个人信息</h3>
    <el-form :model="formData" label-width="100px" :rules="rules" ref="formRef">
      <el-form-item label="姓名" prop="name">
        <el-input v-model="formData.name" placeholder="请输入姓名" />
      </el-form-item>
      
      <el-form-item label="性别" prop="gender">
        <el-select v-model="formData.gender" placeholder="请选择性别">
          <el-option label="男" value="男" />
          <el-option label="女" value="女" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="专业" prop="major">
        <el-input v-model="formData.major" placeholder="请输入专业" />
      </el-form-item>
      
      <el-form-item label="年级" prop="grade">
        <el-select v-model="formData.grade" placeholder="请选择年级">
          <el-option label="大一" value="大一" />
          <el-option label="大二" value="大二" />
          <el-option label="大三" value="大三" />
          <el-option label="大四" value="大四" />
        </el-select>
      </el-form-item>
      
      <el-form-item label="学校" prop="school">
        <el-input v-model="formData.school" placeholder="请输入学校" />
      </el-form-item>
      
      <el-form-item label="联系电话" prop="phone">
        <el-input v-model="formData.phone" placeholder="请输入联系电话" />
      </el-form-item>
      
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="formData.email" placeholder="请输入邮箱" type="email" />
      </el-form-item>
      
      <el-form-item label="职业目标" prop="careerGoal">
        <el-input 
          v-model="formData.careerGoal" 
          placeholder="请输入职业目标" 
          type="textarea" 
          :rows="3"
        />
      </el-form-item>
      
      <el-form-item>
        <el-button type="primary" @click="handleSubmit">保存信息</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const formRef = ref()

const formData = reactive({
  name: '',
  gender: '',
  major: '',
  grade: '',
  school: '',
  phone: '',
  email: '',
  careerGoal: ''
})

const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度应在 2-20 个字符之间', trigger: 'blur' }
  ],
  gender: [
    { required: true, message: '请选择性别', trigger: 'change' }
  ],
  major: [
    { required: true, message: '请输入专业', trigger: 'blur' }
  ],
  grade: [
    { required: true, message: '请选择年级', trigger: 'change' }
  ],
  school: [
    { required: true, message: '请输入学校', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  careerGoal: [
    { required: true, message: '请输入职业目标', trigger: 'blur' },
    { min: 10, message: '职业目标至少 10 个字符', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (formRef.value) {
    await formRef.value.validate((valid: boolean) => {
      if (valid) {
        userStore.updateProfile(formData)
        ElMessage.success('信息保存成功！')
      } else {
        ElMessage.error('请检查表单填写是否正确')
        return false
      }
    })
  }
}

const handleReset = () => {
  if (formRef.value) {
    formRef.value.resetFields()
  }
}

onMounted(() => {
  // 从 store 加载已有数据
  const user = userStore.user
  if (user) {
    Object.assign(formData, user)
  }
})
</script>

<style scoped>
.profile-form {
  width: 100%;
}

.form-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #333;
  margin-bottom: 1rem;
}

:deep(.el-form) {
  max-width: 600px;
}

:deep(.el-form-item) {
  margin-bottom: 1.25rem;
}

:deep(.el-button) {
  margin-right: 0.75rem;
}

@media (max-width: 768px) {
  :deep(.el-form) {
    max-width: 100%;
  }
  
  :deep(.el-form-item__label) {
    width: 80px;
  }
  
  :deep(.el-form-item__content) {
    margin-left: 90px !important;
  }
}
</style>
