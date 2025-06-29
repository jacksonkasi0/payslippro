"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Image from "next/image"
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

// ** import icons
import { GalleryVerticalEnd, Eye, EyeOff } from "lucide-react"

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
const signupSchema = z.object({
  organization: z.string().min(2, "Organization name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type SignupFormValues = z.infer<typeof signupSchema>

export default function SignupPage() {
  // Constants
  const APP_NAME = "PaySlip Pro"
  
  // Hooks
  const router = useRouter()
  const { signUp, signInWithGoogle } = useAuth()
  
  // Local State
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      organization: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })
  
  // Event Handlers
  const onSubmit = async (values: SignupFormValues) => {
    setError(null)
    setIsLoading(true)
    
    try {
      await signUp(values.email, values.password, values.organization)
      
      // Check if email confirmation is required
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // Email confirmation required - show success message
        toast.success("Account created successfully!", {
          description: "Please check your email to confirm your account before logging in.",
          duration: 6000,
        })
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          router.push('/auth/login')
        }, 1500)
      } else {
        // Email confirmation not required - proceed to dashboard
        toast.success("Welcome to PaySlip Pro!", {
          description: "Your account has been created successfully.",
        })
        router.push('/dashboard')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create account'
      setError(errorMessage)
      toast.error("Signup failed", {
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    setError(null)
    setIsLoading(true)
    
    try {
      await signInWithGoogle()
      // Google OAuth will handle the redirect
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign up with Google'
      setError(errorMessage)
      toast.error("Google signup failed", {
        description: errorMessage,
      })
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword)
  }

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
                  <Typography variant="T_Bold_H3">Create your account</Typography>
                  <Typography 
                    variant="T_Regular_H6" 
                    className="text-muted-foreground text-balance"
                  >
                    Enter your details to get started
                  </Typography>
                </div>
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}
                <div className="grid gap-6">
                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Organization</FormLabel>
                        <FormControl>
                          <Input 
                            type="text" 
                            placeholder="Your organization name" 
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
                        <FormLabel>Password</FormLabel>
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
                              {...field} 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={toggleConfirmPasswordVisibility}
                              aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
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
                      {isLoading ? "Creating Account..." : "Create Account"}
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
                    onClick={handleGoogleSignup}
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
                    <Typography variant="T_SemiBold_H6">Sign up with Google</Typography>
                  </Button>
                </div>
                <div className="text-center text-sm space-y-2">
                  <div>
                    <Typography variant="T_Regular_H6" className="inline">
                      Already have an account?{" "}
                    </Typography>
                    <a href="/auth/login" className="underline underline-offset-4">
                      <Typography variant="T_Regular_H6" className="inline">
                        Sign in
                      </Typography>
                    </a>
                  </div>
                  <div>
                    <Typography variant="T_Regular_H6" className="inline text-muted-foreground">
                      Need to resend confirmation email?{" "}
                    </Typography>
                    <a href="/auth/login" className="underline underline-offset-4">
                      <Typography variant="T_Regular_H6" className="inline">
                        Go to login
                      </Typography>
                    </a>
                  </div>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/placeholder.svg"
          alt="Signup illustration"
          fill
          className="object-cover dark:brightness-[0.2] dark:grayscale"
          priority
        />
      </div>
    </div>
  )
} 