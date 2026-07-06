import { useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'

export function useAuth() {
  const setUser = useAuthStore((state) => state.setUser)
  const navigateTo = useAuthStore((state) => state.navigateTo)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user)
        navigateTo('dashboard')
      }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user)
        navigateTo('dashboard')
      } else {
        setUser(null)
        navigateTo('login')
      }
    })

    return () => subscription.unsubscribe()
  }, [setUser, navigateTo])
}