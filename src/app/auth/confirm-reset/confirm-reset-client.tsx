"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Typography from "@/components/ui/typography"

type SearchParams = {
  token?: string
  token_hash?: string
  code?: string
  type?: string
}

interface ConfirmResetClientProps {
  searchParams: SearchParams
}

export default function ConfirmResetClient({ searchParams }: ConfirmResetClientProps) {
  const router = useRouter()
  
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
    const { token, token_hash, code, type = 'recovery' } = searchParams
    
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
    <div className="flex flex-col gap-3">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

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
  )
} 