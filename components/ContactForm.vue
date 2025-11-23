<script setup>
import { nextTick, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n()
const { get, post } = useApi();
const config = useRuntimeConfig();
// État du formulaire
const formData = ref({
    company_name: '',
    email: '',
    contact_object_id: '',
    message: ''
})

// État pour les objets de contact
const contactObjects = ref([])

// État pour la gestion des erreurs et du statut de soumission
const errors = ref({})
const isSubmitting = ref(false)
const submitStatus = ref(null) // 'success', 'error', null
const submitMessage = ref('')
const isLoadingContactObjects = ref(false)

// Récupération des objets de contact avec gestion d'erreur améliorée
const fetchContactObjects = async () => {
    isLoadingContactObjects.value = true
    try {
        const data = await get('/api/contact-objects');
        contactObjects.value = data;
    } catch (error) {
        console.error('Erreur lors de la récupération des objets de contact:', error);
        // Vous pouvez ajouter une notification d'erreur ici si nécessaire
        contactObjects.value = [] // Fallback en cas d'erreur
    } finally {
        isLoadingContactObjects.value = false
    }
};

// Validation du formulaire avec messages d'erreur améliorés
const validateForm = () => {
    const newErrors = {}

    // Validation nom de l'entreprise
    if (!formData.value.company_name.trim()) {
        newErrors.company_name = t('contact.form.errors.company_name_required')
    } else if (formData.value.company_name.trim().length < 2) {
        newErrors.company_name = t('contact.form.errors.company_name_too_short')
    }

    // Validation email
    if (!formData.value.email.trim()) {
        newErrors.email = t('contact.form.errors.email_required')
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.value.email.trim())) {
            newErrors.email = t('contact.form.errors.email_invalid')
        }
    }

    // Validation objet de contact
    if (!formData.value.contact_object_id) {
        newErrors.contact_object_id = t('contact.form.errors.subject_required')
    }

    // Validation message
    if (!formData.value.message.trim()) {
        newErrors.message = t('contact.form.errors.message_required')
    } else if (formData.value.message.trim().length < 10) {
        newErrors.message = t('contact.form.errors.message_too_short')
    }

    // Nettoyage et mise à jour des erreurs
    Object.keys(errors.value).forEach(key => {
        delete errors.value[key]
    })

    Object.keys(newErrors).forEach(key => {
        errors.value[key] = newErrors[key]
    })

    return Object.keys(newErrors).length === 0
}

// Réinitialisation du formulaire
const resetForm = () => {
    formData.value = {
        company_name: '',
        email: '',
        contact_object_id: '',
        message: ''
    }
    
    // Nettoyer les erreurs
    Object.keys(errors.value).forEach(key => {
        delete errors.value[key]
    })
}

// Réinitialisation du statut après un délai
const resetStatusAfterDelay = (delay = 5000) => {
    setTimeout(() => {
        if (submitStatus.value) {
            submitStatus.value = null
            submitMessage.value = ''
        }
    }, delay)
}

// Soumission du formulaire avec gestion d'erreur améliorée
const submitForm = async (event) => {
    event.preventDefault()

    // Réinitialiser le statut précédent
    submitStatus.value = null
    submitMessage.value = ''

    // Validation côté client
    if (!validateForm()) {
        // Faire défiler vers la première erreur
        await nextTick()
        const firstErrorElement = document.querySelector('.is-invalid')
        if (firstErrorElement) {
            firstErrorElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'center' 
            })
            firstErrorElement.focus()
        }
        return
    }

    // Début de la soumission
    isSubmitting.value = true

    try {
        // Préparation des données (nettoyage des espaces)
        const cleanedData = {
            company_name: formData.value.company_name.trim(),
            email: formData.value.email.trim().toLowerCase(),
            contact_object_id: formData.value.contact_object_id,
            message: formData.value.message.trim()
        }

        // Envoi des données
        const response = await post('/api/contact-message', cleanedData)

        // Gestion du succès
        submitStatus.value = 'success'
        submitMessage.value = response?.message || t('contact.form.success')

        // Réinitialiser le formulaire après succès
        resetForm()

        // Faire défiler vers le haut pour voir le message de succès
        window.scrollTo({ 
            top: 0, 
            behavior: 'smooth' 
        })

        // Réinitialiser le statut après 7 secondes pour le succès
        resetStatusAfterDelay(7000)

    } catch (error) {
        // Gestion des erreurs
        submitStatus.value = 'error'
        
        // Gestion des différents types d'erreurs
        if (error.response) {
            // Erreur de réponse du serveur
            const status = error.response.status
            const errorData = error.response.data
            
            if (status === 422 && errorData.errors) {
                // Erreurs de validation côté serveur
                Object.keys(errorData.errors).forEach(key => {
                    if (errorData.errors[key] && errorData.errors[key].length > 0) {
                        errors.value[key] = errorData.errors[key][0]
                    }
                })
                submitMessage.value = t('contact.form.validation_error')
            } else if (status === 429) {
                // Trop de requêtes
                submitMessage.value = t('contact.form.rate_limit_error')
            } else if (status >= 500) {
                // Erreur serveur
                submitMessage.value = t('contact.form.server_error')
            } else {
                // Autres erreurs
                submitMessage.value = errorData.message || t('contact.form.error')
            }
        } else if (error.request) {
            // Erreur de réseau/connexion
            submitMessage.value = t('contact.form.network_error')
        } else {
            // Autres erreurs
            submitMessage.value = t('contact.form.error')
        }

        console.error('Erreur lors de l\'envoi du formulaire:', error)

        // Réinitialiser le statut après 10 secondes pour les erreurs
        resetStatusAfterDelay(10000)

    } finally {
        // Fin du chargement
        isSubmitting.value = false
    }
}

