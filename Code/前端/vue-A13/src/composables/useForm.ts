import { ref, computed } from 'vue'
import { validateForm, validateField as validateFieldUtil, type ValidationRule } from '@/utils/validators'

interface UseFormOptions<T> {
  initialValues: T
  validationRules?: Record<string, ValidationRule[]>
  onSubmit?: (values: T) => void | Promise<void>
}

export function useForm<T extends Record<string, string>>(options: UseFormOptions<T>) {
  const { initialValues, validationRules = {}, onSubmit } = options

  const values = ref<T>({ ...initialValues })
  const errors = ref<Record<string, string>>({})
  const touched = ref<Record<string, boolean>>({})
  const isSubmitting = ref(false)

  const isValid = computed(() => {
    return Object.keys(errors.value).length === 0
  })

  const isDirty = computed(() => {
    return JSON.stringify(values.value) !== JSON.stringify(initialValues)
  })

  function validateField(field: keyof T) {
    const fieldRules = validationRules[field as string]
    if (!fieldRules) return true

    const result = validateFieldUtil(
      values.value[field] || '',
      fieldRules,
      field as string
    )

    if (result.valid) {
      delete errors.value[field as string]
    } else {
      errors.value[field as string] = result.message
    }

    return result.valid
  }

  function validateAll() {
    const { valid, errors: validationErrors } = validateForm(
      values.value,
      validationRules
    )
    errors.value = validationErrors
    return valid
  }

  function handleChange(field: keyof T, value: string) {
    values.value[field] = value as T[keyof T]
    if (touched.value[field as string]) {
      validateField(field)
    }
  }

  function handleBlur(field: keyof T) {
    touched.value[field as string] = true
    validateField(field)
  }

  async function handleSubmit() {
    // 标记所有字段为已触碰
    Object.keys(values.value).forEach((key) => {
      touched.value[key] = true
    })

    if (!validateAll()) {
      return
    }

    if (onSubmit) {
      isSubmitting.value = true
      try {
        await onSubmit(values.value)
      } finally {
        isSubmitting.value = false
      }
    }
  }

  function reset() {
    values.value = { ...initialValues }
    errors.value = {}
    touched.value = {}
    isSubmitting.value = false
  }

  function setValues(newValues: Partial<T>) {
    values.value = { ...values.value, ...newValues }
  }

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    handleChange,
    handleBlur,
    handleSubmit,
    validateField,
    validateAll,
    reset,
    setValues
  }
}
