<script setup>
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const config = useRuntimeConfig()

useHead({
    title: t('contact.title') + ' | ' + 'CS Conseil',
    meta: [{
        name: 'description',
        content: t('contact.description')
    }]
})
</script>

<template>
    <SecondHero :title="$t('constant.contact_us')" :image="`${config.public.apiBaseUrl}/storage/images_folder/conseil_contact_hero.jpg`"/>
    <ContactInfo/>
    <ContactForm/>
    <ContactMap/>
</template>

<style>
    
</style>