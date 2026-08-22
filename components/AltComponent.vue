<script setup>
import { onMounted, ref, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '~/composables/useAuth';
import LoginModal from '~/components/LoginModal.vue';
import SubscriptionCompo from '~/components/SubscriptionCompo.vue';
import {
    PAXITY_CHECKOUT_DETAILS_KEY,
    PAXITY_CHECKOUT_REFERENCE_KEY,
    PAXITY_PENDING_EDITION_PURCHASE_KEY,
    PAXITY_CARD_METHOD_ID,
    appendCardOption
} from '~/composables/usePaxityCheckout';

const config = useRuntimeConfig();
const { locale } = useI18n();
const { formatDate } = useFormatDate()
const localePath = useLocalePath();
const route = useRoute();
const router = useRouter();
const { isLoggedIn, getAuthUser } = useAuth();

// Récupérer la locale courante
const currentLocale = computed(() => {
    const pathParts = route.path.split('/');
    const loc = pathParts[1];
    return ['fr', 'en'].includes(loc) ? loc : 'fr';
});

const altNews = ref([]);
const loading = ref(true);
const error = ref(null);

// État pour le modal de connexion et paiement
const showLoginModal = ref(false);
const showPlansModal = ref(false);
const showPaymentModal = ref(false);
const selectedEditionForPurchase = ref(null);
const paymentTransactionId = ref('');
const paymentPhone = ref('');
const phoneError = ref('');
const { actif: modeTest, tarif } = useModeTest();

// Tarif unitaire d'une édition, ramené à 100 F sur les URL de recette.
const UNIT_PRICE = computed(() => tarif(2000));

// —————————————————————————— Paiement Paxity
// Remplace CinetPay, dont le CDN (cdn.cinetpay.com/seamless/main.js) répond 522
// et rendait l'achat d'une édition impossible. Aucune clé n'est manipulée ici :
// tout passe par les routes /api/payment/paxity/** du serveur Nitro.
const {
    createCheckout: createPaxityCheckout,
    createCardCheckout: createPaxityCardCheckout,
    getMethods: getPaxityMethods,
    error: paxityError
} = usePaxityCheckout();

const paymentMethods = ref([]);
const selectedMethodId = ref('');
const { ouvrir: ouvrirWidgetCarte, loading: widgetLoading } = usePaxityWidget();
const { pays, paysChoisi, moyensDuPays, charger: chargerCatalogue } = usePaymentCountries();

// —————————————————————————— Carte bancaire
// Fermée tant que Paxity n'a pas habilité le business : son endpoint
// `pay-in-card` répond 403. Le drapeau évite d'afficher une option morte.
// La carte est ouverte dès que le widget Paxity est actif : c'est lui qui
// collecte le numéro, chez Paxity. `paxityCardEnabled` gouverne l'autre chemin,
// celui de notre route /card qui reçoit le PAN, et reste fermé.
const cardEnabled = computed(() => String(config.public.paxityCardWidget) === 'true');
const isCardSelected = computed(() => selectedMethodId.value === PAXITY_CARD_METHOD_ID);

/**
 * ⚠️ Données de porteur : jamais persistées, jamais journalisées. Effacées
 * dès la réponse du serveur et à la fermeture de la modale.
 */
const cardFields = ref({
    cardNumber: '',
    expiry: '',
    cvv: '',
    holderFirstName: '',
    holderLastName: ''
});

const resetCardFields = () => {
    cardFields.value = { cardNumber: '', expiry: '', cvv: '', holderFirstName: '', holderLastName: '' };
};

const isCardValid = computed(() => {
    const f = cardFields.value;
    return f.cardNumber.replace(/\D/g, '').length >= 12 &&
        /^\d{2}\/\d{2}$/.test(f.expiry) &&
        f.cvv.length >= 3 &&
        f.holderFirstName.trim() !== '' &&
        f.holderLastName.trim() !== '';
});
const methodsLoading = ref(false);
const methodsError = ref('');
const paymentError = ref('');
const isPaying = ref(false);

const brokenLogos = ref(new Set());

const convertedAmount = ref(null);
const convertLoading = ref(false);

/**
 * Montant réellement débité quand le moyen choisi n'est pas libellé en XOF.
 *
 * Purement informatif : c'est le serveur qui refait la conversion au moment de
 * créer la transaction. L'afficher évite qu'un client voie « 2 000 FCFA » et
 * retrouve « 37,60 GHS » sur son relevé sans explication.
 */
const refreshConvertedAmount = async () => {
    const devise = selectedMethod.value?.currency;
    const montant = tarif(selectedEditionForPurchase.value?.price || 2000);

    if (!devise || devise === 'XOF') {
        convertedAmount.value = null;
        return;
    }

    convertLoading.value = true;
    try {
        const data = await $fetch('/api/payment/paxity/convert', {
            query: { amount: montant, currency: devise }
        });
        convertedAmount.value = data;
    } catch {
        // Un taux indisponible ne doit pas empêcher de payer : le serveur
        // retentera la conversion, on se contente de ne rien annoncer.
        convertedAmount.value = null;
    } finally {
        convertLoading.value = false;
    }
};

watch(selectedMethodId, refreshConvertedAmount);

watch(paysChoisi, () => {
    if (!paymentMethods.value.length) return;
    paymentMethods.value = appendCardOption(moyensDuPays.value, cardEnabled.value);
    if (!paymentMethods.value.some((m) => m.id === selectedMethodId.value)) {
        const first = paymentMethods.value.find((m) => m.available !== false);
        selectedMethodId.value = first ? first.id : '';
    }
});

const selectedMethod = computed(
    () => paymentMethods.value.find((method) => method.id === selectedMethodId.value) || null
);

/** Charge les moyens actifs. Le catalogue peut changer sans préavis côté Paxity. */
const loadPaymentMethods = async () => {
    if (paymentMethods.value.length) return;
    methodsLoading.value = true;
    methodsError.value = '';
    try {
        await chargerCatalogue();
        paymentMethods.value = appendCardOption(moyensDuPays.value, cardEnabled.value);

        // Ne présélectionne jamais un moyen indisponible.
        if (!selectedMethodId.value) {
            const first = paymentMethods.value.find((method) => method.available !== false);
            if (first) selectedMethodId.value = first.id;
        }
    } catch (error) {
        methodsError.value = 'Impossible de charger les moyens de paiement. Réessayez dans un instant.';
    } finally {
        methodsLoading.value = false;
    }
};

// Filtres et recherche
const activeFilter = ref('all'); // 'all', 'free', 'premium'
const searchQuery = ref('');

// Pagination
const currentPage = ref(1);
const itemsPerPage = ref(9); // 3x3 grid

// Formater le prix
const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price);
};

