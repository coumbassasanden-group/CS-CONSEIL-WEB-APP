<script setup lang="ts">
import { useCartStore } from '@/stores/cart';
import { onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

// Interface basée sur StationeryDetailsVisitorResource
interface Product {
   id: number;
   name: string;
   description: string;
   amount: number;
   images: string[];
}

const config = useRuntimeConfig();
const { t } = useI18n();
const route = useRoute();
const api = useApi();

const product = ref<Product>({
   id: 0,
   name: '',
   description: '',
   amount: 0,
   images: []
});


const correctPrice = (amount: number): string => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const cartStore = useCartStore();

const loading = ref(true);
const error = ref<string | null>(null);
const selectedImage = ref<string>('');

const fetchProductDetails = async () => {
   loading.value = true;
   error.value = null;

   try {
      const productId = route.params.id;
      const response = await api.get<Product>(`/api/books/${productId}`);
      product.value = response;

      // Définir la première image comme image sélectionnée par défaut
      if (response.images && response.images.length > 0) {
         selectedImage.value = response.images[0];
      }
   } catch (err: any) {
      console.error('Error fetching product details:', err);
      error.value = err?.response?.data?.message || t('stationery.error.generic');
   } finally {
      loading.value = false;
   }
};

const selectImage = (image: string) => {
   selectedImage.value = image;
};

// Formater le prix
const formatPrice = (price: number) => {
   return `${correctPrice(price)} F CFA`;
};

const addToCart = () => {
    cartStore.addToCart({
        id: product.value.id,
        name: product.value.name,
        amount: product.value.amount,
        image: product.value.images[0]
    });
    // Ouvrir automatiquement le mini panier
    cartStore.toggleCart();
};

// Mise à jour du head quand le produit est chargé
watch(product, (newValue) => {
    if (newValue && newValue.name) {
        useHead({
            title: t('stationery.detailTitle', { 
                name: newValue.name,
                price: formatPrice(newValue.amount)
            }) + ' | CS Conseil',
            meta: [
                {
                    name: 'description',
                    content: newValue.description 
                        ? t('stationery.detailDescription', { 
                            name: newValue.name,
                            price: formatPrice(newValue.amount),
                            description: newValue.description.slice(0, 155)
                          })
                        : t('stationery.defaultDetailDescription', { 
                            name: newValue.name,
                            price: formatPrice(newValue.amount)
                          })
                }
            ]
        })
    }
});

onMounted(() => {
   fetchProductDetails();
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
                  <p class="mt-3 fs-5 text-muted">{{ t('stationery.loading') }}</p>
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
                  <h3 class="text-danger">{{ t('stationery.error.title') }}</h3>
                  <p class="text-muted mb-4">{{ error }}</p>
                  <button @click="fetchProductDetails" class="btn btn-primary">
                     <i class="fa-solid fa-rotate me-2"></i>{{ t('stationery.error.retry') }}
                  </button>
               </div>
            </div>
         </div>
      </div>
   </div>

   <!-- Main Content -->
   <div v-else>
      <ThirdHero :title="product.name" :image="`${config.public.apiBaseUrl}/storage/images_folder/conseil_papeterie_details_hero.jpg`" />
      <div class="tp-postbox-area pt-140 pb-90">
         <div class="container">
            <div class="row">
               <div class="col-lg-8">
                  <div class="tp-postbox-details-wrapper mr-50 mb-50">
                     <article class="tp-postbox-details-item mb-50">
                        <!-- Image principale -->
                        <div class="tp-postbox-thumb" v-if="selectedImage">
                           <img class="w-100 tp-round-4" :src="`${config.public.apiBaseUrl}/storage/${selectedImage}`"
                              :alt="product.name">
                        </div>

                        <!-- Miniatures cliquables -->
                        <div class="image-thumbnails mb-30" v-if="product.images && product.images.length > 0">
                           <div class="row g-2">
                              <div v-for="(image, index) in product.images" :key="index" class="col-auto">
                                 <div class="thumbnail-wrapper" :class="{ active: selectedImage === image }"
                                    @click="selectImage(image)">
                                    <img :src="`${config.public.apiBaseUrl}/storage/${image}`" :alt="`${product.name} - ${index + 1}`"
                                       class="thumbnail-image">
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div class="tp-postbox-content">
                           <div class="product-info mb-30">
                              <h3 class="fw-600 fs-35 ls-m-2 mb-20 fs-lg-30 fs-sm-30 cs-text-gold cs-ff-montserrat">
                                 {{ product.name }}
                              </h3>
                              <div class="price mb-4">
                                 <span class="amount fw-600 fs-24 cs-text-gold">{{ formatPrice(product.amount) }}</span>
                              </div>
                              <div class="description cs-text-dark cs-ff-poppins" v-html="product.description"></div>
                           </div>
                        </div>
                     </article>
                  </div>
               </div>
               <div class="col-lg-4">
                  <div class="tp-sidebar-wrapper">
                     <div class="tp-sidebar-widget mb-50">
                        <div class="tp-sidebar-cta tp-bg-common-white">
                           <h3 class="cs-text-gold mb-4">{{ t('stationery.sidebar.addToCart') }}</h3>
                           <button class="btn btn-primary w-100" @click="addToCart">
                              <i class="fa-solid fa-cart-plus me-2"></i>
                              {{ t('stationery.sidebar.addToCartButton') }}
                           </button>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
      <CartMini />
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

/* Image Thumbnails */
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

.tp-postbox-thumb {
   height: 400px;
}

.tp-postbox-thumb img {
   width: 100%;
   height: 100%;
   object-fit: contain;
   border-radius: 8px;
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

/* Product Specific Styles */
.product-info {
   padding: 20px;
   background: #fff;
   border-radius: 8px;
   box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.amount {
   display: inline-block;
   padding: 10px 20px;
   background: rgba(212, 177, 40, 0.1);
   border-radius: 25px;
}

/* Product Cart Action */
.product-cart-action {
   padding: 20px;
}

.btn-add-to-cart {
   width: 100%;
   padding: 15px;
   border: none;
   background: var(--cs-gold-color);
   color: white;
   border-radius: 30px;
   font-size: 16px;
   font-weight: 600;
   cursor: pointer;
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 10px;
   transition: all 0.3s ease;
}

.btn-add-to-cart:hover {
   background: #333;
   transform: translateY(-2px);
   box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.btn-add-to-cart i {
   font-size: 18px;
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
}
</style>