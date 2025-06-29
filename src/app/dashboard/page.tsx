'use client'

import { useAuth } from '@/hooks/useAuth'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Typography from '@/components/ui/typography'
import { Users, FileText, Calendar, Settings, Mail, History, Plus, TrendingUp } from 'lucide-react'
import { Navigation } from '@/components/layout/navigation'

export default function DashboardPage() {
  const { user, loading } = useAuth()
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
      <Navigation />
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <Typography variant="T_Bold_H2" className="text-foreground mb-2">
              Welcome back!
            </Typography>
            <Typography variant="T_Regular_H6" className="text-muted-foreground">
              Here&apos;s what&apos;s happening with your payroll system today.
            </Typography>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="p-6 border rounded-lg bg-card">
              <div className="flex items-center justify-between mb-2">
                <Typography variant="T_Regular_H6" className="text-muted-foreground">
                  Total Employees
                </Typography>
                <Users className="h-5 w-5 text-muted-foreground" />
              </div>
              <Typography variant="T_Bold_H2" className="text-card-foreground">0</Typography>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <Typography variant="T_Regular_H6" className="text-green-500 text-sm">+0% from last month</Typography>
              </div>
            </div>
            
            <div className="p-6 border rounded-lg bg-card">
              <div className="flex items-center justify-between mb-2">
                <Typography variant="T_Regular_H6" className="text-muted-foreground">
                  Payslips This Month
                </Typography>
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <Typography variant="T_Bold_H2" className="text-card-foreground">0</Typography>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <Typography variant="T_Regular_H6" className="text-green-500 text-sm">Ready to generate</Typography>
              </div>
            </div>
            
            <div className="p-6 border rounded-lg bg-card">
              <div className="flex items-center justify-between mb-2">
                <Typography variant="T_Regular_H6" className="text-muted-foreground">
                  Active Departments
                </Typography>
                <Settings className="h-5 w-5 text-muted-foreground" />
              </div>
              <Typography variant="T_Bold_H2" className="text-card-foreground">0</Typography>
              <div className="flex items-center mt-2">
                <Typography variant="T_Regular_H6" className="text-muted-foreground text-sm">Across organization</Typography>
              </div>
            </div>
            
            <div className="p-6 border rounded-lg bg-card">
              <div className="flex items-center justify-between mb-2">
                <Typography variant="T_Regular_H6" className="text-muted-foreground">
                  Pending Actions
                </Typography>
                <Mail className="h-5 w-5 text-muted-foreground" />
              </div>
              <Typography variant="T_Bold_H2" className="text-card-foreground">0</Typography>
              <div className="flex items-center mt-2">
                <Typography variant="T_Regular_H6" className="text-muted-foreground text-sm">Tasks to complete</Typography>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions Grid */}
            <div className="space-y-6">
              <Typography variant="T_Bold_H3" className="text-foreground">
                Quick Actions
              </Typography>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Link href="/employees">
                  <div className="p-6 border rounded-lg bg-card hover:shadow-md transition-all duration-200 cursor-pointer group">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:scale-110 transition-transform">
                        <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <Typography variant="T_SemiBold_H5" className="text-card-foreground">
                        Manage Employees
                      </Typography>
                    </div>
                    <Typography variant="T_Regular_H6" className="text-muted-foreground mb-4">
                      Add, edit, and manage your organization&apos;s employees
                    </Typography>
                    <Button className="w-full">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Employee
                    </Button>
                  </div>
                </Link>
                
                <div className="p-6 border rounded-lg bg-card hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg group-hover:scale-110 transition-transform">
                      <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <Typography variant="T_SemiBold_H5" className="text-card-foreground">
                      Generate Payslips
                    </Typography>
                  </div>
                  <Typography variant="T_Regular_H6" className="text-muted-foreground mb-4">
                    Create and send payslips for the current month
                  </Typography>
                  <Button className="w-full">
                    <FileText className="mr-2 h-4 w-4" />
                    Create Payslips
                  </Button>
                </div>

                <div className="p-6 border rounded-lg bg-card hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg group-hover:scale-110 transition-transform">
                      <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <Typography variant="T_SemiBold_H5" className="text-card-foreground">
                      Attendance
                    </Typography>
                  </div>
                  <Typography variant="T_Regular_H6" className="text-muted-foreground mb-4">
                    Track and manage employee attendance records
                  </Typography>
                  <Button className="w-full">
                    <Calendar className="mr-2 h-4 w-4" />
                    View Attendance
                  </Button>
                </div>

                <div className="p-6 border rounded-lg bg-card hover:shadow-md transition-all duration-200 cursor-pointer group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg group-hover:scale-110 transition-transform">
                      <Mail className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <Typography variant="T_SemiBold_H5" className="text-card-foreground">
                      Email Templates
                    </Typography>
                  </div>
                  <Typography variant="T_Regular_H6" className="text-muted-foreground mb-4">
                    Manage email templates for payslip delivery
                  </Typography>
                  <Button className="w-full">
                    <Mail className="mr-2 h-4 w-4" />
                    Manage Templates
                  </Button>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="space-y-6">
              <Typography variant="T_Bold_H3" className="text-foreground">
                Recent Activity
              </Typography>
              
              <div className="border rounded-lg bg-card p-6">
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <Typography variant="T_Medium_H6" className="text-muted-foreground mb-2">
                    No recent activity
                  </Typography>
                  <Typography variant="T_Regular_H6" className="text-muted-foreground text-sm">
                    Start by adding employees or generating payslips
                  </Typography>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}