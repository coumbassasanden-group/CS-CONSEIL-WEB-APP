<script setup>
const { t } = useI18n()

const values = [
  { key: 'team', icon: '/assets/img/about/team.png' },
  { key: 'watch', icon: '/assets/img/about/notification.png' },
  { key: 'flexibility', icon: '/assets/img/about/adaptable.png' },
  { key: 'african', icon: '/assets/img/about/africa.png' }
]
</script>

<template>
  <section class="values-section">
    <div class="values-container">
      <div class="values-grid">
        <div 
          v-for="(value, index) in values" 
          :key="value.key"
          class="value-card"
          :style="{ '--delay': `${index * 0.1}s` }"
        >
          <div class="value-icon">
            <img v-if="index===0" src="/assets/img/about/team.png" :alt="value.key" />
            <img v-else-if="index===1" src="/assets/img/about/notification.png" :alt="value.key" />
            <img v-else-if="index===2" src="/assets/img/about/adaptable.png" :alt="value.key" />
            <img v-else="index===3" src="/assets/img/about/africa.png" :alt="value.key" />
          </div>
          <div class="value-content">
            <h3 
              class="value-title" 
              v-html="t(`values.${value.key}.title`).replace('#', '<br>')"
            ></h3>
            <p class="value-description">
              {{ t(`values.${value.key}.description`) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.values-section {  
  padding: 100px 0;
  background: var(--cs-bg-dark-color);
  position: relative;
  overflow: hidden;
}

.values-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: 
    radial-gradient(circle at 20% 30%, rgba(212, 177, 40, 0.12) 0%, transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(212, 177, 40, 0.08) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(212, 177, 40, 0.04) 0%, transparent 60%);
  pointer-events: none;
}

.values-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  position: relative;
  z-index: 1;
}

.values-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  align-items: start;
}

.value-card {
  background: linear-gradient(145deg, #ffffff 0%, rgba(255, 255, 255, 1) 100%);
  /* border: 2px solid var(--cs-gold-color); */
  border-radius: 20px;
  padding: 10px;
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1);
  position: relative;
  box-shadow: 
    0 8px 25px rgba(212, 177, 40, 0.1),
    0 3px 12px rgba(212, 177, 40, 0.08);
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.6s ease-out forwards;
  animation-delay: var(--delay);
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.value-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 18px;
  background: linear-gradient(145deg, 
    rgba(212, 177, 40, 0.08) 0%, 
    rgba(212, 177, 40, 0.12) 50%,
    rgba(212, 177, 40, 0.06) 100%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.value-card:hover {
  transform: translateY(-6px);
  border-color: rgba(212, 177, 40, 0.4);
  box-shadow: 
    0 20px 40px rgba(212, 177, 40, 0.15),
    0 8px 25px rgba(212, 177, 40, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.value-card:hover::before {
  opacity: 1;
}

.value-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  transition: all 0.3s ease;
}

.value-card:hover .value-icon {
  transform: scale(1.05);
  box-shadow: 
    0 8px 30px rgba(212, 177, 40, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.value-icon img {
  width: 50px;
  height: 50px;
  object-fit: contain;
  /* filter: brightness(0) saturate(100%) invert(100%); */
  transition: all 0.3s ease;
}

.value-card:hover .value-icon img {
  transform: scale(1.1);
}

.value-content {
  text-align: center;
}

.value-title {
  height: 70px;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--cs-brown-color);
  margin: 0 0 1rem;
  line-height: 1.3;
  letter-spacing: -0.01em;
  transition: color 0.3s ease;
}

.value-card:hover .value-title {
  color: var(--cs-gold-color);
}

.value-description {
  height: 110px;
  font-size: 0.95rem;
  line-height: 1.6;
  color: rgba(63, 46, 26, 0.8);
  margin: 0;
  font-weight: 400;
  transition: color 0.3s ease;
}

.value-card:hover .value-description {
  color: rgba(63, 46, 26, 0.9);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .values-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (max-width: 768px) {
  .values-section {
    padding: 80px 0;
  }
  
  .values-container {
    padding: 0 1.5rem;
  }
  
  .values-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .value-card {
    padding: 2rem 1.5rem;
  }
  
  .value-icon {
    width: 60px;
    height: 60px;
    margin-bottom: 1.2rem;
    border-radius: 14px;
  }
  
  .value-icon img {
    width: 35px;
    height: 35px;
  }
  
  .value-title {
    font-size: 1.2rem;
    margin-bottom: 0.8rem;
  }
  
  .value-description {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .values-section {
    padding: 60px 0;
  }
  
  .values-container {
    padding: 0 1rem;
  }
  
  .value-card {
    padding: 1.8rem 1.2rem;
    border-radius: 16px;
  }
  
  .value-icon {
    width: 55px;
    height: 55px;
    border-radius: 12px;
  }
  
  .value-icon img {
    width: 30px;
    height: 30px;
  }
  
  .value-title {
    font-size: 1.1rem;
  }
  
  .value-description {
    font-size: 0.85rem;
  }
}

/* Animation douce pour les interactions */
.values-grid:hover .value-card:not(:hover) {
  opacity: 0.85;
}
</style>