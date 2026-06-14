import { ref, watch } from 'vue'
import type { Ref } from 'vue'

export function useLocalStorage<T>(key: string, defaultValue: T): Ref<T> {
  const storedValue = ref<T>(defaultValue) as Ref<T>

  // 从 localStorage 读取初始值
  if (typeof window !== 'undefined') {
    try {
      const item = localStorage.getItem(key)
      if (item) {
        storedValue.value = JSON.parse(item)
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
    }
  }

  // 监听变化并保存到 localStorage
  watch(
    storedValue,
    (newValue) => {
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(key, JSON.stringify(newValue))
        } catch (error) {
          console.warn(`Error setting localStorage key "${key}":`, error)
        }
      }
    },
    { deep: true }
  )

  return storedValue
}

export function useSessionStorage<T>(key: string, defaultValue: T): Ref<T> {
  const storedValue = ref<T>(defaultValue) as Ref<T>

  // 从 sessionStorage 读取初始值
  if (typeof window !== 'undefined') {
    try {
      const item = sessionStorage.getItem(key)
      if (item) {
        storedValue.value = JSON.parse(item)
      }
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error)
    }
  }

  // 监听变化并保存到 sessionStorage
  watch(
    storedValue,
    (newValue) => {
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem(key, JSON.stringify(newValue))
        } catch (error) {
          console.warn(`Error setting sessionStorage key "${key}":`, error)
        }
      }
    },
    { deep: true }
  )

  return storedValue
}
