"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Link from "next/link"
import { toast } from "sonner"

// ** import icons
import { Eye, EyeOff } from "lucide-react"

// ** import shared components
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Typography from "@/components/ui/typography"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

// ** import hooks
import { useAuth } from "@/hooks/useAuth"

// ** Form schema
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>

type SearchParams = {
  error?: string
}

interface LoginClientProps {
  searchParams: SearchParams
}

export default function LoginClient({ searchParams }: LoginClientProps) {
  // Hooks
  const router = useRouter()
  const { signIn, signInWithGoogle, resendConfirmation } = useAuth()
  
  // Local State
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isResendingEmail, setIsResendingEmail] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showResendOption, setShowResendOption] = useState(false)
  const [userEmail, setUserEmail] = useState<string>('')
  
  // Form
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  // Handle URL error parameters
  useEffect(() => {
    const urlError = searchParams.error
    if (urlError) {
      let errorMessage = ''
      let description = ''
      
      switch (urlError) {
        case 'confirmation_failed':
          errorMessage = 'Email confirmation failed'
          description = 'The confirmation link is invalid or has expired. Please try signing up again.'
          break
        case 'reset_failed':
          errorMessage = 'Password reset failed'
          description = 'The password reset link is invalid or has expired. Please request a new one.'
          break
        default:
          errorMessage = 'Authentication error'
          description = 'An error occurred during authentication. Please try again.'
      }
      
      setError(errorMessage)
      toast.error(errorMessage, {
        description,
        duration: 6000,
      })
      
      // Clear the URL parameter
      router.replace('/auth/login')
    }
  }, [searchParams, router])
  
  // Event Handlers
  const onSubmit = async (values: LoginFormValues) => {
    setError(null)
    setShowResendOption(false)
    setIsLoading(true)
    
    try {
      await signIn(values.email, values.password)
      toast.success("Welcome back!", {
        description: "Successfully logged in to PaySlip Pro.",
      })
      // Use window.location.replace for immediate redirect
      window.location.replace('/dashboard')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Invalid email or password'
      setError(errorMessage)
      
      // Check if it's an email confirmation error
      if (errorMessage.toLowerCase().includes('email') && 
          (errorMessage.toLowerCase().includes('confirm') || 
           errorMessage.toLowerCase().includes('verify') ||
           errorMessage.toLowerCase().includes('not confirmed'))) {
        setShowResendOption(true)
        setUserEmail(values.email)
        toast.error("Email not confirmed", {
          description: "Please check your email and click the confirmation link, or resend the confirmation email.",
          duration: 6000,
        })
      } else {
        toast.error("Login failed", {
          description: errorMessage,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    if (!userEmail) return
    
    setIsResendingEmail(true)
    try {
      await resendConfirmation(userEmail)
      toast.success("Confirmation email sent!", {
        description: "Please check your email for the confirmation link.",
        duration: 6000,
      })
      setShowResendOption(false)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend confirmation email'
      toast.error("Failed to resend email", {
        description: errorMessage,
      })
    } finally {
      setIsResendingEmail(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError(null)
    setIsLoading(true)
    
    try {
      await signInWithGoogle()
      // Google OAuth will handle the redirect
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign in with Google'
      setError(errorMessage)
      toast.error("Google login failed", {
        description: errorMessage,
      })
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Typography variant="T_Bold_H3">Login to your account</Typography>
          <Typography 
            variant="T_Regular_H6" 
            className="text-muted-foreground text-balance"
          >
            Enter your email to login
          </Typography>
        </div>
        {error && (
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
            {showResendOption && (
              <div className="mt-3 pt-3 border-t border-destructive/20">
                <p className="text-xs text-destructive/80 mb-2">
                  Didn&apos;t receive the confirmation email?
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResendConfirmation}
                  disabled={isResendingEmail}
                  className="h-8 text-xs w-full"
                >
                  {isResendingEmail ? "Sending..." : "Resend confirmation email"}
                </Button>
              </div>
            )}
          </div>
        )}
        <div className="grid gap-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    type="email" 
                    placeholder="m@example.com" 
                    disabled={isLoading}
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/auth/forgot-password"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input 
                      type={showPassword ? "text" : "password"} 
                      className="pr-10"
                      disabled={isLoading}
                      {...field} 
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={togglePasswordVisibility}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            <Typography variant="T_SemiBold_H6">
              {isLoading ? "Signing in..." : "Login"}
            </Typography>
          </Button>
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <Typography 
              variant="T_Regular_H6" 
              className="bg-background text-muted-foreground relative z-10 px-2"
            >
              Or continue with
            </Typography>
          </div>
          <Button 
            type="button"
            variant="outline" 
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <Typography variant="T_SemiBold_H6">Login with Google</Typography>
          </Button>
        </div>
        <div className="text-center text-sm space-y-2">
          <div>
            <Typography variant="T_Regular_H6" className="inline">
              Don&apos;t have an account?{" "}
            </Typography>
            <a href="/auth/signup" className="underline underline-offset-4">
              <Typography variant="T_Regular_H6" className="inline">
                Sign up
              </Typography>
            </a>
          </div>
        </div>
      </form>
    </Form>
  )
} 