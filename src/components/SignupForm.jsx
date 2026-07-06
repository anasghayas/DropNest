import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../stores/authStore'
import { signupSchema } from '../lib/validations'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle, Input, Label, Button } from './ui'
import { GoogleButton } from './GoogleButton'
import { AuthInputs } from './AuthInputs'

export function SignupForm() {
  const [authError, setAuthError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [signupSuccess, setSignupSuccess] = useState(false)
  const navigateTo = useAuthStore((state) => state.navigateTo)

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (data) => {
    setIsLoading(true)
    setAuthError(null)

    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    })

    if (error) {
      setAuthError(error.message)
    } else {
      setSignupSuccess(true)
    }
    
    setIsLoading(false)
  }

  if (signupSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Check your email</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              We've sent a confirmation link to your email address. Please click the link to verify your account.
            </p>
            <Button onClick={() => navigateTo('login')} className="w-full">
              Back to login
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>
            Join DropNest to track price drops
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <GoogleButton text="Sign up with Google" onError={setAuthError} />

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <AuthInputs register={register} errors={errors} />

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register('confirmPassword')}
                className={errors.confirmPassword ? 'border-destructive' : ''}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
              )}
            </div>

            {authError && (
              <div className="p-3 rounded-md bg-destructive/15 text-destructive text-sm">
                {authError}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </CardContent>
        
        <CardFooter className="flex justify-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <button 
            type="button"
            onClick={() => navigateTo('login')}
            className="ml-1 font-medium text-primary hover:underline focus:outline-none"
          >
            Sign in
          </button>
        </CardFooter>
      </Card>
    </div>
  )
}
