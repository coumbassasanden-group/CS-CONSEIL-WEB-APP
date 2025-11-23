<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const config = useRuntimeConfig();
interface Actualite {
    id: number;
    date: string;
    image: string;
    video_link: string | null;
    pdf_link: string | null;  // Ajout du PDF global
    title: string;
    subtitle: string;
    country: string;
    content: string;
}

const { formatDate } = useFormatDate();
const { locale, t } = useI18n();
const route = useRoute();

const actualite = ref<Actualite>({
    id: 0,
    date: '',
    image: '',
    video_link: null,
    pdf_link: null,  // Ajout du PDF global
    title: '',
    subtitle: '',
    country: '',
    content: ''
});
const loading = ref(true);
const error = ref(null);
const showPdfPreview = ref(false);  // État pour l'aperçu PDF

// Mise à jour du head quand l'actualité est chargée
watch(actualite, (newValue) => {
    if (newValue && newValue.title) {
        useHead({
            title: t('news.detailTitle', {
                title: newValue.title,
                country: newValue.country
            }) + ' | CS Conseil',
            meta: [
                {
                    name: 'description',
                    content: newValue.content
                        ? t('news.detailDescription', {
                            title: newValue.title,
                            subtitle: newValue.subtitle,
                            country: newValue.country,
                            date: formatDate(newValue.date)
                        })
                        : t('news.defaultDetailDescription', {
                            title: newValue.title,
                            country: newValue.country
                        })
                }
            ]
        })
    }
});