// Filtrer les éditions
const filteredNews = computed(() => {
    let result = altNews.value;

    // Filtre par type
    if (activeFilter.value === 'free') {
        result = result.filter(news => news.has_free_version || news.is_free);
    } else if (activeFilter.value === 'premium') {
        result = result.filter(news => !news.has_free_version && !news.is_free);
    }

    // Filtre par recherche
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase().trim();
        result = result.filter(news =>
            news.title.toLowerCase().includes(query) ||
            (news.description && news.description.toLowerCase().includes(query))
        );
    }

    return result;
});

// Compteurs pour les filtres
const filterCounts = computed(() => ({
    all: altNews.value.length,
    free: altNews.value.filter(n => n.has_free_version || n.is_free).length,
    premium: altNews.value.filter(n => !n.has_free_version && !n.is_free).length
}));

// Pagination computed properties
const totalPages = computed(() => Math.ceil(filteredNews.value.length / itemsPerPage.value));

const paginatedNews = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filteredNews.value.slice(start, end);
});

// Reset page when filters change
watch([activeFilter, searchQuery], () => {
    currentPage.value = 1;
});

// Navigation functions
const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        // Scroll to top of editions
        const element = document.querySelector('.filters-section');
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
};

const prevPage = () => goToPage(currentPage.value - 1);
const nextPage = () => goToPage(currentPage.value + 1);

// Generate page numbers for display
const visiblePages = computed(() => {
    const pages = [];
    const total = totalPages.value;
    const current = currentPage.value;

    if (total <= 5) {
        for (let i = 1; i <= total; i++) pages.push(i);
    } else {
        if (current <= 3) {
            pages.push(1, 2, 3, 4, '...', total);
        } else if (current >= total - 2) {
            pages.push(1, '...', total - 3, total - 2, total - 1, total);
        } else {
            pages.push(1, '...', current - 1, current, current + 1, '...', total);
        }
    }
    return pages;
});

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

// ===== Logique d'achat d'édition =====

// Référence marchand. Elle porte l'édition et l'abonné : le webhook Paxity
// s'en sert pour enregistrer l'achat côté serveur, même quand le navigateur
// ne revient jamais (paiement par carte, onglet fermé).
const generateTransactionId = (editionId, userId) => {
    return `ED-${editionId}-S${userId}-${Date.now()}`;
};

// Vérifier si le téléphone est valide
const isPhoneValid = computed(() => {
    const phone = paymentPhone.value.trim();
    return phone.length >= 8;
});

// Clic sur "Acheter ce numéro"
const handleBuyEdition = (edition) => {
    selectedEditionForPurchase.value = edition;

    if (!isLoggedIn()) {
        // Pas connecté → afficher le modal de connexion
        showLoginModal.value = true;
    } else {
        // Connecté → afficher le modal de paiement
        openPaymentModal();
    }
};

// Ouvrir le modal de paiement
const openPaymentModal = () => {
    const user = getAuthUser();
    paymentTransactionId.value = generateTransactionId(
        selectedEditionForPurchase.value?.id,
        user?.id || user?.userId || 0
    );
    paymentPhone.value = user?.phone || '';
    phoneError.value = '';
    paymentError.value = '';
    showPaymentModal.value = true;
    loadPaymentMethods();
};

