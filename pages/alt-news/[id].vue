<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const config = useRuntimeConfig();
const { t, locale } = useI18n();
const route = useRoute();

interface AltNews {
    id: number;
    title: string;
    date: string;
    image: string;
    iFrame: string;
    pdf: string;
    content: string;
}

const { formatDate } = useFormatDate()

const altNews = ref<AltNews>({
    id: 0,
    title: '',
    date: '',
    image: '',
    iFrame: '',
    pdf: '',
    content: ''
});

const loading = ref(true);
const error = ref<string | null>(null);
const showPdfPreview = ref(false);

const fetchAltNewsDetails = async () => {
    loading.value = true;
    error.value = null;

    try {
        const newsId = route.params.id;
        const response = await fetch(`${config.public.apiBaseUrl}/api/alt-news/${newsId}`, {
            method: 'GET',
            headers: {
                'Accept-Language': locale.value,
                'company': 'conseil'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        altNews.value = data;
    } catch (err: any) {
        console.error('Error fetching ALT news details:', err);
        error.value = err.message || 'Failed to load ALT news details';
    } finally {
        loading.value = false;
    }
};

const downloadPdf = () => {
    if (altNews.value.pdf) {
        const link = document.createElement('a');
        link.href = `${config.public.apiBaseUrl}/storage/${altNews.value.pdf}`;
        link.download = `ALT_${altNews.value.id}_${altNews.value.title}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

const togglePdfPreview = () => {
    showPdfPreview.value = !showPdfPreview.value;
};

// Mise à jour du head quand l'actualité est chargée
watch(altNews, (newValue) => {
    if (newValue && newValue.title) {
        useHead({
            title: t('altNews.detailTitle', { 
                title: newValue.title, 
                id: newValue.id 
            }) + ' | CS Conseil',
            meta: [
                {
                    name: 'description',
                    content: newValue.content 
                        ? t('altNews.detailDescription', { 
                            content: newValue.content.slice(0, 155),
                            id: newValue.id,
                            title: newValue.title 
                          })
                        : t('altNews.defaultDetailDescription', { 
                            id: newValue.id,
                            title: newValue.title 
                          })
                }
            ]
        })
    }
})

onMounted( async () => {
    await fetchAltNewsDetails();
});
</script>

<template>
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
        <div class="container">
            <div class="row">
                <div class="col-12 text-center py-5">
                    <div class="spinner-container">
                        <div class="spinner">
                            <div class="spinner-inner"></div>
                        </div>
                        <p class="mt-3 fs-5 text-muted">Loading ALT news details...</p>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
        <div class="container">
            <div class="row">
                <div class="col-12">
                    <div class="error-content text-center py-5">
                        <div class="error-icon mb-3">
                            <i class="fa-solid fa-circle-exclamation fs-1 text-danger"></i>
                        </div>
                        <h3 class="text-danger">Oops! Something went wrong.</h3>
                        <p class="text-muted mb-4">{{ error }}</p>
                        <button @click="fetchAltNewsDetails" class="btn btn-primary">
                            <i class="fa-solid fa-rotate me-2"></i>Try Again
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div v-else>
        <ThirdHero v-if="String(altNews.title).match(/\d+/g)" :title="`ALT #${String(altNews.title).match(/\d+/g)![0]}`" parentPage="/alt-news" :image="`${config.public.apiBaseUrl}/storage/images_folder/conseil_alt_news_details_hero.jpg`" />
         <ThirdHero v-else title="" parentPage="/alt-news" :image="`${config.public.apiBaseUrl}/storage/images_folder/conseil_alt_news_details_hero.jpg`" />

        <!-- Section d'en-tête -->
        <div class="tp-team-details-area pt-100">
            <div class="container">
                <div class="row">
                    <div class="col-lg-4">
                        <div class="tp-team-details-thumb mb-30 wow img-custom-anim-left" data-wow-duration="1.5s"
                            data-wow-delay="0.2s">
                            <img class="w-100 tp-round-4 shadow-lg" 
                                 :src="`${config.public.apiBaseUrl}/storage/${altNews.image}`"
                                 alt="Image ALT News">
                        </div>
                    </div>
                    <div class="col-lg-8">
                        <div class="tp-team-details-content mb-30">
                            <h2 class="fw-600 fs-50 ls-m-2 mb-15 wow img-custom-anim-left cs-text-purple cs-ff-montserrat"
                                data-wow-duration="1.5s" data-wow-delay="0.2s">
                                {{ altNews.title }}
                            </h2>
                            <div class="tp-postbox-meta-item mb-30 d-flex align-items-center">
                                <span class="cs-text-dark fw-600 fs-18">{{ formatDate(altNews.date) }}</span>
                                <span v-if="String(altNews.title).match(/\d+/g)" class="cs-badge ms-3">ALT #{{ String(altNews.title).match(/\d+/g)![0] }}</span>
                            </div>
                            <div class="mb-40" v-if="altNews.content">
                                <div v-html="altNews.content"></div>
                            </div>
                            <span class="fw-600 fs-16 cs-text-gold p-3 border-bottom">Explorer les détails ci-dessous</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Section de timeline améliorée -->
        <div class="tp-team-expreance-area pb-95">
            <div class="container">
                <div class="row">
                    <!-- Timeline avec points de navigation -->
                    <div class="col-12">
                        <div class="cs-timeline-container">
                            <!-- Section Wireframe/iFrame -->
                            <div class="cs-timeline-item" v-if="altNews.iFrame">
                                <div class="cs-timeline-marker">
                                    <div class="cs-timeline-dot"></div>
                                    <div class="cs-timeline-line"></div>
                                </div>
                                <div class="cs-timeline-header">
                                    <h3 class="cs-timeline-title cs-text-purple">Publication Interactive</h3>
                                </div>
                                <div class="cs-timeline-content">
                                    <div class="iframe-container">
                                        <div v-html="altNews.iFrame"></div>
                                    </div>
                                </div>
                            </div>

                            <!-- Section PDF -->
                            <div class="cs-timeline-item" v-if="altNews.pdf">
                                <div class="cs-timeline-marker">
                                    <div class="cs-timeline-dot"></div>
                                </div>
                                <div class="cs-timeline-header">
                                    <h3 class="cs-timeline-title cs-text-purple">Version PDF</h3>
                                </div>
                                <div class="cs-timeline-content">
                                    <div class="pdf-actions mb-3">
                                        <button @click="downloadPdf"
                                            class="tp-btn-xl d-inline-block lh-0 tp-round-24 fs-16 cs-bg-purple ls-0 tp-btn-switch-animation tp-text-common-white hover-text-white fw-500">
                                            <span class="d-flex align-items-center justify-content-center">
                                                <span class="btn-text">Télécharger</span>
                                                <span class="btn-icon"><i class="fa-regular fa-arrow-down-to-line"></i></span>
                                                <span class="btn-icon"><i class="fa-regular fa-arrow-down-to-line"></i></span>
                                            </span>
                                        </button>
                                        <button @click="togglePdfPreview"
                                            class="tp-btn-border d-inline-block lh-0 tp-round-24 fs-16 border-full-1 ls-0 tp-btn-switch-animation tp-text-theme-primary fw-500">
                                            <span class="d-flex align-items-center justify-content-center">
                                                <span class="btn-text">{{ showPdfPreview ? 'Masquer' : 'Aperçu' }}</span>
                                                <span class="btn-icon">
                                                    <i :class="showPdfPreview ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye'"></i>
                                                </span>
                                            </span>
                                        </button>
                                    </div>
                                    
                                    <!-- PDF Preview -->
                                    <div v-if="showPdfPreview" class="pdf-preview mt-3">
                                        <iframe :src="`${config.public.apiBaseUrl}/storage/${altNews.pdf}`"
                                                class="w-100 pdf-iframe"
                                                title="PDF Preview">
                                        </iframe>
                                    </div>
                                </div>
                            </div>

                            <!-- Message si pas de contenu -->
                            <div v-if="!altNews.iFrame && !altNews.pdf" class="cs-timeline-item">
                                <div class="cs-timeline-marker">
                                    <div class="cs-timeline-dot"></div>
                                </div>
                                <div class="cs-timeline-content">
                                    <div class="empty-content text-center py-5">
                                        <i class="fa-regular fa-file-lines fs-1 text-muted mb-3"></i>
                                        <h4 class="text-muted">Contenu en cours de préparation</h4>
                                        <p class="text-muted">Le contenu détaillé sera bientôt disponible.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Loading Spinner */
.loading-container,
.error-container {
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

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

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}

/* Error State */
.error-content {
    background-color: #fff9f9;
    border: 1px solid #ffe0e0;
    border-radius: 8px;
    padding: 2rem;
}

/* Styles existants */
.content-box {
    background-color: rgba(231, 215, 197, 0.1);
    padding: 20px;
    border-radius: 10px;
    border-left: 4px solid var(--cs-gold-color);
}

.cs-badge {
    background-color: var(--cs-purple-color);
    color: white;
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
}

.explore-banner {
    display: inline-block;
    border: 2px solid var(--cs-gold-color);
    border-radius: 8px;
    background-color: rgba(212, 177, 40, 0.08);
    transition: all 0.3s ease;
}

.explore-banner:hover {
    background-color: rgba(212, 177, 40, 0.15);
    transform: translateY(-3px);
}

/* Timeline amélioré */
.cs-timeline-container {
    position: relative;
    padding: 20px 0;
}

.cs-timeline-item {
    position: relative;
    display: flex;
    flex-direction: column;
    margin-bottom: 60px;
}

.cs-timeline-marker {
    position: absolute;
    left: 0;
    top: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.cs-timeline-dot {
    width: 16px;
    height: 16px;
    background-color: var(--cs-gold-color);
    border-radius: 50%;
    z-index: 2;
    box-shadow: 0 0 0 5px rgba(212, 177, 40, 0.2);
}

.cs-timeline-line {
    position: absolute;
    width: 3px;
    background-color: var(--cs-gold-color);
    top: 16px;
    bottom: -60px;
    left: calc(16px / 2 - 3px / 2);
}

.cs-timeline-header {
    padding-left: 40px;
    margin-bottom: 15px;
}

.cs-timeline-title {
    font-size: 24px;
    font-weight: 600;
    margin: 0;
    font-family: var(--cs-family-montserrat);
}

.cs-timeline-content {
    padding-left: 40px;
}

/* iFrame Container */
.iframe-container {
    background-color: #f8f9fa;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.iframe-container :deep(iframe) {
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* PDF Actions */
.pdf-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
}

.pdf-preview {
    background-color: #f8f9fa;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.pdf-iframe {
    height: 600px;
    border: none;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Empty Content */
.empty-content {
    background-color: #f9f9f9;
    border-radius: 8px;
    padding: 3rem;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* Responsive */
@media only screen and (max-width: 767px) {
    .cs-timeline-item {
        margin-bottom: 40px;
    }

    .cs-timeline-content {
        padding-left: 30px;
    }

    .cs-timeline-header {
        padding-left: 30px;
    }

    .pdf-iframe {
        height: 400px;
    }

    .pdf-actions {
        flex-direction: column;
        align-items: stretch;
    }

    .pdf-actions button {
        width: 100%;
        justify-content: center;
    }
}
</style>