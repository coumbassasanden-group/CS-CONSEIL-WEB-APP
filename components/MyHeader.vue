<script setup lang="ts">

const route = useRoute();
const localePath = useLocalePath();
const dropdownRef = ref<HTMLElement | null>(null)

const showDevelopmentAlert = (e: Event) => {
    e.preventDefault();
    alert('En cours de développement');
}

const { currentLanguage, languages, changeLanguage } = useLanguage();

const isDropdownOpen = ref(false)

const toggleDropdown = () => {
    isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
    isDropdownOpen.value = false
}

const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement
    if (dropdownRef.value && !dropdownRef.value.contains(target)) {
        isDropdownOpen.value = false
    }
}

const menuItems = ref([
    { text: 'header.index', path: 'index' },
    { text: 'header.services', path: 'services' },
    { text: 'header.events', path: 'events' },
    { text: 'header.news', path: 'news' },
    { text: 'header.stationery', path: 'stationery', icon: 'fa-solid fa-store' }
])

// Gestion du menu mobile
const isOffcanvasOpen = ref(false)

const toggleOffcanvas = () => {
    isOffcanvasOpen.value = !isOffcanvasOpen.value
    const offcanvas = document.querySelector(".tpoffcanvas")
    const overlay = document.querySelector(".body-overlay")

    if (isOffcanvasOpen.value) {
        offcanvas?.classList.add("opened")
        overlay?.classList.add("apply")
    } else {
        offcanvas?.classList.remove("opened")
        overlay?.classList.remove("apply")
    }
}

const closeOffcanvas = () => {
    isOffcanvasOpen.value = false
    const offcanvas = document.querySelector(".tpoffcanvas")
    const overlay = document.querySelector(".body-overlay")
    offcanvas?.classList.remove("opened")
    overlay?.classList.remove("apply")
}


