// 表单验证工具函数

export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  email?: boolean
  phone?: boolean
  message?: string
}

export interface ValidationResult {
  valid: boolean
  message: string
}

// 验证邮箱
export function validateEmail(email: string): ValidationResult {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) {
    return { valid: false, message: '邮箱不能为空' }
  }
  if (!emailPattern.test(email)) {
    return { valid: false, message: '请输入有效的邮箱地址' }
  }
  return { valid: true, message: '' }
}

// 验证手机号
export function validatePhone(phone: string): ValidationResult {
  const phonePattern = /^1[3-9]\d{9}$/
  if (!phone) {
    return { valid: false, message: '手机号不能为空' }
  }
  if (!phonePattern.test(phone)) {
    return { valid: false, message: '请输入有效的手机号码' }
  }
  return { valid: true, message: '' }
}

// 验证必填项
export function validateRequired(value: string, fieldName: string = '该项'): ValidationResult {
  if (!value || value.trim() === '') {
    return { valid: false, message: `${fieldName}不能为空` }
  }
  return { valid: true, message: '' }
}

// 验证长度
export function validateLength(
  value: string,
  minLength?: number,
  maxLength?: number,
  fieldName: string = '该项'
): ValidationResult {
  if (minLength && value.length < minLength) {
    return { valid: false, message: `${fieldName}至少需要${minLength}个字符` }
  }
  if (maxLength && value.length > maxLength) {
    return { valid: false, message: `${fieldName}不能超过${maxLength}个字符` }
  }
  return { valid: true, message: '' }
}

// 通用验证函数
export function validateField(
  value: string,
  rules: ValidationRule[],
  fieldName: string = '该项'
): ValidationResult {
  for (const rule of rules) {
    // 必填验证
    if (rule.required) {
      const result = validateRequired(value, fieldName)
      if (!result.valid) return result
    }

    // 长度验证
    if (rule.minLength || rule.maxLength) {
      const result = validateLength(value, rule.minLength, rule.maxLength, fieldName)
      if (!result.valid) return result
    }

    // 正则验证
    if (rule.pattern && !rule.pattern.test(value)) {
      return { valid: false, message: rule.message || `${fieldName}格式不正确` }
    }

    // 邮箱验证
    if (rule.email) {
      const result = validateEmail(value)
      if (!result.valid) return result
    }

    // 手机号验证
    if (rule.phone) {
      const result = validatePhone(value)
      if (!result.valid) return result
    }
  }

  return { valid: true, message: '' }
}

// 验证整个表单
export function validateForm(
  formData: Record<string, string>,
  validationRules: Record<string, ValidationRule[]>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}
  let valid = true

  for (const [field, rules] of Object.entries(validationRules)) {
    const value = formData[field] || ''
    const result = validateField(value, rules, field)
    if (!result.valid) {
      errors[field] = result.message
      valid = false
    }
  }

  return { valid, errors }
}

// 学生信息表单验证规则
export const studentProfileRules: Record<string, ValidationRule[]> = {
  name: [
    { required: true },
    { minLength: 2, maxLength: 20 }
  ],
  gender: [
    { required: true }
  ],
  major: [
    { required: true },
    { minLength: 2, maxLength: 50 }
  ],
  grade: [
    { required: true }
  ],
  school: [
    { required: true },
    { minLength: 2, maxLength: 100 }
  ],
  phone: [
    { required: true },
    { phone: true }
  ],
  email: [
    { required: true },
    { email: true }
  ],
  careerGoal: [
    { maxLength: 500, message: '职业目标不能超过500个字符' }
  ]
}
