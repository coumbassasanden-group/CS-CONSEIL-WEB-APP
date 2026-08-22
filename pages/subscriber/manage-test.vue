<script setup lang="ts">
/**
 * Espace abonné en mode recette.
 *
 * Rend exactement la page `manage`, qui détecte le suffixe `-test` de l'URL et
 * ramène tous les montants à 100 F. Aucune logique n'est dupliquée ici : toute
 * correction sur `manage.vue` profite automatiquement à cette page.
 */
import Manage from './manage.vue'

useHead({
  meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
</script>

<template>
  <Manage />
</template>