// Nettoyage des erreurs lors de la saisie
const clearFieldError = (fieldName) => {
    if (errors.value[fieldName]) {
        delete errors.value[fieldName]
    }
}

// Chargement initial
onMounted(() => {
    fetchContactObjects()
})
</script>

<template>
    <div class="tp-join-area fix tp-border-middle tp-border-bottom pt-80 pb-50">
        <div class="container-fluid p-0">
            <div class="row">
                <div class="col-lg-6">
                    <div class="tp-join-thumb p-relative mr-65 mb-30 bg-danger ps-2">
                        <img :src="`${config.public.apiBaseUrl}/storage/images_folder/conseil_contact.jpg`" class="p-absolute" alt="">
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="tp-join-form-wrap mb-30">
                        <h3 class="mb-20 wow img-custom-anim-right" data-wow-duration="1.5s" data-wow-delay="0.2s">
                            {{ $t('contact.form.title') }}
                        </h3>
                        <p class="tp-text-grey-1 mb-30">{{ $t('contact.form.subtitle') }}</p>

                        <form @submit="submitForm" novalidate>
                            <!-- Messages de statut améliorés -->
                            <div v-if="submitStatus === 'success'" class="alert alert-success mb-15 d-flex align-items-center">
                                <i class="fas fa-check-circle me-2"></i>
                                {{ submitMessage || $t('contact.form.success') }}
                            </div>
                            <div v-if="submitStatus === 'error'" class="alert alert-danger mb-15 d-flex align-items-center">
                                <i class="fas fa-exclamation-triangle me-2"></i>
                                {{ submitMessage || $t('contact.form.error') }}
                            </div>

                            <!-- Nom de l'entreprise -->
                            <div class="mb-15">
                                <input 
                                    class="tp-input" 
                                    :class="{ 'is-invalid': errors.company_name }" 
                                    type="text"
                                    v-model="formData.company_name" 
                                    :placeholder="$t('contact.form.company_name')"
                                    :disabled="isSubmitting"
                                    @input="clearFieldError('company_name')"
                                    maxlength="100"
                                >
                                <div v-if="errors.company_name" class="invalid-feedback">
                                    {{ errors.company_name }}
                                </div>
                            </div>

                            <!-- Email -->
                            <div class="mb-15">
                                <input 
                                    class="tp-input" 
                                    :class="{ 'is-invalid': errors.email }" 
                                    type="email"
                                    v-model="formData.email" 
                                    :placeholder="$t('contact.form.email')"
                                    :disabled="isSubmitting"
                                    @input="clearFieldError('email')"
                                    maxlength="100"
                                >
                                <div v-if="errors.email" class="invalid-feedback">
                                    {{ errors.email }}
                                </div>
                            </div>

                            <!-- Objet -->
                            <div class="mb-15">
                                <select 
                                    class="tp-input" 
                                    :class="{ 'is-invalid': errors.contact_object_id }"
                                    v-model="formData.contact_object_id"
                                    :disabled="isSubmitting || isLoadingContactObjects"
                                    @change="clearFieldError('contact_object_id')"
                                >
                                    <option value="">
                                        {{ isLoadingContactObjects ? $t('contact.form.loading_subjects') : $t('contact.form.select_subject') }}
                                    </option>
                                    <option v-for="object in contactObjects" :key="object.value" :value="object.value">
                                        {{ object.label }}
                                    </option>
                                </select>
                                <div v-if="errors.contact_object_id" class="invalid-feedback">
                                    {{ errors.contact_object_id }}
                                </div>
                            </div>

                            <!-- Message -->
                            <div class="mb-15">
                                <textarea 
                                    class="tp-textarea tp-input" 
                                    :class="{ 'is-invalid': errors.message }"
                                    v-model="formData.message" 
                                    :placeholder="$t('contact.form.message')"
                                    :disabled="isSubmitting"
                                    @input="clearFieldError('message')"
                                    rows="5"
                                    maxlength="1000"
                                ></textarea>
                                <div v-if="errors.message" class="invalid-feedback">
                                    {{ errors.message }}
                                </div>
                                <small class="text-muted">
                                    {{ formData.message.length }}/1000
                                </small>
                            </div>

                            <!-- Bouton de soumission -->
                            <button 
                                type="submit"
                                class="tp-btn-xl tp-round-4 fs-16 cs-bg-gold w-100 d-block tp-text-common-white hover-text-white fw-500"
                                :disabled="isSubmitting"
                                :class="{ 'opacity-75': isSubmitting }"
                            >
                                <span class="btn-text">
                                    {{ isSubmitting ? $t('contact.form.sending') : $t('contact.form.send') }}
                                </span>
                                <span v-if="isSubmitting" class="spinner-border spinner-border-sm ms-2" role="status">
                                    <span class="visually-hidden">{{ $t('contact.form.loading') }}</span>
                                </span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Styles originaux conservés */