// Déterminer si un lien est actif en fonction de la route
const setActive = (name: string) => {
    if (name === localePath('index') && route.path !== localePath('index')) {
        return ''; // Ne pas activer '/' si ce n'est pas la route exacte
    }
    return route.path.startsWith(name) ? 'current' : '';
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
    <!-- <PhoneMenu/> -->
    <div class="tpoffcanvas-area">
        <div class="tpoffcanvas">
            <div class="tpoffcanvas__close-btn">
                <button class="close-btn" @click="closeOffcanvas"><i class="fal fa-times"></i></button>
            </div>
            <div class="tpoffcanvas__logo">
                <NuxtLink :to="localePath('index')">
                    <img data-width="140" src="/assets/img/logo/logo-cs-conseil.png" alt="logo">
                </NuxtLink>
            </div>
            <div class="tp-offcanvas-menu">
                <nav>
                    <ul>
                        <li @click="closeOffcanvas" v-for="item in menuItems" :key="item.path">
                            <NuxtLink :to="localePath(item.path)" :class="setActive(localePath(item.path))">
                                <i v-if="setActive(localePath(item.path)) === 'current'" class="fa-solid fa-chevrons-right"></i>
                                {{ $t(item.text) }}
                                <i v-if="item.icon" :class="item.icon"></i>
                            </NuxtLink>
                        </li>
                        <li>
                            <a href="https://altconnect.africa/login-user" target="_blank" rel="noopener noreferrer">
                                {{ $t('header.alt_connect') }}
                                <i class="fa-solid fa-arrow-up-right-from-square"></i>
                            </a>
                        </li>

                        <li @click="closeOffcanvas">
                            <NuxtLink :to="localePath('alt-news')" :class="setActive(localePath('alt-news'))">
                                <i v-if="setActive(localePath('alt-news')) === 'current'"
                                    class="fa-solid fa-chevrons-right"></i>
                                {{ $t('header.alt-news') }}
                            </NuxtLink>
                        </li>
                    </ul>
                </nav>
            </div>
            <div class="tpoffcanvas-btn-1 mb-50" @click="closeOffcanvas">
                <NuxtLink :to="localePath('contact')" 
                    :class="['tpoffcanvas-btn', setActive(localePath('contact'))]">
                    {{ $t('header.contact') }}
                </NuxtLink>
            </div>
            <div class="tpoffcanvas__contact-info">
                <div class="tpoffcanvas__contact-title"> 
                    <h5>{{ $t('constant.contact_us') }}</h5>
                </div>
                <ul>
                    <li>
                        <span>
                            <svg width="15" height="17" viewBox="0 0 15 17" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M13.2727 7.13636C13.2727 11.9091 7.13636 16 7.13636 16C7.13636 16 1 11.9091 1 7.13636C1 5.5089 1.64651 3.94809 2.7973 2.7973C3.94809 1.64651 5.5089 1 7.13636 1C8.76383 1 10.3246 1.64651 11.4754 2.7973C12.6262 3.94809 13.2727 5.5089 13.2727 7.13636Z"
                                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                    stroke-linejoin="round" />
                                <path
                                    d="M7.13629 9.18243C8.26596 9.18243 9.18174 8.26665 9.18174 7.13698C9.18174 6.00731 8.26596 5.09152 7.13629 5.09152C6.00662 5.09152 5.09084 6.00731 5.09084 7.13698C5.09084 8.26665 6.00662 9.18243 7.13629 9.18243Z"
                                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                    stroke-linejoin="round" />
                            </svg>
                        </span>
                         <span class="poppins">{{ $t('constant.address') }}</span>
                    </li>
                    <li>
                        <span>
                            <svg width="17" height="14" viewBox="0 0 17 14" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M2.5 1H14.5C15.325 1 16 1.675 16 2.5V11.5C16 12.325 15.325 13 14.5 13H2.5C1.675 13 1 12.325 1 11.5V2.5C1 1.675 1.675 1 2.5 1Z"
                                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
                                    stroke-linejoin="round" />
                                <path d="M16 2.5L8.5 7.75L1 2.5" stroke="currentColor" stroke-width="1.5"
                                    stroke-linecap="round" stroke-linejoin="round" />
                            </svg>
                        </span>
                        <a href="mailto:hello@contact.com"><span>contact@coumbassa-sanden.com</span></a>
                    </li>
                    <li>
                        <span>
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M2.24434 7.95965C1.58072 6.80251 1.26029 5.85764 1.06709 4.89985C0.781336 3.4833 1.43527 2.09956 2.51857 1.21663C2.97641 0.843468 3.50126 0.970963 3.772 1.45668L4.38323 2.55324C4.8677 3.4224 5.10994 3.85698 5.06189 4.31771C5.01385 4.77845 4.68716 5.1537 4.03378 5.9042L2.24434 7.95965ZM2.24434 7.95965C3.58755 10.3018 5.69549 12.4109 8.04035 13.7557M8.04035 13.7557C9.19749 14.4193 10.1424 14.7397 11.1002 14.9329C12.5167 15.2187 13.9004 14.5647 14.7834 13.4814C15.1565 13.0236 15.029 12.4987 14.5433 12.228L13.4468 11.6168C12.5776 11.1323 12.143 10.8901 11.6823 10.9381C11.2215 10.9862 10.8463 11.3128 10.0958 11.9662L8.04035 13.7557Z"
                                    stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                                <path
                                    d="M9.40002 4.3823C10.3963 4.80537 11.1947 5.60374 11.6178 6.6M9.85784 1C12.3339 1.71453 14.2854 3.66597 15 6.14194"
                                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
                            </svg>
                        </span>
                        <a href="tel:(+00)67834598568">(+225) 07 10 10 29 43</a>
                    </li>
                </ul>
            </div>
            <div class="tpoffcanvas__social text-center">
                <div class="social-icon">
                    <a href="#" class="bg-light border-primary mx-2">
                        <i class="fa-brands fa-linkedin fs-2 text-primary"></i>
                    </a>
                    <a href="#" class="bg-light border-danger mx-2">
                        <i class="fa-brands fa-youtube fs-2 text-danger"></i>
                    </a>
                </div>
            </div>
        </div>
    </div>
    <div class="body-overlay" @click="closeOffcanvas"></div>
    <header class="tp-header-height">

        <!-- tp-header-area-start -->
        <div class="tp-header-area tp-header-2-wrap">
            <div class="tp-header-3-top tp-header-4-top d-none d-xl-block cs-bg-dark">

            </div>
            <div id="header-sticky" class="tp-header-2-main tp-header-lg-space p-relative">
                <div class="container container-1690">
                    <div class="row align-items-center">
                        <!-- Logo - responsive width -->
                        <div class="col-xxl-2 col-xl-2 col-lg-3 col-md-3 col-sm-3 col-4">
                            <div class="tp-header-left">
                                <div class="tp-header-logo">
                                    <NuxtLink :to="localePath('index')">
                                        <img data-width="168"
                                            src="~/assets/img/logo/logo-cs-conseil.png" 
                                            alt="cs-conseil-logo"
                                            class="responsive-logo">
                                    </NuxtLink>
                                </div>
                            </div>
                        </div>
                        <!-- Navigation and controls -->
                        <div class="col-xxl-10 col-xl-10 col-lg-9 col-md-9 col-sm-9 col-8">
                            <div class="tp-header-2-right d-flex align-items-center justify-content-end">
                                <!-- Desktop Menu - Only on screens 1400px and above -->
                                <div class="tp-main-menu d-none" :class="{'d-xxl-block': true}">
                                    <nav class="nav">
                                        <ul class="compact-menu">
                                            <li v-for="item in menuItems" :key="item.path">
                                                <NuxtLink :to="localePath(item.path)"
                                                    :class="setActive(localePath(item.path))">
                                                    {{ $t(item.text) }}
                                                    <i v-if="item.icon" :class="item.icon"></i>
                                                </NuxtLink>
                                            </li>
                                            <li>
                                                <a href="https://altconnect.africa/login-user" target="_blank"
                                                    rel="noopener noreferrer">
                                                    {{ $t('header.alt_connect') }}
                                                    <i class="fa-solid fa-arrow-up-right-from-square"></i>
                                                </a>
                                            </li>
                                            <li>
                                                <NuxtLink :to="localePath('alt-news')"
                                                    :class="setActive(localePath('alt-news'))">
                                                    {{ $t('header.alt-news') }}
                                                </NuxtLink>
                                            </li>
                                            <li>
                                                <a target="_blank" href=" https://officielimmobilier.net/"
                                                    rel="noopener noreferrer">
                                                     Officiel de l'immobilier
                                                </a>
                                            </li>
                                           
                                        </ul>
                                    </nav>
                                </div>
                                
                                <!-- Header Controls -->
                                <div class="tp-header-contact d-flex align-items-center justify-content-end">
                                    <!-- Contact Button - Only on very large screens when menu is visible -->
                                    <div class="tp-header-2-btn d-none" :class="{'d-xxl-inline-block': true}">
                                        <NuxtLink :to="localePath('contact')"
                                            :class="['tp-btn-compact d-inline-block lh-0 tp-round-24 contact-btn ls-0 tp-btn-switch-animation tp-text-theme-primary fw-500', setActive(localePath('contact'))]">
                                            <span class="d-flex align-items-center justify-content-center">
                                                <span class="btn-text"> {{ $t('header.contact') }} </span>
                                                <span class="btn-icon"><i class="fa-sharp fa-regular fa-arrow-right"></i></span>
                                                <span class="btn-icon"><i class="fa-sharp fa-regular fa-arrow-right"></i></span>
                                            </span>
                                        </NuxtLink>
                                    </div>
                                    
                                    <!-- Language Selector - Always visible but compact -->
                                    <div class="language-selector" ref="dropdownRef">
                                        <button @click.stop="toggleDropdown" class="language-btn tp-round-24">
                                            <span class="language-flag">{{languages.find(lang => lang.code === currentLanguage)?.flag}}</span>
                                            <span class="language-code d-none d-md-inline">{{languages.find(lang => lang.code === currentLanguage)?.code.toUpperCase()}}</span>
                                            <i class="bi bi-chevron-down d-none d-md-inline"></i>
                                        </button>
                                        <div class="language-dropdown" :class="{ 'show': isDropdownOpen }">
                                            <button v-for="lang in languages" :key="lang.code"
                                                @click="changeLanguage(lang.code); closeDropdown()"
                                                :class="{ 'active': currentLanguage === lang.code }"
                                                class="dropdown-item">
                                                <span class="flag">{{ lang.flag }}</span>
                                                <span class="lang-name">{{ lang.name }}</span>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <!-- Mobile Menu Button - Visible when desktop menu is hidden -->
                                    <div class="tp-header-sidebar-menu d-inline-block" :class="{'d-xxl-none': true}">
                                        <button @click="toggleOffcanvas"
                                            class="tp-menu-bar tp-header-sidebar-btn border-full-1 rounded-circle lh-1">
                                            <svg width="18" height="16" viewBox="0 0 18 16" fill="none"
                                                xmlns="http://www.w3.org/2000/svg">
                                                <path fill-rule="evenodd" clip-rule="evenodd"
                                                    d="M0 7.23636H7.45455L3.74545 0.763636L5.05455 0L8.8 6.47273L12.5455 0L13.8545 0.763636L10.1091 7.23636H17.6V8.76364H10.1091L13.8545 15.2364L12.5455 16L8.8 9.52727L5.05455 16L3.74545 15.2364L7.45455 8.76364H0V7.23636Z"
                                                    fill="currentColor"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- tp-header-area-end -->

    </header>
</template>

<style scoped>
/* Logo responsive */
.responsive-logo {
    width: 168px;
    height: auto;
    max-width: 100%;
}

@media (max-width: 1399.98px) {
    .responsive-logo {
        width: 150px;
    }
}

@media (max-width: 991.98px) {
    .responsive-logo {
        width: 140px;
    }
}

@media (max-width: 575.98px) {
    .responsive-logo {
        width: 120px;
    }
}

/* Contact button - Desktop version with more padding */
.tp-btn-compact {
    font-size: 14px !important;
    padding: 0.7rem 1.5rem !important;
}

/* Contact button mobile (offcanvas) - Same style as desktop */
.tpoffcanvas-btn {
    font-size: 14px !important;
    padding: 0.7rem 1.5rem !important;
    background-color: var(--cs-light-brown-color) !important;
    color: var(--cs-bg-dark-color) !important;
    font-weight: 700 !important;
    font-family: var(--cs-family-montserrat) !important;
    border-radius: 24px !important;
    text-decoration: none !important;
    display: inline-block !important;
    transition: all 0.3s ease !important;
}

.tpoffcanvas-btn:hover {
    background-color: var(--cs-gold-color) !important;
    color: var(--cs-bg-dark-color) !important;
}

/* Contact button mobile active state */
.tpoffcanvas-btn.current {
    background-color: var(--cs-gold-color) !important;
    color: var(--cs-bg-dark-color) !important;
}

/* Language selector mobile (offcanvas) */
.tpoffcanvas-language-selector {
    padding: 1rem;
    border-top: 1px solid rgba(162, 228, 246, 0.2);
    margin-top: 1rem;
}

.language-selector-mobile {
    position: relative;
    width: 100%;
}

.language-btn-mobile {
    background-color: var(--cs-brown-color);
    border: none;
    color: var(--cs-light-brown-color);
    padding: 0.8rem 1.2rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.7rem;
    font-weight: 500;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
    font-size: 14px;
    border-radius: 24px;
}

.language-btn-mobile:hover {
    background-color: var(--cs-gold-color);
    color: var(--cs-brown-color);
}

.language-btn-mobile i {
    font-size: 0.8rem;
    transition: transform 0.3s ease;
}

.language-btn-mobile:hover i {
    transform: rotate(180deg);
}

.language-dropdown-mobile {
    position: absolute;
    bottom: calc(100% + 0.5rem);
    left: 0;
    right: 0;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    opacity: 0;
    visibility: hidden;
    transform: translateY(10px);
    transition: all 0.3s ease;
    overflow: hidden;
    border: 1px solid rgba(162, 228, 246, 0.3);
    z-index: 9999;
}

.language-dropdown-mobile.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.dropdown-item-mobile {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    width: 100%;
    padding: 0.8rem 1.2rem;
    border: none;
    background: none;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #3F2E1A;
    font-family: var(--cs-family-poppins);
    font-weight: 500;
    justify-content: center;
}

.dropdown-item-mobile:hover {
    background-color: rgba(162, 228, 246, 0.1);
    color: #0C657B;
}

.dropdown-item-mobile.active {
    background-color: rgba(12, 101, 123, 0.05);
    color: #0C657B;
    font-weight: 600;
}

.dropdown-item-mobile:not(:last-child) {
    border-bottom: 1px solid rgba(162, 228, 246, 0.1);
}

.contact-btn {
    background-color: var(--cs-light-brown-color);
}

.current.contact-btn {
    background-color: var(--cs-gold-color);
}

.contact-btn .btn-text {
    font-weight: 700;
    color: var(--cs-bg-dark-color);
    transition: all 0.3s ease;
    font-family: var(--cs-family-montserrat) !important;
}

/* Navigation - Compact menu */
.compact-menu {
    display: flex;
    gap: 1;
    flex-wrap: nowrap;
}

.compact-menu li a {
    padding: 0.4rem 0.8rem !important;
    font-size: 14px !important;
    white-space: nowrap;
}

nav ul li a {
    transition: all 0.3s ease;
    font-family: var(--cs-family-montserrat) !important;
    font-size: 16px;
    font-weight: 700;
    color: var(--cs-bg-dark-color);
}

nav ul li a.current,
nav ul li a:hover {
    color: var(--cs-bg-dark-color) !important;
    background-color: var(--cs-gold-color) !important;
}

.tp-offcanvas-menu ul li a.current {
    padding-left: 20px;
}

/* Language selector - More compact */
.language-selector {
    position: relative;
    margin-left: 0.5rem;
    padding: 2px !important;
    z-index: 9999;
}

.language-btn {
    background-color: var(--cs-brown-color);
    border: none;
    color: var(--cs-light-brown-color);
    padding: 0.5rem 0.7rem;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-weight: 500;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    min-width: 45px;
    justify-content: center;
    font-size: 13px;
}

@media (min-width: 768px) {
    .language-btn {
        padding: 0.5rem 0.8rem;
        gap: 0.5rem;
        min-width: auto;
        justify-content: flex-start;
        font-size: 14px;
    }
}

.language-btn:hover {
    background-color: var(--cs-gold-color);
    color: var(--cs-brown-color);
}

.language-btn i {
    font-size: 0.8rem;
    transition: transform 0.3s ease;
}

.language-btn:hover i {
    transform: rotate(180deg);
}

.language-flag {
    font-size: 1.1rem;
}

.language-code {
    font-size: 0.9rem;
    font-weight: 600;
}

/* Language dropdown */
.language-dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    min-width: 160px;
    overflow: hidden;
    border: 1px solid rgba(162, 228, 246, 0.3);
    z-index: 9999;
}

