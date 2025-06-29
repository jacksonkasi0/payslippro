"use client"

import React, { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"

// ** import icons
import { GalleryVerticalEnd, ArrowLeft, Clock, AlertCircle } from "lucide-react"

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

// ** Form schema
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  // Constants
  const APP_NAME = "PaySlip Pro"
  
  // Hooks
  const { resetPassword } = useAuth()
  
  // Local State
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sentEmail, setSentEmail] = useState<string>("")
  
  // Form
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })
  
  // Event Handlers
  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setError(null)
    setIsLoading(true)
    
    try {
      await resetPassword(values.email)
      setSentEmail(values.email)
      setIsEmailSent(true)
      toast.success("Reset email sent!", {
        description: "Please check your email for password reset instructions.",
        duration: 6000,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send reset email'
      setError(errorMessage)
      toast.error("Failed to send reset email", {
        description: "Please try again or contact support if the problem persists.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendEmail = async () => {
    if (!sentEmail) return
    
    setError(null)
    setIsLoading(true)
    
    try {
      await resetPassword(sentEmail)
      toast.success("Reset email sent again!", {
        description: "Please check your email for password reset instructions.",
        duration: 6000,
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to resend reset email'
      setError(errorMessage)
      toast.error("Failed to resend reset email", {
        description: errorMessage,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
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
                  <Typography variant="T_Bold_H3">Check your email</Typography>
                  <Typography 
                    variant="T_Regular_H6" 
                    className="text-muted-foreground text-balance"
                  >
                    We&apos;ve sent password reset instructions to:
                  </Typography>
                  <Typography 
                    variant="T_SemiBold_H6" 
                    className="text-primary"
                  >
                    {sentEmail}
                  </Typography>
                </div>

                {/* Important Information Alert */}
                <Alert>
                  <Clock className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <Typography variant="T_SemiBold_H6" className="text-sm">
                        Important Information:
                      </Typography>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• The reset link is valid for <strong>1 hour</strong></li>
                        <li>• If you request multiple links, only the <strong>most recent</strong> one will work</li>
                        <li>• Check your spam folder if you don&apos;t see the email</li>
                        <li>• Complete the reset process promptly to avoid expiration</li>
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
                
                {error && (
                  <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-3">
                  <Button
                    type="button"
                    onClick={handleResendEmail}
                    disabled={isLoading}
                    variant="outline"
                    className="w-full"
                  >
                    <Typography variant="T_SemiBold_H6">
                      {isLoading ? "Sending..." : "Resend email"}
                    </Typography>
                  </Button>
                  
                  <Link href="/auth/login">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      <Typography variant="T_SemiBold_H6">
                        Back to login
                      </Typography>
                    </Button>
                  </Link>
                </div>

                <div className="text-center text-sm">
                  <Typography variant="T_Regular_H6" className="text-muted-foreground">
                    Didn&apos;t receive the email? Check your spam folder or try again.
                  </Typography>
                </div>
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
                  <Typography variant="T_Bold_H3">Forgot your password?</Typography>
                  <Typography 
                    variant="T_Regular_H6" 
                    className="text-muted-foreground text-balance"
                  >
                    Enter your email address and we&apos;ll send you a link to reset your password.
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
                  
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    <Typography variant="T_SemiBold_H6">
                      {isLoading ? "Sending..." : "Send reset email"}
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