<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n()

useHead({
    title: t('header.index') + ' | ' + 'C&S Conseil',
    meta: [{
        name: 'description',
        content: t('my-hero.description1')
    }]
})
</script>

<template>
    <MyHero />
    <!-- <CompanyName/> -->
    <!-- <AboutUs/> -->
    <!-- <OurValues/> -->
    <Actualities />
</template>

<style scoped></style>