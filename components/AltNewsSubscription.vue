<script setup>
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';

const config = useRuntimeConfig();
const { t } = useI18n();
const router = useRouter();
const route = useRoute();

// Récupérer la locale courante
const currentLocale = computed(() => {
  const pathParts = route.path.split('/');
  const locale = pathParts[1];
  return ['fr', 'en'].includes(locale) ? locale : 'fr';
});

// State
const plans = ref([]);
const loading = ref(true);
const showModal = ref(false);
const selectedPlan = ref(null);
const submitting = ref(false);
const success = ref(false);
const errorMessage = ref('');
const subscriptionId = ref(null);
const showPayment = ref(false);
const transactionId = ref('');

// CinetPay ref
const cinetpayRef = ref(null);

// Form data
const form = ref({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    password: '',
    password_confirmation: '',
    student_proof: null
});

// Generate transaction ID
const generateTransactionId = () => {
    return 'ALT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
};

// Fetch plans
const fetchPlans = async () => {
    try {
        const response = await fetch(`${config.public.apiBaseUrl}/subscription/plans`);
        const data = await response.json();
        // Surcharge du libellé pour le plan étudiant IUA
        plans.value = (data.plans || []).map((plan) => {
            if (plan?.id === 'student_iua' || plan?.type === 'student_iua') {
                return { ...plan, name: 'Étudiant IUA / AUPROHADA-UCAO' };
            }
            return plan;
        });
    } catch (err) {
        console.error('Error fetching plans:', err);
    } finally {
        loading.value = false;
    }
};

// Format price
const formatPrice = (price) => {
    return new Intl.NumberFormat('fr-FR').format(price) + ' FCFA';
};

// Open subscription modal
const openModal = (plan) => {
    selectedPlan.value = plan;
    showModal.value = true;
    errorMessage.value = '';
    success.value = false;
};

// Close modal
const closeModal = () => {
    showModal.value = false;
    selectedPlan.value = null;
    resetForm();
};

// Reset form
const resetForm = () => {
    form.value = {
        email: '',
        first_name: '',
        last_name: '',
        phone: '',
        password: '',
        password_confirmation: '',
        student_proof: null
    };
};

// Handle file upload
const handleFileUpload = (event) => {
    form.value.student_proof = event.target.files[0];
};

// Submit subscription
const submitSubscription = async () => {
    if (!selectedPlan.value) return;

    errorMessage.value = '';
    submitting.value = true;

    try {
        let endpoint = '';
        let formData = new FormData();

        if (selectedPlan.value.type === 'free') {
            endpoint = '/subscription/free';
            formData.append('email', form.value.email);
            formData.append('first_name', form.value.first_name);
            formData.append('last_name', form.value.last_name);
        } else {
            endpoint = '/subscription/subscribe';
            formData.append('email', form.value.email);
            formData.append('first_name', form.value.first_name);
            formData.append('last_name', form.value.last_name);
            formData.append('phone', form.value.phone);
            formData.append('password', form.value.password);
            formData.append('type', selectedPlan.value.type);

            if ((selectedPlan.value.type === 'student' || selectedPlan.value.type === 'student_iua') && form.value.student_proof) {
                formData.append('student_proof', form.value.student_proof);
            }
        }

        const response = await fetch(`${config.public.apiBaseUrl}${endpoint}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
            },
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Une erreur est survenue');
        }

        // student_iua est gratuit → pas de paiement, montrer le succès directement
        if (selectedPlan.value.type === 'student_iua') {
            success.value = true;
        }
        // Si c'est un abonnement payant, afficher l'interface de paiement
        else if (selectedPlan.value.type !== 'free' && data.subscription_id) {
            subscriptionId.value = data.subscription_id;
            transactionId.value = generateTransactionId();
            showPayment.value = true;
            success.value = false;

            // Sauvegarder les données d'authentification si disponibles
            if (data.token) {
                localStorage.setItem('authToken', data.token);
            }
            if (data.subscriber || data.subscription) {
                const subscriber = data.subscriber || data.subscription;
                const userData = {
                    id: subscriber.id,
                    email: subscriber.email || form.value.email,
                    firstName: subscriber.first_name || form.value.first_name,
                    lastName: subscriber.last_name || form.value.last_name,
                    type: subscriber.type || selectedPlan.value?.type,
                    status: subscriber.status || 'pending'
                };
                localStorage.setItem('authUser', JSON.stringify(userData));
                if (data.token) {
                    localStorage.setItem('authData', JSON.stringify({
                        user: userData,
                        token: data.token,
                        loginTime: new Date().toISOString()
                    }));
                }
            }
        } else {
            success.value = true;
        }

    } catch (err) {
        errorMessage.value = err.message;
    } finally {
        submitting.value = false;
    }
};

// Lancer le paiement CinetPay
const launchPayment = async () => {
    if (cinetpayRef.value && cinetpayRef.value.isCinetPayLoaded) {
        cinetpayRef.value.checkout(handlePaymentSuccess);
    } else {
        // Attendre que CinetPay soit chargé
        const waitForCinetPay = () => {
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (cinetpayRef.value && cinetpayRef.value.isCinetPayLoaded) {
                        clearInterval(checkInterval);
                        resolve();
                    }
                }, 100);
                setTimeout(() => {
                    clearInterval(checkInterval);
                    resolve();
                }, 10000);
            });
        };
        
        await waitForCinetPay();
        
        if (cinetpayRef.value && cinetpayRef.value.checkout) {
            cinetpayRef.value.checkout(handlePaymentSuccess);
        } else {
            errorMessage.value = 'Impossible de charger le système de paiement. Veuillez rafraîchir la page.';
        }
    }
};

// Handle successful payment
const handlePaymentSuccess = async () => {
    try {
        const response = await fetch(`${config.public.apiBaseUrl}/subscription/confirm-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                subscription_id: subscriptionId.value,
                payment_reference: transactionId.value,
                payment_method: 'cinetpay'
            })
        });

        const data = await response.json();
        if (response.ok) {
            success.value = true;
            showPayment.value = false;

            // Sauvegarder les données d'authentification si disponibles
            if (data.token) {
                localStorage.setItem('authToken', data.token);
            }
            if (data.subscriber) {
                const userData = {
                    id: data.subscriber.id,
                    email: data.subscriber.email || form.value.email,
                    firstName: data.subscriber.first_name || form.value.first_name,
                    lastName: data.subscriber.last_name || form.value.last_name,
                    type: data.subscriber.type || selectedPlan.value?.type,
                    status: data.subscriber.status || 'active'
                };
                localStorage.setItem('authUser', JSON.stringify(userData));
                localStorage.setItem('authData', JSON.stringify({
                    user: userData,
                    token: data.token,
                    loginTime: new Date().toISOString()
                }));
            }
        }
    } catch (err) {
        console.error('Error confirming payment:', err);
    }
};

