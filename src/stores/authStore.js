import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set) => ({
  user: null,                   
  currentPage: 'login',         

  setUser: (user) => set({ user }),

  navigateTo: (page) => set({ currentPage: page }),

  logout: async () => {
    await supabase.auth.signOut()
    set({ user: null, currentPage: 'login' })
  }
}))
