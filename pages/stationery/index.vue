<script setup lang="ts">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
const config = useRuntimeConfig();

useHead({
    title: t('stationery.pageTitle') + ' | CS Conseil',
    meta: [
        {
            name: 'description',
            content: t('stationery.pageDescription')
        }
    ]
})

    interface ShopItem {
        id: number,
        title: string,
        amount: string,
        image: string
    }
</script>

<template>
    <SecondHero :title="$t('header.stationery')" :image="`${config.public.apiBaseUrl}/storage/images_folder/conseil_papeterie_hero.jpg`"/>
    <StationeryDescription/>
    <!-- <CartComponent/> -->
    <ShopItems/>
</template>

<style>
    
</style>