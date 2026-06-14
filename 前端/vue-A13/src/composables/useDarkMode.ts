import { ref, watch, onMounted } from 'vue'

const isDark = ref(false)

export function useDarkMode() {
  // 初始化深色模式
  onMounted(() => {
    // 检查 localStorage
    const savedMode = localStorage.getItem('darkMode')
    if (savedMode !== null) {
      isDark.value = savedMode === 'true'
    } else {
      // 检查系统偏好
      isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches
    }
    updateTheme()
  })

  // 监听变化
  watch(isDark, () => {
    updateTheme()
    localStorage.setItem('darkMode', String(isDark.value))
  })

  function updateTheme() {
    if (isDark.value) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function toggleDarkMode() {
    isDark.value = !isDark.value
  }

  function setDarkMode(value: boolean) {
    isDark.value = value
  }

  return {
    isDark,
    toggleDarkMode,
    setDarkMode
  }
}
