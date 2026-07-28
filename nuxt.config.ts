
// const prefix = process.env.PREFIX || '/next-coumbassa-sanden/'
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  devtools: { enabled: true },
  ssr: false,

  runtimeConfig: {
    public: {
      apiBaseUrl: process.env.API_BASE_URL || 'https://nextapi.coumbassa-sanden.com',
      apiSubcriptionUrl: process.env.API_SUBSCRIPTION_URL || 'https://nextapi.coumbassa-sanden.com/api/',
      checkoutApiBase:'https://cs-pay.coumbassa-sanden.com',
      CS_JEKO_BUSINESS:'dd76c26d-0131-40b3-9e68-c493731652a3',
      CS_JEKO_RETURN_URL: 'https://conseil.coumbassa-sanden.com/fr/subscriber/manage',
      CS_JEKO_PROD: 100 ,
      CS_JEKO_PAYMENT_METHOD: process.env.CS_JEKO_PAYMENT_METHOD || 'wave',
    }
    //http://213.199.36.68:5020
  },

  css: [
    '/assets/css/bootstrap.min.css',
    '/assets/css/animate.css',
    '/assets/css/swiper-bundle.css',
    '/assets/css/slick.css',
    '/assets/css/magnific-popup.css',
    '/assets/css/font-awesome-pro.css',
    '/assets/css/spacing.css',
    '/assets/css/main.css'
  ],

  app: {
    // baseURL: '/dev_alt-news',
    // buildAssetsDir: '/next-coumbassa-sanden/',
    // head: {
    //   script: [
    //     { src: prefix+'js/vendor/jquery.js' },
    //     { src: prefix+'js/bootstrap-bundle.js' },
    //     { src: prefix+'js/swiper-bundle.js' },
    //     { src: prefix+'js/magnific-popup.js' },
    //     { src: prefix+'js/nice-select.js' },
    //     { src: prefix+'js/purecounter.js' },
    //     { src: prefix+'js/wow.js' },
    //     { src: prefix+'js/isotope-pkgd.js' },
    //     { src: prefix+'js/imagesloaded-pkgd.js' },
    //     { src: prefix+'js/ajax-form.js' },
    //     { src: prefix+'js/jarallax.js' },
    //     { src: prefix+'js/parallax.js' },
    //     { src: prefix+'js/parallax-scrool.js' },
    //     { src: prefix+'js/slider-init.js' },
    //     { src: prefix+'js/main.js' }
    //   ]
    // }
    head: {
      script: [
        // Google Tag Manager
        {
          innerHTML: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-WMX8QZBN');`,
          type: 'text/javascript',
        },
        { src: '/js/vendor/jquery.js',},
        { src: '/js/bootstrap-bundle.js', defer: true },
        { src: '/js/swiper-bundle.js', defer: true },
        { src: '/js/magnific-popup.js', defer: true },
        { src: '/js/nice-select.js', defer: true },
        { src: '/js/purecounter.js', defer: true },
        { src: '/js/wow.js', defer: true },
        { src: '/js/isotope-pkgd.js', defer: true },
        { src: '/js/imagesloaded-pkgd.js', defer: true },
        { src: '/js/ajax-form.js', defer: true },
        { src: '/js/jarallax.js', defer: true },
        { src: '/js/parallax.js', defer: true },
        { src: '/js/slider-init.js', defer: true },
        { src: '/js/main.js', defer: true }
      ],
    }
  },
  i18n: {
    bundle: {
      optimizeTranslationDirective: false
    },
    locales: [
      { code: 'en', language: 'en-US', file: 'en.json' },
      { code: 'fr', language: 'fr-FR', file: 'fr.json' }
    ],
    lazy: true,
    langDir: 'locales/',
    defaultLocale: 'fr',
    strategy: 'prefix', // Utilisation du préfixe /fr, /en dans l'URL
    detectBrowserLanguage: {
      useCookie: true,
      cookieCrossOrigin: false,
      cookieSecure: false,
      alwaysRedirect: false,
      fallbackLocale: 'fr'
    },
    customRoutes: 'config',
    pages: {
      index: {
        en: '/',
        fr: '/'
      },
      services: {
        en: '/services',
        fr: '/services'
      },
      events: {
        en: '/events',
        fr: '/evenements'
      },
      'events-id': {
        en: '/events/[id]',
        fr: '/evenements/[id]'
      },
      news: {
        en: '/news',
        fr: '/actualites'
      },
      'news-id': {
        en: '/news/[id]',
        fr: '/actualites/[id]'
      },
      'alt-news': {
        en: '/alt-news',
        fr: '/alt-news'
      },
      'alt-news-id': {
        en: '/alt-news/[id]',
        fr: '/alt-news/[id]'
      },
      stationery: {
        en: '/stationery',
        fr: '/papeterie'
      },
      'stationery-id': {
        en: '/stationery/[id]',
        fr: '/papeterie/[id]'
      },
      contact: {
        en: '/contact',
        fr: '/contact'
      },
      'subscriber-manage': {
        en: '/subscriber/manage',
        fr: '/subscriber/manage'
      },
      'subscriber-reset-password': {
        en: '/subscriber/reset-password',
        fr: '/subscriber/reset-password'
      },
      'subscriber-success': {
        en: '/subscriber/success',
        fr: '/subscriber/success'
      },
      'payment-success': {
        en: '/payment/success',
        fr: '/payment/success'
      },
    }
  },
  modules: ['@nuxtjs/i18n', 'nuxt-swiper', '@pinia/nuxt'],
  plugins: ['~/plugins/gtm.client.ts']
})
