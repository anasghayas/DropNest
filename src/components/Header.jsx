import { useAuthStore } from '../stores/authStore'
import { Button } from './ui'

export function Header() {
  const user = useAuthStore((state) => state.user)
  const currentPage = useAuthStore((state) => state.currentPage)
  const navigateTo = useAuthStore((state) => state.navigateTo)
  const logout = useAuthStore((state) => state.logout)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 md:px-8 mx-auto">
        
        {/* Logo / Brand */}
        <div 
          className="flex items-center gap-2 font-bold text-xl cursor-pointer"
          onClick={() => navigateTo(user ? 'dashboard' : 'login')}
        >
          <img src="/favicon.png" alt="DropNest Logo" className="h-6 w-6" />
          DropNest
        </div>

        {/* Navigation Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline-block">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              {currentPage !== 'login' && (
                <Button size="sm" onClick={() => navigateTo('login')}>
                  Log in
                </Button>
              )}
              {currentPage !== 'signup' && (
                <Button size="sm" onClick={() => navigateTo('signup')}>
                  Sign up
                </Button>
              )}
            </>
          )}
        </div>

      </div>
    </header>
  )
}