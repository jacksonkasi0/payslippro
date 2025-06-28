'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ModeToggle } from "@/components/mode-toggle";

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/auth/login')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header with theme toggle */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">PaySlip Pro</h1>
          <ModeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            Professional Payslip Management
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Generate, manage, and organize your payslips with ease. 
            A modern solution for your payroll needs.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Easy Generation
              </h3>
              <p className="text-muted-foreground">
                Create professional payslips quickly with our intuitive interface.
              </p>
            </div>
            
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Secure Storage
              </h3>
              <p className="text-muted-foreground">
                Keep your payroll data safe and organized in one place.
              </p>
            </div>
            
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Easy Export
              </h3>
              <p className="text-muted-foreground">
                Download your payslips in various formats when you need them.
              </p>
            </div>
          </div>

          <div className="mt-12">
            <p className="text-sm text-muted-foreground">
              Redirecting to login...
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}