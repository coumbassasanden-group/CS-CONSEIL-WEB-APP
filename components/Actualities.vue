<script setup lang="ts">
import 'swiper/css';
import 'swiper/css/navigation';
import { Autoplay, Navigation } from 'swiper/modules';
import { Swiper, SwiperSlide } from 'swiper/vue';

interface AltData {
    id: number;
    title: string;
    date: string;
    image: string;
    is_free?: boolean;
    price?: number;
}

interface EventItem {
    id: number;
    date: string;
    image: string;
    title: string;
    subtitle: string;
    country: string;
}

interface NewsItem {
    id: number;
    date: string;
    image: string;
    title: string;
    subtitle: string;
    country: string;
}

interface LastNews {
    events: EventItem[];
    altNews: AltData[];
    news: NewsItem[];
}

const config = useRuntimeConfig();
const { locale } = useI18n();
const localePath = useLocalePath();
const api = useApi();
const { formatDate } = useFormatDate();

const { data: actualities } = await useAsyncData<LastNews>(
    'actualities',
    () => api.get('/api/recent-actualities')
);

const hasContent = computed(() => {
    const altNewsLength = actualities.value?.altNews?.length || 0;
    const newsLength = actualities.value?.news?.length || 0;
    const eventsLength = actualities.value?.events?.length || 0;
    return altNewsLength + newsLength + eventsLength > 0;
});

const shouldLoop = computed(() => {
    const totalSlides = (actualities.value?.altNews?.length ? 1 : 0) +
        (actualities.value?.news?.length ? 1 : 0) +
        (actualities.value?.events?.length ? 1 : 0);
    return totalSlides > 1;
});

// Fonction pour obtenir les éléments à afficher selon la taille d'écran
const getDisplayItems = (items: any[], isMobile: boolean) => {
    return isMobile ? items.slice(0, 1) : items;
};

// Formater le prix
const formatPrice = (price: number | undefined) => {
    if (!price) return '2000';
    return new Intl.NumberFormat('fr-FR').format(price);
};
</script>