// Fermer le modal de paiement
const closePaymentModal = () => {
    showPaymentModal.value = false;
    selectedEditionForPurchase.value = null;
    paymentPhone.value = '';
    phoneError.value = '';
    paymentError.value = '';
};

// Callback après connexion réussie
const onLoginSuccess = (user) => {
    showLoginModal.value = false;
    // Après connexion, ouvrir le modal de paiement
    if (selectedEditionForPurchase.value) {
        nextTick(() => {
            openPaymentModal();
        });
    }
};

// Callback pour inscription
const onRegisterClick = () => {
    showLoginModal.value = false;
    // On memorise l'edition en cours pour reprendre l'achat apres creation du compte
    const editionId = selectedEditionForPurchase.value?.id;
    if (editionId) {
        localStorage.setItem('pendingEditionPurchase', JSON.stringify({
            edition: selectedEditionForPurchase.value,
            returnUrl: route.fullPath
        }));
    }
    // La route /subscriber n'existe pas (page desactivee) : rediriger dessus renvoyait un 404.
    // On ouvre le choix des plans dans la page, comme le fait deja alt-news/[id].vue.
    showPlansModal.value = true;
};

// Lancer le paiement via Paxity
const startPayment = async () => {
    const phone = paymentPhone.value.trim();

    if (!selectedMethodId.value) {
        paymentError.value = 'Veuillez choisir un moyen de paiement';
        return;
    }

    // La carte n'a pas besoin du téléphone ; les moyens mobiles si.
    if (!isCardSelected.value) {
        if (!phone) {
            phoneError.value = 'Veuillez entrer votre numéro de téléphone';
            return;
        }
        if (phone.length < 8) {
            phoneError.value = 'Le numéro doit contenir au moins 8 chiffres';
            return;
        }
    }

    phoneError.value = '';
    paymentError.value = '';

    const edition = selectedEditionForPurchase.value;
    const amount = tarif(edition?.price || 2000);
    const user = getAuthUser();

    // Seules les méthodes QR_CODE renvoient une page opérateur ; les méthodes
    // PUSH se valident sur le téléphone du client, sans redirection.
    const expectsRedirect = selectedMethod.value?.type === 'QR_CODE';
    const paymentWindow = expectsRedirect ? window.open('about:blank', '_blank') : null;

    isPaying.value = true;

    try {
        let checkout;

        if (isCardSelected.value) {
            // Le widget Paxity prend le relais : il affiche son propre
            // formulaire, collecte le numéro et le cryptogramme chez lui, et
            // poste la transaction. Rien de tout cela ne passe par nos
            // serveurs, donc rien à effacer ni à protéger ici.
            await ouvrirWidgetCarte({
                amount,
                currency: 'XOF',
                country: 'CI',
                idClient: paymentTransactionId.value,
                ipn: `${window.location.origin}/api/payment/paxity/webhook`
            });

            // Le widget mène le paiement jusqu'au bout de son côté : il n'y a
            // pas de `checkout` à enchaîner, et la suite du flux ne s'applique
            // pas.
            isPaying.value = false;
            return;
        } else {
            checkout = await createPaxityCheckout({
                method: selectedMethodId.value,
                amount,
                phone,
                reference: paymentTransactionId.value,
                description: `ALT News - ${edition?.title || 'édition'}`
            });
        }

        // La référence Paxity est la seule clé de rapprochement fiable :
        // l'API ne renvoie pas notre propre référence à la relecture.
        const pendingPurchase = {
            edition,
            transactionId: paymentTransactionId.value,
            reference: checkout.reference,
            userId: user?.id || user?.userId || user?.email,
            // Mémorisé ici pour que la page de suivi puisse enregistrer l'achat
            // même si la session a expiré entre-temps : le backend identifie
            // l'acheteur par e-mail, nom et prénom, pas par le jeton.
            email: user?.email,
            firstName: user?.firstName,
            lastName: user?.lastName,
            amount,
            phone,
            paymentMethod: selectedMethodId.value,
            provider: 'paxity',
            timestamp: Date.now()
        };

        localStorage.setItem(PAXITY_CHECKOUT_REFERENCE_KEY, checkout.reference);
        localStorage.setItem(PAXITY_CHECKOUT_DETAILS_KEY, JSON.stringify(checkout));
        localStorage.setItem(PAXITY_PENDING_EDITION_PURCHASE_KEY, JSON.stringify(pendingPurchase));

        if (checkout.redirectUrl && paymentWindow) {
            paymentWindow.location.href = checkout.redirectUrl;
        } else if (checkout.redirectUrl) {
            // Ouverture bloquée par le navigateur : on redirige l'onglet courant.
            await navigateTo(checkout.redirectUrl, { external: true });
            return;
        }

        // Paxity ne rappelle jamais le site après paiement : la page de suivi
        // interroge le statut, puis enregistre l'achat côté serveur.
        await navigateTo(
            `/${currentLocale.value}/payment/success?reference=${encodeURIComponent(checkout.reference)}`
        );
    } catch (error) {
        // Ne jamais relancer automatiquement : la transaction a pu être créée
        // côté Paxity malgré l'erreur, et un second appel doublerait le débit.
        paymentWindow?.close();
        paymentError.value = paxityError.value || 'Le paiement n\'a pas pu être initié. Réessayez dans un instant.';
        isPaying.value = false;
    }
};

