<script setup lang="ts">
interface NewsItem {
    id: number;
    date: string;
    image: string;
    title: string;
    subtitle: string;
    country: string;
}

import { useI18n } from 'vue-i18n';
const config = useRuntimeConfig();
const { formatDate } = useFormatDate()
const localePath = useLocalePath();
const { locale } = useI18n();
const news = ref<NewsItem[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

const fetchNews = async () => {
    loading.value = true;
    error.value = null;

    try {
        const response = await fetch(`${config.public.apiBaseUrl}/api/news`, {
            method: 'GET',
            headers: {
                'Accept-Language': locale.value,
                'company': 'conseil'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        news.value = await response.json();
    } catch (err: any) {
        console.error('Error fetching news:', err);
        error.value = err.message || 'Failed to load news';
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchNews();
});
</script>

<template>
    <div class="tp-blog-area pt-140 pb-90">
        <div class="container">
            <div class="col-lg-12">
                <div class="tp-success-section-title-wrap text-center mb-50">
                    <span class="tp-section-subtitle fw-500 cs-text-dark fs-4 d-flex align-items-center justify-content-center gap-2 mb-10">
                        <svg width="30" height="30" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M1.7 10.2C1.2325 10.2 0.832431 10.0334 0.4998 9.7002C0.1666 9.36759 0 8.9675 0 8.5C0 8.0325 0.1666 7.63215 0.4998 7.29895C0.832431 6.96635 1.2325 6.8 1.7 6.8C2.1675 6.8 2.56757 6.96635 2.9002 7.29895C3.2334 7.63215 3.4 8.0325 3.4 8.5C3.4 8.9675 3.2334 9.36759 2.9002 9.7002C2.56757 10.0334 2.1675 10.2 1.7 10.2ZM3.1025 15.045L1.9125 13.855L5.61 10.1575L6.8 11.3475L3.1025 15.045ZM5.6525 6.8L1.955 3.1025L3.145 1.9125L6.8425 5.61L5.6525 6.8ZM8.5 17C8.0325 17 7.63241 16.8337 7.2998 16.5011C6.9666 16.1679 6.8 15.7675 6.8 15.3C6.8 14.8325 6.9666 14.4321 7.2998 14.099C7.63241 13.7663 8.0325 13.6 8.5 13.6C8.9675 13.6 9.36785 13.7663 9.70105 14.099C10.0337 14.4321 10.2 14.8325 10.2 15.3C10.2 15.7675 10.0337 16.1679 9.70105 16.5011C9.36785 16.8337 8.9675 17 8.5 17ZM8.5 3.4C8.0325 3.4 7.63241 3.2334 7.2998 2.9002C6.9666 2.56757 6.8 2.1675 6.8 1.7C6.8 1.2325 6.9666 0.83215 7.2998 0.49895C7.63241 0.166319 8.0325 0 8.5 0C8.9675 0 9.36785 0.166319 9.70105 0.49895C10.0337 0.83215 10.2 1.2325 10.2 1.7C10.2 2.1675 10.0337 2.56757 9.70105 2.9002C9.36785 3.2334 8.9675 3.4 8.5 3.4ZM11.3475 6.8425L10.1575 5.61L13.8975 1.9125L15.0875 3.1025L11.3475 6.8425ZM13.8975 15.045L10.2 11.3475L11.39 10.1575L15.0875 13.855L13.8975 15.045ZM15.3 10.2C14.8325 10.2 14.4321 10.0334 14.099 9.7002C13.7663 9.36759 13.6 8.9675 13.6 8.5C13.6 8.0325 13.7663 7.63215 14.099 7.29895C14.4321 6.96635 14.8325 6.8 15.3 6.8C15.7675 6.8 16.1679 6.96635 16.5011 7.29895C16.8337 7.63215 17 8.0325 17 8.5C17 8.9675 16.8337 9.36759 16.5011 9.7002C16.1679 10.0334 15.7675 10.2 15.3 10.2Z"
                                fill="#d4b128" />
                        </svg>
                        {{ $t('news.title') }}
                    </span>
                    <h2 class="mb-25 fs-33 fs-sm-24 wow img-custom-anim-right cs-text-gold" 
                        data-wow-duration="1.5s" data-wow-delay="0.2s">
                        {{ $t('news.subtitle') }}
                    </h2>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="row">
                <div class="col-12 text-center py-5">
                    <div class="spinner-container">
                        <div class="spinner">
                            <div class="spinner-inner"></div>
                        </div>
                        <p class="mt-3 fs-5 text-muted">{{ $t('news.loading') }}</p>
                    </div>
                </div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="row">
                <div class="col-12">
                    <div class="error-container text-center py-5">
                        <div class="error-icon mb-3">
                            <i class="fa-solid fa-circle-exclamation fs-1 text-danger"></i>
                        </div>
                        <h3 class="text-danger">{{ $t('news.error.title') }}</h3>
                        <p class="text-muted mb-4">{{ error }}</p>
                        <button @click="fetchNews" class="btn btn-primary">
                            <i class="fa-solid fa-rotate me-2"></i>{{ $t('news.error.retry') }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- News List -->
            <div v-else class="row">
                <div v-for="item in news" :key="item.id" class="col-xl-4 col-lg-6 col-md-6">
                    <div class="tp-blog-item anim-zoomin-wrap mb-40">
                        <div class="tp-blog-thumb fix mb-25 tp-round-4 p-relative border border-1">
                            <div class="anim-zoomin fix">
                                <img class="w-100 thumbs tp-round-4" :src="`${config.public.apiBaseUrl}/storage/${item.image}`" :alt="item.title">
                            </div>
                            <div class="tp-blog-cetagory-wrap p-absolute">
                                <span class="tp-blog-cetagory text-uppercase cs-bg-brown fs-14 fw-500 tp-text-common-white d-inline-block mr-5">
                                    {{ item.country }}
                                </span>
                            </div>
                            <div class="tp-blog-author-wrap">
                                <div class="tp-blog-date d-inline-block text-center tp-round-4">
                                    <span class="cs-text-dark">{{ formatDate(item.date) }}</span>
                                </div>
                            </div>
                        </div>
                        <div class="tp-blog-content">
                            <h3 class="fw-500 fs-19 lh-24">
                                <NuxtLink class="underline-black" :to="localePath({ name: 'news-id', params: { id: item.id } })">{{ item.title }}</NuxtLink>
                            </h3>
                            <div class="tp-border-bottom mt-15 mb-20"></div>
                            <p class="mb-20 description">{{ item.subtitle }}</p>
                            <NuxtLink :to="localePath({ name: 'news-id', params: { id: item.id } })"
                                class="tp-btn-border d-inline-block lh-0 tp-round-36 fs-16 border-full-1 ls-0 tp-btn-switch-animation tp-text-theme-primary fw-500">
                                <span class="d-flex align-items-center justify-content-center">
                                    <span class="btn-text">{{ $t('events.continue_reading') }}</span>
                                    <span class="btn-icon"><i class="fa-sharp fa-regular fa-arrow-right"></i></span>
                                    <span class="btn-icon"><i class="fa-sharp fa-regular fa-arrow-right"></i></span>
                                </span>
                            </NuxtLink>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-if="news.length === 0" class="col-12 text-center py-5">
                    <div class="empty-state">
                        <i class="fa-regular fa-newspaper fs-1 text-muted mb-3"></i>
                        <h4 class="text-muted">{{ $t('news.empty.title') }}</h4>
                        <p class="text-muted">{{ $t('news.empty.description') }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.spinner-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 200px;
}

h3 {
    height: 50px;
}

.description {
    height: 90px;
}

.spinner {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    border: 4px solid rgba(212, 177, 40, 0.2);
    border-top-color: #d4b128;
    animation: spin 1s infinite linear;
    position: relative;
}

.spinner-inner {
    position: absolute;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 4px solid transparent;
    border-top-color: #d4b128;
    top: 50%;
    left: 50%;
    margin-top: -20px;
    margin-left: -20px;
    animation: spin 0.8s infinite linear reverse;
}

.error-container {
    background-color: #fff9f9;
    border: 1px solid #ffe0e0;
    border-radius: 8px;
    padding: 2rem;
}

.empty-state {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 3rem;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.tp-blog-thumb div.anim-zoomin.fix {
    position: relative;
    width: 100%;
    height: 300px; /* Adjusted for better aspect ratio */
} 
.tp-blog-thumb div.anim-zoomin.fix img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>