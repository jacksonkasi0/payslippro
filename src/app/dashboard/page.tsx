'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ModeToggle } from '@/components/mode-toggle'
import Typography from '@/components/ui/typography'
import { Users, FileText, Calendar, Settings, Mail, History } from 'lucide-react'

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
          <Typography variant="T_Bold_H4" className="text-foreground">PaySlip Pro Dashboard</Typography>
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
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <Typography variant="T_Bold_H2" className="text-foreground mb-2">
              Dashboard
            </Typography>
            <Typography variant="T_Regular_H6" className="text-muted-foreground">
              Manage your organization&apos;s payroll and employee data
            </Typography>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="p-6 border rounded-lg bg-card">
              <Typography variant="T_Regular_H6" className="text-muted-foreground mb-2">
                Total Employees
              </Typography>
              <Typography variant="T_Bold_H2" className="text-card-foreground">0</Typography>
            </div>
            
            <div className="p-6 border rounded-lg bg-card">
              <Typography variant="T_Regular_H6" className="text-muted-foreground mb-2">
                Payslips This Month
              </Typography>
              <Typography variant="T_Bold_H2" className="text-card-foreground">0</Typography>
            </div>
            
            <div className="p-6 border rounded-lg bg-card">
              <Typography variant="T_Regular_H6" className="text-muted-foreground mb-2">
                Departments
              </Typography>
              <Typography variant="T_Bold_H2" className="text-card-foreground">0</Typography>
            </div>
            
            <div className="p-6 border rounded-lg bg-card">
              <Typography variant="T_Regular_H6" className="text-muted-foreground mb-2">
                Pending Emails
              </Typography>
              <Typography variant="T_Bold_H2" className="text-card-foreground">0</Typography>
            </div>
          </div>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/employees">
              <div className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <Typography variant="T_SemiBold_H5" className="text-card-foreground">
                    Manage Employees
                  </Typography>
                </div>
                <Typography variant="T_Regular_H6" className="text-muted-foreground mb-4">
                  Add, edit, and manage your organization&apos;s employees
                </Typography>
                <Button className="w-full">
                  View Employees
                </Button>
              </div>
            </Link>
            
            <div className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <Typography variant="T_SemiBold_H5" className="text-card-foreground">
                  Generate Payslips
                </Typography>
              </div>
              <Typography variant="T_Regular_H6" className="text-muted-foreground mb-4">
                Create and send payslips for the current month
              </Typography>
              <Button className="w-full">
                Create Payslips
              </Button>
            </div>
            
            <div className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <Typography variant="T_SemiBold_H5" className="text-card-foreground">
                  Attendance Tracking
                </Typography>
              </div>
              <Typography variant="T_Regular_H6" className="text-muted-foreground mb-4">
                Track and manage employee attendance records
              </Typography>
              <Button className="w-full">
                View Attendance
              </Button>
            </div>

            <div className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Mail className="h-6 w-6 text-orange-600" />
                </div>
                <Typography variant="T_SemiBold_H5" className="text-card-foreground">
                  Email Templates
                </Typography>
              </div>
              <Typography variant="T_Regular_H6" className="text-muted-foreground mb-4">
                Manage email templates for payslip delivery
              </Typography>
              <Button className="w-full">
                Manage Templates
              </Button>
            </div>

            <div className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-100 rounded-lg">
                  <History className="h-6 w-6 text-red-600" />
                </div>
                <Typography variant="T_SemiBold_H5" className="text-card-foreground">
                  Send History
                </Typography>
              </div>
              <Typography variant="T_Regular_H6" className="text-muted-foreground mb-4">
                View history of sent payslips and emails
              </Typography>
              <Button className="w-full">
                View History
              </Button>
            </div>

            <div className="p-6 border rounded-lg bg-card hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Settings className="h-6 w-6 text-gray-600" />
                </div>
                <Typography variant="T_SemiBold_H5" className="text-card-foreground">
                  Settings
                </Typography>
              </div>
              <Typography variant="T_Regular_H6" className="text-muted-foreground mb-4">
                Configure organization settings and preferences
              </Typography>
              <Button className="w-full">
                Open Settings
              </Button>
            </div>
          </div>

          {/* User Profile Info */}
          {user.adminProfile && (
            <div className="mt-8 p-6 border rounded-lg bg-card">
              <Typography variant="T_SemiBold_H5" className="text-card-foreground mb-4">
                Your Profile
              </Typography>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Typography variant="T_Regular_H6" className="text-muted-foreground">Email</Typography>
                  <Typography variant="T_Medium_H6">{user.email}</Typography>
                </div>
                <div>
                  <Typography variant="T_Regular_H6" className="text-muted-foreground">Role</Typography>
                  <Typography variant="T_Medium_H6" className="capitalize">{user.adminProfile.role}</Typography>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}