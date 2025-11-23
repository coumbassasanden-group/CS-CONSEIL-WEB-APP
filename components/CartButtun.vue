<script setup lang="ts">
import { useCartStore } from '~/stores/cart';

const cartStore = useCartStore();
</script>

<template>
  <div class="floating-cart tp-gsap-cursor-point cart-icon text-anim" @click="cartStore.toggleCart">
    <div class="anim-zoomin-wrap cart-icon-wrapper">
      <i class="fas fa-shopping-cart"></i>
      <span v-if="cartStore.totalItems" class="cart-count anim-zoomin">{{ cartStore.totalItems }}</span>
    </div>
  </div>
</template>

<style scoped>
.floating-cart {
  position: fixed;
  bottom: 30px;
  left: 30px;
  z-index: 999;
  /* Augmenter la taille pour un meilleur look en tant que FAB */
  padding: 20px;
  background: var(--cs-gold-color);
  border-radius: 50%;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

/* Modifier la couleur de l'icône pour qu'elle soit visible sur le fond doré */
.cart-icon i {
  font-size: 24px;
  color: white;
  transition: transform 0.3s ease;
}

.floating-cart:hover {
  transform: translateY(-5px) scale(1.05);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

/* Ajuster la position du badge de compteur */
.cart-count {
  position: absolute;
  top: -8px;
  right: -25px;
  background: var(--cs-brown-color);
  color: var(--cs-gold-color);
  font-weight: 700;
  padding: 7px 17px;
  border-radius: 50px;
  /* border: 2px solid var(--cs-gold-color); */
}

/* Ajout d'une media query pour le responsive */
@media (max-width: 768px) {
  .floating-cart {
    bottom: 20px;
    left: 20px;
    padding: 16px;
  }

  .cart-icon i {
    font-size: 20px;
  }
}
</style>