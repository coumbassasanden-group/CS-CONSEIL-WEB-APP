<script setup lang="ts">
const { get } = useApi()
const texts = ref<string[]>([])
const isLoading = ref(true);
const isSubcribe = ref(false);

const handleSubscribe = () => {
    isSubcribe.value = true
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
                    <div class="col-lg-6">
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
                                <div class="text-center">
                                    <button @click="handleSubscribe"  class="subscribe-button">S'abonner</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-6">
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
                        </div>
                    </div>
                </div>
                <subscription-compo v-if="isSubcribe" ></subscription-compo>
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
    background-color: var(--cs-brown-color);
    box-shadow: 0 4px 15px #d4b1284d;
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
</style>