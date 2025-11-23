<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const config = useRuntimeConfig();
const { locale } = useI18n();
const services = ref([]);
const loading = ref(true);
const error = ref(null);

// Computed properties pour séparer les services par type
const fiscalServices = computed(() => {
    return services.value.filter(service => service.type === 'fiscal');
});

const juridiqueServices = computed(() => {
    return services.value.filter(service => service.type === 'juridique');
});

const currentActiveIndex = ref(-1);
let autoHoverInterval = null;

const fetchServices = async () => {
    loading.value = true;
    error.value = null;

    try {
        const response = await fetch(`${config.public.apiBaseUrl}/api/services`, {
            method: 'GET',
            headers: {
                'Accept-Language': locale.value,
                'company': 'conseil'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        services.value = await response.json();
    } catch (err) {
        console.error('Error fetching services:', err);
        error.value = err.message || 'Failed to load services';
    } finally {
        loading.value = false;
        // Démarrer l'animation automatique une fois les services chargés
        startAutoHover();
    }
};

const startAutoHover = () => {
    if (services.value.length === 0) return;
    
    autoHoverInterval = setInterval(() => {
        currentActiveIndex.value = (currentActiveIndex.value + 1) % services.value.length;
    }, 2000); // Change toutes les 2 secondes
};

const stopAutoHover = () => {
    if (autoHoverInterval) {
        clearInterval(autoHoverInterval);
        autoHoverInterval = null;
    }
};

const pauseAutoHover = () => {
    stopAutoHover();
    currentActiveIndex.value = -1;
    // Redémarre après 5 secondes d'inactivité
    setTimeout(() => {
        if (!autoHoverInterval) {
            startAutoHover();
        }
    }, 5000);
};

const getServiceGlobalIndex = (service) => {
    return services.value.findIndex(s => s.id === service.id);
};

const isServiceActive = (service) => {
    return getServiceGlobalIndex(service) === currentActiveIndex.value;
};

onMounted(() => {
    fetchServices();
});

// Nettoyage à la destruction du composant
onUnmounted(() => {
    stopAutoHover();
});
</script>

<template>
    <div class="tp-services-area pt-100 pt-md-135 pb-100 pb-md-140 px-3 px-md-4">
        <div class="container">
            <!-- Section Title -->
            <div class="row">
                <div class="col-12">
                    <div class="tp-services-section-title-wrap text-center mb-4 mb-md-5">
                        <!-- <span class="tp-section-subtitle fw-500 text-dark fs-5 fs-md-4 d-flex align-items-center justify-content-center gap-2 mb-2 mb-md-3">
                            <svg width="24" height="24" class="d-none d-md-block" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.7 10.2C1.2325 10.2 0.832431 10.0334 0.4998 9.7002C0.1666 9.36759 0 8.9675 0 8.5C0 8.0325 0.1666 7.63215 0.4998 7.29895C0.832431 6.96635 1.2325 6.8 1.7 6.8C2.1675 6.8 2.56757 6.96635 2.9002 7.29895C3.2334 7.63215 3.4 8.0325 3.4 8.5C3.4 8.9675 3.2334 9.36759 2.9002 9.7002C2.56757 10.0334 2.1675 10.2 1.7 10.2ZM3.1025 15.045L1.9125 13.855L5.61 10.1575L6.8 11.3475L3.1025 15.045ZM5.6525 6.8L1.955 3.1025L3.145 1.9125L6.8425 5.61L5.6525 6.8ZM8.5 17C8.0325 17 7.63241 16.8337 7.2998 16.5011C6.9666 16.1679 6.8 15.7675 6.8 15.3C6.8 14.8325 6.9666 14.4321 7.2998 14.099C7.63241 13.7663 8.0325 13.6 8.5 13.6C8.9675 13.6 9.36785 13.7663 9.70105 14.099C10.0337 14.4321 10.2 14.8325 10.2 15.3C10.2 15.7675 10.0337 16.1679 9.70105 16.5011C9.36785 16.8337 8.9675 17 8.5 17ZM8.5 3.4C8.0325 3.4 7.63241 3.2334 7.2998 2.9002C6.9666 2.56757 6.8 2.1675 6.8 1.7C6.8 1.2325 6.9666 0.83215 7.2998 0.49895C7.63241 0.166319 8.0325 0 8.5 0C8.9675 0 9.36785 0.166319 9.70105 0.49895C10.0337 0.83215 10.2 1.2325 10.2 1.7C10.2 2.1675 10.0337 2.56757 9.70105 2.9002C9.36785 3.2334 8.9675 3.4 8.5 3.4ZM11.3475 6.8425L10.1575 5.61L13.8975 1.9125L15.0875 3.1025L11.3475 6.8425ZM13.8975 15.045L10.2 11.3475L11.39 10.1575L15.0875 13.855L13.8975 15.045ZM15.3 10.2C14.8325 10.2 14.4321 10.0334 14.099 9.7002C13.7663 9.36759 13.6 8.9675 13.6 8.5C13.6 8.0325 13.7663 7.63215 14.099 7.29895C14.4321 6.96635 14.8325 6.8 15.3 6.8C15.7675 6.8 16.1679 6.96635 16.5011 7.29895C16.8337 7.63215 17 8.0325 17 8.5C17 8.9675 16.8337 9.36759 16.5011 9.7002C16.1679 10.0334 15.7675 10.2 15.3 10.2Z" fill="#d4b128" />
                            </svg>
                            <svg width="20" height="20" class="d-md-none" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1.7 10.2C1.2325 10.2 0.832431 10.0334 0.4998 9.7002C0.1666 9.36759 0 8.9675 0 8.5C0 8.0325 0.1666 7.63215 0.4998 7.29895C0.832431 6.96635 1.2325 6.8 1.7 6.8C2.1675 6.8 2.56757 6.96635 2.9002 7.29895C3.2334 7.63215 3.4 8.0325 3.4 8.5C3.4 8.9675 3.2334 9.36759 2.9002 9.7002C2.56757 10.0334 2.1675 10.2 1.7 10.2ZM3.1025 15.045L1.9125 13.855L5.61 10.1575L6.8 11.3475L3.1025 15.045ZM5.6525 6.8L1.955 3.1025L3.145 1.9125L6.8425 5.61L5.6525 6.8ZM8.5 17C8.0325 17 7.63241 16.8337 7.2998 16.5011C6.9666 16.1679 6.8 15.7675 6.8 15.3C6.8 14.8325 6.9666 14.4321 7.2998 14.099C7.63241 13.7663 8.0325 13.6 8.5 13.6C8.9675 13.6 9.36785 13.7663 9.70105 14.099C10.0337 14.4321 10.2 14.8325 10.2 15.3C10.2 15.7675 10.0337 16.1679 9.70105 16.5011C9.36785 16.8337 8.9675 17 8.5 17ZM8.5 3.4C8.0325 3.4 7.63241 3.2334 7.2998 2.9002C6.9666 2.56757 6.8 2.1675 6.8 1.7C6.8 1.2325 6.9666 0.83215 7.2998 0.49895C7.63241 0.166319 8.0325 0 8.5 0C8.9675 0 9.36785 0.166319 9.70105 0.49895C10.0337 0.83215 10.2 1.2325 10.2 1.7C10.2 2.1675 10.0337 2.56757 9.70105 2.9002C9.36785 3.2334 8.9675 3.4 8.5 3.4ZM11.3475 6.8425L10.1575 5.61L13.8975 1.9125L15.0875 3.1025L11.3475 6.8425ZM13.8975 15.045L10.2 11.3475L11.39 10.1575L15.0875 13.855L13.8975 15.045ZM15.3 10.2C14.8325 10.2 14.4321 10.0334 14.099 9.7002C13.7663 9.36759 13.6 8.9675 13.6 8.5C13.6 8.0325 13.7663 7.63215 14.099 7.29895C14.4321 6.96635 14.8325 6.8 15.3 6.8C15.7675 6.8 16.1679 6.96635 16.5011 7.29895C16.8337 7.63215 17 8.0325 17 8.5C17 8.9675 16.8337 9.36759 16.5011 9.7002C16.1679 10.0334 15.7675 10.2 15.3 10.2Z" fill="#d4b128" />
                            </svg>
                            {{ $t('services.title') }}
                        </span> -->
                        <h2 class="mb-3 mb-md-4 fs-2 fs-md-1 wow img-custom-anim-right text-gold" 
                            data-wow-duration="1.5s" data-wow-delay="0.2s">
                            {{ $t('services.subtitle') }}
                        </h2>
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="row">
                <div class="col-12 text-center py-4 py-md-5">
                    <div class="spinner-container">
                        <div class="spinner">
                            <div class="spinner-inner"></div>
                        </div>
                        <p class="mt-3 fs-6 fs-md-5 text-muted">{{ $t('services.loading') }}</p>
                    </div>
                </div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="row">
                <div class="col-12">
                    <div class="error-container text-center py-4 py-md-5">
                        <div class="error-icon mb-3">
                            <i class="fa-solid fa-circle-exclamation fs-1 text-danger"></i>
                        </div>
                        <h3 class="text-danger fs-4 fs-md-3">{{ $t('services.error.title') }}</h3>
                        <p class="text-muted mb-4 fs-6">{{ error }}</p>
                        <button @click="fetchServices" class="btn btn-primary btn-sm btn-md-md">
                            <i class="fa-solid fa-rotate me-2"></i>{{ $t('services.error.retry') }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Services Content -->
            <div v-else class="row g-3 g-md-4">
                <!-- Section Fiscale -->
                <div class="col-12 col-lg-6">
                    <div class="services-column">
                        <div class="section-header">
                            <h3 class="section-title">{{ $t('services.sections.fiscal') }}</h3>
                        </div>
                        <div class="services-list" 
                             @mouseenter="stopAutoHover" 
                             @mouseleave="pauseAutoHover">
                            <div v-for="(service, index) in fiscalServices" 
                                 :key="service.id" 
                                 class="service-item">
                                <div class="service-card" 
                                     :class="{ 'auto-active': isServiceActive(service) }"
                                     @mouseenter="currentActiveIndex = -1"
                                     @mouseleave="currentActiveIndex = -1">
                                    <div class="service-icon">
                                        <i :class="service.icon"></i>
                                    </div>
                                    <div class="service-content">
                                        <h4 class="service-title">{{ service.title }}</h4>
                                        <p class="service-description">{{ service.description }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Section Juridique -->
                <div class="col-12 col-lg-6">
                    <div class="services-column">
                        <div class="section-header">
                            <h3 class="section-title">{{ $t('services.sections.legal') }}</h3>
                        </div>
                        
                        <div class="services-list" 
                             @mouseenter="stopAutoHover" 
                             @mouseleave="pauseAutoHover">
                            <div v-for="(service, index) in juridiqueServices" 
                                 :key="service.id" 
                                 class="service-item">
                                <div class="service-card" 
                                     :class="{ 'auto-active': isServiceActive(service) }"
                                     @mouseenter="currentActiveIndex = -1"
                                     @mouseleave="currentActiveIndex = -1">
                                    <div class="service-icon">
                                        <i :class="service.icon"></i>
                                    </div>
                                    <div class="service-content">
                                        <h4 class="service-title">{{ service.title }}</h4>
                                        <p class="service-description">{{ service.description }}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empty State -->
                <div v-if="services.length === 0" class="col-12 text-center py-4 py-md-5">
                    <div class="empty-state">
                        <i class="fa-regular fa-folder-open fs-1 text-muted mb-3"></i>
                        <h4 class="text-muted fs-5 fs-md-4">{{ $t('services.empty.title') }}</h4>
                        <p class="text-muted fs-6">{{ $t('services.empty.description') }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Variables CSS pour cohérence */
:root {
    --service-card-height-mobile: auto;
    --service-card-height-desktop: 160px;
    --service-icon-size-mobile: 50px;
    --service-icon-size-desktop: 60px;
}

/* Loading Spinner */
.spinner-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 150px;
}

.spinner {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: 3px solid rgba(212, 177, 40, 0.2);
    border-top-color: var(--cs-gold-color);
    animation: spin 1s infinite linear;
    position: relative;
}

.spinner-inner {
    position: absolute;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 3px solid transparent;
    border-top-color: var(--cs-gold-color);
    top: 50%;
    left: 50%;
    margin-top: -15px;
    margin-left: -15px;
    animation: spin 0.8s infinite linear reverse;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* Error State */
.error-container {
    background-color: #fff9f9;
    border: 1px solid #ffe0e0;
    border-radius: 8px;
    padding: 1.5rem;
    margin: 0 1rem;
}

/* Empty State */
.empty-state {
    background-color: var(--cs-light-brown-color, #f8f9fa);
    border-radius: 8px;
    padding: 2rem 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 1rem;
}

/* Typography */
.text-gold {
    color: var(--cs-gold-color, #d4b128) !important;
}

/* Section Headers */
.section-header {
    text-align: center;
    margin-bottom: 1rem;
    background-color: #f8f9fa;
    padding: 1rem 0.5rem;
    border-radius: 8px 8px 0 0;
}

.section-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--cs-bg-dark-color, #333);
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

/* Services Column */
.services-column {
    background-color: #f8f9fa;
    border-radius: 8px;
    height: 100%;
    display: flex;
    flex-direction: column;
}

.services-list {
    padding: 0 0.75rem 1rem;
    flex: 1;
}

/* Service Item */
.service-item {
    margin-bottom: 1rem;
}

.service-item:last-child {
    margin-bottom: 0;
}

/* Service Card - Mobile First */
.service-card {
    height: var(--service-card-height-mobile);
    background: white;
    border-radius: 8px;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 0.75rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    border: 1px solid #e9ecef;
    transition: all 0.6s ease;
    cursor: pointer;
    min-height: 140px;
}

.service-card:hover,
.service-card.auto-active {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(212, 177, 40, 0.15);
    border-color: var(--cs-gold-color, #d4b128);
}

/* Service Icon - Mobile */
.service-icon {
    width: var(--service-icon-size-mobile);
    height: var(--service-icon-size-mobile);
    background: var(--cs-gold-color, #d4b128);
    border-radius: 8px;
    display: flex;
    align-items: center;
    padding: 15px;
    justify-content: center;
    flex-shrink: 0;
    transition: all 0.6s ease;
}

.service-icon i {
    font-size: 1.25rem;
    color: white;
    transition: all 0.6s ease;
}

.service-card:hover .service-icon,
.service-card.auto-active .service-icon {
    background: var(--cs-brown-color, #8b6914);
    transform: scale(1.05);
}

/* Service Content */
.service-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.service-title {
    font-size: 1rem;
    font-weight: 600;
    color: var(--cs-bg-dark-color, #333);
    margin-bottom: 0.5rem;
    line-height: 1.3;
    transition: color 0.6s ease;
}

.service-card:hover .service-title,
.service-card.auto-active .service-title {
    color: var(--cs-gold-color, #d4b128);
}

.service-description {
    color: #666;
    line-height: 1.4;
    font-size: 0.875rem;
    text-align: justify;
    margin: 0;
}

/* Responsive Design - Tablet et Desktop */
@media (min-width: 576px) {
    .spinner {
        width: 60px;
        height: 60px;
        border-width: 4px;
    }
    
    .spinner-inner {
        width: 40px;
        height: 40px;
        border-width: 4px;
        margin-top: -20px;
        margin-left: -20px;
    }
    
    .error-container,
    .empty-state {
        margin: 0;
        padding: 2rem;
    }
    
    .services-list {
        padding: 0 1rem 1.5rem;
    }
    
    .service-item {
        margin-bottom: 1.25rem;
    }
    
    .service-card {
        min-height: 120px;
        padding: 1.25rem;
    }
    
    .service-title {
        font-size: 1.1rem;
    }
    
    .service-description {
        font-size: 0.9rem;
    }
}

@media (min-width: 768px) {
    .section-header {
        padding: 1.5rem 1rem;
        margin-bottom: 1.5rem;
    }
    
    .section-title {
        font-size: 1.5rem;
        letter-spacing: 1px;
    }
    
    .service-card {
        flex-direction: row;
        text-align: left;
        align-items: flex-start;
        gap: 1.25rem;
        min-height: 110px;
        padding: 1.5rem;
    }
    
    .service-icon {
        width: var(--service-icon-size-desktop);
        height: var(--service-icon-size-desktop);
        border-radius: 10px;
    }
    
    .service-icon i {
        font-size: 1.5rem;
    }
    
    .service-content {
        text-align: left;
    }
    
    .service-title {
        font-size: 1.2rem;
        margin-bottom: 0.75rem;
    }
    
    .service-description {
        font-size: 0.95rem;
        line-height: 1.5;
    }
}

@media (min-width: 992px) {
    .services-column {
        min-height: 500px;
    }
    
    .services-list {
        padding: 0 1.5rem 2rem;
    }
    
    .service-item {
        margin-bottom: 1.5rem;
    }
    
    .service-card {
        height: var(--service-card-height-desktop);
        min-height: 140px;
        padding: 1.75rem;
        gap: 1.5rem;
    }
    
    .section-header {
        padding: 2rem 1rem;
        margin-bottom: 2rem;
    }
    
    .section-title {
        font-size: 2rem;
    }
    
    .service-title {
        font-size: 1.3rem;
        margin-bottom: 0.8rem;
    }
}

@media (min-width: 1200px) {
    .service-card {
        padding: 2rem;
    }
    
    .section-title {
        font-size: 2.25rem;
    }
}

/* Amélioration pour très petits écrans */
@media (max-width: 375px) {
    .tp-services-area {
        padding-left: 1rem !important;
        padding-right: 1rem !important;
    }
    
    .service-card {
        padding: 0.875rem;
        min-height: 130px;
    }
    
    .service-icon {
        width: 45px;
        height: 45px;
    }
    
    .service-icon i {
        font-size: 1.1rem;
    }
    
    .service-title {
        font-size: 0.95rem;
    }
    
    .service-description {
        font-size: 0.8rem;
    }
    
    .section-title {
        font-size: 1.1rem;
    }
}

/* Optimisation pour écrans tactiles */
@media (hover: none) and (pointer: coarse) {
    .service-card:hover {
        transform: none;
    }
    
    .service-card.auto-active {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(212, 177, 40, 0.15);
        border-color: var(--cs-gold-color, #d4b128);
    }
    
    .service-card:active {
        transform: scale(0.98);
        transition: transform 0.1s ease;
    }
}

/* Amélioration de l'accessibilité */
@media (prefers-reduced-motion: reduce) {
    .service-card,
    .service-icon,
    .service-title,
    .spinner,
    .spinner-inner {
        transition: none;
        animation: none;
    }
    
    /* Garde quand même l'effet auto-active mais sans animation */
    .service-card.auto-active {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(212, 177, 40, 0.15);
        border-color: var(--cs-gold-color, #d4b128);
    }
    
    .service-card.auto-active .service-icon {
        background: var(--cs-brown-color, #8b6914);
        transform: scale(1.05);
    }
    
    .service-card.auto-active .service-title {
        color: var(--cs-gold-color, #d4b128);
    }
}
</style>