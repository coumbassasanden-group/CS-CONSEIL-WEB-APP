<script setup>
import { computed, ref } from 'vue'

// États réactifs
const email = ref('')
const loading = ref(false)
const message = ref('')
const error = ref(false)
const isSuccess = ref(false)
const localePath = useLocalePath();
// Configuration API
const config = useRuntimeConfig();
const API_CONFIG = {
    baseUrl: config.public.apiBaseUrl,
    endpoint: '/api/newsletters',
    timeout: 10000,
    company: 'conseil'
}

// Validation d'email améliorée
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const isValidEmail = computed(() => {
    return email.value.trim() !== '' && emailRegex.test(email.value.trim())
})

// Messages d'erreur personnalisés
const ERROR_MESSAGES = {
    network: 'Problème de connexion. Veuillez vérifier votre connexion internet.',
    timeout: 'La demande a pris trop de temps. Veuillez réessayer.',
    server: 'Erreur du serveur. Veuillez réessayer plus tard.',
    validation: 'Veuillez entrer une adresse email valide.',
    duplicate: 'Cette adresse email est déjà inscrite à notre newsletter.',
    default: 'Une erreur inattendue est survenue. Veuillez réessayer.'
}

// Fonction de gestion des erreurs
function handleError(err, responseData = null) {
    console.error('Newsletter subscription error:', err)

    if (responseData?.message) {
        return responseData.message
    }

    if (err.name === 'AbortError') {
        return ERROR_MESSAGES.timeout
    }

    if (!navigator.onLine) {
        return ERROR_MESSAGES.network
    }

    return ERROR_MESSAGES.default
}

// Fonction de soumission avec gestion avancée
async function submitNewsletter() {
    if (!isValidEmail.value) {
        error.value = true
        message.value = ERROR_MESSAGES.validation
        return
    }

    loading.value = true
    message.value = ''
    error.value = false
    isSuccess.value = false

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout)

    try {
        const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'company': API_CONFIG.company,
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email.value.trim().toLowerCase(),
            }),
            signal: controller.signal
        })

        clearTimeout(timeoutId)
        const data = await response.json()

        if (response.ok) {
            isSuccess.value = true
            error.value = false
            message.value = data.message || 'Inscription réussie ! Merci de vous être abonné(e) à notre newsletter.'
            email.value = ''

            if (typeof gtag !== 'undefined') {
                gtag('event', 'newsletter_signup', {
                    method: 'footer_form',
                    company: API_CONFIG.company
                })
            }

        } else if (response.status === 200 && data.type === 'already_subscribed') {
            isSuccess.value = true
            error.value = false
            message.value = data.message
            email.value = ''

        } else {
            error.value = true
            message.value = handleError(null, data)
        }

    } catch (err) {
        clearTimeout(timeoutId)
        error.value = true
        message.value = handleError(err)
    } finally {
        loading.value = false

        setTimeout(() => {
            if (message.value) {
                message.value = ''
                error.value = false
                isSuccess.value = false
            }
        }, 5000)
    }
}

function resetForm() {
    email.value = ''
    message.value = ''
    error.value = false
    isSuccess.value = false
}

function handleKeydown(event) {
    if (event.key === 'Escape') {
        resetForm()
    }
}
</script>

