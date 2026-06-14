<template>
  <div v-if="visible" class="error-message" :class="{ 'dismissible': dismissible }">
    <div class="error-content">
      <svg class="error-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      <span class="error-text">{{ message }}</span>
    </div>
    <button v-if="dismissible" class="dismiss-btn" @click="handleDismiss">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  message: string
  visible: boolean
  dismissible?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  dismissible: true
})

const emit = defineEmits<{
  dismiss: []
}>()

function handleDismiss() {
  emit('dismiss')
}
</script>

<style scoped>
.error-message {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 1rem;
  margin: 1rem 0;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.error-icon {
  color: #ef4444;
  flex-shrink: 0;
}

.error-text {
  color: #dc2626;
  font-size: 0.95rem;
}

.dismiss-btn {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.dismiss-btn:hover {
  background: #fecaca;
}

/* 深色模式 */
.dark .error-message {
  background: #450a0a;
  border-color: #7f1d1d;
}

.dark .error-icon {
  color: #f87171;
}

.dark .error-text {
  color: #fca5a5;
}

.dark .dismiss-btn {
  color: #f87171;
}

.dark .dismiss-btn:hover {
  background: #7f1d1d;
}
</style>
