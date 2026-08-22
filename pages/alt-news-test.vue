<script setup>
/**
 * ALT News en mode recette.
 *
 * Rend la même page que `/alt-news`, qui détecte le suffixe `-test` de l'URL et
 * ramène les montants à 100 F. Aucune logique dupliquée.
 */
import AltNews from './alt-news/index.vue'

useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] })
</script>

<template>
  <AltNews />
</template>
