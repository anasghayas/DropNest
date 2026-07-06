import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { loginSchema } from '../lib/validations'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Button } from './ui'
import { GoogleButton } from './GoogleButton'
import { AuthInputs } from './AuthInputs'

export function LoginForm() {
  const [authError, setAuthError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const navigateTo = useAuthStore((state) => state.navigateTo)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setAuthError(null)

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setAuthError(error.message)
    } else {
      navigateTo('dashboard')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription>
            Log in to your DropNest account
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <GoogleButton text="Sign in with Google" onError={setAuthError} />

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t " />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground" >
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <AuthInputs register={register} errors={errors} />

            {authError && (
              <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm">
                {authError}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <button 
            type="button"
            onClick={() => navigateTo('signup')}
            className="ml-1 font-medium text-primary hover:underline focus:outline-none"
          >
            Sign up
          </button>
        </CardFooter>
      </Card>
    </div>
  )
}
