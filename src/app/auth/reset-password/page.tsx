"use client"

import React, { useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"

// ** import icons
import { GalleryVerticalEnd, Eye, EyeOff, ArrowLeft, AlertCircle } from "lucide-react"

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
  const { updatePassword } = useAuth()

  // Local State
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  
  // Form
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  // Event Handlers
  const onSubmit = async (values: ResetPasswordFormValues) => {
    console.log('Form submission started')
    setError(null)
    setIsLoading(true)
    
    try {
      console.log('Updating password for authenticated user...', {
        timestamp: new Date().toISOString()
      })
      
      // Server-side calls are more reliable, use longer timeout
      const updatePromise = updatePassword(values.password)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Password update timed out')), 60000) // 60 second timeout
      })
      
      // Race between update and timeout
      await Promise.race([updatePromise, timeoutPromise])
      console.log('Password update completed successfully')
      
      setIsSuccess(true)
      toast.success("Password updated successfully!", {
        description: "Your password has been reset. Redirecting to dashboard...",
        duration: 6000,
      })
      
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
    } catch (err) {
      console.error('Password update error:', err)
      
      let errorMessage = 'Failed to update password'
      
      if (err instanceof Error) {
        if (err.message.includes('timed out')) {
          errorMessage = 'Password update timed out. Please try again or request a new reset link.'
        } else if (err.message.includes('session') || err.message.includes('401')) {
          errorMessage = 'Your session has expired. Please request a new password reset link.'
        } else if (err.message.includes('Network error')) {
          errorMessage = 'Network error. Please check your connection and try again.'
        } else if (err.message.includes('weak')) {
          errorMessage = 'Password is too weak. Please choose a stronger password.'
        } else if (err.message.includes('8 characters')) {
          errorMessage = err.message
        } else if (err.message.includes('uppercase')) {
          errorMessage = err.message
        } else {
          errorMessage = err.message || 'Failed to update password. Please try again.'
        }
      }
      
      setError(errorMessage)
      toast.error("Failed to update password", {
        description: errorMessage,
      })
    } finally {
      console.log('Form submission completed, setting loading to false')
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
                    Your password has been successfully updated. Redirecting to dashboard...
                  </Typography>
                </div>
                
                <Link href="/dashboard">
                  <Button className="w-full">
                    <Typography variant="T_SemiBold_H6">
                      Continue to Dashboard
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
                      <Typography variant="T_SemiBold_H6" className="text-sm">
                        {error}
                      </Typography>
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
                              disabled={isLoading}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                              disabled={isLoading}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password strength indicator */}
                  <div className="space-y-2">
                    <Typography variant="T_SemiBold_H6" className="text-sm">
                      Password requirements:
                    </Typography>
                    <ul className="space-y-1">
                      {getPasswordStrengthInfo().map((check, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm">
                          <div className={`h-2 w-2 rounded-full ${check.test ? 'bg-green-500' : 'bg-gray-300'}`} />
                          <span className={check.test ? 'text-green-600' : 'text-gray-500'}>
                            {check.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full"
                  >
                    <Typography variant="T_SemiBold_H6">
                      {isLoading ? "Updating password..." : "Update password"}
                    </Typography>
                  </Button>
                  
                  <Link href="/auth/forgot-password">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      <Typography variant="T_SemiBold_H6">
                        Request new reset link
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordPageContent />
    </Suspense>
  )
}