<template>
    <footer class="cs-footer" data-theme="conseil">
        <!-- Newsletter Section -->
        <div class="cs-newsletter-section">
            <div class="container">
                <div class="row align-items-center">
                    <div class="col-lg-8">
                        <div class="cs-newsletter-content">
                            <div class="cs-newsletter-icon">
                                <i class="fas fa-envelope-open"></i>
                            </div>
                            <div class="cs-newsletter-text">
                                <h3 class="cs-newsletter-title montserrat">{{ $t('constant.newsletter.title') }}</h3>
                                <p class="cs-newsletter-desc poppins">{{ $t('constant.newsletter.description') }}</p>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="cs-newsletter-form">
                            <form @submit.prevent="submitNewsletter" @keydown="handleKeydown">
                                <div class="cs-input-group">
                                    <input 
                                        type="email" 
                                        v-model="email"
                                        :class="['cs-newsletter-input', {
                                            'is-invalid': error && !isValidEmail,
                                            'is-valid': isSuccess
                                        }]"
                                        :placeholder="$t('constant.newsletter.placeholder')"
                                        :disabled="loading"
                                        required
                                    >
                                    <button 
                                        type="submit" 
                                        class="cs-newsletter-btn"
                                        :disabled="loading || !isValidEmail"
                                    >
                                        <span v-if="loading" class="cs-spinner"></span>
                                        <i v-else class="fas fa-paper-plane"></i>
                                    </button>
                                </div>
                                <Transition name="fade">
                                    <div 
                                        v-if="message" 
                                        :class="['cs-form-message', {
                                            'cs-success': isSuccess,
                                            'cs-error': error
                                        }]"
                                    >
                                        <div class="cs-message-content">
                                            <i :class="isSuccess ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle'"></i>
                                            <span>{{ message }}</span>
                                            <button 
                                                type="button" 
                                                class="cs-close-btn"
                                                @click="closeMessage"
                                                :aria-label="$t('constant.close')"
                                            >
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </div>
                                    </div>
                                </Transition>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Footer Content -->
        <div class="cs-footer-main">
            <div class="container">
                <div class="row">
                    <!-- Company Info -->
                    <div class="col-lg-4 col-md-6">
                        <div class="cs-footer-widget">
                            <div class="cs-footer-brand">
                                <div class="cs-brand-icon">
                                    <i class="fas fa-chevron-right"></i>
                                </div>
                                <div class="cs-brand-logo">
                                    <img src="~/assets/img/logo/logo-cs-conseil.png" alt="CS Conseil" class="cs-logo">
                                </div>
                            </div>
                            <p class="cs-footer-desc poppins">
                                {{ $t('constant.companies.legal') }}
                            </p>
                            <div class="cs-footer-address">
                                <div class="cs-address-item">
                                    <i class="fas fa-map-marker-alt cs-accent-color"></i>
                                    <span class="poppins">{{ $t('constant.address') }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Quick Links -->
                    <div class="col-lg-2 col-md-6">
                        <div class="cs-footer-widget">
                            <h5 class="cs-footer-title montserrat">{{ $t('constant.useful_link') }}</h5>
                            <ul class="cs-footer-menu poppins">
                                <li><NuxtLink :to="localePath('contact')">{{ $t('constant.contact_us') }}</NuxtLink></li>
                                <li><NuxtLink :to="localePath('services')">{{ $t('constant.our_services') }}</NuxtLink></li>
                                <li><NuxtLink :to="localePath('stationery')">{{ $t('header.stationery') }}</NuxtLink></li>
                                <li><NuxtLink :to="localePath('news')">{{ $t('header.news') }}</NuxtLink></li>
                                <li><NuxtLink :to="localePath('alt-news')">{{ $t('header.alt-news') }}</NuxtLink></li>
                            </ul>
                        </div>
                    </div>

                    <!-- Contact Info -->
                    <div class="col-lg-3 col-md-6">
                        <div class="cs-footer-widget">
                            <h5 class="cs-footer-title montserrat">{{ $t('constant.our_contact') }}</h5>
                            <ul class="cs-footer-contact poppins">
                                <li>
                                    <i class="fas fa-envelope cs-accent-color"></i>
                                    <a href="mailto:contact@coumbassa-sanden.com">contact@coumbassa-sanden.com</a>
                                </li>
                                <li>
                                    <i class="fas fa-phone cs-accent-color"></i>
                                    <a href="tel:+22507101029433">(+225) 07 10 10 29 43</a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <!-- Social Media -->
                    <div class="col-lg-3 col-md-6">
                        <div class="cs-footer-widget">
                            <h5 class="cs-footer-title montserrat">{{ $t('constant.our_socials') }}</h5>
                            <div class="cs-social-links poppins">
                                <a href="https://www.linkedin.com/company/cabinet-coumbassa-sanden/" target="_blank" rel="noopener" class="cs-social-link">
                                    <i class="fab fa-linkedin"></i>
                                    <span>cabinet-coumbassa-sanden</span>
                                </a>
                                <a href="https://www.youtube.com/@CoumbassaSanden" target="_blank" rel="noopener" class="cs-social-link">
                                    <i class="fab fa-youtube"></i>
                                    <span>@CoumbassaSanden</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Related Companies Section -->
        <div class="cs-companies-section">
            <div class="container">
                <h5 class="cs-companies-title montserrat">{{ $t('constant.see_also') }}</h5>
                <div class="cs-companies-grid">
                    <a class="d-block" href="https://coumbassa-sanden.com" target="_blank" rel="noopener noreferrer">
                        <div class="cs-company-card">
                            <div class="cs-company-logo">
                                <img src="~/assets/img/logo/logo-cs-group.png" alt="CS Group">
                            </div>
                            <p class="cs-company-desc poppins">{{ $t('constant.companies.group') }}</p>
                        </div>
                    </a>
                    <a class="d-block" href="https://finance.coumbassa-sanden.com" target="_blank" rel="noopener noreferrer">
                        <div class="cs-company-card">
                            <div class="cs-company-logo">
                                <img src="~/assets/img/logo/logo-cs-finance.png" alt="CS Finance">
                            </div>
                            <p class="cs-company-desc poppins">{{ $t('constant.companies.finance') }}</p>
                        </div>
                    </a>
                    <a class="d-block" href="https://tech.coumbassa-sanden.com" target="_blank" rel="noopener noreferrer">
                        <div class="cs-company-card">
                            <div class="cs-company-logo">
                                <img src="~/assets/img/logo/logo-cs-tech.png" alt="CS Tech">
                            </div>
                            <p class="cs-company-desc poppins">{{ $t('constant.companies.tech') }}</p>
                        </div>
                    </a>
                </div>
            </div>
        </div>

        <!-- Footer Bottom -->
        <div class="cs-footer-bottom">
            <div class="container">
                <div class="cs-footer-bottom-content">
                    <p class="cs-copyright montserrat">
                        © <span id="year">2025 </span>
                        <strong>COUMBASSA & SANDEN GROUP</strong>.
                        {{ $t('constant.all_rights_reserved') }}
                    </p>
                </div>
            </div>
        </div>
    </footer>
</template>

<style scoped>
/* Variables CSS pour les thèmes */
.cs-footer[data-theme="conseil"] {
    --cs-primary-color: #dab304;
    --cs-accent-color: #E7D7C5;
    --cs-light-accent: #3F2E1A;
}

/* Thèmes pour les différentes entités */
.cs-footer[data-theme="group"] {
    --cs-primary-color: #3F2E1A;
    --cs-accent-color: #dab304;
    --cs-light-accent: #E7D7C5;
}

/* Styles pour les messages */
.cs-form-message {
    margin-top: 15px;
    padding: 0;
    border-radius: 12px;
    font-size: 14px;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    overflow: hidden;
}

.cs-message-content {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    position: relative;
}

.cs-form-message.cs-success {
    background: rgba(40, 167, 69, 0.15);
    border-color: rgba(40, 167, 69, 0.3);
}

.cs-form-message.cs-success .cs-message-content {
    color: #28a745;
}

.cs-form-message.cs-error {
    background: rgba(220, 53, 69, 0.15);
    border-color: rgba(220, 53, 69, 0.3);
}

.cs-form-message.cs-error .cs-message-content {
    color: #dc3545;
}


.poppins {
    font-family: var(--cs-family-poppins) !important;
}

.montserrat {
    font-family: var(--cs-family-montserrat) !important;
}

.cs-footer[data-theme="finance"] {
    --cs-primary-color: #0C657B;
    --cs-accent-color: #0C657B;
    --cs-light-accent: #A2E4F6;
}

.cs-footer[data-theme="tech"] {
    --cs-primary-color: #F9B233;
    --cs-accent-color: #F9B233;
    --cs-light-accent: #FEEFD7;
}

/* Styles de base */
.cs-footer {
    background: #0B0909;
    color: var(--cs-grey-color);
    font-family: var(--cs-font-primary);
    position: relative;
    overflow: hidden;
}

.cs-footer::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 20% 80%, rgba(212, 177, 40, 0.1) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(212, 177, 40, 0.1) 0%, transparent 50%);
    pointer-events: none;
}

