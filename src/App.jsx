import { useAuth } from './hooks/useAuth'
import { useAuthStore } from './stores/authStore'
import { LoginForm } from './components/LoginForm'
import { SignupForm } from './components/SignupForm'
import { Header } from './components/Header'

function Dashboard() {
  const user = useAuthStore((state) => state.user)
  
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p>Welcome, {user?.email}!</p>
    </div>
  )
}

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
