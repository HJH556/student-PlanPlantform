<template>
  <div v-if="visible" class="loading-spinner" :class="{ 'overlay': overlay }">
    <div class="spinner-container">
      <div class="spinner"></div>
      <p v-if="text" class="loading-text">{{ text }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  text?: string
  overlay?: boolean
}

withDefaults(defineProps<Props>(), {
  text: '加载中...',
  overlay: false
})
</script>

<style scoped>
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-spinner.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.8);
  z-index: 9999;
}

.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #eaeaea;
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 深色模式 */
.dark .loading-spinner.overlay {
  background: rgba(0, 0, 0, 0.8);
}

.dark .spinner {
  border-color: #444;
  border-top-color: #667eea;
}

.dark .loading-text {
  color: #ccc;
}
</style>