</script>

<template>
    <div class="tp-project-area tp-project-2-animate-tab  pb-110">
        <!-- Bandeau de recette : cette page encaisse 100 F au lieu du tarif réel. -->
        <div v-if="modeTest" class="bandeau-recette">
            <strong>Mode recette</strong> — les paiements de cette page sont ramenés à
            <strong>100 FCFA</strong>. Les débits sont bien réels.
            Ne pas communiquer cette adresse aux clients.
        </div>
        <div class="container">


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

            <!-- Filters and Search Bar -->
            <div v-else class="filters-section mb-40">
                <div class="row align-items-center">
                    <div class="col-lg-7 col-md-12 mb-3 mb-lg-0">
                        <div class="filter-buttons">
                            <button
                                @click="activeFilter = 'all'"
                                :class="['filter-btn', { active: activeFilter === 'all' }]"
                            >
                                <i class="fa-solid fa-th-large me-2"></i>
                                {{ $t('alt_news.filters.all') }}
                                <span class="filter-count">{{ filterCounts.all }}</span>
                            </button>
                            <button
                                @click="activeFilter = 'free'"
                                :class="['filter-btn free', { active: activeFilter === 'free' }]"
                            >
                                <i class="fa-solid fa-gift me-2"></i>
                                {{ $t('alt_news.filters.free') }}
                                <span class="filter-count">{{ filterCounts.free }}</span>
                            </button>
                            <button
                                @click="activeFilter = 'premium'"
                                :class="['filter-btn premium', { active: activeFilter === 'premium' }]"
                            >
                                <i class="fa-solid fa-crown me-2"></i>
                                {{ $t('alt_news.filters.premium') }}
                                <span class="filter-count">{{ filterCounts.premium }}</span>
                            </button>
                        </div>
                    </div>
                    <div class="col-lg-5 col-md-12">
                        <div class="search-wrapper">
                            <i class="fa-solid fa-search search-icon"></i>
                            <input
                                type="text"
                                v-model="searchQuery"
                                :placeholder="$t('alt_news.filters.search_placeholder')"
                                class="search-input"
                            />
                            <button v-if="searchQuery" @click="searchQuery = ''" class="clear-btn">
                                <i class="fa-solid fa-times"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Results count -->
                <div class="results-count mt-3" v-if="filteredNews.length !== altNews.length || searchQuery">
                    <span v-if="filteredNews.length > 0">
                        {{ filteredNews.length }} {{ $t('alt_news.filters.results') }}
                    </span>
                    <span v-else class="text-muted">{{ $t('alt_news.filters.no_results') }}</span>
                </div>
            </div>

            <!-- Alt News List -->
            <div v-if="!loading && !error" class="row">
                <div v-for="(news, index) in paginatedNews" :key="news.id" class="col-lg-4 col-md-6">
                    <div class="tp-service-2-wrap p-relative fix mb-30 wow fadeInLeft"
                        :data-wow-delay="`${0.3 + (index * 0.1)}s`" data-wow-duration=".9s">
                        <div class="tp-service-2-thumb tp-round-4">
                            <img class="w-100 tp-round-4" :src="`${config.public.apiBaseUrl}/storage/${news.image}`"
                                :alt="news.title">
                            <!-- Badge Gratuit/Premium -->
                            <div class="edition-badge-container">
                                <span v-if="news.has_free_version || news.is_free" class="edition-badge free">
                                    <i class="fa-solid fa-gift me-1"></i> {{ $t('alt_news.filters.free') }}
                                </span>
                                <span v-else class="edition-badge premium">
                                    <i class="fa-solid fa-crown me-1"></i> {{ $t('alt_news.filters.premium') }}
                                </span>
                            </div>
                            <!-- Prix pour éditions premium -->
                            <div v-if="!news.has_free_version && !news.is_free" class="edition-price-tag">
                                {{ formatPrice(tarif(news.price || 2000)) }} FCFA
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
                            <!-- Bouton Acheter pour les éditions Premium -->
                            <div v-if="!news.has_free_version && !news.is_free" class="edition-buy-button mt-15">
                                <button
                                    @click.stop.prevent="handleBuyEdition(news)"
                                    class="btn-buy-edition"
                                >
                                    <i class="fa-solid fa-shopping-cart me-2"></i>
                                    {{ $t('alt_news.purchase.buy_edition') }} {{ formatPrice(tarif(news.price || 2000)) }} FCFA
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Empty State - No results from filter/search -->
                <div v-if="filteredNews.length === 0 && altNews.length > 0" class="col-12 text-center py-5">
                    <div class="empty-state">
                        <i class="fa-solid fa-search fs-1 text-muted mb-3"></i>
                        <h4 class="text-muted">{{ $t('alt_news.filters.no_edition_found') }}</h4>
                        <p class="text-muted mb-4">{{ $t('alt_news.filters.modify_criteria') }}</p>
                        <button @click="activeFilter = 'all'; searchQuery = ''" class="btn-reset-filters">
                            <i class="fa-solid fa-rotate-left me-2"></i>
                            {{ $t('alt_news.filters.reset_filters') }}
                        </button>
                    </div>
                </div>

                <!-- Empty State - No editions at all -->
                <div v-if="altNews.length === 0" class="col-12 text-center py-5">
                    <div class="empty-state">
                        <i class="fa-regular fa-folder-open fs-1 text-muted mb-3"></i>
                        <h4 class="text-muted">{{ $t('alt_news.empty.title') }}</h4>
                        <p class="text-muted">{{ $t('alt_news.empty.description') }}</p>
                    </div>
                </div>

                <!-- Pagination -->
                <div v-if="filteredNews.length > itemsPerPage && totalPages > 1" class="col-12">
                    <div class="pagination-container">
                        <div class="pagination-info">
                            {{ $t('alt_news.filters.showing') }} {{ (currentPage - 1) * itemsPerPage + 1 }} {{ $t('alt_news.filters.to') }} {{ Math.min(currentPage * itemsPerPage, filteredNews.length) }} {{ $t('alt_news.filters.of') }} {{ filteredNews.length }} {{ $t('alt_news.filters.editions') }}
                        </div>
                        <div class="pagination-controls">
                            <button
                                @click="prevPage"
                                :disabled="currentPage === 1"
                                class="pagination-btn prev"
                            >
                                <i class="fa-solid fa-chevron-left"></i>
                            </button>
                            <template v-for="(page, index) in visiblePages" :key="index">
                                <span v-if="page === '...'" class="pagination-ellipsis">...</span>
                                <button
                                    v-else
                                    @click="goToPage(page)"
                                    :class="['pagination-btn', { active: currentPage === page }]"
                                >
                                    {{ page }}
                                </button>
                            </template>
                            <button
                                @click="nextPage"
                                :disabled="currentPage === totalPages"
                                class="pagination-btn next"
                            >
                                <i class="fa-solid fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Modal de connexion -->
    <LoginModal
        v-model="showLoginModal"
        @login-success="onLoginSuccess"
        @register-click="onRegisterClick"
    />

    <!-- Modal de choix du plan / creation de compte -->
    <Teleport to="body">
        <div v-if="showPlansModal" class="plans-modal-overlay" @click.self="showPlansModal = false">
            <div class="plans-modal">
                <div class="plans-modal-header">
                    <h3>Choisissez votre plan</h3>
                    <button class="btn-close-modal" @click="showPlansModal = false" type="button">
                        <span>&times;</span>
                    </button>
                </div>
                <div class="plans-modal-body">
                    <SubscriptionCompo @open-login-modal="showPlansModal = false; showLoginModal = true" />
                </div>
            </div>
        </div>
    </Teleport>

    <!-- Modal de paiement -->
    <Teleport to="body">
        <div v-if="showPaymentModal" class="payment-modal-overlay" @click.self="closePaymentModal">
            <div class="payment-modal">
                <button class="modal-close" @click="closePaymentModal">
                    <i class="fa-solid fa-times"></i>
                </button>

                <div class="modal-header-payment">
                    <i class="fa-solid fa-cart-shopping modal-icon"></i>
                    <h2>Acheter cette édition</h2>
                </div>

                <div class="modal-body-payment">
                    <div v-if="selectedEditionForPurchase" class="edition-preview">
                        <img :src="`${config.public.apiBaseUrl}/storage/${selectedEditionForPurchase.image}`" :alt="selectedEditionForPurchase.title" />
                        <div class="edition-info">
                            <h3>{{ selectedEditionForPurchase.title }}</h3>
                            <p class="edition-price-modal">{{ formatPrice(tarif(selectedEditionForPurchase.price || 2000)) }} FCFA</p>
                        </div>
                    </div>

                    <!-- Champ téléphone : inutile pour un paiement par carte -->
                    <div v-if="!isCardSelected" class="phone-input-wrapper">
                        <label for="phone" class="phone-label">
                            <i class="fa-solid fa-phone me-2"></i>Numéro de téléphone
                        </label>
                        <input
                            type="tel"
                            id="phone"
                            v-model="paymentPhone"
                            placeholder="Ex: 0701020304"
                            class="phone-input"
                            :class="{ 'has-error': phoneError }"
                        />
                        <p v-if="phoneError" class="phone-error">{{ phoneError }}</p>
                    </div>

                    <!-- Moyens de paiement Paxity -->
                    <div class="method-picker">
                        <label class="phone-label">
                            <i class="fa-solid fa-wallet me-2"></i>Moyen de paiement
                        </label>

                        <p v-if="methodsLoading" class="method-hint">Chargement des moyens de paiement…</p>
                        <p v-else-if="methodsError" class="phone-error">{{ methodsError }}</p>

                        <!-- Pays : présélectionné d'après l'IP, modifiable. -->
                        <div class="country-picker">
                            <label class="country-picker-label">Pays du moyen de paiement</label>
                            <select v-model="paysChoisi" class="country-picker-select">
                                <option v-for="p in pays" :key="p.code" :value="p.code">{{ p.nom }}</option>
                            </select>
                        </div>

                        <div v-if="!methodsLoading && !methodsError" class="method-grid">
                            <button
                                v-for="method in paymentMethods"
                                :key="method.id"
                                type="button"
                                class="method-option"
                                :class="{ selected: selectedMethodId === method.id, unavailable: method.available === false }"
                                :disabled="method.available === false"
                                @click="selectedMethodId = method.id"
                            >
                                <!-- alt vide : les logos sont hébergés chez un tiers qui
                                     répond parfois 429, et un alt renseigné affichait alors
                                     le nom du moyen en double. L'icône de repli prend le
                                     relais si l'image ne charge pas. -->
                                <img
                                    v-if="method.logo && !brokenLogos.has(method.id)"
                                    :src="method.logo"
                                    alt=""
                                    class="method-logo"
                                    @error="brokenLogos.add(method.id)"
                                />
                                <i v-else class="fa-solid method-logo-fallback" :class="method.type === 'CARD' ? 'fa-credit-card' : 'fa-mobile-screen-button'"></i>
                                <span class="method-name">{{ method.name }}</span>
                                <span v-if="method.available === false" class="method-badge">Bientôt</span>
                            </button>
                        </div>

                        <p v-if="convertLoading" class="method-hint">Calcul du montant…</p>
                        <p v-else-if="convertedAmount" class="method-hint conversion-note">
                            Ce moyen encaisse en {{ convertedAmount.to }} :
                            vous serez débité de
                            <strong>{{ convertedAmount.convertedAmount }} {{ convertedAmount.to }}</strong>
                            (équivalent de {{ formatPrice(convertedAmount.amount) }} FCFA).
                        </p>

                        <p v-if="selectedMethod?.instructions" class="method-hint">
                            {{ selectedMethod.instructions }}
                        </p>
                    </div>

                    <!-- Aucun champ de carte ici : le widget Paxity affiche son
                         propre formulaire et collecte le numéro chez lui. -->
                    <p v-if="isCardSelected" class="method-hint conversion-note">
                        Le paiement par carte s'ouvre dans une fenêtre sécurisée de Paxity.
                        Vos coordonnées bancaires ne transitent pas par notre site.
                    </p>

                    <div class="payment-summary">
                        <div class="summary-row">
                            <span>Prix de l'édition</span>
                            <span>{{ formatPrice(tarif(selectedEditionForPurchase?.price || 2000)) }} FCFA</span>
                        </div>
                        <div class="summary-row total">
                            <span>Total à payer</span>
                            <span>{{ formatPrice(tarif(selectedEditionForPurchase?.price || 2000)) }} FCFA</span>
                        </div>
                    </div>

                    <p v-if="paymentError" class="phone-error">{{ paymentError }}</p>

                    <button
                        @click="startPayment"
                        class="btn-pay"
                        :disabled="!selectedMethodId || isPaying || widgetLoading || (!isCardSelected && !isPhoneValid)"
                    >
                        <!-- Cadenas et non carte bancaire : seuls les moyens mobile money
                             sont proposés, une icône de carte laissait croire le contraire. -->
                        <i class="fa-solid fa-lock me-2"></i>
                        <template v-if="widgetLoading">Ouverture du paiement sécurisé…</template>
                        <template v-else-if="isPaying">Paiement en cours…</template>
                        <template v-else-if="isCardSelected">Payer par carte {{ formatPrice(tarif(selectedEditionForPurchase?.price || 2000)) }} FCFA</template>
                        <template v-else>Payer {{ formatPrice(tarif(selectedEditionForPurchase?.price || 2000)) }} FCFA</template>
                    </button>
                </div>
            </div>
        </div>
    </Teleport>
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
    position: relative;
}

