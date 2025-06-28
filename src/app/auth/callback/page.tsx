'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { organizationService } from '@/lib/database'
import { supabase } from '@/lib/supabase'
import { Button, Input, Label, Typography } from '@/components/ui'
import { GalleryVerticalEnd } from 'lucide-react'

export default function CallbackPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [organizationName, setOrganizationName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [needsOrganization, setNeedsOrganization] = useState(false)

  useEffect(() => {
    checkUserOrganization()
  }, [user])

  const checkUserOrganization = async () => {
    if (!user) {
      setIsLoading(false)
      return
    }

    // Check if user already has an organization
    if (user.adminProfile?.organization_id) {
      router.push('/dashboard')
      return
    }

    // User needs to create/join an organization
    setNeedsOrganization(true)
    setIsLoading(false)
  }

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!user) {
      setError('No user found')
      setIsLoading(false)
      return
    }

    try {
      // Create organization
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert({ name: organizationName })
        .select()
        .single()

      if (orgError) throw orgError

      // Create admin user profile
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          id: user.id,
          email: user.email!,
          role: 'admin',
          organization_id: organization.id
        })

      if (adminError) throw adminError

      // Redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Failed to create organization')
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up your account...</p>
        </div>
      </div>
    )
  }

  if (needsOrganization) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="flex justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <Typography variant="T_SemiBold_H6">PaySlip Pro</Typography>
            </div>
          </div>
          
          <div className="border rounded-lg p-6 bg-card">
            <form onSubmit={handleCreateOrganization} className="space-y-6">
              <div className="text-center">
                <Typography variant="T_Bold_H4">Welcome to PaySlip Pro!</Typography>
                <Typography variant="T_Regular_H6" className="text-muted-foreground mt-2">
                  Create your organization to get started
                </Typography>
              </div>

              {error && (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="organization">Organization Name</Label>
                <Input
                  id="organization"
                  type="text"
                  placeholder="Enter your organization name"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                <Typography variant="T_SemiBold_H6">
                  {isLoading ? 'Creating Organization...' : 'Create Organization'}
                </Typography>
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return null
} 