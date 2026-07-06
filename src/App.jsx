import { useAuth } from './hooks/useAuth'
import { useAuthStore } from './stores/authStore'
import { LoginForm } from './components/LoginForm'
import { SignupForm } from './components/SignupForm'

function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <p>Welcome, {user?.email}!</p>
      <button 
        onClick={logout}
        className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
      >
        Sign Out
      </button>
    </div>
  )
}

function App() {
  useAuth()
  const currentPage = useAuthStore((state) => state.currentPage)

  return (
    <main className="min-h-screen bg-background text-foreground">
      {currentPage === 'login' && <LoginForm />}
      {currentPage === 'signup' && <SignupForm />}
      {currentPage === 'dashboard' && <Dashboard />}
    </main>
  )
}

export default App