const fetchActualite = async () => {
    loading.value = true;
    error.value = null;

    try {
        const actualiteId = route.params.id;
        const response = await fetch(`${config.public.apiBaseUrl}/api/news/${actualiteId}`, {
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

        actualite.value = data;
    } catch (err: any) {
        console.error('Error fetching actualite details:', err);
        error.value = err.message || 'Failed to load actualite details';
    } finally {
        loading.value = false;
    }
};

const getVideoThumbnail = (videoLink: string): string => {
    // Extraire l'ID YouTube de l'URL
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = videoLink.match(youtubeRegex);
    if (match) {
        return `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg`;
    }
    return '';
};

// Ajouter cette nouvelle fonction
const getEmbedUrl = (videoLink: string): string => {
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/;
    const match = videoLink.match(youtubeRegex);
    if (match) {
        return `https://www.youtube.com/embed/${match[1]}`;
    }
    return videoLink;
};

// ✨ Fonctions PDF (inspirées d'AltNews)
const downloadPdf = () => {
    if (actualite.value.pdf_link) {
        const link = document.createElement('a');
        link.href = `${config.public.apiBaseUrl}/storage/${actualite.value.pdf_link}`;
        link.download = `News_${actualite.value.id}_${actualite.value.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

const togglePdfPreview = () => {
    showPdfPreview.value = !showPdfPreview.value;
};

onMounted(async () => {
    await fetchActualite();
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
                        <p class="mt-3 fs-5 text-muted">{{ $t('newsDetail.loading') }}</p>
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
                        <h3 class="text-danger">{{ $t('newsDetail.error.title') }}</h3>
                        <p class="text-muted mb-4">{{ error }}</p>
                        <button @click="fetchActualite" class="btn btn-primary">
                            <i class="fa-solid fa-rotate me-2"></i>{{ $t('newsDetail.error.retry') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Main Content -->
    <div v-else>
        <ThirdHero :title="actualite.title" parentPage="/news"
            :image="`${config.public.apiBaseUrl}/storage/images_folder/conseil_news_details_hero.jpg`" />

        <!-- Section d'en-tête - même structure qu'ALT News -->
        <div class="tp-team-details-area pt-100">
            <div class="container">
                <div class="row">
                    <div class="col-lg-4">
                        <div class="tp-team-details-thumb mb-30 wow img-custom-anim-left" data-wow-duration="1.5s"
                            data-wow-delay="0.2s">
                            <img class="w-100 tp-round-4 shadow-lg" 
                                 :src="`${config.public.apiBaseUrl}/storage/${actualite.image}`"
                                 :alt="actualite.title">
                        </div>
                    </div>
                    <div class="col-lg-8">
                        <div class="tp-team-details-content mb-30">
                            <h2 class="fw-600 fs-50 ls-m-2 mb-15 wow img-custom-anim-left cs-text-gold cs-ff-montserrat"
                                data-wow-duration="1.5s" data-wow-delay="0.2s">
                                {{ actualite.title }}
                            </h2>
                            <div class="tp-postbox-meta-item mb-30 d-flex align-items-center flex-wrap gap-3">
                                <span class="cs-text-dark fw-600 fs-18">{{ formatDate(actualite.date) }}</span>
                                <span class="cs-badge ms-3 text-uppercase cs-bg-brown">{{ actualite.country }}</span>
                            </div>
                            <div class="subtitle-section mb-30" v-if="actualite.subtitle">
                                <p class="cs-text-dark cs-ff-poppins fs-18 fw-500">{{ actualite.subtitle }}</p>
                            </div>
                            <div class="mb-40" v-if="actualite.content">
                                <div v-html="actualite.content"></div>
                            </div>
                            <span class="fw-600 fs-16 cs-text-gold p-3 border-bottom">{{ $t('constant.explore_details') }}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Section de timeline améliorée - même structure qu'ALT News -->
        <div class="tp-team-expreance-area pb-95">
            <div class="container">
                <div class="row">
                    <!-- Timeline avec points de navigation -->
                    <div class="col-12">
                        <div class="cs-timeline-container">
                            <!-- Section Vidéo YouTube -->
                            <div class="cs-timeline-item" v-if="actualite.video_link">
                                <div class="cs-timeline-marker">
                                    <div class="cs-timeline-dot"></div>
                                    <div class="cs-timeline-line"></div>
                                </div>
                                <div class="cs-timeline-header">
                                    <h3 class="cs-timeline-title cs-text-gold"><i class="fa-brands fa-youtube text-danger"></i> {{ $t('newsDetail.videoSection.title', 'Vidéo associée') }}</h3>
                                </div>
                                <div class="cs-timeline-content">
                                    <div class="video-container">
                                        <iframe
                                            :src="`${actualite.video_link.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}?&rel=0`"
                                            title="Vidéo de l'actualité" 
                                            frameborder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            referrerpolicy="strict-origin-when-cross-origin" 
                                            allowfullscreen
                                            loading="lazy"
                                            class="w-100 video-iframe">
                                        </iframe>
                                    </div>
                                </div>
                            </div>

                            <!-- Section PDF ou Message si pas de PDF -->
                            <div class="cs-timeline-item">
                                <div class="cs-timeline-marker">
                                    <div v-if="actualite.pdf_link" class="cs-timeline-dot"></div>
                                    <div v-if="actualite.video_link" class="cs-timeline-line"></div>
                                </div>
                                <div v-if="actualite.pdf_link" class="cs-timeline-header">
                                    <h3 class="cs-timeline-title cs-text-gold">{{ $t('newsDetail.pdfSection.title') }}</h3>
                                </div>
                                <div class="cs-timeline-content">
                                    <div v-if="actualite.pdf_link">
                                        <div class="pdf-actions mb-3">
                                            <button @click="downloadPdf"
                                                class="tp-btn-xl d-inline-block lh-0 tp-round-24 fs-16 cs-bg-gold ls-0 tp-btn-switch-animation tp-text-common-white hover-text-white fw-500">
                                                <span class="d-flex align-items-center justify-content-center">
                                                    <span class="btn-text">{{ $t('newsDetail.downloadPdf', 'Télécharger') }}</span>
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
                                            <iframe :src="`${config.public.apiBaseUrl}/storage/${actualite.pdf_link}`"
                                                    class="w-100 pdf-iframe"
                                                    title="PDF Preview">
                                            </iframe>
                                        </div>
                                    </div>
                                    <!-- <div v-else class="no-pdf-content">
                                        <div class="no-pdf-message">
                                            <i class="fa-regular fa-file-pdf fs-2 text-muted mb-3"></i>
                                            <p class="text-muted mb-0 fs-16">{{ $t('constant.doc_no_availlable') }}</p>
                                        </div>
                                    </div> -->
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

/* Styles principaux - structure ALT News */
.tp-team-details-area {
    background-color: white;
    padding-top: 100px;
}

.tp-team-details-thumb {
    position: relative;
    overflow: hidden;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.tp-team-details-thumb img {
    width: 100%;
    height: auto;
    transition: transform 0.3s ease;
}

.tp-team-details-thumb:hover img {
    transform: scale(1.02);
}

.tp-team-details-content {
    padding-left: 0;
}

.cs-badge {
    background-color: var(--cs-brown-color);
    color: var(--cs-gold-color);
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    display: inline-block;
}

.cs-bg-brown {
    background-color: var(--cs-brown-color) !important;
    color: var(--cs-gold-color) !important;
}

.subtitle-section p {
    font-style: italic;
    color: var(--cs-text-muted);
    border-left: 4px solid var(--cs-gold-color);
    padding-left: 20px;
    margin: 0;
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

/* Timeline amélioré - même style qu'ALT News */
.tp-team-expreance-area {
    background-color: white;
    padding-bottom: 95px;
}

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

/* Video Container */
.video-container {
    background-color: #f8f9fa;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.video-iframe {
    height: 400px;
    border: none;
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

/* Messages "pas disponible" */
.no-pdf-content {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 120px;
    background-color: #f8f9fa;
    border-radius: 10px;
    border: 2px dashed #dee2e6;
}

.no-pdf-message {
    text-align: center;
    color: #6c757d;
}

.no-pdf-message i {
    display: block;
    margin-bottom: 10px;
}

/* Typography améliorée */
.tp-team-details-content h2 {
    line-height: 1.2;
}

.tp-postbox-meta-item {
    margin-bottom: 30px;
}

.tp-postbox-meta-item span {
    font-family: var(--cs-family-poppins);
}

/* Content styling */
.tp-team-details-content :deep(p) {
    font-family: var(--cs-family-poppins);
    color: var(--cs-text-dark);
    line-height: 1.6;
    margin-bottom: 20px;
}

.tp-team-details-content :deep(ul),
.tp-team-details-content :deep(ol) {
    font-family: var(--cs-family-poppins);
    color: var(--cs-text-dark);
    line-height: 1.6;
    padding-left: 20px;
    margin-bottom: 20px;
}

.tp-team-details-content :deep(strong),
.tp-team-details-content :deep(b) {
    color: var(--cs-brown-color);
}

/* Responsive */
@media only screen and (max-width: 991px) {
    .tp-team-details-content {
        margin-top: 30px;
    }
}

@media only screen and (max-width: 767px) {
    .tp-team-details-area {
        padding-top: 60px;
    }

    .cs-timeline-item {
        margin-bottom: 40px;
    }

    .cs-timeline-content {
        padding-left: 30px;
    }

    .cs-timeline-header {
        padding-left: 30px;
    }

    .video-iframe {
        height: 250px;
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

    .tp-team-details-content h2 {
        font-size: 36px !important;
    }

    .tp-postbox-meta-item {
        flex-direction: column;
        align-items: flex-start !important;
        gap: 10px !important;
    }

    .cs-badge {
        margin-left: 0 !important;
    }
}

@media only screen and (max-width: 480px) {
    .tp-team-details-content h2 {
        font-size: 28px !important;
    }

    .video-iframe {
        height: 200px;
    }

    .cs-timeline-content {
        padding-left: 25px;
    }

    .cs-timeline-header {
        padding-left: 25px;
    }
}
</style>