<script setup>
const localePath = useLocalePath()
const route = useRoute()
const { locale } = useI18n()

const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    parentPage: {
        type: String,
        default: null,
    },
    image: {
        type: String,
        required: true,
    }
})

const currentPath = computed(() => route.path)
const parentPathInfo = computed(() => {
    if (props.parentPage) {
        return {
            path: props.parentPage,
            key: props.parentPage.replace('/', '')
        }
    }
    
    const segments = currentPath.value.split('/')
    
    const startIndex = segments[1] === locale.value ? 2 : 1
    
    if (segments.length >= startIndex + 2) {
        const parentSection = segments[startIndex]
        
        const sectionToKey = {
            'services': 'services',
            'events': 'events',
            'evenements': 'events',
            'news': 'news',
            'actualites': 'news',
            'alt-news': 'alt-news',
            'stationery': 'stationery',
            'papeterie': 'stationery',
            'contact': 'contact'
        }
        
        return {
            path: segments.slice(0, startIndex + 1).join('/'),
            key: sectionToKey[parentSection] || parentSection
        }
    }
    
    return { path: localePath('index'), key: 'index' }
})
</script>

<template>
    <div class="tp-breadcrumb-area tp-breadcrumb-spacing bg-position pt-200" :style="{ backgroundImage: `url(${props.image})` }">
        <div class="container">
            <div class="row">
                <div class="col-xl-7 col-lg-8 col-md-11">
                    <div class="tp-breadcrumb-content mr-80">
                        <h2 :class="['tp-breadcrumb-title fw-600 fs-25 fs-xs-30 ls-m-3 lh-1 title ', 
                                    props.title.includes('ALT') ? 'cs-text-purple' : 'cs-text-dark']">
                            {{ props.title }}
                        </h2>
                        <div class="tp-breadcrumb-dvdr mt-2">
                            <ul>
                                <li><NuxtLink :to="localePath('index')">{{ $t('header.index') }}</NuxtLink></li>
                                <li class="dvdr">/</li>
                                
                                <li>
                                    <NuxtLink :to="parentPathInfo.path">
                                        {{ $t(`header.${parentPathInfo.key}`) }}
                                    </NuxtLink>
                                </li>
                                <li class="dvdr">/</li>
                                
                                <li>{{ props.title }}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

.title {
    font-family: var(--cs-family-montserrat);
}

li {
    color: white !important;
    font-family: var(--cs-family-poppins) !important;
    font-weight: 700 !important;
}

li a {
    text-decoration: underline;
}
</style>