.is-invalid {
    border-color: #dc3545 !important;
    box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25) !important;
}

.invalid-feedback {
    color: #dc3545;
    font-size: 0.875em;
    margin-top: 0.25rem;
}

.alert {
    animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
    from {
        opacity: 0;
        transform: translateY(-10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.tp-input:disabled,
.tp-textarea:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.text-muted {
    font-size: 0.8rem;
    margin-top: 0.25rem;
    display: block;
    text-align: right;
}

/* Améliorations responsive uniquement */
@media (max-width: 991.98px) {
    .tp-join-area {
        flex-direction: column;
    }
    
    .tp-join-thumb {
        margin-right: 0 !important;
        margin-bottom: 20px;
    }
    
    .tp-join-form-wrap {
        padding: 0 15px;
    }
}

@media (max-width: 767.98px) {
    .tp-join-area .pt-80 {
        padding-top: 40px !important;
    }
    
    .tp-join-area .pb-50 {
        padding-bottom: 30px !important;
    }
    
    .tp-join-thumb {
        height: 300px;
        overflow: hidden;
    }
    
    .tp-join-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        position: relative !important;
    }
    
    .tp-join-form-wrap {
        padding: 20px 15px;
        margin-bottom: 0 !important;
    }
    
    .tp-join-form-wrap h3 {
        font-size: 1.5rem;
        margin-bottom: 15px;
    }
    
    .tp-join-form-wrap p {
        margin-bottom: 20px;
        font-size: 0.9rem;
    }
}

@media (max-width: 575.98px) {
    .tp-join-area .pt-80 {
        padding-top: 30px !important;
    }
    
    .tp-join-area .pb-50 {
        padding-bottom: 20px !important;
    }
    
    .tp-join-thumb {
        height: 250px;
        margin-bottom: 15px;
        padding-left: 0 !important;
    }
    
    .tp-join-form-wrap {
        padding: 15px 10px;
    }
    
    .tp-join-form-wrap h3 {
        font-size: 1.3rem;
        margin-bottom: 12px;
    }
    
    .tp-join-form-wrap p {
        margin-bottom: 15px;
        font-size: 0.85rem;
    }
    
    .mb-15 {
        margin-bottom: 12px !important;
    }
    
    .tp-input,
    .tp-textarea {
        font-size: 14px;
    }
}

/* Fix pour éviter les chevauchements */
@media (max-width: 991.98px) {
    .tp-join-thumb.p-relative {
        position: relative !important;
    }
    
    .tp-join-thumb img.p-absolute {
        position: relative !important;
    }
}
</style>