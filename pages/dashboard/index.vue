<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const config = useRuntimeConfig();
const { t } = useI18n();
const localePath = useLocalePath();

// State
const isLoggedIn = ref(false);
const subscriber = ref(null);
const editions = ref([]);
const purchases = ref([]);
const payments = ref([]);
const loading = ref(true);
const showLoginModal = ref(false);
const loginError = ref('');
const token = ref('');
const activeTab = ref('editions');
const showProfileModal = ref(false);
const showUpgradeModal = ref(false);
const showPaymentModal = ref(false);
const selectedEdition = ref(null);
const transactionId = ref('');
const processingPayment = ref(false);

// Profile form
const profileForm = ref({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    billing_email: ''
});

// Login form
const loginForm = ref({
    email: '',
    password: ''
});

// —————————————————————————— Paiement Paxity
// Aucune clé côté navigateur : tout passe par /api/payment/paxity/**.
const {
    createCheckout: createPaxityCheckout,
    getMethods: getPaxityMethods,
    waitForCompletion: waitForPaxityCompletion,
    error: paxityError
} = usePaxityCheckout();

const paymentMethods = ref([]);
const selectedMethodId = ref('');
const methodsLoading = ref(false);
const methodsError = ref('');
const paymentError = ref('');
const paymentPhone = ref('');
const awaitingMessage = ref('');

const loadPaymentMethods = async () => {
    if (paymentMethods.value.length) return;
    methodsLoading.value = true;
    methodsError.value = '';
    try {
        paymentMethods.value = await getPaxityMethods('CI');
        if (!selectedMethodId.value && paymentMethods.value.length) {
            selectedMethodId.value = paymentMethods.value[0].id;
        }
    } catch (error) {
        methodsError.value = 'Impossible de charger les moyens de paiement.';
    } finally {
        methodsLoading.value = false;
    }
};

