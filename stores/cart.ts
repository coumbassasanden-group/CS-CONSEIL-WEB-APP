import { defineStore } from 'pinia'

interface CartItem {
  id: number
  name: string
  amount: number
  quantity: number
  image: string
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as CartItem[],
    isCartOpen: false
  }),

  getters: {
    totalItems: (state) => state.items.reduce((total, item) => total + item.quantity, 0),
    totalAmount: (state) => state.items.reduce((total, item) => total + (item.amount * item.quantity), 0)
  },

  actions: {
    addToCart(item: Omit<CartItem, 'quantity'>) {
      const existingItem = this.items.find(i => i.id === item.id)
      
      if (existingItem) {
        existingItem.quantity++
      } else {
        this.items.push({ ...item, quantity: 1 })
      }
    },

    removeFromCart(itemId: number) {
      const index = this.items.findIndex(item => item.id === itemId)
      if (index > -1) {
        this.items.splice(index, 1)
      }
    },

    updateQuantity(itemId: number, quantity: number) {
      const item = this.items.find(i => i.id === itemId)
      if (item) {
        item.quantity = quantity
      }
    },

    toggleCart() {
      this.isCartOpen = !this.isCartOpen
    }
  }
})