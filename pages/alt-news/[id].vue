<script setup lang="ts">
import { onMounted, ref, watch, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import LoginModal from '~/components/LoginModal.vue';
import SubscriptionCompo from '~/components/SubscriptionCompo.vue';

const config = useRuntimeConfig();
const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();

// Modaux
const showLoginModal = ref(false);
const showPlansModal = ref(false);

// Vérifier si l'utilisateur est connecté et a un plan premium
const { isLoggedIn, getAuthUser } = useAuth();
const userLoggedIn = computed(() => isLoggedIn());

// Vérifier si l'utilisateur a un plan premium actif
const hasPremiumPlan = computed(() => {
    if (!userLoggedIn.value) return false;

    const user = getAuthUser();
    if (!user) return false;

    // Les types de plans premium qui donnent accès au contenu
    const premiumTypes = ['annual', 'student', 'monthly'];
    const hasPremiumType = premiumTypes.includes(user.type);

    // Vérifier si l'abonnement n'est pas expiré
    if (user.expiresAt) {
        const expirationDate = new Date(user.expiresAt);
        const now = new Date();
        if (expirationDate < now) {
            return false; // Abonnement expiré
        }
    }

    return hasPremiumType;
});

// Calculer si le contenu est accessible
const isPremiumContent = computed(() => altNews.value.is_free === false);
const canAccessContent = computed(() => {
    // Si gratuit, tout le monde peut accéder
    if (altNews.value.is_free) return true;
    // Si premium, il faut être connecté ET avoir un plan premium actif
    return hasPremiumPlan.value;
});

// Ouvrir le modal de connexion
const openLoginModal = () => {
    showLoginModal.value = true;
};

// Ouvrir le modal des plans
const openPlansModal = () => {
    showPlansModal.value = true;
};

// Gestion du succès de connexion
const handleLoginSuccess = (user: any) => {
    console.log('✅ Utilisateur connecté:', user.email);
    // Fermer le modal et recharger les données
    showLoginModal.value = false;
};

interface AltNews {
    id: number;
    title: string;
    date: string;
    image: string;
    iFrame: string;
    pdf: string;
    content: string;
    is_free?: boolean;
}

const { formatDate } = useFormatDate()

// Formater le prix
const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
};

