<template>
  <div class="text-center py-5">
    <i class="fas fa-exclamation-triangle fs-1 text-danger mb-3"></i>
    <h3 class="text-danger">{{ message }}</h3>
    <button @click="$emit('retry')" class="btn btn-primary mt-3">
      <i class="fas fa-redo mr-2"></i> Réessayer
    </button>
  </div>
</template>

<script setup>
defineProps({
  message: {
    type: String,
    default: "Une erreur s'est produite"
  }
})
defineEmits(['retry'])
</script>