<template>
  <div class="tabs-container">
    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="['tab-btn', { active: activeTab === tab.id }]"
        @click="$emit('update:activeTab', tab.id)"
      >
        <Icon :icon="tab.icon" />
        <span>{{ tab.label }}</span>
        <span v-if="tab.count > 0" class="tab-count">{{ tab.count }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue"

interface Tab {
  id: string
  label: string
  icon: string
  count: number
}

defineProps<{
  tabs: Tab[]
  activeTab: string
}>()

defineEmits<{
  'update:activeTab': [value: string]
}>()
</script>

<style scoped>
.tabs-container {
  margin-bottom: 2rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.tab-btn:hover {
  border-color: #d4b128;
  color: #d4b128;
}

.tab-btn.active {
  background: #d4b128;
  border-color: transparent;
  color: white;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 0.4rem;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 11px;
  font-size: 0.8rem;
}

.tab-btn.active .tab-count {
  background: rgba(255, 255, 255, 0.25);
}

@media (max-width: 768px) {
  .tabs {
    padding-bottom: 1rem;
  }

  .tab-btn {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }

  .tab-btn span:not(.tab-count) {
    display: none;
  }
}
</style>
