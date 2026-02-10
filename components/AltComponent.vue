<script setup>
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const config = useRuntimeConfig();
const { locale } = useI18n();
const { formatDate } = useFormatDate()
const localePath = useLocalePath();
const altNews = ref([]);
const loading = ref(true);
const error = ref(null);

const fetchAltNews = async () => {
    loading.value = true;
    error.value = null;

    try {
        const response = await fetch(`${config.public.apiBaseUrl}/api/alt-news`, {
            method: 'GET',
            headers: {
                'Accept-Language': locale.value,
                'company': 'conseil'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        altNews.value = await response.json();
    } catch (err) {
        console.error('Error fetching alt news:', err);
        error.value = err.message || 'Failed to load alt news';
    } finally {
        loading.value = false;
    }
};

onMounted(() => {
    fetchAltNews();
});
</script>

<template>
    <div class="tp-project-area tp-project-2-animate-tab pt-100 pb-110">
        <div class="container">
            <!-- Section Title -->
            <div class="row align-items-end">
                <div class="col-lg-12">
                    <div class="tp-project-5-title-wrap text-center mb-55">
                        <h1 class="fw-500 fs-40 cs-text-brown mb-10 d-inline-block">{{ $t('alt_news.title') }}</h1>
                        <h2 class="mb-20 fs-xl-32 fs-sm-28 wow img-custom-anim-left cs-text-gold"
                            data-wow-duration="1.5s" data-wow-delay="0.2s">
                            {{ $t('alt_news.subtitle') }} <span
                                class="text-italic fw-400 tp-ff-heading cs-text-brown">{{ $t('alt_news.subtitle_span')
                                }}</span>
                        </h2>
                        <p class="fs-16 text-muted mb-0 max-w-800 mx-auto">{{ $t('alt_news.description') }}</p>
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="row">
                <div class="col-12 text-center py-5">
                    <div class="spinner-container">
                        <div class="spinner">
                            <div class="spinner-inner"></div>
                        </div>
                        <p class="mt-3 fs-5 text-muted">{{ $t('alt_news.loading') }}</p>
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
                        <h3 class="text-danger">{{ $t('alt_news.error.title') }}</h3>
                        <p class="text-muted mb-4">{{ error }}</p>
                        <button @click="fetchAltNews" class="btn btn-primary">
                            <i class="fa-solid fa-rotate me-2"></i>{{ $t('alt_news.error.retry') }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Alt News List -->
            <div v-else class="row">
                <div v-for="(news, index) in altNews" :key="news.id" class="col-lg-4 col-md-6">
                    <div class="tp-service-2-wrap p-relative fix mb-30 wow fadeInLeft"
                        :data-wow-delay="`${0.3 + (index * 0.1)}s`" data-wow-duration=".9s">
                        <div class="tp-service-2-thumb tp-round-4 p-relative">
                            <img class="w-100 tp-round-4" :src="`${config.public.apiBaseUrl}/storage/${news.image}`"
                                :alt="news.title">
                            
                            <!-- Badge Premium/Gratuit en haut à gauche -->
                            <div class="badge-type p-absolute">
                                <span v-if="news.title.includes('Premium')" class="badge-premium">
                                    <i class="fa-solid fa-crown me-2"></i>Premium
                                </span>
                                <span v-else class="badge-free">
                                    <i class="fa-solid fa-gift me-2"></i>Gratuit
                                </span>
                            </div>
                            
                            <!-- Badge Prix en haut à droite (seulement pour premium) -->
                            <div v-if="news.title.includes('Premium')" class="badge-price p-absolute">
                                <span class="price-tag">2000 FCFA</span>
                            </div>
                        </div>
                        <div class="tp-service-2-content p-absolute">
                            <div class="tp-service-2-content-top d-flex align-items-center">
                                <span v-if="String(news.title).match(/\d+/g)" class="mr-10 p-3 rounded-3 text-light cs-bg-purple fw-700 fs-5">
                                    #{{ String(news.title).match(/\d+/g)[0] }}
                                </span>
                                <span class="fw-500 fs-25 ls-m-2 cs-text-dark">
                                    <NuxtLink :to="localePath({ name: 'alt-news-id', params: { id: news.id } })"
                                        class="hover-text-white cs-ff-montserrat fs-18">
                                        {{ news.title }}
                                    </NuxtLink>
                                </span>
                            </div>
                            <div class="tp-service-2-content-bottom pt-20">
                                <span class="cs-text-dark cs-ff-montserrat fw-700 cs-ff-poppins">
                                    {{ formatDate(news.date) }}
                                </span>
                            </div>
                        </div>
                        
                        <!-- Bouton d'achat en bas (seulement pour premium) -->
                        <div v-if="news.title.includes('Premium')" class="purchase-button p-absolute">
                            <NuxtLink :to="localePath({ name: 'alt-news-id', params: { id: news.id } })"
                                class="btn-purchase">
                                <i class="fa-solid fa-cart-shopping me-2"></i>
                                Acheter ce numéro 2000 FCFA
                            </NuxtLink>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-if="altNews.length === 0" class="col-12 text-center py-5">
                    <div class="empty-state">
                        <i class="fa-regular fa-folder-open fs-1 text-muted mb-3"></i>
                        <h4 class="text-muted">{{ $t('alt_news.empty.title') }}</h4>
                        <p class="text-muted">{{ $t('alt_news.empty.description') }}</p>
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

.tp-service-2-thumb {
    /* width: 415px; */
    height: 550px;
}

.tp-service-2-thumb img {
    object-fit: fill;
    width: 100%;
    height: 100%;
}

/* Badge Premium/Gratuit en haut à gauche */
.badge-type {
    top: 20px;
    left: 20px;
    z-index: 10;
}

.badge-premium {
    background: linear-gradient(135deg, #d4b128 0%, #f4d03f 100%);
    color: #fff;
    padding: 10px 25px;
    border-radius: 30px;
    font-weight: 700;
    font-size: 16px;
    display: inline-flex;
    align-items: center;
    box-shadow: 0 4px 15px rgba(212, 177, 40, 0.4);
    font-family: var(--cs-family-montserrat);
}

.badge-free {
    background: linear-gradient(135deg, #9e73b0 0%, #b88fd1 100%);
    color: #fff;
    padding: 10px 25px;
    border-radius: 30px;
    font-weight: 700;
    font-size: 16px;
    display: inline-flex;
    align-items: center;
    box-shadow: 0 4px 15px rgba(158, 115, 176, 0.4);
    font-family: var(--cs-family-montserrat);
}

/* Badge Prix en haut à droite */
.badge-price {
    top: 20px;
    right: 20px;
    z-index: 10;
}

.price-tag {
    background: #2c2c2c;
    color: #fff;
    padding: 12px 25px;
    border-radius: 30px;
    font-weight: 700;
    font-size: 18px;
    display: inline-block;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    font-family: var(--cs-family-montserrat);
}

/* Bouton d'achat en bas */
.purchase-button {
    bottom: 15px;
    left: 20px;
    right: 20px;
    z-index: 10;
}

.btn-purchase {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
    color: #fff;
    padding: 12px 20px;
    border-radius: 30px;
    font-weight: 700;
    font-size: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
    font-family: var(--cs-family-montserrat);
    width: 100%;
    white-space: nowrap;
}

.btn-purchase:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
    color: #fff;
}

.btn-purchase i {
    font-size: 13px;
}

/* Ajuster la position du contenu pour laisser de la place au bouton */
.tp-service-2-content {
    bottom: 80px;
    padding: 20px 25px 15px 25px !important;
}

.tp-service-2-content-top {
    margin-bottom: 10px;
}

.tp-service-2-content-bottom {
    padding-top: 10px !important;
}


.date {
    top: 0px;
    right: 0;
    background: linear-gradient(209deg, rgb(158, 115, 176, 0.3) 0%, rgb(158, 115, 176, 0.3) 100%);
}


/* .tp-blog-author-info-wrap {
    position: absolute;
    top: -180px;
    right: 20px;
    padding: 8px 15px;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    backdrop-filter: blur(5px);
} */


@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>