/* Newsletter Section */
.cs-newsletter-section {
    padding: 30px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    z-index: 1;
}

.cs-newsletter-content {
    display: flex;
    align-items: center;
    gap: 20px;
}

.cs-newsletter-icon {
    width: 70px;
    height: 70px;
    background: linear-gradient(135deg, var(--cs-accent-color), var(--cs-primary-color));
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    color: white;
    flex-shrink: 0;
    box-shadow: 0 10px 30px rgba(212, 177, 40, 0.3);
}

.cs-newsletter-title {
    font-family: var(--cs-font-title);
    font-size: 28px;
    font-weight: 600;
    color: white;
    margin: 0 0 8px 0;
}

.cs-newsletter-desc {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.8);
    margin: 0;
}

.cs-newsletter-form {
    max-width: 400px;
    margin-left: auto;
}

.cs-input-group {
    position: relative;
    display: flex;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border-radius: 50px;
    padding: 8px;
    border: 2px solid transparent;
    transition: all 0.3s ease;
}

.cs-input-group:focus-within {
    border-color: var(--cs-accent-color);
    box-shadow: 0 0 0 4px rgba(212, 177, 40, 0.2);
}

.cs-newsletter-input {
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    padding: 12px 20px;
    color: white;
    font-size: 16px;
    border-radius: 50px;
}

