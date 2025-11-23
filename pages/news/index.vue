<script setup>
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const config = useRuntimeConfig();

useHead({
    title: t('news.pageTitle') + ' | CS Conseil',
    meta: [
        {
            name: 'description',
            content: t('news.pageDescription')
        }
    ]
})
</script>

<template>
    <SecondHero :title="$t('header.news')" :image="`${config.public.apiBaseUrl}/storage/images_folder/conseil_news_hero.jpg`"/>
    <NewsItems/>
</template>

<style>
    
</style>