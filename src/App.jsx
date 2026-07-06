import { useAuth } from './hooks/useAuth'
import { useAuthStore } from './stores/authStore'
import { LoginForm } from './components/LoginForm'
import { SignupForm } from './components/SignupForm'
import { Header } from './components/Header'

import Dashboard from './components/Dashboard'

function App() {
  useAuth()
  const currentPage = useAuthStore((state) => state.currentPage)

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Header />
      <main className="flex-1">
        {currentPage === 'login' && <LoginForm />}
        {currentPage === 'signup' && <SignupForm />}
        {currentPage === 'dashboard' && <Dashboard />}
      </main>
    </div>
  )
}

export default App