.language-dropdown.show {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.7rem;
    width: 100%;
    padding: 0.8rem 1.2rem;
    border: none;
    background: none;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #3F2E1A;
    font-family: var(--cs-family-poppins);
    font-weight: 500;
}

.dropdown-item:hover {
    background-color: rgba(162, 228, 246, 0.1);
    color: #0C657B;
}

.dropdown-item.active {
    background-color: rgba(12, 101, 123, 0.05);
    color: #0C657B;
    font-weight: 600;
}

.dropdown-item:not(:last-child) {
    border-bottom: 1px solid rgba(162, 228, 246, 0.1);
}

.flag {
    font-size: 1.1rem;
}

.lang-name {
    font-size: 0.9rem;
    font-weight: 400;
}

/* Prevent wrapping and ensure proper spacing */
.tp-header-contact {
    flex-wrap: nowrap;
    gap: 0.3rem;
    margin-left: auto;
}

.tp-header-2-right {
    min-width: 0;
    flex: 1;
    overflow: visible;
    position: relative;
}

/* Force single line layout */
.tp-main-menu nav ul {
    white-space: nowrap;
    overflow: visible;
}

.tp-main-menu nav ul li {
    display: inline-block;
}

/* Mobile adjustments */
@media (max-width: 575.98px) {
    .tp-header-contact {
        gap: 0.2rem;
    }
    
    .language-selector {
        margin-left: 0.2rem;
    }
    
    .tp-header-sidebar-menu {
        margin-left: 0.2rem !important;
    }
}

/* Custom breakpoint for problematic range */
@media (min-width: 1200px) and (max-width: 1399.98px) {
    .compact-menu li a {
        padding: 0.3rem 0.6rem !important;
        font-size: 13px !important;
    }
    
    .language-btn {
        padding: 0.4rem 0.6rem;
        font-size: 12px;
    }
    
    .tp-header-contact {
        gap: 0.2rem;
    }
}

/* Offcanvas slide from left */
.tpoffcanvas {
    position: fixed;
    top: 0;
    left: -320px;
    width: 320px;
    height: 100vh;
    background: white;
    transition: left 0.3s ease;
    z-index: 9999;
    overflow-y: auto;
}

.tpoffcanvas.opened {
    left: 0;
}

.body-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    opacity: 0;
    visibility: hidden;
    transition: all 0.3s ease;
    z-index: 9998;
}

.body-overlay.apply {
    opacity: 1;
    visibility: visible;
}

/* Offcanvas close button adjustment */
.tpoffcanvas__close-btn .close-btn {
    margin-top: 40px;
    margin-right: 0px;
}
</style>