.tp-service-2-thumb img {
    object-fit: fill;
    width: 100%;
    height: 100%;
}

/* Badge Gratuit/Premium */
.edition-badge-container {
    position: absolute;
    top: 15px;
    left: 15px;
    z-index: 10;
}

.edition-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 25px;
    font-size: 0.85rem;
    font-weight: 700;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(5px);
}

.edition-badge.free {
    background: linear-gradient(135deg, #9E73B0, #7B1FA2);
    color: white;
}

.edition-badge.premium {
    background: #d4b128;
    color: white;
}

/* Prix pour éditions premium */
.conversion-note {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1e40af;
    border-radius: 8px;
    padding: 0.7rem 0.85rem;
    line-height: 1.5;
}

.bandeau-recette {
    background: #fef3c7;
    border: 2px solid #f59e0b;
    color: #92400e;
    padding: 0.75rem 1.25rem;
    text-align: center;
    font-size: 0.92rem;
    line-height: 1.5;
    border-radius: 8px;
    margin-bottom: 1.5rem;
}


.country-picker {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin-bottom: 0.9rem;
}
.country-picker-label {
    font-size: 0.85rem;
    color: #6b7280;
}
.country-picker-select {
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 0.6rem 0.7rem;
    font: inherit;
    background: #fff;
}
.conversion-note {
    background: #eff6ff;
    border: 1px solid #bfdbfe;
    color: #1e40af;
    border-radius: 8px;
    padding: 0.7rem 0.85rem;
    line-height: 1.5;
    font-size: 0.9rem;
    margin: 0.5rem 0;
}

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

/* Filters Section */
.filters-section {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.filter-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
}

.filter-btn {
    display: inline-flex;
    align-items: center;
    padding: 0.75rem 1.25rem;
    border: 2px solid #e5e7eb;
    border-radius: 50px;
    background: white;
    color: #6b7280;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.filter-btn:hover {
    border-color: #d4b128;
    color: #d4b128;
}

.filter-btn.active {
    background: #d4b128;
    border-color: #d4b128;
    color: white;
}

.filter-btn.free.active {
    background: linear-gradient(135deg, #9E73B0, #7B1FA2);
    border-color: #9E73B0;
}

.filter-btn.premium.active {
    background: #d4b128;
    border-color: #d4b128;
}

.filter-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 24px;
    padding: 0 0.5rem;
    background: rgba(0, 0, 0, 0.1);
    border-radius: 12px;
    font-size: 0.8rem;
    margin-left: 0.5rem;
}

.filter-btn.active .filter-count {
    background: rgba(255, 255, 255, 0.25);
}

/* Search */
.search-wrapper {
    position: relative;
    width: 100%;
}

.search-wrapper .search-icon {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
}

.search-wrapper .search-input {
    width: 100%;
    padding: 0.875rem 2.5rem 0.875rem 2.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 50px;
    font-size: 0.95rem;
    background: #f9fafb;
    transition: all 0.3s ease;
}

.search-wrapper .search-input:focus {
    outline: none;
    border-color: #d4b128;
    background: white;
    box-shadow: 0 0 0 3px rgba(212, 177, 40, 0.1);
}

.search-wrapper .search-input::placeholder {
    color: #9ca3af;
}

.clear-btn {
    position: absolute;
    right: 1rem;
    top: 50%;
    transform: translateY(-50%);
    background: #e5e7eb;
    border: none;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    color: #6b7280;
    transition: all 0.2s ease;
}

.clear-btn:hover {
    background: #d1d5db;
    color: #374151;
}

.results-count {
    font-size: 0.9rem;
    color: #d4b128;
    font-weight: 600;
}

.btn-reset-filters {
    display: inline-flex;
    align-items: center;
    padding: 0.75rem 1.5rem;
    background: #d4b128;
    color: white;
    border: none;
    border-radius: 50px;
    font-size: 0.9rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-reset-filters:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(212, 177, 40, 0.3);
}

@media (max-width: 768px) {
    .filter-buttons {
        justify-content: center;
    }

    .filter-btn {
        padding: 0.6rem 1rem;
        font-size: 0.85rem;
    }
}

/* Pagination */
.pagination-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    margin-top: 3rem;
    padding: 1.5rem;
    background: white;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.pagination-info {
    font-size: 0.9rem;
    color: #6b7280;
}

.pagination-controls {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.pagination-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: 40px;
    padding: 0 0.75rem;
    border: 2px solid #e5e7eb;
    border-radius: 10px;
    background: white;
    color: #6b7280;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
    border-color: #d4b128;
    color: #d4b128;
}

.pagination-btn.active {
    background: #d4b128;
    border-color: #d4b128;
    color: white;
}

.pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.pagination-btn.prev,
.pagination-btn.next {
    padding: 0 0.5rem;
}

.pagination-ellipsis {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    height: 40px;
    color: #9ca3af;
    font-weight: 600;
}

@media (max-width: 768px) {
    .pagination-container {
        padding: 1rem;
    }

    .pagination-btn {
        min-width: 36px;
        height: 36px;
        font-size: 0.85rem;
    }

    .pagination-info {
        font-size: 0.8rem;
        text-align: center;
    }
}

/* ===== Bouton Acheter l'édition ===== */
.edition-buy-button {
    margin-top: 12px;
}

.btn-buy-edition {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: 0.75rem 1.25rem;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
}

.btn-buy-edition:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.35);
    background: linear-gradient(135deg, #059669, #047857);
}

