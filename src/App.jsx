import { useAuth } from './hooks/useAuth'
import { useAuthStore } from './stores/authStore'
import { LoginForm } from './components/LoginForm'
import { SignupForm } from './components/SignupForm'
import { Header } from './components/Header'
import { Loader2, LogOut } from 'lucide-react'
import { Button } from './components/ui/button'
import Dashboard from './components/Dashboard'
import Lightfall from './components/Lightfall'

function App() {
  useAuth()
  const currentPage = useAuthStore((state) => state.currentPage)

  return (
    <div className="dark min-h-screen relative bg-[#0A29FF] text-white">
      {/* Lightfall Background */}
      <div className="fixed top-0 left-0 w-[100vw] h-[100lvh] z-0 pointer-events-none">
        <Lightfall
          dpr={1}
          colors={['#A6C8FF', '#5227FF', '#FF9FFC']}
          backgroundColor="#0A29FF"
          speed={0.4}
          streakCount={1}
          streakWidth={0.2}
          streakLength={1}
          glow={0.2}
          density={0.4}
          twinkle={1}
          zoom={3}
          backgroundGlow={0.5}
          opacity={1}
          mouseInteraction
          mouseStrength={1}
          mouseRadius={0.85}
          color1="#A6C8FF"
          color2="#5227FF"
          color3="#FF9FFC"
        />
      </div>
      <Header />
      <main className="relative z-10 flex-1">
        {currentPage === 'login' && <LoginForm />}
        {currentPage === 'signup' && <SignupForm />}
        {currentPage === 'dashboard' && <Dashboard />}
      </main>
    </div>
  )
}

export default App
