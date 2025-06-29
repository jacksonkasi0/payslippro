"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"

// ** import icons
import { GalleryVerticalEnd, ArrowLeft, ShieldCheck } from "lucide-react"

// ** import shared components
import { Button } from "@/components/ui/button"
import Typography from "@/components/ui/typography"

// ** import supabase client
import { createClient } from "@/lib/supabase/client"

function ConfirmResetPageContent() {
  // Constants
  const APP_NAME = "PaySlip Pro"
  
  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Local State
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tokenParams, setTokenParams] = useState<{ 
    token?: string; 
    token_hash?: string; 
    code?: string; 
    type?: string 
  } | null>(null)
  
  // Extract token parameters on mount
  useEffect(() => {
    const token = searchParams.get('token') || undefined
    const token_hash = searchParams.get('token_hash') || undefined
    const code = searchParams.get('code') || undefined
    const type = searchParams.get('type') || 'recovery' // Default to recovery if not specified
    
    // Check if we have any valid token parameter
    if (token || token_hash || code) {
      setTokenParams({ token, token_hash, code, type })
    } else {
      console.warn('No valid token parameters found')
      setError('Invalid password reset link. Please request a new one.')
    }
  }, [searchParams])

  const handleConfirmReset = async () => {
    if (!tokenParams) {
      console.error('No token parameters available')
      return
    }
    
    setError(null)
    setIsLoading(true)
    
    try {
      // Add a small delay to show the user something is happening
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Success - redirect to reset password page with the token
      const params = new URLSearchParams()
      
      // Use whichever token parameter we have, prioritizing token_hash, then code, then token
      if (tokenParams.token_hash) {
        params.set('token_hash', tokenParams.token_hash)
      } else if (tokenParams.code) {
        params.set('token_hash', tokenParams.code) // Pass code as token_hash
      } else if (tokenParams.token) {
        params.set('token_hash', tokenParams.token) // Pass token as token_hash
      }
      
      params.set('type', tokenParams.type || 'recovery')
      params.set('verified', 'true')
      
      toast.success("Verification successful!", {
        description: "Redirecting to password reset form...",
      })
      
      router.push(`/auth/reset-password?${params.toString()}`)
      
    } catch (err) {
      console.error('Unexpected error during confirmation:', err)
      setError('Unable to process reset link. Please try requesting a new one.')
      toast.error("Verification failed", {
        description: "Please try requesting a new password reset link.",
      })
    } finally {
      setIsLoading(false)
    }
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
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                  <ShieldCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <Typography variant="T_Bold_H3">Confirm Password Reset</Typography>
                <Typography 
                  variant="T_Regular_H6" 
                  className="text-muted-foreground text-balance"
                >
                  Click the button below to confirm that you want to reset your password. This helps protect your account from unauthorized access.
                </Typography>
              </div>
              
              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3">
                <Button
                  onClick={handleConfirmReset}
                  disabled={isLoading || !tokenParams}
                  className="w-full"
                >
                  <Typography variant="T_SemiBold_H6">
                    {isLoading ? "Verifying..." : "Confirm Password Reset"}
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
                  If you didn't request a password reset, you can safely ignore this and your password will remain unchanged.
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <Image
          src="/placeholder.svg"
          alt="Confirm password reset illustration"
          fill
          className="object-cover dark:brightness-[0.2] dark:grayscale"
          priority
        />
      </div>
    </div>
  )
}

export default function ConfirmResetPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ConfirmResetPageContent />
    </Suspense>
  )
}