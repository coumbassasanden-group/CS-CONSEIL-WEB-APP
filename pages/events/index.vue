<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const config = useRuntimeConfig();

useHead({
    title: t('events.pageTitle') + ' | CS Conseil',
    meta: [
        {
            name: 'description',
            content: t('events.pageDescription')
        }
    ]
})
</script>

<template>
    <SecondHero :title="$t('header.events')" :image="`${config.public.apiBaseUrl}/storage/images_folder/conseil_events_hero.jpg`"/>
    <OurEvents/>
</template>

<style>
    
</style>