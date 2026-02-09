<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useApi } from '~/composables/useApi'
import LoginModal from '~/components/LoginModal.vue'
import SubscriptionCompo from '~/components/SubscriptionCompo.vue'

const { get } = useApi()
const texts = ref<string[]>([])
const isLoading = ref(true)
const isSubcribe = ref(false)
const showLoginModal = ref(false)

// Gestion de l'abonnement
const handleSubscribe = () => {
  isSubcribe.value = true
}

// Gestion du succès de connexion
const handleLoginSuccess = (user: any) => {
  console.log('✅ Utilisateur connecté depuis AltPresentation:', user.email)
  // La redirection est gérée par LoginModal
  // On peut ajouter d'autres actions ici si nécessaire
}

onMounted(async () => {
  try {
    texts.value = await get<string[]>('/api/texts/alt_presentation')
  } catch (error) {
    console.error('Error fetching alt presentation texts:', error)
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
    <section>
        <div class="tp-chose-bottom pt-50 pb-5 p-relative z-indexm-1">
            <span class="tp-chose-shape-2 p-absolute d-none d-xxl-block">
                <svg width="73" height="346" viewBox="0 0 73 346" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="-50" cy="123" r="122.5" stroke="#d4b128" stroke-opacity="0.5" />
                    <circle cx="-50" cy="223" r="122.5" stroke="#9E73B0" stroke-opacity="0.5" />
                </svg>
            </span>
            <div class="container">
                <div class="row">
                    <div class="col-lg-8">
                        <div class="tp-chose-wrapper pb-50">
                            <!-- Skeleton Loading pour la colonne gauche -->
                            <div v-if="isLoading" class="tp-chose-list mb-45">
                                <div class="skeleton-text skeleton-text-lg mb-25"></div>
                                <div class="skeleton-text skeleton-text-md mb-25"></div>
                                <div class="skeleton-text skeleton-text-sm mb-25"></div>
                                <div class="skeleton-text skeleton-text-lg mb-70"></div>
                                <div class="skeleton-text skeleton-text-md mb-25"></div>
                            </div>
                            
                            <!-- Contenu réel -->
                            <div v-else class="tp-chose-list mb-45 wow img-custom-anim-right" v-if="texts.length >= 2">
                                <h2 class="form-title">La revue mensuelle ALT NEWS</h2>
                                <h5 class="text-black" >La Revue ALT NEWS évolue vers une version premium, abonnez-vous et
restez informer des nouvelles parutions.</h5>
                                <div class="text-center">
                                    <button @click="handleSubscribe"  class="subscribe-button">S'abonner</button>
                                    <!-- <p class="text-center mt-3">
                                        <small>Vous avez déjà un compte ? 
                                            <button @click="showLoginModal = true" class="link-button">Connectez-vous ici</button>
                                        </small>
                                    </p> -->
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <!-- Skeleton Loading pour la colonne droite -->
                        <div v-if="isLoading" class="tp-chose-content">
                            <div class="skeleton-text skeleton-text-md mb-25"></div>
                            <div class="skeleton-text skeleton-text-lg mb-25"></div>
                            <div class="skeleton-text skeleton-text-sm mb-25"></div>
                            <div class="skeleton-text skeleton-text-md mb-70"></div>
                            <div class="skeleton-text skeleton-text-lg mb-25"></div>
                            
                            <!-- Skeleton pour le SVG -->
                            <div class="tp-chose-shape mt-5 text-end">
                                <div class="skeleton-shape"></div>
                            </div>
                        </div>
                        
                        <!-- Contenu réel -->
                        <div v-else class="tp-chose-content wow img-custom-anim-left" v-if="texts.length >= 4">
                            <!-- <p class="cs-text-dark mb-25 fs-18">{{ texts[2] }}</p>
                            <p class="cs-text-dark mb-70 fs-18">{{ texts[3] }}</p> -->
                            <div class="tp-chose-shape mt-5 text-end">
                                <span>
                                    <svg style="transform: rotate(180deg);" width="199" height="122" viewBox="0 0 199 122" fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path d="M98.4789 0L0 77.1088H198.5L98.4789 0Z" fill="#9E73B0"
                                            fill-opacity="1" />
                                        <path d="M98.4789 22.0312L0 99.14H198.5L98.4789 22.0312Z" fill="#9E73B0"
                                            fill-opacity="0.7" />
                                        <path d="M98.4789 44.062L0 121.171H198.5L98.4789 44.062Z" fill="#9E73B0"
                                            fill-opacity="0.4" />
                                    </svg>
                                </span>
                            </div>

                            <div class="login-button-container">
                                <button @click="showLoginModal = true" class="login-button">
                                    <i class="fa-solid fa-user me-2"></i>
                                    Accéder à mon espace
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- Modal d'abonnement -->
                <Teleport to="body">
                    <Transition name="modal">
                        <div v-if="isSubcribe" class="subscription-modal-overlay" @click.self="isSubcribe = false">
                            <div class="subscription-modal">
                                <div class="subscription-modal-header">
                                    <h3>Créer votre compte</h3>
                                    <button class="btn-close-modal" @click="isSubcribe = false" type="button">
                                        <span>×</span>
                                    </button>
                                </div>
                                <div class="subscription-modal-body">
                                    <subscription-compo @open-login-modal="isSubcribe = false; showLoginModal = true"></subscription-compo>
                                </div>
                            </div>
                        </div>
                    </Transition>
                </Teleport>
                <LoginModal v-model="showLoginModal" @login-success="handleLoginSuccess" @register-click="handleSubscribe" />
            </div>
        </div>
    </section>
</template>

<style scoped>
/* Skeleton Loading Styles */
.skeleton-text {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 4px;
    height: 18px;
}

.skeleton-text-sm {
    width: 60%;
}

.skeleton-text-md {
    width: 80%;
}

.skeleton-text-lg {
    width: 100%;
}

.skeleton-shape {
    width: 199px;
    height: 122px;
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: 4px;
    margin-left: auto;
    clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
}

@keyframes loading {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
}

.tp-chose-list p.cs-text-dark.fs-18, .tp-chose-content p.cs-text-dark.fs-18 {
    text-align: justify;
}

/* Animation de fondu pour la transition */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.form-title {
    color: var(--cs-gold-color);
    font-family: var(--tp-ff-body);
    font-weight: 600;
    letter-spacing: -.02em;
    line-height: 1.1;
    margin-top: 0;
    transition: color .3s ease-out 0s;
}
.subscribe-button{
    background: #d4b128;
    box-shadow: 0 4px 15px rgba(212, 177, 40, 0.3);
    color: #fff;
    cursor: pointer !important;
    font-weight: 700;
    overflow: hidden !important;
    position: relative !important;
    text-decoration: none !important;
    transition: all .3s ease !important;
    border: none !important;
    border-radius: 50px;
    margin-top: 1rem;
    padding: 1rem 2rem;
}

.login-button-container {
    display: flex;
    justify-content: center;
    margin-top: 1.5rem;
}

.login-button {
    background-color: transparent;
    box-shadow: 0 4px 15px rgba(212, 177, 40, 0.2);
    color: #d4b128;
    cursor: pointer;
    font-weight: 700;
    overflow: hidden;
    text-decoration: none;
    transition: all 0.3s ease;
    border: 2px solid #d4b128;
    border-radius: 50px;
    padding: 1rem 2rem;
    display: inline-flex;
    align-items: center;
}

.login-button:hover {
    background: #d4b128;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(212, 177, 40, 0.4);
    border-color: #d4b128;
}

.link-button {
    background: none;
    border: none;
    color: #d4b128;
    cursor: pointer;
    font-weight: 700;
    padding: 0;
    text-decoration: underline;
    transition: color 0.3s ease;
}

.link-button:hover {
    color: #b89a22;
}

/* Modal d'abonnement */
.subscription-modal-overlay {
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

.subscription-modal {
    background: white;
    border-radius: 20px;
    max-width: 1200px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(212, 177, 40, 0.2);
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

.subscription-modal-header {
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

.subscription-modal-header h3 {
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

.subscription-modal-body {
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

.modal-enter-active .subscription-modal,
.modal-leave-active .subscription-modal {
    transition: transform 0.3s ease;
}

.modal-enter-from .subscription-modal,
.modal-leave-to .subscription-modal {
    transform: scale(0.9);
}
</style>