<template>
    <div class="cs-recent-news-area tp-testimonial-4-wrap">
        <div class="container">
            <div class="pt-80 pb-80 tp-round-4">
                <div class="row">
                    <div class="col-xl-12">
                        <div class="tp-testimonial-2-slider tp-testimonial-3-slider p-relative">
                            <h2 class="tp-testimonial-4-title mb-20 fs-xl-45 fs-sm-36 title-text mr-100 wow 
                                img-custom-anim-right" data-wow-duration="1.5s" data-wow-delay="0.2s">
                                <div class="custum-img">
                                    <img src="/assets/img/about/newspaper.png" alt="">
                                </div>
                                {{ $t('headlines.title') }}
                            </h2>
                            <Swiper :modules="[Navigation, Autoplay]" :navigation="{
                                nextEl: '.tp-testimonial-2-next',
                                prevEl: '.tp-testimonial-2-prev',
                            }" :loop="shouldLoop" :autoplay="shouldLoop ? { delay: 5000 } : false" :spaceBetween="30"
                                style="min-height: 400px;" v-if="hasContent">
                                <SwiperSlide v-if="actualities?.altNews?.length">
                                    <div class="p-relative z-index-1">
                                        <div class="col-12">
                                            <h1 class="fs-20 cs-ff-montserrat text-end">ALT News</h1>
                                        </div>
                                        <div class="row">
                                            <template v-for="(item, index) in actualities.altNews" :key="item.id">
                                                <div class="col-lg-4 col-md-6"
                                                    :class="{ 'd-none d-md-block': index > 0 }">
                                                    <div class="tp-service-2-wrap p-relative fix mb-30 wow fadeInLeft"
                                                        data-wow-duration=".9s">
                                                        <div class="tp-service-2-thumb tp-round-4 position-relative">
                                                            <img class="w-100 tp-round-4"
                                                                :src="`${config.public.apiBaseUrl}/storage/${item.image}`"
                                                                :alt="item.title">
                                                            <!-- Badge Premium/Gratuit -->
                                                            <div class="edition-type-badge-home">
                                                                <span v-if="item.is_free" class="badge-free-home">
                                                                    <i class="fa-solid fa-gift me-1"></i> Gratuit
                                                                </span>
                                                                <span v-else class="badge-premium-home">
                                                                    <i class="fa-solid fa-crown me-1"></i> Premium
                                                                </span>
                                                            </div>
                                                            <!-- Prix pour éditions premium -->
                                                            <div v-if="!item.is_free" class="edition-price-tag-home">
                                                                {{ formatPrice(item.price) }} FCFA
                                                            </div>
                                                            <!-- Bande verte en bas pour acheter -->
                                                            <div v-if="!item.is_free" class="purchase-banner-home">
                                                                <NuxtLink :to="localePath({ name: 'alt-news-id', params: { id: item.id } })"
                                                                    class="purchase-link-home">
                                                                    <i class="fa-solid fa-shopping-cart me-2"></i>
                                                                    Acheter ce numéro - {{ formatPrice(item.price) }} FCFA
                                                                </NuxtLink>
                                                            </div>
                                                        </div>
                                                        <div class="tp-service-2-content p-absolute">
                                                            <div
                                                                class="tp-service-2-content-top d-flex align-items-center">
                                                                <span v-if="String(item.title).match(/\d+/g)"
                                                                    class="mr-10 p-3 rounded-3 text-light cs-bg-purple fw-700 fs-5">
                                                                    #{{ String(item.title).match(/\d+/g)![0] }}
                                                                </span>
                                                                <span class="fw-500 fs-25 ls-m-2 cs-text-dark">
                                                                    <NuxtLink
                                                                        :to="localePath({ name: 'alt-news-id', params: { id: item.id } })"
                                                                        class="hover-text-white cs-ff-montserrat fs-18">
                                                                        {{ item.title }}
                                                                    </NuxtLink>
                                                                </span>
                                                            </div>
                                                            <div class="tp-service-2-content-bottom pt-20 mt-15">
                                                                <span
                                                                    class="cs-text-dark cs-ff-montserrat fw-700 cs-ff-poppins">
                                                                    {{ formatDate(item.date) }}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <!-- <div class="date p-2 text-center p-absolute">
                                                           
                                                        </div> -->
                                                    </div>
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                </SwiperSlide>
                                <SwiperSlide v-if="actualities?.news?.length">
                                    <div class="p-relative z-index-1">
                                        <div class="row">
                                            <div class="col-12">
                                                <h1 class="fs-20 cs-ff-montserrat text-end">{{ $t('header.news') }}</h1>
                                            </div>
                                            <template v-for="(item, index) in actualities.news" :key="item.id">
                                                <div class="col-xl-4 col-lg-6 col-md-6"
                                                    :class="{ 'd-none d-md-block': index > 0 }">
                                                    <div class="tp-blog-item anim-zoomin-wrap mb-40">
                                                        <div
                                                            class="tp-blog-thumb fix mb-25 tp-round-4 p-relative border border-1">
                                                            <div class="anim-zoomin fix">
                                                                <img class="w-100 thumbs tp-round-4"
                                                                    :src="`${config.public.apiBaseUrl}/storage/${item.image}`"
                                                                    :alt="item.title">
                                                            </div>
                                                            <div class="tp-blog-cetagory-wrap p-absolute">
                                                                <span
                                                                    class="tp-blog-cetagory text-uppercase cs-bg-brown fs-14 fw-500 tp-text-common-white d-inline-block mr-5">
                                                                    {{ item.country }}
                                                                </span>
                                                            </div>
                                                            <div class="tp-blog-author-wrap">
                                                                <div
                                                                    class="tp-blog-date d-inline-block text-center tp-round-4">
                                                                    <span class="cs-text-dark">{{ formatDate(item.date)
                                                                        }}</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="tp-blog-content">
                                                            <h3 class="fw-500 fs-19 lh-24">
                                                                <NuxtLink class="underline-black"
                                                                    :to="localePath({ name: 'news-id', params: { id: item.id } })">
                                                                    {{ item.title }}</NuxtLink>
                                                            </h3>
                                                            <div class="tp-border-bottom mt-15 mb-20"></div>
                                                            <p class="mb-20 description">{{ item.subtitle }}</p>
                                                            <NuxtLink
                                                                :to="localePath({ name: 'news-id', params: { id: item.id } })"
                                                                class="tp-btn-border d-inline-block lh-0 tp-round-36 fs-16 border-full-1 ls-0 tp-btn-switch-animation tp-text-theme-primary fw-500">
                                                                <span
                                                                    class="d-flex align-items-center justify-content-center">
                                                                    <span class="btn-text">{{
                                                                        $t('events.continue_reading') }}</span>
                                                                    <span class="btn-icon"><i
                                                                            class="fa-sharp fa-regular fa-arrow-right"></i></span>
                                                                    <span class="btn-icon"><i
                                                                            class="fa-sharp fa-regular fa-arrow-right"></i></span>
                                                                </span>
                                                            </NuxtLink>
                                                        </div>
                                                    </div>
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                </SwiperSlide>
                                <SwiperSlide v-if="actualities?.events?.length">
                                    <div class="p-relative z-index-1">
                                        <div class="row">
                                            <div class="col-12">
                                                <h1 class="fs-20 cs-ff-montserrat text-end">{{ $t('header.events') }}
                                                </h1>
                                            </div>
                                            <template v-for="(item, index) in actualities.events" :key="item.id">
                                                <div class="col-lg-6" :class="{ 'd-none d-md-block': index > 0 }">
                                                    <div class="tp-postbox-wrapper mr-50 mb-50">
                                                        <article class="tp-postbox-item mb-50">
                                                            <div class="tp-postbox-thumb mb-30 p-relative">
                                                                <NuxtLink
                                                                    :to="localePath({ name: 'events-id', params: { id: item.id } })">
                                                                    <img class="w-100 tp-round-4"
                                                                        :src="`${config.public.apiBaseUrl}/storage/${item.image}`"
                                                                        :alt="item.title">
                                                                </NuxtLink>
                                                                <div class="tp-blog-cetagory-wrap p-absolute">
                                                                    <span
                                                                        class="tp-blog-cetagory cs-bg-brown fs-14 fw-500 tp-text-common-white d-inline-block mr-5">
                                                                        {{ item.country }}
                                                                    </span>
                                                                </div>
                                                                <div class="tp-blog-author-wrap">
                                                                    <div
                                                                        class="tp-blog-date d-inline-block text-center tp-round-4">
                                                                        <!-- <h6 class="fs-24 tp-text-common-white mb-0 lh-1">22</h6> -->
                                                                        <span class="cs-text-dark">{{
                                                                            formatDate(item.date) }}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div class="tp-postbox-content">
                                                                <h3
                                                                    class="fw-600 fs-20 ls-m-2 fs-lg-30 fs-sm-25 cs-ff-montserrat">
                                                                    <NuxtLink
                                                                        :to="localePath({ name: 'events-id', params: { id: item.id } })"
                                                                        class="underline-gold">{{ item.title }}
                                                                    </NuxtLink>
                                                                </h3>
                                                                <p class="cs-ff-poppins fs-16 cs-text-dark description">
                                                                    {{ item.subtitle }} </p>
                                                                <NuxtLink
                                                                    :to="localePath({ name: 'events-id', params: { id: item.id } })"
                                                                    class="tp-btn-md d-inline-block lh-0 tp-round-26 fs-16 cs-bg-brown ls-0 tp-btn-switch-animation tp-text-common-white hover-text-white fw-600">
                                                                    <span
                                                                        class="d-flex align-items-center justify-content-center">
                                                                        <span class="btn-text cs-ff-poppins">{{
                                                                            $t('events.continue_reading') }}</span>
                                                                        <span class="btn-icon"><i
                                                                                class="fa-sharp fa-regular fa-arrow-right"></i></span>
                                                                        <span class="btn-icon"><i
                                                                                class="fa-sharp fa-regular fa-arrow-right"></i></span>
                                                                    </span>
                                                                </NuxtLink>
                                                            </div>
                                                        </article>
                                                    </div>
                                                </div>
                                            </template>
                                        </div>
                                    </div>
                                </SwiperSlide>
                            </Swiper>
                            <div v-else class="text-center p-5">
                                {{ $t('headlines.no_content') }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.custum-img {
    width: 60px;
    height: 60px;
    display: inline-block;
}

.tp-postbox-content h3,
.tp-blog-content h3 {
    height: 65px;
    line-height: 30px;
}

.tp-postbox-content p,
.tp-blog-content p {
    height: 90px;
}

.title-text {
    color: var(--cs-bg-dark-color);
}

.tp-blog-thumb div.anim-zoomin.fix {
    position: relative;
    width: 100%;
    height: 300px;
    /* Adjusted for better aspect ratio */
}

.tp-blog-thumb div.anim-zoomin.fix img {
    width: 100% !important;
    height: 100% !important;
    object-fit: cover;
}

.tp-postbox-thumb {
    /* position: relative; */
    /* width: 820px; */
    height: 350px;
}

.tp-postbox-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;

    /* width: 820px; */
    /* height: 350px; */
}