const altNews = ref<AltNews>({
    id: 0,
    title: '',
    date: '',
    image: '',
    iFrame: '',
    pdf: '',
    content: '',
    is_free: true
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

        <!-- Message de blocage premium - AFFICHÉ EN PREMIER si pas d'accès -->
        <div v-if="isPremiumContent && !canAccessContent" class="tp-team-expreance-area pt-100 pb-50">
            <div class="container">
                <div class="row">
                    <div class="col-12">
                        <div class="premium-block-message">
                            <div class="premium-block-content">
                                <div class="premium-block-icon">
                                    <i class="fa-solid fa-lock"></i>
                                </div>
                                <!-- Utilisateur non connecté -->
                                <template v-if="!userLoggedIn">
                                    <h3>Contenu réservé aux abonnés</h3>
                                    <p>Connectez-vous à votre espace abonné pour accéder à l'intégralité de cette édition premium.</p>
                                    <div class="premium-block-actions">
                                        <button @click="openLoginModal" class="btn-login-premium">
                                            <i class="fa-solid fa-right-to-bracket me-2"></i>
                                            Se connecter
                                        </button>
                                        <button @click="openPlansModal" class="btn-subscribe-premium">
                                            <i class="fa-solid fa-crown me-2"></i>
                                            S'abonner
                                        </button>
                                    </div>
                                    <p class="premium-block-hint">
                                        Pas encore de compte ? <button @click="openPlansModal" class="link-subscribe">Créez-en un gratuitement</button>
                                    </p>
                                </template>
                                <!-- Utilisateur connecté mais sans plan premium -->
                                <template v-else>
                                    <h3>Abonnement Premium requis</h3>
                                    <p>Votre abonnement actuel ne vous donne pas accès aux éditions premium. Passez à un abonnement Premium pour débloquer tout le contenu.</p>
                                    <div class="premium-block-actions">
                                        <button @click="openPlansModal" class="btn-subscribe-premium">
                                            <i class="fa-solid fa-crown me-2"></i>
                                            Passer à Premium
                                        </button>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Section d'en-tête avec image et description -->
        <div class="tp-team-details-area" :class="isPremiumContent && !canAccessContent ? 'pt-50' : 'pt-100'">
            <div class="container">
                <div class="row">
                    <div class="col-lg-4">
                        <div class="tp-team-details-thumb mb-30 wow img-custom-anim-left position-relative" data-wow-duration="1.5s"
                            data-wow-delay="0.2s">
                            <img class="w-100 tp-round-4 shadow-lg"
                                 :src="`${config.public.apiBaseUrl}/storage/${altNews.image}`"
                                 alt="Image ALT News">
                            <!-- Badge Premium/Gratuit -->
                            <div class="edition-type-badge">
                                <span v-if="altNews.is_free" class="badge-free">
                                    <i class="fa-solid fa-gift me-1"></i> Gratuit
                                </span>
                                <span v-else class="badge-premium">
                                    <i class="fa-solid fa-crown me-1"></i> Premium
                                </span>
                            </div>
                            <!-- Prix pour éditions premium -->
                            <div v-if="!altNews.is_free" class="edition-price-tag">
                                {{ formatPrice(altNews.price || 2000) }} FCFA
                            </div>
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
                            <span v-if="canAccessContent" class="fw-600 fs-16 cs-text-gold p-3 border-bottom">Explorer les détails ci-dessous</span>
                            <div v-else-if="isPremiumContent" class="premium-teaser-banner">
                                <i class="fa-solid fa-lock me-2"></i>
                                <span>Abonnez-vous pour accéder au contenu complet</span>
                            </div>
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
                        <!-- Contenu accessible (gratuit ou utilisateur avec accès) -->
                        <div v-if="canAccessContent" class="cs-timeline-container">
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

        <!-- Modal de connexion -->
        <LoginModal v-model="showLoginModal" @login-success="handleLoginSuccess" @register-click="openPlansModal" />

        <!-- Modal des plans d'abonnement -->
        <Teleport to="body">
            <Transition name="modal">
                <div v-if="showPlansModal" class="plans-modal-overlay" @click.self="showPlansModal = false">
                    <div class="plans-modal">
                        <div class="plans-modal-header">
                            <h3>Choisissez votre plan</h3>
                            <button class="btn-close-modal" @click="showPlansModal = false" type="button">
                                <span>×</span>
                            </button>
                        </div>
                        <div class="plans-modal-body">
                            <SubscriptionCompo @open-login-modal="showPlansModal = false; showLoginModal = true" />
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
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

/* Badge Premium/Gratuit */
.edition-type-badge {
    position: absolute;
    top: 15px;
    left: 15px;
    z-index: 10;
}

.badge-free {
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

.badge-premium {
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

/* Prix pour éditions premium */
.edition-price-tag {
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

/* Premium Teaser Banner */
.premium-teaser-banner {
    display: inline-flex;
    align-items: center;
    padding: 0.8rem 1.5rem;
    background: linear-gradient(135deg, rgba(212, 177, 40, 0.1), rgba(212, 177, 40, 0.05));
    border: 2px solid #d4b128;
    border-radius: 25px;
    color: #d4b128;
    font-weight: 600;
    font-size: 0.95rem;
    box-shadow: 0 4px 15px rgba(212, 177, 40, 0.15);
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

/* Premium Block Message */
.premium-block-message {
    background: linear-gradient(135deg, #fef7f0 0%, #fff5eb 100%);
    border: 2px solid #d4b128;
    border-radius: 20px;
    padding: 3rem 2rem;
    text-align: center;
    margin: 2rem 0;
    box-shadow: 0 10px 40px rgba(212, 177, 40, 0.15);
}

.premium-block-content {
    max-width: 500px;
    margin: 0 auto;
}

.premium-block-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #d4b128, #b8991d);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    box-shadow: 0 8px 25px rgba(212, 177, 40, 0.3);
}

.premium-block-icon i {
    font-size: 2rem;
    color: white;
}

.premium-block-message h3 {
    font-size: 1.8rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 1rem;
}

.premium-block-message p {
    color: #6b7280;
    font-size: 1.05rem;
    line-height: 1.6;
    margin-bottom: 1.5rem;
}

.premium-block-actions {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
}

.btn-login-premium {
    display: inline-flex;
    align-items: center;
    padding: 0.875rem 2rem;
    background: linear-gradient(135deg, #d4b128, #b8991d);
    color: white;
    border: none;
    border-radius: 50px;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 15px rgba(212, 177, 40, 0.3);
}

.btn-login-premium:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(212, 177, 40, 0.4);
}

.btn-subscribe-premium {
    display: inline-flex;
    align-items: center;
    padding: 0.875rem 2rem;
    background: white;
    color: #d4b128;
    border: 2px solid #d4b128;
    border-radius: 50px;
    font-weight: 700;
    font-size: 1rem;
    text-decoration: none;
    transition: all 0.3s ease;
}

.btn-subscribe-premium:hover {
    background: #d4b128;
    color: white;
    transform: translateY(-2px);
}

.premium-block-hint {
    font-size: 0.9rem;
    color: #9ca3af;
    margin: 0;
}

.premium-block-hint a,
.link-subscribe {
    color: #d4b128;
    font-weight: 600;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0;
}

.premium-block-hint a:hover,
.link-subscribe:hover {
    text-decoration: underline;
}

/* Modal des plans */
.plans-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 1rem;
    overflow-y: auto;
}

.plans-modal {
    background: white;
    border-radius: 20px;
    max-width: 1200px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(107, 33, 168, 0.2);
    animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: translateY(-30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.plans-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    border-bottom: 2px solid #d4b128;
    position: sticky;
    top: 0;
    background: white;
    z-index: 10;
}

.plans-modal-header h3 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #d4b128;
    margin: 0;
}

.btn-close-modal {
    width: 40px;
    height: 40px;
    border: none;
    background: #f3f4f6;
    border-radius: 50%;
    font-size: 1.8rem;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
}

.btn-close-modal:hover {
    background: #e5e7eb;
    color: #1f2937;
}

.plans-modal-body {
    padding: 0;
}

/* Animation de la modal */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .plans-modal,
.modal-leave-active .plans-modal {
    transition: transform 0.3s ease;
}

.modal-enter-from .plans-modal,
.modal-leave-to .plans-modal {
    transform: scale(0.9);
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