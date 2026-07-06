import { create } from 'zustand'

export const useProductStore = create((set) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async (userId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch(`http://localhost:3001/api/products/user/${userId}`)
      if (!response.ok) throw new Error('Failed to fetch products')
      
      const data = await response.json()
      set({ products: data, isLoading: false })
    } catch (err) {
      set({ error: err.message, isLoading: false })
    }
  },

  trackProduct: async (url, userId) => {
    set({ isLoading: true, error: null })
    try {
      const response = await fetch('http://localhost:3001/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url, userId })
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
  }
}))