.btn-buy-edition:active {
    transform: translateY(0);
}

/* ===== Modal de Paiement ===== */
.payment-modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    padding: 1rem;
}

.payment-modal {
    background: white;
    border-radius: 20px;
    max-width: 480px;
    width: 100%;
    position: relative;
    animation: modalSlideIn 0.3s ease;
    max-height: 90vh;
    overflow-y: auto;
}

@keyframes modalSlideIn {
    from {
        opacity: 0;
        transform: scale(0.95) translateY(20px);
    }
    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

.modal-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 36px;
    height: 36px;
    background: #f3f4f6;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 1rem;
    color: #6b7280;
    z-index: 10;
}

.modal-close:hover {
    background: #e5e7eb;
    color: #1f2937;
}

.modal-header-payment {
    text-align: center;
    padding: 2rem 2rem 1rem;
}

.modal-icon {
    font-size: 3rem;
    color: #10b981;
    margin-bottom: 1rem;
}

.modal-header-payment h2 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
}

.modal-body-payment {
    padding: 0 2rem 2rem;
}

.edition-preview {
    display: flex;
    gap: 1.25rem;
    padding: 1.25rem;
    background: #f9fafb;
    border-radius: 12px;
    margin-bottom: 1.5rem;
}

.edition-preview img {
    width: 80px;
    height: 100px;
    object-fit: cover;
    border-radius: 8px;
}

