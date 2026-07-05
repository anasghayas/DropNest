// ============================================
// Zustand Auth Store
// ============================================
// Manages: user session, currentPage navigation

import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set) => ({
  // --- State ---
  user: null,                   // Holds the logged-in user object
  currentPage: 'login',         // 'login' | 'signup' | 'dashboard'

  // --- Actions ---
  // Update the user state
  setUser: (user) => set({ user }),

  // Change the visible page
  navigateTo: (page) => set({ currentPage: page }),

  // Logout function
  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, currentPage: 'login' })
  }
}))
