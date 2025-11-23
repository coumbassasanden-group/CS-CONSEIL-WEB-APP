<script setup>
import { onMounted, ref } from 'vue'

const props = defineProps({
  modelValue: String,
  options: {
    type: Array,
    required: true
  },
  placeholder: String
})

const emit = defineEmits(['update:modelValue'])
const selectElement = ref(null)

onMounted(() => {
  // Initialize nice-select
  if (typeof jQuery !== 'undefined') {
    jQuery(selectElement.value).niceSelect()
    
    // Handle change events
    jQuery(selectElement.value).on('change', function() {
      emit('update:modelValue', this.value)
    })
  }
})

// Cleanup on unmount
onUnmounted(() => {
  if (typeof jQuery !== 'undefined') {
    jQuery(selectElement.value).niceSelect('destroy')
  }
})
</script>

<template>
  <select 
    ref="selectElement"
    :value="modelValue"
    class="tp-input mb-15"
    @change="$emit('update:modelValue', $event.target.value)"
  >
    <option value="">{{ placeholder }}</option>
    <option 
      v-for="option in options" 
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>