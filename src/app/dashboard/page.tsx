'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
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

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-foreground">PaySlip Pro Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user.email}
            </span>
            <ModeToggle />
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-foreground mb-2">
              Dashboard
            </h2>
            <p className="text-muted-foreground">
              Manage your organization's payroll and employee data
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Total Employees
              </h3>
              <p className="text-2xl font-bold text-card-foreground">0</p>
            </div>
            
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Payslips This Month
              </h3>
              <p className="text-2xl font-bold text-card-foreground">0</p>
            </div>
            
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Departments
              </h3>
              <p className="text-2xl font-bold text-card-foreground">0</p>
            </div>
            
            <div className="p-6 border rounded-lg bg-card">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                Pending Emails
              </h3>
              <p className="text-2xl font-bold text-card-foreground">0</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Manage Employees
              </h3>
              <p className="text-muted-foreground mb-4">
                Add, edit, and manage your organization's employees
              </p>
              <Button className="w-full">
                View Employees
              </Button>
            </div>
            
            <div className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Generate Payslips
              </h3>
              <p className="text-muted-foreground mb-4">
                Create and send payslips for the current month
              </p>
              <Button className="w-full">
                Create Payslips
              </Button>
            </div>
            
            <div className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow">
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Attendance Tracking
              </h3>
              <p className="text-muted-foreground mb-4">
                Track and manage employee attendance records
              </p>
              <Button className="w-full">
                View Attendance
              </Button>
            </div>
          </div>

          {/* User Profile Info */}
          {user.adminProfile && (
            <div className="mt-8 p-6 border rounded-lg bg-card">
              <h3 className="text-lg font-semibold text-card-foreground mb-4">
                Your Profile
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium capitalize">{user.adminProfile.role}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}