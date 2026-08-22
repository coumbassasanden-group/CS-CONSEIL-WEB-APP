<template>
  <div />
</template>

<script setup lang="ts">
// La page /subscriber a ete desactivee (voir _index.vue_) mais des liens internes
// et d'anciens e-mails pointent encore dessus : sans cette route, ils tombaient
// sur un 404. On redirige (302, cote serveur) vers ALT News, ou les offres sont
// presentees. La locale est deduite du chemin pour rester valable en /fr, /en...
definePageMeta({
  middleware: [
    (to) => {
      const locale = to.path.split('/').filter(Boolean)[0] || 'fr'
      return navigateTo(`/${locale}/alt-news`, { redirectCode: 302 })
    }
  ]
})
</script>