.edition-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.edition-info h3 {
    font-size: 1.1rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0 0 0.5rem;
}

.edition-price-modal {
    font-size: 1.25rem;
    font-weight: 800;
    color: #10b981;
    margin: 0;
}

.phone-input-wrapper {
    margin-bottom: 1.5rem;
}

.phone-label {
    display: flex;
    align-items: center;
    font-size: 0.95rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.5rem;
}

.phone-input {
    width: 100%;
    padding: 0.875rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 12px;
    font-size: 1rem;
    transition: all 0.3s ease;
}

.phone-input:focus {
    outline: none;
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.phone-input.has-error {
    border-color: #ef4444;
}

.phone-input::placeholder {
    color: #9ca3af;
}

.phone-error {
    margin: 0.5rem 0 0;
    font-size: 0.85rem;
    color: #ef4444;
}

.payment-summary {
    background: #f9fafb;
    border-radius: 12px;
    padding: 1.25rem;
    margin-bottom: 1.5rem;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 0;
    font-size: 0.95rem;
    color: #6b7280;
}

.summary-row.total {
    padding-top: 1rem;
    margin-top: 0.5rem;
    border-top: 2px solid #e5e7eb;
    font-size: 1.1rem;
    font-weight: 700;
    color: #1f2937;
}

.method-picker {
    margin-bottom: 20px;
}

.method-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
    gap: 10px;
    margin-top: 10px;
}

