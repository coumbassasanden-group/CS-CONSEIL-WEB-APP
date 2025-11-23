<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const config = useRuntimeConfig()

useHead({
    title: t('services.title') + ' | CS Conseil',
    meta: [{
        name: 'description',
        content: t('services.subtitle')
    }]
})
</script>

<template>
    <SecondHero :title="$t('services.title')" :image="`${config.public.apiBaseUrl}/storage/images_folder/conseil_service_hero.jpg`"/>
    <ServiceDescription />
    <OurServices/>
</template>

<style>
    
</style>