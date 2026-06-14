import { ref } from 'vue'

export function useLoading() {
  const isLoading = ref(false)
  const loadingText = ref('加载中...')
  const error = ref<string | null>(null)

  async function withLoading<T>(
    fn: () => Promise<T>,
    options: {
      loadingText?: string
      errorMessage?: string
    } = {}
  ): Promise<T | null> {
    isLoading.value = true
    loadingText.value = options.loadingText || '加载中...'
    error.value = null

    try {
      const result = await fn()
      return result
    } catch (err) {
      error.value = options.errorMessage || (err instanceof Error ? err.message : '操作失败')
      return null
    } finally {
      isLoading.value = false
    }
  }

  function clearError() {
    error.value = null
  }

  function setLoading(value: boolean, text?: string) {
    isLoading.value = value
    if (text) loadingText.value = text
  }

  return {
    isLoading,
    loadingText,
    error,
    withLoading,
    clearError,
    setLoading
  }
}