// Rediriger vers l'espace abonné
const goToSubscriberSpace = () => {
    closeModal();
    router.push(`/${currentLocale.value}/subscriber/manage`);
};

// Plan icons
const getPlanIcon = (type) => {
    const icons = {
        free: 'fa-envelope',

        annual: 'fa-crown',
        student: 'fa-graduation-cap'
    };
    return icons[type] || 'fa-star';
};

// Plan colors
const getPlanColor = (type) => {
    const colors = {
        free: '#5D4037',      // Marron
        annual: '#D4AF37',    // Doré
        student: '#7B1FA2'    // Violet
    };
    return colors[type] || '#5D4037';
};

onMounted(() => {
    fetchPlans();
});
</script>

<template>
    <div class="alt-news-subscription py-80">
        <div class="container">
            <!-- Section Title -->
            <div class="row">
                <div class="col-12 text-center mb-50">
                    <span class="tp-section-subtitle cs-text-gold">{{ $t('subscription.subtitle') || 'Abonnements' }}</span>
                    <h2 class="tp-section-title cs-text-brown mb-20">
                        {{ $t('subscription.title') || 'Choisissez votre formule' }}
                    </h2>
                    <p class="text-muted max-w-600 mx-auto">
                        {{ $t('subscription.description') || 'Accédez à toutes nos éditions ALT News avec nos différentes formules d\'abonnement.' }}
                    </p>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="row justify-content-center">
                <div class="col-12 text-center py-5">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Chargement...</span>
                    </div>
                </div>
            </div>

            <!-- Plans Grid -->
            <div v-else class="row justify-content-center">
                <div v-for="plan in plans" :key="plan.type" class="col-lg-3 col-md-6 mb-30">
                    <div class="subscription-card h-100" :class="{ 'featured': plan.type === 'annual' }">
                        <!-- Plan Header -->
                        <div class="card-header text-center" :style="{ backgroundColor: getPlanColor(plan.type) }">
                            <i :class="['fa-solid', getPlanIcon(plan.type), 'plan-icon']"></i>
                            <h4 class="plan-name">{{ plan.name }}</h4>
                            <div class="plan-price">
                                <span class="price">{{ formatPrice(plan.price) }}</span>
                                <span class="frequency">/ {{ plan.frequency }}</span>
                            </div>
                        </div>

                        <!-- Plan Body -->
                        <div class="card-body">
                            <p class="plan-description">{{ plan.description }}</p>
                            <ul class="features-list">
                                <li v-for="(feature, index) in plan.features" :key="index">
                                    <i class="fa-solid fa-check text-success me-2"></i>
                                    {{ feature }}
                                </li>
                            </ul>
                        </div>

                        <!-- Plan Footer -->
                        <div class="card-footer">
                            <button 
                                class="btn btn-subscribe w-100"
                                :style="{ backgroundColor: getPlanColor(plan.type) }"
                                @click="openModal(plan)"
                            >
                                {{ plan.type === 'free' ? 'S\'inscrire' : 'Souscrire' }}
                            </button>
                        </div>

                        <!-- Featured Badge -->
                        <div v-if="plan.type === 'annual'" class="featured-badge">
                            <span>Populaire</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Subscription Modal -->
        <Teleport to="body">
            <div v-if="showModal" class="subscription-modal-overlay" @click.self="closeModal">
                <div class="subscription-modal">
                    <!-- Modal Header -->
                    <div class="modal-header" :style="{ backgroundColor: selectedPlan ? getPlanColor(selectedPlan.type) : '#d4b128' }">
                        <h5 class="modal-title">
                            <i :class="['fa-solid', selectedPlan ? getPlanIcon(selectedPlan.type) : 'fa-star', 'me-2']"></i>
                            {{ selectedPlan?.name }}
                        </h5>
                        <button type="button" class="btn-close btn-close-white" @click="closeModal"></button>
                    </div>

                    <!-- Modal Body -->
                    <div class="modal-body">
                        <!-- Success Message -->
                        <div v-if="success && !showPayment" class="alert text-center" :class="(selectedPlan?.type === 'student' || selectedPlan?.type === 'student_iua') ? 'alert-warning' : 'alert-success'">
                            <i :class="['fa-solid', (selectedPlan?.type === 'student' || selectedPlan?.type === 'student_iua') ? 'fa-clock fa-3x mb-3' : 'fa-check-circle fa-3x mb-3']"></i>
                            <h5 v-if="selectedPlan?.type === 'free'">Inscription réussie !</h5>
                            <h5 v-else-if="selectedPlan?.type === 'student' || selectedPlan?.type === 'student_iua'">Inscription enregistrée !</h5>
                            <h5 v-else>Paiement confirmé !</h5>
                            <p v-if="selectedPlan?.type === 'free'">
                                Vous êtes maintenant inscrit à notre newsletter ALT News.
                            </p>
                            <p v-else-if="selectedPlan?.type === 'student' || selectedPlan?.type === 'student_iua'">
                                Votre inscription est en cours de validation. Votre carte étudiante est en cours de vérification par notre équipe. Vous recevrez un email de confirmation dès que votre abonnement sera activé.
                            </p>
                            <p v-else>
                                Votre abonnement a été activé avec succès !
                            </p>
                            <button v-if="selectedPlan?.type === 'student' || selectedPlan?.type === 'student_iua'" class="btn btn-secondary mt-3" @click="closeModal">
                                Compris, merci !
                            </button>
                            <button v-else-if="selectedPlan?.type !== 'free'" class="btn btn-primary mt-3" @click="goToSubscriberSpace">
                                Accéder à mon espace abonné
                            </button>
                            <button v-else class="btn btn-secondary mt-3" @click="closeModal">Fermer</button>
                        </div>

                        <!-- CinetPay Payment -->
                        <div v-else-if="showPayment" class="text-center py-4">
                            <h5 class="mb-3">Paiement en cours...</h5>
                            <p class="text-muted mb-4">Veuillez compléter le paiement dans la fenêtre CinetPay</p>
                            <Cinetpay
                                ref="cinetpayRef"
                                :structure="'CS-CONSEIL'"
                                :userName="form.first_name + ' ' + form.last_name"
                                :firstName="form.first_name"
                                :lastName="form.last_name"
                                :phone="form.phone"
                                :email="form.email"
                                :amount="selectedPlan?.price"
                                :service="'Abonnement ALT News - ' + selectedPlan?.name"
                                :transactionId="transactionId"
                            />
                            <button class="btn btn-primary mt-3" @click="launchPayment">Payer maintenant</button>
                            <button class="btn btn-secondary mt-3 ms-2" @click="showPayment = false">Annuler</button>
                        </div>

                        <!-- Subscription Form -->
                        <form v-else @submit.prevent="submitSubscription">
                            <!-- Error Message -->
                            <div v-if="errorMessage" class="alert alert-danger">
                                {{ errorMessage }}
                            </div>

                            <!-- Plan Summary -->
                            <div class="plan-summary mb-4 p-3 bg-light rounded">
                                <div class="d-flex justify-content-between align-items-center">
                                    <span>{{ selectedPlan?.name }}</span>
                                    <strong>{{ selectedPlan ? formatPrice(selectedPlan.price) : '' }}</strong>
                                </div>
                            </div>

                            <!-- Form Fields -->
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Prénom *</label>
                                    <input 
                                        type="text" 
                                        class="form-control" 
                                        v-model="form.first_name"
                                        required
                                    >
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Nom *</label>
                                    <input 
                                        type="text" 
                                        class="form-control" 
                                        v-model="form.last_name"
                                        required
                                    >
                                </div>
                            </div>

                            <div class="mb-3">
                                <label class="form-label">Email *</label>
                                <input 
                                    type="email" 
                                    class="form-control" 
                                    v-model="form.email"
                                    required
                                >
                            </div>

                            <!-- Phone (for paid subscriptions) -->
                            <div v-if="selectedPlan?.type !== 'free'" class="mb-3">
                                <label class="form-label">Téléphone</label>
                                <input 
                                    type="tel" 
                                    class="form-control" 
                                    v-model="form.phone"
                                >
                            </div>

                            <!-- Password (for paid subscriptions) -->
                            <div v-if="selectedPlan?.type !== 'free'" class="mb-3">
                                <label class="form-label">Mot de passe *</label>
                                <input 
                                    type="password" 
                                    class="form-control" 
                                    v-model="form.password"
                                    required
                                    minlength="6"
                                >
                                <small class="text-muted">Minimum 6 caractères</small>
                            </div>

                            <!-- Student Proof (for student and student_iua plans) -->
                            <div v-if="selectedPlan?.type === 'student' || selectedPlan?.type === 'student_iua'" class="mb-3">
                                <label class="form-label">
                                    {{ selectedPlan?.type === 'student_iua' ? 'Carte étudiante IUA *' : 'Justificatif étudiant *' }}
                                </label>
                                <input
                                    type="file"
                                    class="form-control"
                                    @change="handleFileUpload"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    required
                                >
                                <small class="text-muted">
                                    {{ selectedPlan?.type === 'student_iua'
                                        ? 'Votre carte étudiante IUA de l\'année en cours (PDF, JPG, PNG)'
                                        : 'Carte étudiante ou certificat de scolarité (PDF, JPG, PNG)'
                                    }}
                                </small>
                            </div>

                            <!-- Submit Button -->
                            <button 
                                type="submit" 
                                class="btn btn-primary btn-lg w-100"
                                :disabled="submitting"
                                :style="{ backgroundColor: selectedPlan ? getPlanColor(selectedPlan.type) : '#d4b128' }"
                            >
                                <span v-if="submitting">
                                    <span class="spinner-border spinner-border-sm me-2"></span>
                                    Traitement...
                                </span>
                                <span v-else>
                                    {{ selectedPlan?.type === 'free' ? 'S\'inscrire gratuitement' : (selectedPlan?.type === 'student_iua' ? 'Finaliser mon inscription' : 'Continuer vers le paiement') }}
                                </span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<style scoped>