.cs-newsletter-input::placeholder {
    color: rgba(255, 255, 255, 0.6);
}

.cs-newsletter-btn {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, var(--cs-accent-color), var(--cs-primary-color));
    border: none;
    border-radius: 50%;
    color: white;
    font-size: 18px;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
}

.cs-newsletter-btn:hover:not(:disabled) {
    transform: scale(1.05);
    box-shadow: 0 5px 15px rgba(212, 177, 40, 0.4);
}

.cs-newsletter-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.cs-spinner {
    width: 18px;
    height: 18px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    border-top-color: white;
    animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.cs-form-message {
    margin-top: 12px;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    text-align: center;
}

.cs-form-message.cs-success {
    background: rgba(40, 167, 69, 0.2);
    color: #28a745;
    border: 1px solid rgba(40, 167, 69, 0.3);
}

.cs-form-message.cs-error {
    background: rgba(220, 53, 69, 0.2);
    color: #dc3545;
    border: 1px solid rgba(220, 53, 69, 0.3);
}

/* Main Footer */
.cs-footer-main {
    padding: 30px 0;
    position: relative;
    z-index: 1;
}

/* .cs-footer-widget {
    margin-bottom: 40px;
} */

.cs-footer-brand {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 20px;
}

.cs-brand-icon {
    color: var(--cs-accent-color);
    font-size: 15px;
}

.cs-brand-logo {
    background: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.cs-logo {
    height: 35px;
    width: auto;
}

.cs-footer-desc {
    font-size: 15px;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 30px;
    line-height: 1.6;
    font-family: var(--cs-family-poppins) !important;
}

.cs-footer-address {
    margin-top: 20px;
}

.cs-address-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    color: rgba(255, 255, 255, 0.8);
    line-height: 1.6;
}

.cs-address-item i {
    margin-top: 4px;
    flex-shrink: 0;
}

.cs-footer-title {
    font-family: var(--cs-font-title);
    font-size: 20px;
    font-weight: 600;
    color: white;
    margin-bottom: 25px;
    position: relative;
}

.cs-footer-title::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 30px;
    height: 3px;
    background: var(--cs-accent-color);
    border-radius: 2px;
}

.cs-footer-menu {
    list-style: none;
    padding: 0;
    margin: 0;
}

.cs-footer-menu li {
    margin-bottom: 12px;
}

.cs-footer-menu a {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    font-size: 16px;
    transition: all 0.3s ease;
    position: relative;
}