.tp-service-2-thumb {
    /* width: 415px !important; */
    height: 500px !important;
}

.tp-service-2-thumb img {
    object-fit: fill !important;
    width: 100% !important;
    height: 100% !important;
}

/* Badge Premium/Gratuit pour la page d'accueil */
.edition-type-badge-home {
    position: absolute;
    top: 15px;
    left: 15px;
    z-index: 10;
}

.badge-free-home {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 25px;
    font-size: 0.85rem;
    font-weight: 700;
    background: linear-gradient(135deg, #9E73B0, #7B1FA2);
    color: white;
    box-shadow: 0 4px 15px rgba(158, 115, 176, 0.4);
}

.badge-premium-home {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 25px;
    font-size: 0.85rem;
    font-weight: 700;
    background: linear-gradient(135deg, #d4b128, #b8991d);
    color: white;
    box-shadow: 0 4px 15px rgba(212, 177, 40, 0.4);
}

/* Prix pour éditions premium sur la page d'accueil */
.edition-price-tag-home {
    position: absolute;
    top: 15px;
    right: 15px;
    background: rgba(0, 0, 0, 0.75);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 700;
    backdrop-filter: blur(5px);
    z-index: 10;
}

/* Bande verte en bas pour acheter */
.purchase-banner-home {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #10b981, #059669);
    padding: 0;
    border-radius: 0 0 12px 12px;
    z-index: 10;
    overflow: hidden;
}

.purchase-link-home {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    color: white;
    font-weight: 700;
    font-size: 0.95rem;
    text-decoration: none;
    transition: all 0.3s ease;
    font-family: var(--cs-family-montserrat);
}

.purchase-link-home:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

.purchase-link-home i {
    font-size: 1.1rem;
}

/* Styles supplémentaires pour améliorer l'affichage mobile */
@media (max-width: 767px) {

    .col-lg-4.d-none.d-md-block:first-child,
    .col-xl-4.d-none.d-md-block:first-child,
    .col-lg-6.d-none.d-md-block:first-child {
        display: block !important;
    }
}
</style>