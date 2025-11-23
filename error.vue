<template>
    <div class="error-page" data-theme="conseil">
        <div class="container">
            <div class="brand">
                <div class="logo">
                    <img src="~/assets/img/logo/logo-cs-conseil.png" alt="">
                </div>
            </div>

            <div class="error-content">
                <div class="error-code">{{ error!.statusCode || 500 }}</div>

                <h2 class="error-title">
                    <span v-if="error!.statusCode === 404">{{ $t('error.page_not_found') }}</span>
                    <span v-else>{{ $t('error.error_occurred') }}</span>
                </h2>

                <p class="error-message">
                    <span v-if="error!.statusCode === 404">
                        {{ $t('error.404_message') }}
                    </span>
                    <span v-else>
                        {{ error!.statusMessage || $t('error.default_message') }}
                    </span>
                </p>
                
                <div class="error-actions">
                    <button @click="goBack" class="btn btn-primary">
                        {{ $t('error.back') }}
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const error = useError()
const { t } = useI18n()

useHead({
    title: `${error.value?.statusCode || 500} - ${t('compagny')}`,
    meta: [
        { name: 'description', content: `${error.value?.statusCode || 500} - ${t('compagny')}` },
        { name: 'robots', content: 'noindex' }
    ]
})

const router = useRouter();

const goBack = () => {
  router.back();
}

</script>

<style scoped>
.error-page[data-theme="conseil"] {
    --cs-primary-color: #dab304;
    --cs-accent-color: #E7D7C5;
    --cs-light-accent: #3F2E1A;
    --cs-background-color: #FDF1D8;
}

.error-page[data-theme="group"] {
    --cs-primary-color: #3F2E1A;
    --cs-accent-color: #dab304;
    --cs-light-accent: #E7D7C5;
    --cs-background-color: #E7D7C5;
}

.error-page[data-theme="finance"] {
    --cs-primary-color: #0C657B;
    --cs-accent-color: #0C657B;
    --cs-light-accent: #A2E4F6;
    --cs-background-color: #A2E4F6;
}

.error-page[data-theme="tech"] {
    --cs-primary-color: #F9B233;
    --cs-accent-color: #F9B233;
    --cs-light-accent: #FEEFD7;
    --cs-background-color: #FEEFD7;
}

.error-page {
    min-height: 100vh;
    background: var(--cs-background-color);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    font-family: var(--cs-family-montserrat);
    transition: background-color 0.3s ease;
}

.container {
    max-width: 800px;
    width: 100%;
    text-align: center;
}

.brand {
    margin-bottom: 3rem;
}

.logo {
    width: 300px !important;
    height: auto !important;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    position: relative;
    margin-bottom: 1rem;
}

.logo img {
    width: 100% !important;
    height: 100% !important;
    object-fit: fill;
    -o-object-fit: fill;
}

.logo-circle {
    width: 60px;
    height: 60px;
    background: var(--cs-primary-color);
    border-radius: 50%;
    position: relative;
    transition: background-color 0.3s ease;
}

.logo-text {
    position: absolute;
    color: white;
    font-weight: 700;
    font-size: 1.2rem;
    letter-spacing: 1px;
}

.company-name {
    color: var(--cs-primary-color);
    font-size: 1.5rem;
    font-weight: 300;
    margin: 0;
    letter-spacing: 0.5px;
    transition: color 0.3s ease;
}

.error-content {
    background: white;
    border-radius: 16px;
    padding: 3rem 2rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    border: 1px solid var(--cs-light-accent);
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.error-code {
    font-size: 6rem;
    font-weight: 300;
    color: var(--cs-primary-color);
    margin: 0;
    line-height: 1;
    opacity: 0.7;
    transition: color 0.3s ease;
}

.error-title {
    color: var(--cs-primary-color);
    font-size: 2rem;
    font-weight: 400;
    margin: 1rem 0;
    transition: color 0.3s ease;
}

.error-message {
    color: var(--cs-primary-color);
    font-size: 1.1rem;
    line-height: 1.6;
    margin-bottom: 2.5rem;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
    transition: color 0.3s ease;
}

.error-actions {
    display: flex;
    justify-content: center;
    margin-bottom: 3rem;
}

.btn {
    padding: 0.875rem 2.5rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s ease;
    letter-spacing: 0.3px;
}

.btn-primary {
    background: var(--cs-primary-color);
    color: white;
}

.btn-primary:hover {
    opacity: 0.9;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.theme-selector {
    margin-top: 2rem;
    padding: 1rem;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 8px;
    border: 1px solid var(--cs-light-accent);
}

.theme-selector label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--cs-primary-color);
    font-weight: 500;
}

.theme-selector select {
    padding: 0.5rem;
    border-radius: 4px;
    border: 1px solid var(--cs-light-accent);
    background: white;
    color: var(--cs-primary-color);
}

/* Companies Section */
.companies-section {
    border-top: 1px solid var(--cs-light-accent);
    padding-top: 2.5rem;
    transition: border-color 0.3s ease;
}

.companies-title {
    color: var(--cs-primary-color);
    font-size: 1.1rem;
    font-weight: 500;
    margin-bottom: 2rem;
    opacity: 0.9;
    transition: color 0.3s ease;
}

.companies-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    max-width: 900px;
    margin: 0 auto;
}

.company-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: #FAFAFA;
    border-radius: 12px;
    border: 1px solid #F0F0F0;
    transition: all 0.3s ease;
}

.company-item:hover {
    background: white;
    border-color: var(--cs-light-accent);
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.company-logo {
    position: relative;
    width: 50px;
    height: 50px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.logo-shape {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 8px;
    opacity: 0.1;
    background: var(--cs-accent-color);
    transition: background-color 0.3s ease;
}

.logo-initials {
    font-weight: 700;
    font-size: 0.9rem;
    letter-spacing: 1px;
    z-index: 1;
    color: var(--cs-accent-color);
    transition: color 0.3s ease;
}

.company-info {
    flex: 1;
    text-align: left;
}

.company-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--cs-primary-color);
    margin: 0 0 0.25rem 0;
    line-height: 1.3;
    transition: color 0.3s ease;
}

.company-tagline {
    font-size: 0.875rem;
    color: #666;
    margin: 0;
    line-height: 1.4;
}

/* Responsive */
@media (max-width: 768px) {
    .error-page {
        padding: 1rem;
    }

    .error-content {
        padding: 2rem 1.5rem;
    }

    .error-code {
        font-size: 4rem;
    }

    .error-title {
        font-size: 1.5rem;
    }

    .error-actions {
        margin-bottom: 2.5rem;
    }

    .btn {
        width: 200px;
    }

    .companies-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .company-item {
        padding: 1.25rem;
    }

    .company-name {
        font-size: 0.95rem;
    }

    .company-tagline {
        font-size: 0.825rem;
    }
}

@media (max-width: 480px) {
    .logo-circle {
        width: 50px;
        height: 50px;
    }

    .logo-text {
        font-size: 1rem;
    }

    .error-content {
        padding: 1.5rem 1rem;
    }
}
</style>