.alt-news-subscription {
    background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
}

.subscription-card {
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
}

.subscription-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.subscription-card.featured {
    border: 2px solid #D4AF37;
}

.card-header {
    padding: 30px 20px;
    color: #fff;
}

.plan-icon {
    font-size: 2.5rem;
    margin-bottom: 15px;
    display: block;
}

.plan-name {
    font-size: 1.3rem;
    font-weight: 600;
    margin-bottom: 15px;
    color: #fff;
}

.plan-price {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.plan-price .price {
    font-size: 1.8rem;
    font-weight: 700;
}

.plan-price .frequency {
    font-size: 0.9rem;
    opacity: 0.9;
}

.card-body {
    padding: 25px 20px;
}

.plan-description {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 20px;
    min-height: 60px;
}

.features-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.features-list li {
    padding: 8px 0;
    border-bottom: 1px solid #eee;
    font-size: 0.9rem;
}

.features-list li:last-child {
    border-bottom: none;
}

.card-footer {
    padding: 20px;
    background: #f8f9fa;
}

.btn-subscribe {
    color: #fff;
    font-weight: 600;
    padding: 12px 20px;
    border: none;
    border-radius: 8px;
    transition: opacity 0.3s ease;
}

.btn-subscribe:hover {
    opacity: 0.9;
    color: #fff;
}

.featured-badge {
    position: absolute;
    top: 15px;
    right: -30px;
    background: #dc3545;
    color: #fff;
    padding: 5px 40px;
    font-size: 0.75rem;
    font-weight: 600;
    transform: rotate(45deg);
}

/* Modal Styles */
.subscription-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    padding: 20px;
}

.subscription-modal {
    background: #fff;
    border-radius: 16px;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.subscription-modal .modal-header {
    padding: 20px 25px;
    color: #fff;
    border-radius: 16px 16px 0 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.subscription-modal .modal-title {
    margin: 0;
    font-weight: 600;
}

.subscription-modal .modal-body {
    padding: 25px;
}

.max-w-600 {
    max-width: 600px;
}

@media (max-width: 768px) {
    .subscription-card {
        margin-bottom: 20px;
    }
    
    .plan-price .price {
        font-size: 1.5rem;
    }
}
</style>