.method-option {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    padding: 12px 8px;
    background: #fff;
    border: 2px solid #e6e8ec;
    border-radius: 10px;
    cursor: pointer;
    transition: border-color 0.2s, box-shadow 0.2s;
}

.method-option:hover:not(:disabled) {
    border-color: #b9c0cc;
}

/* Moyen annoncé mais pas encore ouvert (carte bancaire) : visible, non cliquable. */
.method-option.unavailable {
    opacity: 0.55;
    cursor: not-allowed;
    background: #f8fafc;
}

.method-badge {
    position: absolute;
    top: -8px;
    right: -6px;
    background: #64748b;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    padding: 2px 7px;
    border-radius: 999px;
}

.method-logo-fallback {
    font-size: 30px;
    height: 40px;
    display: flex;
    align-items: center;
    color: #64748b;
}

.method-option.selected {
    border-color: #3761ff;
    box-shadow: 0 0 0 3px rgba(55, 97, 255, 0.12);
}

.method-logo {
    width: 40px;
    height: 40px;
    object-fit: contain;
}

.method-name {
    font-size: 13px;
    font-weight: 600;
    color: #1e2937;
    text-align: center;
    line-height: 1.2;
}

.method-hint {
    margin-top: 10px;
    font-size: 13px;
    color: #6b7280;
}

.awaiting-validation {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px;
    margin-bottom: 16px;
    background: #f4f7ff;
    border: 1px solid #d6e0ff;
    border-radius: 10px;
}

.awaiting-validation p {
    margin: 0;
    font-size: 14px;
    color: #1e2937;
}

.btn-pay {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s ease;
}

.btn-pay:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
}

.btn-pay:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

@media (max-width: 480px) {
    .edition-preview {
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .edition-preview img {
        width: 100px;
        height: 130px;
    }

    .btn-buy-edition {
        font-size: 0.85rem;
        padding: 0.65rem 1rem;
    }
}

/* Modal de choix du plan (reprise des styles de alt-news/[id].vue) */
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
    animation: plansModalSlideIn 0.3s ease;
}

@keyframes plansModalSlideIn {
    from { opacity: 0; transform: translateY(-30px); }
    to { opacity: 1; transform: translateY(0); }
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
</style>