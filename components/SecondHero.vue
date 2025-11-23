<script setup>
const localePath = useLocalePath()
const props = defineProps({
    title: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        required: true,
    }
})
</script>

<template>
    <div class="tp-breadcrumb-area tp-breadcrumb-spacing bg-position pt-200" :style="{ backgroundImage: `url(${props.image})` }">
        <div class="container">
            <div class="row">
                <div class="col-xl-6 col-lg-7 col-md-10">
                    <div class="tp-breadcrumb-content mr-80">
                        <h2 :class="['tp-breadcrumb-title fw-600 fs-40 fs-xs-40 ls-m-3 lh-1 title ', props.title === 'ALT News' ? 'cs-text-purple' : 'cs-text-dark']">{{ props.title }}</h2>
                        <div class="tp-breadcrumb-dvdr mt-2">
                            <ul>
                                <li><NuxtLink :to="localePath('index')">{{ $t('header.index') }}</NuxtLink></li>
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
    /* color: var(--cs-bg-dark-color); */
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