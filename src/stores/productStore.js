import { create } from 'zustand'

export const useProductStore = create((set) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async (userId) => {
    set({ isLoading: true, error: null })
    try {
      const API_URL = import.meta.env.VITE_API_URL || ''
      const response = await fetch(`${API_URL}/api/products/user/${userId}`)
      if (!response.ok) throw new Error('Failed to fetch products')
      
      const data = await response.json()
      set({ products: data, isLoading: false })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  trackProduct: async (url, userId, userEmail) => {
    set({ isLoading: true, error: null })
    try {
      const API_URL = import.meta.env.VITE_API_URL || ''
      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url, userId, userEmail })
      })
      
      const data = await response.json()
      
      if (!response.ok) throw new Error(data.error || 'Failed to track product')

      // Refresh the product list after successfully tracking
      set((state) => ({ isLoading: false }))
      return data
    } catch (err) {
      set({ error: err.message, isLoading: false })
      throw err
    }
  },

  removeProduct: async (productId, userId) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || ''
      const response = await fetch(`${API_URL}/api/products/user/${userId}/${productId}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Failed to remove product')
      set((state) => ({
        products: state.products.filter(item => item.productId !== productId)
      }))
    } catch (err) {
      console.error(err)
    }
  }
}))
