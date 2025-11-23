<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useCartStore } from '~/stores/cart';
const config = useRuntimeConfig();
const cartStore = useCartStore();
const isAnimating = ref(false);
const { t } = useI18n();

const formatPrice = (price: number) => {
  return price + ' F CFA';
};

const handleEscape = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && cartStore.isCartOpen) {
    cartStore.toggleCart();
  }
};

onMounted(() => {
  document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscape);
});

const closeCart = () => {
  if (!isAnimating.value) {
    isAnimating.value = true;
    cartStore.toggleCart();
    setTimeout(() => {
      isAnimating.value = false;
    }, 300);
  }
};
</script>

<template>
  <div class="cart-mini tp-round-4" :class="{ 'is-open': cartStore.isCartOpen }">
    <div class="cart-overlay" @click="closeCart" v-if="cartStore.isCartOpen"></div>
    
    <div class="cart-content tp-gsap-image-position">
      <div class="cart-header">
        <h3 class="tp-breadcrumb-title fw-500">
          <span class="text-anim">{{ t('cart.title') }}</span>
          <span class="cart-items-count anim-zoomin" v-if="cartStore.totalItems">({{ cartStore.totalItems }})</span>
        </h3>
        <button @click="closeCart" class="close-btn tp-gsap-cursor-point" :aria-label="t('common.close')">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>
      
      <div class="cart-items">
        <transition-group name="cart-item" tag="div" class="cart-items-container">
          <div v-for="item in cartStore.items" :key="item.id" class="cart-item image-reveal">
            <div class="item-image-container tp-gsap-image-position fix">
              <img :src="`${config.public.apiBaseUrl}/storage/${item.image}`" :alt="item.name" class="item-image tp-gsap-image-cover">
            </div>
            <div class="item-details">
              <h4 class="fw-500 fs-18 ls-m-2">{{ item.name }}</h4>
              <p class="fw-500 fs-16 tp-text-theme-primary">{{ formatPrice(item.amount) }}</p>
              <div class="quantity-controls tp-round-4">
                <button 
                  @click="cartStore.updateQuantity(item.id, item.quantity - 1)" 
                  :disabled="item.quantity <= 1"
                  class="quantity-btn tp-gsap-cursor-point"
                  :aria-label="t('cart.decrease')"
                >
                  <i class="fa-solid fa-minus"></i>
                </button>
                <span class="quantity">{{ item.quantity }}</span>
                <button 
                  @click="cartStore.updateQuantity(item.id, item.quantity + 1)"
                  class="quantity-btn tp-gsap-cursor-point"
                  :aria-label="t('cart.increase')"
                >
                  <i class="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>
            <button 
              @click="cartStore.removeFromCart(item.id)" 
              class="remove-btn tp-gsap-cursor-point"
              :aria-label="t('cart.remove')"
            >
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </transition-group>
        
        <div v-if="!cartStore.items.length" class="empty-cart">
          <i class="fa-solid fa-shopping-basket fs-50"></i>
          <p class="fw-500 fs-18 mt-20">{{ t('cart.empty') }}</p>
        </div>
      </div>
      
      <div class="cart-footer">
        <div class="total text-anim">
          <span class="fw-500 fs-18">{{ t('cart.total') }}</span>
          <span class="fw-600 fs-24 tp-text-theme-primary">{{ formatPrice(cartStore.totalAmount) }}</span>
        </div>
        <button 
          class="checkout-btn tp-gsap-cursor-point fw-500" 
          :disabled="!cartStore.items.length"
          :class="{'disabled': !cartStore.items.length}"
        >
          {{ t('cart.checkout') }}
          <i class="fa-solid fa-arrow-right ml-10"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-mini {
  position: fixed;
  right: 0;
  top: 0;
  width: 100%;
  height: 100vh;
  z-index: 9999;
  visibility: hidden;
  opacity: 0;
}

.cart-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.cart-mini.is-open {
  visibility: visible;
  opacity: 1;
}

.cart-mini.is-open .cart-overlay {
  opacity: 1;
}

.cart-content {
  position: absolute;
  right: -420px;
  top: 0;
  width: 400px;
  height: 100vh;
  background: white;
  box-shadow: -5px 0 25px rgba(0, 0, 0, 0.1);
  padding: 30px 25px;
  display: flex;
  flex-direction: column;
  transition: right 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.cart-mini.is-open .cart-content {
  right: 0;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
}

.cart-header h3 {
  font-size: 24px;
  margin: 0;
  display: flex;
  align-items: center;
}

.cart-items-count {
  margin-left: 8px;
  background: var(--cs-gold-color);
  color: white;
  border-radius: 20px;
  padding: 3px 10px;
  font-size: 14px;
  font-weight: 500;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 22px;
  color: #333;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  transform: rotate(90deg);
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  padding-right: 5px;
  margin-right: -5px;
}

.cart-items::-webkit-scrollbar {
  width: 5px;
}

.cart-items::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.cart-items::-webkit-scrollbar-thumb {
  background: var(--cs-gold-color);
  border-radius: 10px;
}

.cart-items-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cart-item {
  display: flex;
  align-items: center;
  background: #f9f9f9;
  border-radius: 12px;
  padding: 15px;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
}

.cart-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.item-image-container {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
}

.item-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}

.cart-item:hover .item-image {
  transform: scale(1.1);
}

.item-details {
  flex: 1;
  padding: 0 15px;
}

.item-details h4 {
  margin: 0 0 5px;
}

.item-details p {
  margin: 0 0 10px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  background: white;
  border-radius: 25px;
  padding: 5px;
  width: fit-content;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.quantity-btn {
  border: none;
  background: transparent;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quantity-btn:hover:not(:disabled) {
  background: var(--cs-gold-color);
  color: white;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity {
  padding: 0 10px;
  font-weight: 600;
  min-width: 30px;
  text-align: center;
}

.remove-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  color: #999;
  cursor: pointer;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  opacity: 0;
}

.cart-item:hover .remove-btn {
  opacity: 1;
}

.remove-btn:hover {
  color: #ff3a30;
  background: rgba(255, 58, 48, 0.1);
}

.empty-cart {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #999;
  padding: 40px 0;
}

.cart-footer {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.checkout-btn {
  width: 100%;
  padding: 15px;
  border: none;
  background: var(--cs-gold-color);
  color: white;
  border-radius: 30px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.checkout-btn:hover:not(.disabled) {
  background: #333;
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.checkout-btn.disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.ml-10 {
  margin-left: 10px;
}

/* Animations */
.cart-item-enter-active,
.cart-item-leave-active {
  transition: all 0.3s ease;
}

.cart-item-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.cart-item-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

@media (max-width: 576px) {
  .cart-content {
    width: 320px;
    padding: 20px 15px;
  }

  .cart-header h3 {
    font-size: 20px;
  }

  .item-image-container {
    width: 60px;
    height: 60px;
  }

  .item-details h4 {
    font-size: 16px;
  }

  .item-details p {
    font-size: 14px;
  }

  .quantity-controls {
    transform: scale(0.9);
    transform-origin: left;
  }
}
</style>