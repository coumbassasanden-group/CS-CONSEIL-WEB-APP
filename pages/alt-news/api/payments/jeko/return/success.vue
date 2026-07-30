<template>
  <main class="jeko-return-bridge" aria-live="polite">
    <Icon icon="mdi:loading" class="loading-icon" />
    <p>Redirection vers la vérification du paiement...</p>
  </main>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { Icon } from '@iconify/vue'

const route = useRoute()

onMounted(async () => {
  const locale = String(route.params.locale || route.path.split('/')[1] || 'fr')
  const supportedLocale = ['fr', 'en'].includes(locale) ? locale : 'fr'

  await navigateTo({
    path: `/${supportedLocale}/payment/success`,
    query: route.query
  }, {
    replace: true
  })
})

useHead({
  title: 'Redirection du paiement - ALT News',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' }
  ]
})
</script>

<style scoped>
.jeko-return-bridge {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  color: #374151;
  text-align: center;
}

.loading-icon {
  width: 42px;
  height: 42px;
  color: #10b981;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
