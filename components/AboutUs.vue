<script setup lang="ts">
const localePath = useLocalePath();
const { get } = useApi();
const texts = ref<string[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const config = useRuntimeConfig();
const fetchTexts = async () => {
    isLoading.value = true;
    error.value = null;
    
    try {
        texts.value = await get<string[]>('/api/texts/about_us');
    } catch (e) {
        error.value = "Une erreur est survenue lors du chargement des textes.";
        console.error('Error fetching about us texts:', e);
    } finally {
        isLoading.value = false;
    }
};

onMounted(fetchTexts);
</script>

<template>
    <div class="tp-about-area p-relative fix mt-20">
        <div class="container-fluid gx-0">
            <!-- Error state -->
            <div v-if="error" class="alert alert-danger text-center" role="alert">
                {{ error }}
                <button @click="fetchTexts" class="btn btn-link text-danger">
                    {{ $t('services.error.retry') }}
                </button>
            </div>

            <div class="row gx-20">
                <div class="col-lg-6">
                    <div class="tp-about-thumb-wrap cs-bg-white">
                        <div class="row gx-20">
                            <div class="col-lg-7 col-md-7 col-sm-7 mb-20">
                                <div class="tp-about-thumb mr-15 p-relative">
                                    <img class="thumb w-100" :src="`${config.public.apiBaseUrl}/storage/images_folder/conseil_about_us.jpg`" alt="about us image">
                                </div>
                            </div>
                            <div class="col-lg-5 col-md-5 col-sm-5 mb-20">
                                <div class="tp-about-thumb-2 h-100 fix tp-round-4">
                                    <img class="w-100 tp-round-4 mb-20" src="/assets/img/about/ds-nimba.png" alt="ds-nimba"
                                        style="background-color: #3F2E1A;">
                                    <div class="cs-bg-brown text-center pt-60 pb-35 tp-round-4 h-100">
                                        <span class="mb-30 d-inline-block">
                                            <i class="fa-solid fa-books cs-text-white" style="font-size: 3rem;"></i>
                                        </span>
                                        <h2 class="fs-70">
                                            <MyCounter :targetNumber="168" />
                                        </h2>
                                        <p v-if="isLoading" class="skeleton-text fw-500 fs-18 ls-m-2 tp-text-grey-2 px-2"></p>
                                        <p v-else class="cs-text-white fw-600 fs-18 ls-m-2  px-2">{{ texts[0] }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-6 mb-20">
                    <div class="tp-about-content d-flex align-items-center p-relative">
                        <span class="tp-about-shape-2 d-none d-xxl-block wow zoomIn" data-wow-delay=".3s"
                            data-wow-duration=".9s">
                            <svg width="180" height="180" viewBox="0 0 180 180" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path d="M100 100H180V180H100V100Z" fill="#d4b128" />
                                <path
                                    d="M40 40H96C98.2091 40 100 41.7909 100 44V100H44C41.7909 100 40 98.2091 40 96V40Z"
                                    fill="#d4b128" />
                                <path d="M0 0H36C38.2091 0 40 1.79086 40 4V40H4C1.79086 40 0 38.2091 0 36V0Z"
                                    fill="#d4b128" />
                            </svg>
                        </span>
                        <div>
                            <span class="tp-section-subtitle fw-700 cs-text-brown fs-3 d-flex align-items-center gap-2 mb-30">
                                <svg width="30" height="30" viewBox="0 0 17 17" fill="#d4b128"
                                    xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M1.7 10.2C1.2325 10.2 0.832431 10.0334 0.4998 9.7002C0.1666 9.36759 0 8.9675 0 8.5C0 8.0325 0.1666 7.63215 0.4998 7.29895C0.832431 6.96635 1.2325 6.8 1.7 6.8C2.1675 6.8 2.56757 6.96635 2.9002 7.29895C3.2334 7.63215 3.4 8.0325 3.4 8.5C3.4 8.9675 3.2334 9.36759 2.9002 9.7002C2.56757 10.0334 2.1675 10.2 1.7 10.2Z"
                                        fill="#d4b128" />
                                </svg>
                                {{ $t('about.title') }}
                            </span>
                            <h2 v-if="!isLoading" class="mb-25 fs-xl-20 wow img-custom-anim-left" data-wow-duration="1.5s"
                                data-wow-delay="0.2s"> {{ $t('about.subtitle') }} <span
                                    class="cs-text-gold text-italic fw-600 tp-ff-montsearrat">{{
                                    $t('about.subtitle_end') }}</span> </h2>
                            
                            <!-- Skeleton loading pour les paragraphes -->
                            <template v-if="isLoading">
                                <div class="skeleton-text skeleton-text-lg mb-30"></div>
                                <div class="skeleton-text skeleton-text-lg mb-55"></div>
                                <div class="skeleton-text skeleton-text-lg mb-55"></div>
                            </template>
                            
                            <!-- Contenu réel -->
                            <template v-else>
                                <p class="mb-30 cs-text-dark cs-ff-poppins">{{ texts[1] }}</p>
                                <p class="mb-55 cs-text-dark cs-ff-poppins">{{ texts[2] }}</p>
                                <p class="mb-55 cs-text-dark cs-ff-poppins">{{ texts[3] }}</p>
                            </template>

                            <NuxtLink v-if="!isLoading" :to="localePath('services')"
                                class="tp-btn-xl d-inline-block lh-0 tp-round-24 fs-16 cs-bg-theme-primary ls-0 tp-btn-switch-animation tp-text-common-white hover-text-white fw-500">
                                <span class="d-flex align-items-center justify-content-center">
                                    <span class="btn-text">{{ $t('constant.our_services') }}</span>
                                    <span class="btn-icon"><i class="fa-sharp fa-regular fa-arrow-right"></i></span>
                                    <span class="btn-icon"><i class="fa-sharp fa-regular fa-arrow-right"></i></span>
                                </span>
                            </NuxtLink>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
cs-about-area {
    background-color: #fff !important;
}

h2 {
    font-family: var(--cs-family-montserrat);
    color: var(--cs-dark-color);
    font-size: 42px;
}

.tp-about-thumb-2 img {
    background-color: var(--cs-bg-dark-color) !important;
}

/* Skeleton Loading Styles */
.skeleton-text {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 4px;
    height: 18px;
    margin-bottom: 10px;
}

.skeleton-text-sm {
    width: 60%;
}

.skeleton-text-md {
    width: 80%;
}

.skeleton-text-lg {
    width: 100%;
}

@keyframes loading {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
}

/* Animation de fondu pour la transition */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>

<!-- <style scoped>
cs-about-area {
    background-color: #fff;
}

h2 {
    font-family: var(--cs-family-montserrat);
    color: var(--cs-dark-color);
    font-size: 42px;
}
</style> -->