// Generate transaction ID
const generateTransactionId = () => {
    return 'ALT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

// Check if already logged in
onMounted(() => {
    const savedToken = localStorage.getItem('alt_news_token');
    const savedSubscriber = localStorage.getItem('alt_news_subscriber');
    
    if (savedToken && savedSubscriber) {
        token.value = savedToken;
        subscriber.value = JSON.parse(savedSubscriber);
        isLoggedIn.value = true;
        fetchDashboardData();
    } else {
        showLoginModal.value = true;
        loading.value = false;
    }
});

// Login
const login = async () => {
    loginError.value = '';
    loading.value = true;
    
    try {
        const response = await fetch(`${config.public.apiBaseUrl}/api/subscription/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(loginForm.value)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Identifiants invalides');
        }
        
        token.value = data.token;
        subscriber.value = data.subscriber;
        
        localStorage.setItem('alt_news_token', data.token);
        localStorage.setItem('alt_news_subscriber', JSON.stringify(data.subscriber));
        
        isLoggedIn.value = true;
        showLoginModal.value = false;
        
        await fetchDashboardData();
        
    } catch (err) {
        loginError.value = err.message;
    } finally {
        loading.value = false;
    }
};

// Logout
const logout = () => {
    localStorage.removeItem('alt_news_token');
    localStorage.removeItem('alt_news_subscriber');
    token.value = '';
    subscriber.value = null;
    isLoggedIn.value = false;
    showLoginModal.value = true;
    editions.value = [];
    purchases.value = [];
    payments.value = [];
};

// Fetch dashboard data
const fetchDashboardData = async () => {
    loading.value = true;
    
    try {
        // Fetch profile with purchases
        const profileRes = await fetch(`${config.public.apiBaseUrl}/api/subscription/profile`, {
            headers: {
                'Authorization': `Bearer ${token.value}`,
                'Accept': 'application/json'
            }
        });
        
        if (profileRes.ok) {
            const profileData = await profileRes.json();
            subscriber.value = profileData.subscriber;
            purchases.value = profileData.purchases || [];
            payments.value = profileData.payments || [];
            
            // Update profile form
            profileForm.value = {
                first_name: subscriber.value.first_name || '',
                last_name: subscriber.value.last_name || '',
                email: subscriber.value.email || '',
                phone: subscriber.value.phone || '',
                billing_email: subscriber.value.billing_email || subscriber.value.email || ''
            };
        }
        
        // Fetch available editions
        const editionsRes = await fetch(`${config.public.apiBaseUrl}/api/editions`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        
        if (editionsRes.ok) {
            editions.value = await editionsRes.json();
        }
        
    } catch (err) {
        console.error('Error fetching dashboard data:', err);
    } finally {
        loading.value = false;
    }
};

// Computed properties
const isPremium = computed(() => {
    return subscriber.value && ['annual', 'student'].includes(subscriber.value.type) && subscriber.value.status === 'active';
});

const isActive = computed(() => {
    return subscriber.value && subscriber.value.status === 'active';
});

const daysUntilExpiry = computed(() => {
    if (!subscriber.value?.expires_at) return null;
    const expiry = new Date(subscriber.value.expires_at);
    const now = new Date();
    const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
});

const freeEditions = computed(() => {
    return editions.value.filter(e => e.is_free);
});

const paidEditions = computed(() => {
    return editions.value.filter(e => !e.is_free);
});

const myEditions = computed(() => {
    if (isPremium.value) {
        return editions.value;
    }
    const purchasedIds = purchases.value.filter(p => p.status === 'completed').map(p => p.edition_id);
    return editions.value.filter(e => e.is_free || purchasedIds.includes(e.id));
});

// Check if user can access edition
const canAccessEdition = (edition) => {
    if (!subscriber.value) return false;
    if (edition.is_free) return true;
    if (isPremium.value) return true;
    return purchases.value.some(p => p.edition_id === edition.id && p.status === 'completed');
};

// Check if edition is purchased
const isPurchased = (edition) => {
    return purchases.value.some(p => p.edition_id === edition.id && p.status === 'completed');
};

// Download edition
const downloadEdition = async (edition) => {
    if (!canAccessEdition(edition)) {
        alert('Vous n\'avez pas accès à cette édition.');
        return;
    }
    
    try {
        const res = await fetch(`${config.public.apiBaseUrl}/api/subscription/request-download/${edition.id}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token.value}`,
                'Accept': 'application/json'
            }
        });
        
        if (res.ok) {
            const data = await res.json();
            window.open(data.download_url, '_blank');
            alert(`Mot de passe du PDF: ${data.pdf_password}`);
        } else {
            const error = await res.json();
            alert(error.message || 'Erreur lors du téléchargement');
        }
    } catch (err) {
        console.error('Download error:', err);
        alert('Erreur lors du téléchargement');
    }
};

// Open payment modal for edition
const openPaymentModal = (edition) => {
    selectedEdition.value = edition;
    transactionId.value = generateTransactionId();
    paymentPhone.value = subscriber.value?.phone || '';
    paymentError.value = '';
    awaitingMessage.value = '';
    showPaymentModal.value = true;
    loadPaymentMethods();
};

/**
 * Achat d'une édition via Paxity.
 *
 * Remplace CinetPay, dont le CDN répond 522 : le script ne se chargeait jamais
 * et l'achat restait bloqué sur « Impossible de charger le système de paiement ».
 */
const processEditionPayment = async () => {
    if (!selectedEdition.value) return;

    const phone = (paymentPhone.value || '').trim();
    if (phone.length < 8) {
        paymentError.value = 'Numéro de téléphone invalide.';
        return;
    }
    if (!selectedMethodId.value) {
        paymentError.value = 'Veuillez choisir un moyen de paiement.';
        return;
    }

    paymentError.value = '';
    processingPayment.value = true;

    try {
        const checkout = await createPaxityCheckout({
            method: selectedMethodId.value,
            amount: selectedEdition.value.price || 2000,
            phone,
            reference: transactionId.value,
            description: `ALT News - ${selectedEdition.value.title}`
        });

        if (checkout.redirectUrl) {
            window.open(checkout.redirectUrl, '_blank', 'noopener');
        }

        awaitingMessage.value = checkout.redirectUrl
            ? 'Finalisez le paiement dans l\'onglet ouvert. Cette page se met à jour automatiquement.'
            : 'Validez le paiement sur votre téléphone. Cette page se met à jour automatiquement.';

        const final = await waitForPaxityCompletion(checkout.reference);

        if (final.status === 'SUCCESS') {
            await handleEditionPaymentSuccess();
        } else if (final.status === 'FAILED') {
            paymentError.value = 'Le paiement a été refusé ou annulé.';
        } else {
            paymentError.value = `Paiement non confirmé à temps. Si vous avez été débité, contactez-nous avec la référence ${checkout.reference}.`;
        }
    } catch (error) {
        // Pas de relance automatique : la transaction a pu aboutir côté Paxity.
        paymentError.value = paxityError.value || 'Le paiement n\'a pas pu être initié.';
    } finally {
        processingPayment.value = false;
        awaitingMessage.value = '';
    }
};

// Handle edition payment success
const handleEditionPaymentSuccess = async () => {
    try {
        const res = await fetch(`${config.public.apiBaseUrl}/api/subscription/purchase-edition`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token.value}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                edition_id: selectedEdition.value.id,
                payment_reference: transactionId.value,
                payment_method: 'cinetpay'
            })
        });
        
        if (res.ok) {
            showPaymentModal.value = false;
            await fetchDashboardData();
            alert('Achat effectué avec succès !');
        }
    } catch (err) {
        console.error('Error confirming purchase:', err);
    } finally {
        processingPayment.value = false;
    }
};

// Update profile
const updateProfile = async () => {
    try {
        const res = await fetch(`${config.public.apiBaseUrl}/api/subscription/update-profile`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token.value}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(profileForm.value)
        });
        
        if (res.ok) {
            const data = await res.json();
            subscriber.value = data.subscriber;
            localStorage.setItem('alt_news_subscriber', JSON.stringify(data.subscriber));
            showProfileModal.value = false;
            alert('Profil mis à jour');
        }
    } catch (err) {
        console.error('Error updating profile:', err);
    }
};

// Format date
const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

// Format price
const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
};

// Subscription type label
const getTypeLabel = (type) => {
    const labels = {
        free: 'Gratuit (Newsletter)',
        unit: 'Achat à l\'unité',
        annual: 'Premium Annuel',
        student: 'Premium Étudiant'
    };
    return labels[type] || type;
};

// Status badge class
const getStatusClass = (status) => {
    const classes = {
        active: 'bg-success',
        pending: 'bg-warning',
        expired: 'bg-danger',
        pending_validation: 'bg-info'
    };
    return classes[status] || 'bg-secondary';
};

// Status label
const getStatusLabel = (status) => {
    const labels = {
        active: 'Actif',
        pending: 'En attente de paiement',
        expired: 'Expiré',
        pending_validation: 'Validation en cours',
        completed: 'Payé'
    };
    return labels[status] || status;
};

useHead({
    title: 'Mon Espace ALT News | CS Conseil'
});
</script>

<template>
    <div class="dashboard-page">
        <!-- Hero Section -->
        <div class="dashboard-hero cs-bg-brown py-4">
            <div class="container">
                <div class="row align-items-center">
                    <div class="col-lg-8">
                        <h1 class="text-white mb-2">
                            <i class="fa-solid fa-newspaper me-3"></i>
                            Mon Espace ALT News
                        </h1>
                        <p class="text-white-50 mb-0" v-if="subscriber">
                            Bienvenue {{ subscriber.first_name }} {{ subscriber.last_name }}
                        </p>
                    </div>
                    <div class="col-lg-4 text-lg-end mt-3 mt-lg-0" v-if="isLoggedIn">
                        <button @click="showProfileModal = true" class="btn btn-outline-light me-2">
                            <i class="fa-solid fa-user-edit me-1"></i>Profil
                        </button>
                        <button @click="logout" class="btn btn-light">
                            <i class="fa-solid fa-sign-out-alt me-1"></i>Déconnexion
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <div class="container py-4">
            <!-- Loading State -->
            <div v-if="loading" class="text-center py-5">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Chargement...</span>
                </div>
            </div>

            <!-- Dashboard Content -->
            <div v-else-if="isLoggedIn && subscriber" class="row">
                <!-- Sidebar -->
                <div class="col-lg-4 mb-4">
                    <!-- Subscription Card -->
                    <div class="card shadow-sm mb-4 subscription-card">
                        <div class="card-header" :class="isPremium ? 'bg-gold' : 'bg-secondary'" style="color: white;">
                            <h5 class="mb-0">
                                <i :class="isPremium ? 'fa-solid fa-crown' : 'fa-solid fa-user'" class="me-2"></i>
                                {{ getTypeLabel(subscriber.type) }}
                            </h5>
                        </div>
                        <div class="card-body">
                            <!-- Status -->
                            <div class="d-flex justify-content-between align-items-center mb-3">
                                <span class="text-muted">Statut</span>
                                <span class="badge" :class="getStatusClass(subscriber.status)">
                                    {{ getStatusLabel(subscriber.status) }}
                                </span>
                            </div>
                            
                            <!-- Dates -->
                            <div v-if="subscriber.started_at" class="d-flex justify-content-between mb-2">
                                <span class="text-muted small">Début</span>
                                <span class="small">{{ formatDate(subscriber.started_at) }}</span>
                            </div>
                            <div v-if="subscriber.expires_at" class="d-flex justify-content-between mb-2">
                                <span class="text-muted small">Expiration</span>
                                <span class="small" :class="daysUntilExpiry < 30 ? 'text-danger fw-bold' : ''">
                                    {{ formatDate(subscriber.expires_at) }}
                                </span>
                            </div>
                            <div v-if="daysUntilExpiry !== null && daysUntilExpiry <= 30" class="alert alert-warning py-2 mt-3 small">
                                <i class="fa-solid fa-exclamation-triangle me-1"></i>
                                {{ daysUntilExpiry > 0 ? `Expire dans ${daysUntilExpiry} jours` : 'Abonnement expiré' }}
                            </div>
                            
                            <!-- Upgrade Button -->
                            <div v-if="!isPremium" class="mt-3">
                                <NuxtLink :to="localePath('/alt-news')" class="btn bg-gold text-white w-100">
                                    <i class="fa-solid fa-crown me-2"></i>Passer en Premium
                                </NuxtLink>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Stats -->
                    <div class="card shadow-sm mb-4">
                        <div class="card-body">
                            <h6 class="card-title mb-3"><i class="fa-solid fa-chart-bar me-2"></i>Mes statistiques</h6>
                            <div class="row text-center">
                                <div class="col-6 border-end">
                                    <h3 class="mb-0 text-gold">{{ myEditions.length }}</h3>
                                    <small class="text-muted">Éditions accessibles</small>
                                </div>
                                <div class="col-6">
                                    <h3 class="mb-0 text-gold">{{ purchases.filter(p => p.status === 'completed').length }}</h3>
                                    <small class="text-muted">Achats</small>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Contact Info -->
                    <div class="card shadow-sm">
                        <div class="card-body">
                            <h6 class="card-title mb-3"><i class="fa-solid fa-envelope me-2"></i>Mes coordonnées</h6>
                            <p class="small mb-1"><strong>Email:</strong> {{ subscriber.email }}</p>
                            <p class="small mb-1" v-if="subscriber.phone"><strong>Téléphone:</strong> {{ subscriber.phone }}</p>
                            <p class="small mb-0" v-if="subscriber.billing_email">
                                <strong>Email facturation:</strong> {{ subscriber.billing_email }}
                            </p>
                            <button @click="showProfileModal = true" class="btn btn-sm btn-outline-secondary mt-3 w-100">
                                <i class="fa-solid fa-edit me-1"></i>Modifier
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="col-lg-8">
                    <!-- Tabs -->
                    <ul class="nav nav-tabs mb-4">
                        <li class="nav-item">
                            <button class="nav-link" :class="{ active: activeTab === 'editions' }" @click="activeTab = 'editions'">
                                <i class="fa-solid fa-book me-1"></i>Toutes les Éditions
                            </button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" :class="{ active: activeTab === 'my-editions' }" @click="activeTab = 'my-editions'">
                                <i class="fa-solid fa-bookmark me-1"></i>Mes Éditions
                            </button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" :class="{ active: activeTab === 'free' }" @click="activeTab = 'free'">
                                <i class="fa-solid fa-gift me-1"></i>Gratuit
                            </button>
                        </li>
                        <li class="nav-item">
                            <button class="nav-link" :class="{ active: activeTab === 'payments' }" @click="activeTab = 'payments'">
                                <i class="fa-solid fa-credit-card me-1"></i>Paiements
                            </button>
                        </li>
                    </ul>

                    <!-- All Editions -->
                    <div v-if="activeTab === 'editions'" class="card shadow-sm">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Toutes les Éditions</h5>
                            <span class="badge bg-primary">{{ editions.length }} éditions</span>
                        </div>
                        <div class="card-body p-0">
                            <div v-if="editions.length > 0" class="list-group list-group-flush">
                                <div v-for="edition in editions" :key="edition.id" class="list-group-item py-3">
                                    <div class="d-flex align-items-center">
                                        <!-- Cover -->
                                        <div class="edition-cover me-3">
                                            <img v-if="edition.cover_image" 
                                                 :src="`${config.public.apiBaseUrl}/storage/${edition.cover_image}`"
                                                 :alt="edition.title" class="rounded">
                                            <div v-else class="edition-placeholder rounded">
                                                <i class="fa-solid fa-newspaper"></i>
                                            </div>
                                        </div>
                                        
                                        <!-- Info -->
                                        <div class="flex-grow-1">
                                            <div class="d-flex align-items-center mb-1">
                                                <h6 class="mb-0 me-2">{{ edition.title }}</h6>
                                                <span v-if="edition.is_free" class="badge bg-success">Gratuit</span>
                                                <span v-else-if="isPurchased(edition)" class="badge bg-info">Acheté</span>
                                                <span v-else-if="isPremium" class="badge bg-gold">Premium</span>
                                            </div>
                                            <p class="text-muted small mb-1">
                                                <i class="fa-regular fa-calendar me-1"></i>{{ formatDate(edition.publication_date) }}
                                                <span v-if="!edition.is_free" class="ms-2">
                                                    <i class="fa-solid fa-tag me-1"></i>{{ formatPrice(edition.price || 100) }}
                                                </span>
                                            </p>
                                        </div>
                                        
                                        <!-- Actions -->
                                        <div class="ms-3">
                                            <button v-if="canAccessEdition(edition)" 
                                                    @click="downloadEdition(edition)"
                                                    class="btn btn-sm bg-gold text-white">
                                                <i class="fa-solid fa-download me-1"></i>Télécharger
                                            </button>
                                            <button v-else 
                                                    @click="openPaymentModal(edition)"
                                                    class="btn btn-sm btn-primary">
                                                <i class="fa-solid fa-shopping-cart me-1"></i>Acheter
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="text-center py-5">
                                <i class="fa-solid fa-inbox fa-3x text-muted mb-3"></i>
                                <p class="text-muted">Aucune édition disponible</p>
                            </div>
                        </div>
                    </div>

                    <!-- My Editions -->
                    <div v-if="activeTab === 'my-editions'" class="card shadow-sm">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0">Mes Éditions</h5>
                            <span class="badge bg-success">{{ myEditions.length }} accessibles</span>
                        </div>
                        <div class="card-body p-0">
                            <div v-if="myEditions.length > 0" class="list-group list-group-flush">
                                <div v-for="edition in myEditions" :key="edition.id" class="list-group-item py-3">
                                    <div class="d-flex align-items-center">
                                        <div class="edition-cover me-3">
                                            <img v-if="edition.cover_image" 
                                                 :src="`${config.public.apiBaseUrl}/storage/${edition.cover_image}`"
                                                 :alt="edition.title" class="rounded">
                                            <div v-else class="edition-placeholder rounded">
                                                <i class="fa-solid fa-newspaper"></i>
                                            </div>
                                        </div>
                                        <div class="flex-grow-1">
                                            <h6 class="mb-1">{{ edition.title }}</h6>
                                            <p class="text-muted small mb-0">{{ formatDate(edition.publication_date) }}</p>
                                        </div>
                                        <button @click="downloadEdition(edition)" class="btn btn-sm bg-gold text-white">
                                            <i class="fa-solid fa-download me-1"></i>Télécharger
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="text-center py-5">
                                <i class="fa-solid fa-lock fa-3x text-muted mb-3"></i>
                                <p class="text-muted">Aucune édition accessible</p>
                                <NuxtLink :to="localePath('/alt-news')" class="btn bg-gold text-white">
                                    Souscrire un abonnement
                                </NuxtLink>
                            </div>
                        </div>
                    </div>

                    <!-- Free Editions -->
                    <div v-if="activeTab === 'free'" class="card shadow-sm">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <h5 class="mb-0"><i class="fa-solid fa-gift me-2"></i>Éditions Gratuit</h5>
                            <span class="badge bg-success">{{ freeEditions.length }} gratuites</span>
                        </div>
                        <div class="card-body p-0">
                            <div v-if="freeEditions.length > 0" class="list-group list-group-flush">
                                <div v-for="edition in freeEditions" :key="edition.id" class="list-group-item py-3">
                                    <div class="d-flex align-items-center">
                                        <div class="edition-cover me-3">
                                            <img v-if="edition.cover_image" 
                                                 :src="`${config.public.apiBaseUrl}/storage/${edition.cover_image}`"
                                                 :alt="edition.title" class="rounded">
                                            <div v-else class="edition-placeholder rounded">
                                                <i class="fa-solid fa-newspaper"></i>
                                            </div>
                                        </div>
                                        <div class="flex-grow-1">
                                            <h6 class="mb-1">{{ edition.title }}</h6>
                                            <p class="text-muted small mb-0">{{ formatDate(edition.publication_date) }}</p>
                                        </div>
                                        <button @click="downloadEdition(edition)" class="btn btn-sm bg-gold text-white">
                                            <i class="fa-solid fa-download me-1"></i>Télécharger
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="text-center py-5">
                                <i class="fa-solid fa-gift fa-3x text-muted mb-3"></i>
                                <p class="text-muted">Aucune édition gratuite disponible</p>
                            </div>
                        </div>
                    </div>

                    <!-- Payments History -->
                    <div v-if="activeTab === 'payments'" class="card shadow-sm">
                        <div class="card-header">
                            <h5 class="mb-0"><i class="fa-solid fa-history me-2"></i>Historique des Paiements</h5>
                        </div>
                        <div class="card-body p-0">
                            <div v-if="purchases.length > 0" class="table-responsive">
                                <table class="table table-hover mb-0">
                                    <thead class="table-light">
                                        <tr>
                                            <th>Date</th>
                                            <th>Description</th>
                                            <th>Montant</th>
                                            <th>Méthode</th>
                                            <th>Statut</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="purchase in purchases" :key="purchase.id">
                                            <td>{{ formatDate(purchase.created_at) }}</td>
                                            <td>
                                                <span v-if="purchase.edition">{{ purchase.edition.title }}</span>
                                                <span v-else>Abonnement {{ getTypeLabel(purchase.type || subscriber.type) }}</span>
                                            </td>
                                            <td>{{ formatPrice(purchase.amount) }}</td>
                                            <td>
                                                <span class="badge bg-secondary">{{ purchase.payment_method || 'CinetPay' }}</span>
                                            </td>
                                            <td>
                                                <span class="badge" :class="purchase.status === 'completed' ? 'bg-success' : 'bg-warning'">
                                                    {{ getStatusLabel(purchase.status) }}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div v-else class="text-center py-5">
                                <i class="fa-solid fa-receipt fa-3x text-muted mb-3"></i>
                                <p class="text-muted">Aucun paiement enregistré</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Login Modal -->
        <Teleport to="body">
            <div v-if="showLoginModal && !isLoggedIn" class="modal-overlay">
                <div class="custom-modal">
                    <div class="modal-header cs-bg-brown text-white">
                        <h5 class="mb-0">
                            <i class="fa-solid fa-sign-in-alt me-2"></i>Connexion Abonné
                        </h5>
                    </div>
                    <div class="modal-body p-4">
                        <form @submit.prevent="login">
                            <div v-if="loginError" class="alert alert-danger">{{ loginError }}</div>
                            <div class="mb-3">
                                <label class="form-label">Email</label>
                                <input type="email" class="form-control" v-model="loginForm.email" required>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Mot de passe</label>
                                <input type="password" class="form-control" v-model="loginForm.password" required>
                            </div>
                            <button type="submit" class="btn bg-gold text-white w-100" :disabled="loading">
                                <span v-if="loading"><span class="spinner-border spinner-border-sm me-2"></span>Connexion...</span>
                                <span v-else><i class="fa-solid fa-sign-in-alt me-2"></i>Se connecter</span>
                            </button>
                        </form>
                        <hr class="my-4">
                        <p class="text-center text-muted mb-0">
                            Pas encore abonné ? 
                            <NuxtLink :to="localePath('/alt-news')" class="text-gold">Souscrire maintenant</NuxtLink>
                        </p>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Profile Modal -->
        <Teleport to="body">
            <div v-if="showProfileModal" class="modal-overlay" @click.self="showProfileModal = false">
                <div class="custom-modal">
                    <div class="modal-header cs-bg-brown text-white">
                        <h5 class="mb-0"><i class="fa-solid fa-user-edit me-2"></i>Modifier mon profil</h5>
                        <button type="button" class="btn-close btn-close-white" @click="showProfileModal = false"></button>
                    </div>
                    <div class="modal-body p-4">
                        <form @submit.prevent="updateProfile">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Prénom</label>
                                    <input type="text" class="form-control" v-model="profileForm.first_name">
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Nom</label>
                                    <input type="text" class="form-control" v-model="profileForm.last_name">
                                </div>
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Téléphone</label>
                                <input type="tel" class="form-control" v-model="profileForm.phone">
                            </div>
                            <div class="mb-3">
                                <label class="form-label">Email de facturation</label>
                                <input type="email" class="form-control" v-model="profileForm.billing_email">
                                <small class="text-muted">Email pour recevoir les factures</small>
                            </div>
                            <button type="submit" class="btn bg-gold text-white w-100">
                                <i class="fa-solid fa-save me-2"></i>Enregistrer
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Teleport>

        <!-- Payment Modal -->
        <Teleport to="body">
            <div v-if="showPaymentModal" class="modal-overlay" @click.self="showPaymentModal = false">
                <div class="custom-modal">
                    <div class="modal-header bg-gold text-white">
                        <h5 class="mb-0"><i class="fa-solid fa-shopping-cart me-2"></i>Acheter une édition</h5>
                        <button type="button" class="btn-close btn-close-white" @click="showPaymentModal = false"></button>
                    </div>
                    <div class="modal-body p-4 text-center">
                        <div v-if="selectedEdition">
                            <h5 class="mb-3">{{ selectedEdition.title }}</h5>
                            <p class="text-muted">{{ formatDate(selectedEdition.publication_date) }}</p>
                            <div class="bg-light p-3 rounded mb-4">
                                <h4 class="mb-0 text-gold">{{ formatPrice(selectedEdition.price || 100) }}</h4>
                            </div>
                            
                            <div class="mb-3 text-start">
                                <label class="form-label fw-semibold">Numéro de téléphone</label>
                                <input
                                    v-model="paymentPhone"
                                    type="tel"
                                    class="form-control"
                                    placeholder="Ex: 0701020304"
                                />
                            </div>

                            <div class="mb-3 text-start">
                                <label class="form-label fw-semibold">Moyen de paiement</label>
                                <p v-if="methodsLoading" class="text-muted small mb-0">Chargement…</p>
                                <p v-else-if="methodsError" class="text-danger small mb-0">{{ methodsError }}</p>
                                <div v-else class="d-flex flex-wrap gap-2">
                                    <button
                                        v-for="method in paymentMethods"
                                        :key="method.id"
                                        type="button"
                                        class="btn btn-sm"
                                        :class="selectedMethodId === method.id ? 'btn-dark' : 'btn-outline-secondary'"
                                        @click="selectedMethodId = method.id"
                                    >
                                        {{ method.name }}
                                    </button>
                                </div>
                            </div>

                            <p v-if="paymentError" class="text-danger small">{{ paymentError }}</p>
                            <p v-if="awaitingMessage" class="text-muted small">{{ awaitingMessage }}</p>
                            
                            <button @click="processEditionPayment" 
                                    class="btn bg-gold text-white w-100 mt-3"
                                    :disabled="processingPayment">
                                <span v-if="processingPayment">
                                    <span class="spinner-border spinner-border-sm me-2"></span>Traitement...
                                </span>
                                <span v-else>
                                    <i class="fa-solid fa-credit-card me-2"></i>Payer maintenant
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
.dashboard-hero {
    background: linear-gradient(135deg, #5a3d2b 0%, #8b6914 100%);
}

.bg-gold, .text-bg-gold {
    background-color: #d4b128 !important;
}

.text-gold {
    color: #d4b128 !important;
}

.edition-cover {
    width: 70px;
    height: 90px;
    flex-shrink: 0;
}

.edition-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.edition-placeholder {
    width: 100%;
    height: 100%;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #999;
    font-size: 1.5rem;
}

.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.custom-modal {
    background: #fff;
    border-radius: 12px;
    width: 100%;
    max-width: 500px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.custom-modal .modal-header {
    padding: 15px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.cs-bg-brown {
    background-color: #5a3d2b !important;
}

.subscription-card .card-header.bg-gold {
    background-color: #d4b128 !important;
}

.nav-tabs .nav-link {
    color: #5a3d2b;
    border: none;
    padding: 10px 15px;
}

.nav-tabs .nav-link.active {
    color: #d4b128;
    border-bottom: 3px solid #d4b128;
    font-weight: 600;
}

.card {
    border: none;
    border-radius: 12px;
}

.card-header {
    background: #f8f9fa;
    border-bottom: 1px solid #eee;
    padding: 15px 20px;
}

.list-group-item:hover {
    background: #f8f9fa;
}

.badge.bg-gold {
    background-color: #d4b128 !important;
}
</style>
