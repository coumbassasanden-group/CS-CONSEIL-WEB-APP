<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const config = useRuntimeConfig()
useHead({
    title: t('altNews.pageTitle') + ' | CS Conseil',
    meta: [
        {
            name: 'description',
            content: t('altNews.pageDescription')
        }
    ]
})
</script>

<template>
    <SecondHero title="ALT News" :image="`${config.public.apiBaseUrl}/storage/images_folder/conseil_alt_news_hero.jpg`"/>
    <AltPresentation/>
    <AltComponent/>
    
</template>

<style>
    
</style>