.cs-footer-menu a::before {
    content: '';
    position: absolute;
    left: -15px;
    top: 50%;
    transform: translateY(-50%);
    width: 0;
    height: 2px;
    background: var(--cs-accent-color);
    transition: width 0.3s ease;
}

.cs-footer-menu a:hover {
    color: var(--cs-accent-color);
    padding-left: 15px;
}

.cs-footer-menu a:hover::before {
    width: 10px;
}

.cs-footer-contact {
    list-style: none;
    padding: 0;
    margin: 0;
}

.cs-footer-contact li {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 15px;
}

.cs-footer-contact a {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    transition: color 0.3s ease;
}

.cs-footer-contact a:hover {
    color: var(--cs-accent-color);
}

.cs-social-links {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.cs-social-link {
    display: flex;
    align-items: center;
    gap: 12px;
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    transition: all 0.3s ease;
    padding: 10px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
}

.cs-social-link:hover {
    color: var(--cs-accent-color);
    background: rgba(212, 177, 40, 0.1);
    transform: translateX(5px);
}

.cs-social-link i {
    font-size: 18px;
    width: 20px;
}

/* Companies Section */
.cs-companies-section {
    padding: 20px 0;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    position: relative;
    z-index: 1;
}

.cs-companies-title {
    font-family: var(--cs-font-title);
    font-size: 24px;
    font-weight: 600;
    color: var(--cs-light-brown-color);
    text-align: center;
    margin-bottom: 20px;
}

.cs-companies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    max-width: 900px;
    margin: 0 auto;
}

.cs-company-card {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 10px 5px;
    text-align: center;
    transition: all 0.3s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.cs-company-card:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.cs-company-logo {
    background: white;
    padding: 10px;
    border-radius: 12px;
    margin-bottom: 10px;
    display: inline-block;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.cs-company-logo img {
    height: 40px;
    width: auto;
}

.cs-company-desc {
    color: rgba(255, 255, 255, 0.8);
    font-size: 14px;
    margin: 0;
}

/* Footer Bottom */
.cs-footer-bottom {
    background: var(--cs-light-brown-color);
    padding: 20px 0;
    position: relative;
    z-index: 1;
}

.cs-footer-bottom-content {
    text-align: center;
}

.cs-copyright {
    font-family: var(--cs-font-title);
    font-size: 16px;
    color: var(--cs-brown-color);
    margin: 0;
}

.cs-copyright strong {
    font-weight: 600;
}

/* Animations */
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

/* Couleurs d'accent */
.cs-accent-color {
    color: var(--cs-accent-color) !important;
}

/* Media Queries */
@media (max-width: 1200px) {
    .cs-newsletter-title {
        font-size: 24px;
    }
    
    .cs-newsletter-desc {
        font-size: 14px;
    }
}

@media (max-width: 992px) {
    .cs-newsletter-content {
        flex-direction: column;
        text-align: center;
        gap: 15px;
        margin-bottom: 30px;
    }
    
    .cs-newsletter-form {
        margin-left: 0;
        max-width: 100%;
    }
    
    .cs-footer-main {
        padding: 60px 0;
    }
}

@media (max-width: 768px) {
    .cs-newsletter-section {
        padding: 20px 0;
    }
    
    .cs-newsletter-title {
        font-size: 20px;
    }
    
    .cs-footer-main {
        padding: 20px 0;
    }
    
    .cs-companies-section {
        padding: 20px 0;
    }
    
    .cs-companies-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    .cs-footer-widget {
        margin-bottom: 30px;
    }
}

@media (max-width: 576px) {
    .cs-newsletter-icon {
        width: 60px;
        height: 60px;
        font-size: 20px;
    }
    
    .cs-newsletter-title {
        font-size: 18px;
    }
    
    .cs-footer-brand {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
    
    .cs-input-group {
        padding: 6px;
    }
    
    .cs-newsletter-input {
        padding: 10px 16px;
        font-size: 14px;
    }
    
    .cs-newsletter-btn {
        width: 45px;
        height: 45px;
        font-size: 16px;
    }
}
</style>