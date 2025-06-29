"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"

// ** import icons
import { GalleryVerticalEnd, Eye, EyeOff, ArrowLeft, AlertCircle, RefreshCw } from "lucide-react"

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
import { Alert, AlertDescription } from "@/components/ui/alert"

// ** import hooks
import { useAuth } from "@/hooks/useAuth"

// ** Form schema with password strength requirements
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

function ResetPasswordPageContent() {
  // Constants
  const APP_NAME = "PaySlip Pro"
  
  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { updatePassword } = useAuth()
  
  // Local State
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const [tokenExpired, setTokenExpired] = useState(false)
  
  // Form
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  // Check if we have valid reset token on mount
  useEffect(() => {
    const checkToken = () => {
      // Check for verification flag and required token_hash parameter
      const verified = searchParams.get('verified')
      const tokenHash = searchParams.get('token_hash')
      const type = searchParams.get('type')
      
      console.log('Token validation check:', {
        verified,
        hasTokenHash: !!tokenHash,
        type,
        timestamp: new Date().toISOString()
      })
      
      // For password reset, we strictly require verification flag, token_hash, and recovery type
      // Supabase's verifyOtp for recovery type specifically expects token_hash parameter
      const hasValidParams = verified === 'true' && tokenHash && type === 'recovery'
      
      if (!hasValidParams) {
        console.warn('Invalid token parameters detected:', {
          verified,
          tokenHash: tokenHash ? 'present' : 'missing',
          type
        })
        setError('Invalid or expired reset link. The link may be malformed or has expired. Please request a new password reset.')
        setIsValidToken(false)
      } else {
        console.log('Token parameters are valid')
        setIsValidToken(true)
      }
    }

    checkToken()
  }, [searchParams])
  
  // Event Handlers
  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!isValidToken) return
    
    setError(null)
    setTokenExpired(false)
    setIsLoading(true)
    
    try {
      console.log('Starting password update process...', {
        timestamp: new Date().toISOString()
      })
      
      // Establish authenticated session with the reset token
      const tokenHash = searchParams.get('token_hash')
      
      console.log('Token parameters for session establishment:', { 
        hasTokenHash: !!tokenHash,
        tokenHashLength: tokenHash?.length,
        timestamp: new Date().toISOString()
      })
      
      // Strictly require token_hash for password reset flow
      if (!tokenHash) {
        throw new Error('Invalid reset token format. Please request a new password reset link.')
      }
      
      if (tokenHash) {
        console.log('Establishing authenticated session...')
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        
        // Establish session using the reset token
        try {
          console.log('Using verifyOtp with token_hash for password recovery', {
            tokenHashPreview: `${tokenHash.substring(0, 8)}...`,
            timestamp: new Date().toISOString()
          })
          
          const sessionResult = await supabase.auth.verifyOtp({
            type: 'recovery',
            token_hash: tokenHash,
          })
          
          console.log('Session establishment result:', {
            hasError: !!sessionResult?.error,
            errorCode: sessionResult?.error?.message,
            hasSession: !!sessionResult?.data?.session,
            hasUser: !!sessionResult?.data?.user,
            timestamp: new Date().toISOString()
          })
          
          if (sessionResult?.error) {
            console.error('Session establishment failed:', sessionResult.error)
            
            // Check for specific error types
            const errorMessage = sessionResult.error.message.toLowerCase()
            
            if (errorMessage.includes('expired') || sessionResult.error.message.includes('otp_expired')) {
              console.log('Token expired error detected')
              setTokenExpired(true)
              throw new Error('Password reset token has expired. Please request a new reset link.')
            } else if (errorMessage.includes('invalid') || errorMessage.includes('not found')) {
              throw new Error('Password reset token is invalid. Please request a new reset link.')
            } else {
              throw new Error('Password reset session could not be established. Please request a new reset link.')
            }
          }
          
          console.log('Session established successfully')
        } catch (sessionError) {
          console.error('Session establishment error:', sessionError)
          
          // If it's already our custom error, re-throw it
          if (sessionError instanceof Error && sessionError.message.includes('Password reset')) {
            throw sessionError
          }
          
          // Otherwise, provide a generic error message
          throw new Error('Failed to establish password reset session. Please request a new reset link.')
        }
      }
      
      // Update the password
      console.log('Updating password...', {
        timestamp: new Date().toISOString()
      })
      await updatePassword(values.password)
      console.log('Password updated successfully')
      
      setIsSuccess(true)
      toast.success("Password updated successfully!", {
        description: "Your password has been reset. You can now log in with your new password.",
        duration: 6000,
      })
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 2000)
    } catch (err) {
      console.error('Password update error:', err)
      
      let errorMessage = 'Failed to update password'
      
      if (err instanceof Error) {
        // Use our custom error messages if available
        if (err.message.includes('Password reset')) {
          errorMessage = err.message
          // Check if it's a token expiration error
          if (err.message.includes('expired')) {
            setTokenExpired(true)
          }
        } else if (err.message.includes('session')) {
          errorMessage = 'Password reset session has expired. Please request a new reset link.'
          setTokenExpired(true)
        } else if (err.message.includes('weak')) {
          errorMessage = 'Password is too weak. Please choose a stronger password.'
        } else if (err.message.includes('8 characters')) {
          errorMessage = err.message // Use our client-side validation message
        } else if (err.message.includes('uppercase')) {
          errorMessage = err.message // Use our client-side validation message
        } else {
          errorMessage = 'Failed to update password. Please try again.'
        }
      }
      
      setError(errorMessage)
      toast.error("Failed to update password", {
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    if (field === 'password') {
      setShowPassword(!showPassword)
    } else {
      setShowConfirmPassword(!showConfirmPassword)
    }
  }

  const getPasswordStrengthInfo = () => {
    const password = form.watch("password")
    const checks = [
      { test: password.length >= 8, text: "At least 8 characters" },
      { test: /[a-z]/.test(password), text: "One lowercase letter" },
      { test: /[A-Z]/.test(password), text: "One uppercase letter" },
      { test: /\d/.test(password), text: "One number" },
    ]
    
    return checks
  }

  // Loading state while checking token
  if (isValidToken === null) {
    return (
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="#" className="flex items-center gap-2 font-medium">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <Typography variant="T_SemiBold_H6">{APP_NAME}</Typography>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <Typography variant="T_Regular_H6" className="text-muted-foreground">
                  Verifying reset link...
                </Typography>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-muted relative hidden lg:block">
          <Image
            src="/placeholder.svg"
            alt="Reset password illustration"
            fill
            className="object-cover dark:brightness-[0.2] dark:grayscale"
            priority
          />
        </div>
      </div>
    )
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="#" className="flex items-center gap-2 font-medium">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <Typography variant="T_SemiBold_H6">{APP_NAME}</Typography>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                    <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <Typography variant="T_Bold_H3">Password updated!</Typography>
                  <Typography 
                    variant="T_Regular_H6" 
                    className="text-muted-foreground text-balance"
                  >
                    Your password has been successfully updated. You will be redirected to the login page shortly.
                  </Typography>
                </div>
                
                <Link href="/auth/login">
                  <Button className="w-full">
                    <Typography variant="T_SemiBold_H6">
                      Continue to Login
                    </Typography>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-muted relative hidden lg:block">
          <Image
            src="/placeholder.svg"
            alt="Password reset success illustration"
            fill
            className="object-cover dark:brightness-[0.2] dark:grayscale"
            priority
          />
        </div>
      </div>
    )
  }

  // Invalid token state
  if (!isValidToken) {
    return (
      <div className="grid min-h-svh lg:grid-cols-2">
        <div className="flex flex-col gap-4 p-6 md:p-10">
          <div className="flex justify-center gap-2 md:justify-start">
            <a href="#" className="flex items-center gap-2 font-medium">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <Typography variant="T_SemiBold_H6">{APP_NAME}</Typography>
            </a>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-xs">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2 text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                    <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                  <Typography variant="T_Bold_H3">Invalid reset link</Typography>
                  <Typography 
                    variant="T_Regular_H6" 
                    className="text-muted-foreground text-balance"
                  >
                    This password reset link is invalid or has expired. Please request a new one.
                  </Typography>
                </div>
                
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <Link href="/auth/forgot-password">
                    <Button className="w-full">
                      <RefreshCw className="mr-2 h-4 w-4" />
                      <Typography variant="T_SemiBold_H6">
                        Request new reset link
                      </Typography>
                    </Button>
                  </Link>
                  
                  <Link href="/auth/login">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      <Typography variant="T_SemiBold_H6">
                        Back to login
                      </Typography>
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-muted relative hidden lg:block">
          <Image
            src="/placeholder.svg"
            alt="Invalid reset link illustration"
            fill
            className="object-cover dark:brightness-[0.2] dark:grayscale"
            priority
          />
        </div>
      </div>
    )
  }

  // Main reset password form
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            <Typography variant="T_SemiBold_H6">{APP_NAME}</Typography>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
                <div className="flex flex-col items-center gap-2 text-center">
                  <Typography variant="T_Bold_H3">Set new password</Typography>
                  <Typography 
                    variant="T_Regular_H6" 
                    className="text-muted-foreground text-balance"
                  >
                    Create a strong password for your account
                  </Typography>
                </div>
                
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="space-y-2">
                        <Typography variant="T_SemiBold_H6" className="text-sm">
                          {error}
                        </Typography>
                        {tokenExpired && (
                          <div className="pt-2">
                            <Link href="/auth/forgot-password">
                              <Button variant="outline" size="sm" className="w-full">
                                <RefreshCw className="mr-2 h-3 w-3" />
                                Request New Reset Link
                              </Button>
                            </Link>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              className="pr-10"
                              disabled={isLoading}
                              placeholder="Enter new password"
                              {...field} 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => togglePasswordVisibility('password')}
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

                  {/* Password strength indicator */}
                  {form.watch("password") && (
                    <div className="space-y-2">
                      <Typography variant="T_Regular_H6" className="text-sm text-muted-foreground">
                        Password requirements:
                      </Typography>
                      <div className="space-y-1">
                        {getPasswordStrengthInfo().map((check, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${check.test ? 'bg-green-500' : 'bg-gray-300'}`} />
                            <Typography 
                              variant="T_Regular_H6" 
                              className={`text-xs ${check.test ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
                            >
                              {check.text}
                            </Typography>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input 
                              type={showConfirmPassword ? "text" : "password"} 
                              className="pr-10"
                              disabled={isLoading}
                              placeholder="Confirm new password"
                              {...field} 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => togglePasswordVisibility('confirmPassword')}
                              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                            >
                              {showConfirmPassword ? (
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
                      {isLoading ? "Updating..." : "Update password"}
                    </Typography>
                  </Button>
                </div>
                
                <div className="text-center">
                  <Link href="/auth/login">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      <Typography variant="T_SemiBold_H6">
                        Back to login
                      </Typography>
                    </Button>
                  </Link>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/placeholder.svg"
          alt="Reset password illustration"
          fill
          className="object-cover dark:brightness-[0.2] dark:grayscale"
          priority
        />
      </div>
    </div>
  )
}

// Loading component for Suspense fallback
function LoadingFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordPageContent />
    </Suspense>
  )
}