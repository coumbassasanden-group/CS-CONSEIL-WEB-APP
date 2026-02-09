<template>
  <div class="search-sort-bar">
    <div class="search-input-wrapper">
      <Icon icon="mdi:magnify" class="search-icon" />
      <input
        type="text"
        :value="searchQuery"
        @input="$emit('update:searchQuery', ($event.target as HTMLInputElement).value)"
        placeholder="Rechercher une edition..."
        class="search-input"
      />
      <button v-if="searchQuery" @click="$emit('update:searchQuery', '')" class="clear-search">
        <Icon icon="mdi:close" />
      </button>
    </div>
    <div class="filters-row">
      <!-- Favorites Toggle -->
      <button
        @click="$emit('update:showFavoritesOnly', !showFavoritesOnly)"
        class="favorites-toggle"
        :class="{ active: showFavoritesOnly }"
      >
        <Icon :icon="showFavoritesOnly ? 'mdi:heart' : 'mdi:heart-outline'" />
        <span>Favoris</span>
        <span v-if="favoritesCount > 0" class="favorites-badge">{{ favoritesCount }}</span>
      </button>
      <!-- Sort -->
      <div class="sort-wrapper">
        <label for="sortBy" class="sort-label">
          <Icon icon="mdi:sort" /> Trier :
        </label>
        <select
          :value="sortBy"
          @change="$emit('update:sortBy', ($event.target as HTMLSelectElement).value)"
          id="sortBy"
          class="sort-select"
        >
          <option value="date_desc">Date (recent → ancien)</option>
          <option value="date_asc">Date (ancien → recent)</option>
          <option value="title_asc">Titre (A → Z)</option>
          <option value="title_desc">Titre (Z → A)</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from "@iconify/vue"

defineProps<{
  searchQuery: string
  showFavoritesOnly: boolean
  favoritesCount: number
  sortBy: string
}>()

defineEmits<{
  'update:searchQuery': [value: string]
  'update:showFavoritesOnly': [value: boolean]
  'update:sortBy': [value: string]
}>()
</script>

<style scoped>
.search-sort-bar {
  background: white;
  border-radius: 16px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.search-input-wrapper {
  position: relative;
  margin-bottom: 1rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  font-size: 1.25rem;
}

.search-input {
  width: 100%;
  padding: 0.875rem 2.5rem 0.875rem 3rem;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #d4b128;
  box-shadow: 0 0 0 3px rgba(212, 177, 40, 0.1);
}

.clear-search {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: #e5e7eb;
  border: none;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.clear-search:hover {
  background: #d1d5db;
}

.filters-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.favorites-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.3s ease;
}

.favorites-toggle:hover {
  border-color: #ef4444;
  color: #ef4444;
}

.favorites-toggle.active {
  background: #fef2f2;
  border-color: #ef4444;
  color: #ef4444;
}

.favorites-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 0.4rem;
  background: #ef4444;
  color: white;
  border-radius: 10px;
  font-size: 0.75rem;
}

.sort-wrapper {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.sort-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #6b7280;
}

.sort-select {
  padding: 0.5rem 2rem 0.5rem 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 0.9rem;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-select:focus {
  outline: none;
  border-color: #d4b128;
}

@media (max-width: 768px) {
  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }

  .sort-wrapper {
    margin-left: 0;
    justify-content: space-between;
  }

  .sort-select {
    flex: 1;
  }
}
</style>
