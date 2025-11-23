<script setup lang="ts">
import { useCartStore } from '~/stores/cart';

interface Product {
  id: number;
  name: string;
  amount: number;
  image: string;
}

const config = useRuntimeConfig();
const { locale } = useI18n();
const { t } = useI18n();
const api = useApi();
const localePath = useLocalePath();

const products = ref<Product[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

// Fonction pour formater le prix avec espaces
const formatPrice = (amount: number): string => {
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
};

const fetchProducts = async () => {
  loading.value = true;
  error.value = null;

  try {
    const response = await api.get<Product[]>('/api/books');
    products.value = response || [];

    // Ne pas définir d'erreur s'il y a des produits, même si name est null
    if (!products.value || products.value.length === 0) {
      error.value = t('shop.noProducts');
    }
  } catch (err: any) {
    console.error('Error fetching products:', err);
    error.value = err?.response?.data?.message || t('shop.loadError');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchProducts();
});

// Watch locale changes to refresh products
watch(locale, () => {
  fetchProducts();
});

const cartStore = useCartStore();

const addToCart = (product: Product) => {
  cartStore.addToCart(product);
  // Optional: Add a toast notification using nuxt/toast
  // useToast().success(t('shop.addedToCart'));
}

// Ajout de la fonction de rafraîchissement
const refreshProducts = () => {
  fetchProducts();
};
</script>

<template>
  <div class="container position-relative">
    <CartButtun />
    <div class="row">
      <div class="col-lg-12">
        <!-- Header avec bouton d'actualisation -->
        <!-- Loading state -->
        <div v-if="loading" class="text-center py-5">
          <div class="spinner-border text-gold" role="status">
            <span class="visually-hidden">{{ t('common.loading') }}</span>
          </div>
        </div>

        <!-- Error state -->
        <div v-else-if="error" class="text-center py-5">
          <div class="alert alert-warning" role="alert">
            {{ error }}
          </div>
          <div class="d-flex justify-content-end mb-4">
            <button class="refresh-btn" @click="refreshProducts" :disabled="loading">
              <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
              {{ t('shop.refresh') }}
            </button>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else-if="products.length === 0" class="text-center py-5">
          <div class="empty-state">
            <i class="fas fa-shopping-bag fa-3x mb-3 text-gold"></i>
            <p>{{ t('shop.noProducts') }}</p>
            <div class="d-flex justify-content-end mb-4">
              <button class="refresh-btn" @click="refreshProducts" :disabled="loading">
                <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                {{ t('shop.refresh') }}
              </button>
            </div>
          </div>
        </div>

        <!-- Products grid -->
        <div v-else class="product_shop_section four_column product_wrapper_grid style_three">
          <div class="grid_show_case grid_layout clearfix">
            <div v-for="product in products" :key="product.id" class="project-wrapper grid_box product">
              <div class="product_box type_three">
                <div class="inner_box">
                  <span class="onsale px-3 btn">+</span>
                  <div class="image_box">
                    <img :src="`${config.public.apiBaseUrl}/storage/${product.image}`" class="img-fluid"
                      :alt="product.name" />
                  </div>
                </div>
                <div class="content_box">
                  <NuxtLink :to="localePath({ name: 'stationery-id', params: { id: product.id } })" class="underline-gold cs-ff-montserrat fw-600 cs-text-gold">
                    {{ product.name }}
                  </NuxtLink>
                  <div class="rating_amount">
                    <span class="amount cs-ff-poppins">
                      {{ formatPrice(product.amount) }} F CFA
                    </span>
                  </div>
                  <button class="add-to-cart-btn" @click="addToCart(product)">
                    <i class="fas fa-shopping-cart"></i>
                    {{ $t('constant.addToCart') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <CartMini />
</template>

<style scoped>
.product_shop_section .project-wrapper.grid_box {
  margin-bottom: 30px !important;
}

.four_column .grid_show_case .grid_box {
  width: 25%;
  padding: 0px 15px;
  margin-bottom: 30px;
}

/* Ajout des media queries pour le responsive */

.product_shop_section .project-wrapper.grid_box {
  margin-bottom: 0px !important;
  display: inline-block;
}

.rating_amount {
  font-size: 18px;
  font-weight: 700;
  color: #333;
}

.product_box.type_three {
  position: relative;
  text-align: center;
  padding: 15px;
  border: none;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.product_box.type_three:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.product_box.type_three .inner_box {
  position: relative;
}

.product_box.type_three .inner_box .onsale {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 8px 12px;
  background: var(--cs-gold-color);
  color: #fff;
  font-size: 14px;
  border-radius: 25px;
  font-weight: 600;
  opacity: 0.9;
}

.product_box.type_three .inner_box .image_box {
  position: relative;
  margin-bottom: 15px;
  border-radius: 8px;
  overflow: hidden;
}

.product_box.type_three .inner_box .image_box img {
  width: 100%;
  height: 250px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product_box.type_three:hover .inner_box .image_box img {
  transform: scale(1.05);
}

.product_box.type_three .content_box a {
  height: 50px;
  display: block;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--cs-gold-color);
  margin-bottom: 8px;
  transition: color 0.3s ease;
}

.add-to-cart-btn {
  background: var(--cs-gold-color);
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 12px;
  opacity: 0;
  transform: translateY(10px);
}

.product_box.type_three:hover .add-to-cart-btn {
  opacity: 1;
  transform: translateY(0);
}

.add-to-cart-btn:hover {
  background: #333;
  transform: scale(1.05);
}

.add-to-cart-btn i {
  margin-right: 8px;
}

.text-gold {
  color: var(--cs-gold-color);
}

.empty-state {
  padding: 2rem;
}

.empty-state i {
  color: var(--cs-gold-color);
  opacity: 0.6;
}

.empty-state p {
  font-size: 1.1rem;
  color: #666;
  margin-top: 1rem;
}

.alert {
  border-radius: 8px;
  padding: 1rem;
}

.refresh-btn {
  background: var(--cs-gold-color);
  color: white;
  border: none;
  padding: 8px 20px;
  border-radius: 25px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.refresh-btn:hover {
  background: #333;
  transform: scale(1.05);
}

.refresh-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.refresh-btn i {
  font-size: 14px;
}

/* Animation pour l'icône de refresh */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.fa-spin {
  animation: spin 1s linear infinite;
}

@media (max-width: 991px) {
  .four_column .grid_show_case .grid_box {
    width: 50%;
    padding: 0px 10px;
  }

  .product_box.type_three .inner_box .image_box img {
    height: 200px;
  }
}

@media (max-width: 576px) {
  .four_column .grid_show_case .grid_box {
    padding: 0px 8px;
    margin-bottom: 20px;
  }

  .product_box.type_three {
    padding: 5px;
  }

  .product_box.type_three .inner_box .image_box img {
    height: 180px;
  }

  .product_box.type_three .content_box a {
    font-size: 14px;
  }

  .rating_amount {
    font-size: 16px;
  }

  .add-to-cart-btn {
    opacity: 1;
    transform: none;
    font-size: 11px;
    /* padding: 6px 16px; */
  }

  .refresh-btn {
    font-size: 12px;
    padding: 6px 16px;
  }
}
</style>