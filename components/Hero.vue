<script setup lang="ts">
import Swiper from 'swiper'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/pagination'
import { Autoplay, EffectFade, Pagination } from 'swiper/modules'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

// Initialize Swiper modules
Swiper.use([Autoplay, EffectFade, Pagination])

const { get } = useApi()
const { locale, t } = useI18n()
const localePath = useLocalePath()

interface HomeHero {
  title: string;
  description: string;
  image: string;
}

interface HeroItem {
  paginations: string[];
  heroes: HomeHero[];
}

let heroSlider: Swiper | null = null
const heroData = ref<HeroItem>({
  paginations: [],
  heroes: [],
})
const loading = ref(true)
const error = ref<string | null>(null)

const fetchHeroData = async () => {
  loading.value = true
  error.value = null

  try {
    const data = await get<HeroItem>('/api/home-hero',)

    heroData.value = data
    console.log('Hero data loaded:', data)

    // Initialize Swiper after data is loaded and DOM is updated
    await nextTick()
    initializeSwiper()
  } catch (err) {
    console.error('Error fetching hero data:', err)
    error.value = err instanceof Error ? err.message : t('hero.error.message')
  } finally {
    loading.value = false
  }
}

const initializeSwiper = () => {
  // Destroy existing slider if it exists
  if (heroSlider) {
    heroSlider.destroy(true, true)
    heroSlider = null
  }

  if (heroData.value.heroes.length > 0) {
    // Use setTimeout to ensure DOM is fully rendered
    setTimeout(() => {
      heroSlider = new Swiper('.tp-hero-slider-zoom', {
        modules: [Autoplay, EffectFade, Pagination],
        slidesPerView: 1,
        speed: 1500,
        spaceBetween: 0,
        loop: heroData.value.heroes.length > 1,
        effect: "fade",
        autoplay: heroData.value.heroes.length > 1 ? {
          delay: 6000,
          disableOnInteraction: false,
        } : false,
        pagination: {
          el: ".tp-hero-slider-pagenation",
          clickable: true,
          renderBullet: function (index: number, className: string) {
            const paginationText = heroData.value.paginations[index] || `Slide ${index + 1}`
            return `<span class="${className}">${paginationText}</span>`
          },
        },
      })

      // console.log('Swiper initialized with', heroData.value.heroes.length, 'slides')
      // console.log('Pagination data:', heroData.value.paginations)
    }, 100)
  }
}

onMounted(() => {
  fetchHeroData()
})

// Clean up on component unmount
onBeforeUnmount(() => {
  if (heroSlider) {
    heroSlider.destroy()
  }
})
</script>

<template>
  <div class="tp-hero-area fix p-relative">
    <!-- Loading State -->
    <div v-if="loading" class="hero-loading-container">
      <div class="container">
        <div class="row align-items-center justify-content-center" style="min-height: 60vh;">
          <div class="col-12 text-center">
            <div class="spinner-container">
              <div class="spinner">
                <div class="spinner-inner"></div>
              </div>
              <p class="mt-3 fs-5 text-light">{{ $t('hero.loading') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="hero-error-container">
      <div class="container">
        <div class="row align-items-center justify-content-center" style="min-height: 60vh;">
          <div class="col-12 text-center">
            <div class="error-container">
              <div class="error-icon mb-3">
                <i class="fa-solid fa-circle-exclamation fs-1 text-danger"></i>
              </div>
              <h3 class="text-light">{{ $t('hero.error.title') }}</h3>
              <p class="text-light mb-4">{{ error }}</p>
              <button @click="fetchHeroData" class="btn btn-primary">
                <i class="fa-solid fa-rotate me-2"></i>{{ $t('hero.error.retry') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Hero Slider -->
    <div v-else-if="heroData.heroes.length > 0" class="swiper tp-hero-slider-zoom">
      <div class="swiper-wrapper">
        <div class="swiper-slide" v-for="(hero, index) in heroData.heroes" :key="index">
          <div class="tp-hero-singles p-relative" style="padding-top: 120px;">
            <div class="tp-hero-bg bg-position"
                   :style="{backgroundImage: `url(${$config.public.apiBaseUrl}/storage/${hero.image})`}"></div>
            <div class="container">
              <div class="row align-items-end">
                <div class="col-lg-7 tp-hero-spacing">
                  <div class="tp-hero-content-wrapper">
                    <h2 class="tp-hero-title text fw-600 fs-70 fs-lg-50 fs-xs-34 ls-m-3 tp-text-common-white lh-1 mb-25">
                      {{ hero.title }}
                    </h2>
                    <p class="text2 mb-50 tp-text-grey-3">
                      {{ hero.description }}
                    </p>
                  </div>
                </div>
                <div class="col-lg-5">
                  <div class="tp-hero-contact tp-round-4 mb-100 tp-slider-para-home">
                    <p class="tp-text-grey-3 mb-25">
                      {{ $t('hero.contact.description') }}
                    </p>
                    <div class="tp-hero-contact-btn">
                      <NuxtLink :to="localePath('contact')" class="fw-500 tp-text-common-white d-flex justify-content-between align-items-center">
                        {{ $t('hero.contact.button') }} <i class="fa-sharp fa-regular fa-arrow-right"></i>
                      </NuxtLink>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="hero-empty-container">
      <div class="container">
        <div class="row align-items-center justify-content-center" style="min-height: 60vh;">
          <div class="col-12 text-center">
            <div class="empty-state">
              <i class="fa-regular fa-folder-open fs-1 text-light mb-3"></i>
              <h4 class="text-light">{{ $t('hero.empty.title') }}</h4>
              <p class="text-light">{{ $t('hero.empty.description') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="!loading && !error && heroData.heroes.length > 0" class="tp-hero-slider-navigate p-absolute">
      <div class="container">
        <div class="row">
          <div class="col-12">
            <div class="tp-hero-slider-pagenation"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hero-loading-container,
.hero-error-container,
.hero-empty-container {
  background: var(--cs-bg-dark-color);
  min-height: 60vh;
}

.spinner-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.2);
  border-top-color: #fff;
  animation: spin 1s infinite linear;
  position: relative;
}

.spinner-inner {
  position: absolute;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 4px solid transparent;
  border-top-color: #fff;
  top: 50%;
  left: 50%;
  margin-top: -20px;
  margin-left: -20px;
  animation: spin 0.8s infinite linear reverse;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-container,
.empty-state {
  padding: 2rem;
}

.btn-primary {
  background-color: var(--cs-gold-color);
  /* border-color: #007bff; */
  padding: 0.5rem 1.5rem;
  border-radius: 0.375rem;
  color: black;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background-color: var(--cs-brown-color);
  /* border-color: #0056b3; */
  transform: translateY(-1px);
}

/* Pagination Styles */
.tp-hero-slider-pagenation {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 20px;
}

.tp-hero-slider-pagenation .swiper-pagination-bullet {
  margin: 0;
  padding: 8px 20px;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  opacity: 0.7;
  transition: all 0.3s ease;
  cursor: pointer;
  border: none;
  outline: none;
}

.tp-hero-slider-pagenation .swiper-pagination-bullet-active {
  background: rgba(255, 255, 255, 0.9);
  color: #333;
  opacity: 1;
  transform: scale(1.05);
}
</style>