<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

declare global {
   interface Window {
      jQuery: any;
   }
}

interface Event {
   id: number;
   title: string;
   date: string;
   subtitle: string;
   country: string;
   content: string;
   video_link: string | null;
   images: string[];
}

const { formatDate } = useFormatDate();
const { t, locale } = useI18n();
const route = useRoute();
const config = useRuntimeConfig();

const event = ref<Event>({
   id: 0,
   title: '',
   date: '',
   subtitle: '',
   country: '',
   content: '',
   video_link: null,
   images: []
});

const loading = ref(true);
const error = ref<string | null>(null);
const selectedImage = ref<string>('');

const fetchEventDetails = async () => {
   loading.value = true;
   error.value = null;

   try {
      const eventId = route.params.id;
      const response = await fetch(`${config.public.apiBaseUrl}/api/events/${eventId}`, {
         method: 'GET',
         headers: {
            'Accept-Language': locale.value,
            'company': 'conseil'
         }
      });

      if (!response.ok) {
         throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      event.value = data;

      // Définir la première image comme image sélectionnée par défaut
      if (data.images && data.images.length > 0) {
         selectedImage.value = data.images[0];
      }
   } catch (err: any) {
      console.error('Error fetching event details:', err);
      error.value = err.message || 'Failed to load event details';
   } finally {
      loading.value = false;
   }
};

const selectImage = (image: string) => {
   selectedImage.value = image;
};

// Mise à jour du head quand l'événement est chargé
watch(event, (newValue) => {
   if (newValue && newValue.title) {
      useHead({
         title: t('events.detailTitle', {
            title: newValue.title,
            country: newValue.country
         }) + ' | CS Conseil',
         meta: [
            {
               name: 'description',
               content: newValue.content
                  ? t('events.detailDescription', {
                     title: newValue.title,
                     subtitle: newValue.subtitle,
                     country: newValue.country
                  })
                  : t('events.defaultDetailDescription', {
                     title: newValue.title,
                     country: newValue.country
                  })
            }
         ]
      })
   }
})

onMounted(async () => {
   await fetchEventDetails();
});
</script>

<template>
   <!-- Loading State -->
   <div v-if="loading" class="loading-container">
      <div class="container">
         <div class="row">
            <div class="col-12 text-center py-5">
               <div class="spinner-container">
                  <div class="spinner">
                     <div class="spinner-inner"></div>
                  </div>
                  <p class="mt-3 fs-5 text-muted">{{ $t('eventDetail.loading') }}</p>
               </div>
            </div>
         </div>
      </div>
   </div>

   <!-- Error State -->
   <div v-else-if="error" class="error-container">
      <div class="container">
         <div class="row">
            <div class="col-12">
               <div class="error-content text-center py-5">
                  <div class="error-icon mb-3">
                     <i class="fa-solid fa-circle-exclamation fs-1 text-danger"></i>
                  </div>
                  <h3 class="text-danger">{{ $t('eventDetail.error.title') }}</h3>
                  <p class="text-muted mb-4">{{ error }}</p>
                  <button @click="fetchEventDetails" class="btn btn-primary">
                     <i class="fa-solid fa-rotate me-2"></i>{{ $t('eventDetail.error.retry') }}
                  </button>
               </div>
            </div>
         </div>
      </div>
   </div>

   <!-- Main Content -->
   <div v-else>
      <ThirdHero :title="event.title" parentPage="/events"
         :image="`${config.public.apiBaseUrl}/storage/images_folder/conseil_events_details_hero.jpg`" />

      <!-- Section d'en-tête - même structure qu'ALT News -->
      <div class="tp-team-details-area pt-100">
         <div class="container">
            <div class="row">
               <div class="col-lg-4">
                  <div class="tp-team-details-thumb mb-30 wow img-custom-anim-left" data-wow-duration="1.5s"
                     data-wow-delay="0.2s">
                     <img class="w-100 tp-round-4 shadow-lg" 
                          :src="`${config.public.apiBaseUrl}/storage/${selectedImage || event.images[0]}`"
                          :alt="event.title" v-if="event.images && event.images.length > 0">
                     
                        <!-- Miniatures cliquables -->
                        <div class="image-thumbnails mb-30" v-if="event.images && event.images.length > 0">
                           <div class="row g-2">
                              <div class="col-auto" v-for="(image, index) in event.images" :key="index">
                                 <div class="thumbnail-wrapper" :class="{ 'active': selectedImage === image }"
                                    @click="selectImage(image)">
                                    <img :src="`${config.public.apiBaseUrl}/storage/${image}`"
                                       :alt="`Image ${index + 1}`" class="thumbnail-image">
                                 </div>
                              </div>
                           </div>
                        </div>
                  </div>
               </div>
               <div class="col-lg-8">
                  <div class="tp-team-details-content mb-30">
                     <h2 class="fw-600 fs-50 ls-m-2 mb-15 wow img-custom-anim-left cs-text-gold cs-ff-montserrat"
                         data-wow-duration="1.5s" data-wow-delay="0.2s">
                        {{ event.title }}
                     </h2>
                     <div class="tp-postbox-meta-item mb-30 d-flex align-items-center flex-wrap gap-3">
                        <span class="cs-text-dark fw-600 fs-18">{{ formatDate(event.date) }}</span>
                        <span class="cs-badge ms-3 cs-bg-brown">{{ event.country }}</span>
                     </div>
                     <div class="subtitle-section mb-30" v-if="event.subtitle">
                        <p class="cs-text-dark cs-ff-poppins fs-18 fw-500">{{ event.subtitle }}</p>
                     </div>
                     <div class="mb-40" v-if="event.content">
                        <div v-html="event.content"></div>
                     </div>
                     <span class="fw-600 fs-16 cs-text-gold p-3 border-bottom">{{ $t('constant.explore_details') }}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <!-- Section de timeline améliorée - même structure qu'ALT News -->
      <div class="tp-team-expreance-area pb-95">
         <div class="container">
            <div class="row">
               <!-- Timeline avec points de navigation -->
               <div class="col-12">
                  <div class="cs-timeline-container">
                     <!-- Section Vidéo YouTube -->
                     <div class="cs-timeline-item" v-if="event.video_link">
                        <div class="cs-timeline-marker">
                           <div class="cs-timeline-dot"></div>
                           <div class="cs-timeline-line"></div>
                        </div>
                        <div class="cs-timeline-header">
                           <h3 class="cs-timeline-title cs-text-gold">
                              <i class="fa-brands fa-youtube text-danger me-2"></i>
                              {{ $t('eventDetail.videoSection.title', 'Vidéo de l\'événement') }}
                           </h3>
                        </div>
                        <div class="cs-timeline-content">
                           <div class="video-container">
                              <iframe
                                 :src="`${event.video_link.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}?&rel=0`"
                                 title="Vidéo de l'événement" 
                                 frameborder="0"
                                 allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                 referrerpolicy="strict-origin-when-cross-origin" 
                                 allowfullscreen
                                 loading="lazy"
                                 class="w-100 video-iframe">
                              </iframe>
                           </div>
                        </div>
                     </div>

                     <!-- Section Galerie d'images -->
                     <!-- <div class="cs-timeline-item" v-if="event.images && event.images.length > 0">
                        <div class="cs-timeline-marker">
                           <div class="cs-timeline-dot"></div>
                        </div>
                        <div class="cs-timeline-header">
                           <h3 class="cs-timeline-title cs-text-gold">Galerie photos ({{ event.images.length }} images)</h3>
                        </div>
                        <div class="cs-timeline-content">
                           <div class="gallery-grid">
                              <div class="gallery-item" 
                                   v-for="(image, index) in event.images" 
                                   :key="index"
                                   @click="selectImage(image)">
                                 <img :src="`${config.public.apiBaseUrl}/storage/${image}`"
                                      :alt="`Image ${index + 1} de l'événement`" 
                                      class="gallery-image">
                                 <div class="gallery-overlay">
                                    <i class="fa-regular fa-eye"></i>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </div> -->



                     <!-- Message si pas de contenu -->
                     <div v-if="!event.video_link && (!event.images || event.images.length === 0)" class="cs-timeline-item">
                        <div class="cs-timeline-marker">
                           <div class="cs-timeline-dot"></div>
                        </div>
                        <div class="cs-timeline-content">
                           <div class="empty-content text-center py-5">
                              <i class="fa-regular fa-images fs-1 text-muted mb-3"></i>
                                <h4 class="text-muted">{{ $t('eventDetail.emptyContent.title') }}</h4>
                                <p class="text-muted">{{ $t('eventDetail.emptyContent.description') }}</p>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
</template>

<style scoped>
/* Loading Spinner */
.loading-container,
.error-container {
   min-height: 60vh;
   display: flex;
   align-items: center;
   justify-content: center;
}

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

@keyframes spin {
   to {
      transform: rotate(360deg);
   }
}

/* Error State */
.error-content {
   background-color: #fff9f9;
   border: 1px solid #ffe0e0;
   border-radius: 8px;
   padding: 2rem;
}

/* Styles principaux - structure ALT News */
.tp-team-details-area {
   background-color: white;
   padding-top: 100px;
}

.tp-team-details-thumb {
   position: relative;
   overflow: hidden;
   border-radius: 12px;
   box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.tp-team-details-thumb img {
   width: 100%;
   height: auto;
   transition: transform 0.3s ease;
}

.tp-team-details-thumb:hover img {
   transform: scale(1.02);
}

.tp-team-details-content {
   padding-left: 0;
}

.cs-badge {
   background-color: var(--cs-brown-color);
   color: var(--cs-gold-color);
   padding: 5px 15px;
   border-radius: 20px;
   font-size: 14px;
   font-weight: 600;
   display: inline-block;
}

.cs-bg-brown {
   background-color: var(--cs-brown-color) !important;
   color: var(--cs-gold-color) !important;
}

.subtitle-section p {
   font-style: italic;
   color: var(--cs-text-muted);
   border-left: 4px solid var(--cs-gold-color);
   padding-left: 20px;
   margin: 0;
}

/* Gallery Grid dans la timeline */
.gallery-grid {
   display: grid;
   grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
   gap: 15px;
   background-color: #f8f9fa;
   border-radius: 10px;
   padding: 20px;
   box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.gallery-item {
   position: relative;
   aspect-ratio: 4/3;
   border-radius: 8px;
   overflow: hidden;
   cursor: pointer;
   transition: all 0.3s ease;
   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.gallery-item:hover {
   transform: translateY(-5px);
   box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.gallery-image {
   width: 100%;
   height: 100%;
   object-fit: cover;
   transition: transform 0.3s ease;
}

.gallery-item:hover .gallery-image {
   transform: scale(1.1);
}

.gallery-overlay {
   position: absolute;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   background: rgba(0, 0, 0, 0.7);
   display: flex;
   align-items: center;
   justify-content: center;
   opacity: 0;
   transition: opacity 0.3s ease;
}

.gallery-item:hover .gallery-overlay {
   opacity: 1;
}

.gallery-overlay i {
   color: var(--cs-gold-color);
   font-size: 24px;
}

/* Image Thumbnails - style original */
.image-thumbnails {
   padding: 10px 0;
}

.thumbnail-wrapper {
   width: 80px;
   height: 80px;
   border-radius: 8px;
   overflow: hidden;
   cursor: pointer;
   border: 2px solid transparent;
   transition: all 0.3s ease;
   position: relative;
}

.thumbnail-wrapper:hover {
   border-color: var(--cs-gold-color);
   transform: scale(1.05);
}

.thumbnail-wrapper.active {
   border-color: var(--cs-gold-color);
   box-shadow: 0 0 0 2px rgba(212, 177, 40, 0.3);
}

.thumbnail-image {
   width: 100%;
   height: 100%;
   object-fit: cover;
   transition: transform 0.3s ease;
}

.thumbnail-wrapper:hover .thumbnail-image {
   transform: scale(1.1);
}

/* Timeline amélioré - même style qu'ALT News */
.tp-team-expreance-area {
   background-color: white;
   padding-bottom: 95px;
}

.cs-timeline-container {
   position: relative;
   padding: 20px 0;
}

.cs-timeline-item {
   position: relative;
   display: flex;
   flex-direction: column;
   margin-bottom: 60px;
}

.cs-timeline-marker {
   position: absolute;
   left: 0;
   top: 0;
   display: flex;
   flex-direction: column;
   align-items: center;
}

.cs-timeline-dot {
   width: 16px;
   height: 16px;
   background-color: var(--cs-gold-color);
   border-radius: 50%;
   z-index: 2;
   box-shadow: 0 0 0 5px rgba(212, 177, 40, 0.2);
}

.cs-timeline-line {
   position: absolute;
   width: 3px;
   background-color: var(--cs-gold-color);
   top: 16px;
   bottom: -60px;
   left: calc(16px / 2 - 3px / 2);
}

.cs-timeline-header {
   padding-left: 40px;
   margin-bottom: 15px;
}

.cs-timeline-title {
   font-size: 24px;
   font-weight: 600;
   margin: 0;
   font-family: var(--cs-family-montserrat);
}

.cs-timeline-content {
   padding-left: 40px;
}

/* Video Container */
.video-container {
   background-color: #f8f9fa;
   border-radius: 10px;
   padding: 20px;
   box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.video-iframe {
   height: 400px;
   border: none;
   border-radius: 8px;
   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}



/* Empty Content */
.empty-content {
   background-color: #f9f9f9;
   border-radius: 8px;
   padding: 3rem;
   display: flex;
   flex-direction: column;
   align-items: center;
}

/* Typography améliorée */
.tp-team-details-content h2 {
   line-height: 1.2;
}

.tp-postbox-meta-item {
   margin-bottom: 30px;
}

.tp-postbox-meta-item span {
   font-family: var(--cs-family-poppins);
}

/* Content styling */
.tp-team-details-content :deep(p) {
   font-family: var(--cs-family-poppins);
   color: var(--cs-text-dark);
   line-height: 1.6;
   margin-bottom: 20px;
}

.tp-team-details-content :deep(ul),
.tp-team-details-content :deep(ol) {
   font-family: var(--cs-family-poppins);
   color: var(--cs-text-dark);
   line-height: 1.6;
   padding-left: 20px;
   margin-bottom: 20px;
}

.tp-team-details-content :deep(strong),
.tp-team-details-content :deep(b) {
   color: var(--cs-brown-color);
}

/* Responsive */
@media only screen and (max-width: 991px) {
   .tp-team-details-content {
      margin-top: 30px;
   }
}

@media only screen and (max-width: 767px) {
   .tp-team-details-area {
      padding-top: 60px;
   }

   .cs-timeline-item {
      margin-bottom: 40px;
   }

   .cs-timeline-content {
      padding-left: 30px;
   }

   .cs-timeline-header {
      padding-left: 30px;
   }

   .video-iframe {
      height: 250px;
   }

   .tp-team-details-content h2 {
      font-size: 36px !important;
   }

   .tp-postbox-meta-item {
      flex-direction: column;
      align-items: flex-start !important;
      gap: 10px !important;
   }

   .cs-badge {
      margin-left: 0 !important;
   }
}

   /* Responsive */
@media only screen and (max-width: 767px) {
   .image-thumbnails .row {
      flex-wrap: nowrap;
      overflow-x: auto;
      padding-bottom: 10px;
   }

   .thumbnail-wrapper {
      flex-shrink: 0;
   }

   .gallery-grid {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 10px;
   }
}

@media only screen and (max-width: 480px) {
   .tp-team-details-content h2 {
      font-size: 28px !important;
   }

   .video-iframe {
      height: 200px;
   }

   .cs-timeline-content {
      padding-left: 25px;
   }

   .cs-timeline-header {
      padding-left: 25px;
   }

   .gallery-grid {
      grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
   }
}
</style>