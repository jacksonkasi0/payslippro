import { Metadata } from "next"
import { Navigation } from "@/components/layout/navigation"
import Typography from "@/components/ui/typography"
import { Users } from "lucide-react"

import EmployeeTable from "./data-table"

export const metadata: Metadata = {
  title: "Employee Management - PaySlip Pro",
  description: "Add, edit, and track employee information",
}

export default function EmployeesPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                <Typography variant="T_Bold_H2" className="text-foreground">
                  Employee Management
                </Typography>
              </div>
              <Typography variant="T_Regular_H6" className="text-muted-foreground">
                Add, edit, and track employee information
              </Typography>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="T_Regular_H6" className="text-muted-foreground text-sm">
                    Total Employees
                  </Typography>
                  <Typography variant="T_Bold_H4" className="text-card-foreground">0</Typography>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </div>
            
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="T_Regular_H6" className="text-muted-foreground text-sm">
                    Active Employees
                  </Typography>
                  <Typography variant="T_Bold_H4" className="text-card-foreground">0</Typography>
                </div>
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="T_Regular_H6" className="text-muted-foreground text-sm">
                    Departments
                  </Typography>
                  <Typography variant="T_Bold_H4" className="text-card-foreground">0</Typography>
                </div>
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                </div>
              </div>
            </div>
            
            <div className="p-4 border rounded-lg bg-card">
              <div className="flex items-center justify-between">
                <div>
                  <Typography variant="T_Regular_H6" className="text-muted-foreground text-sm">
                    Pending Actions
                  </Typography>
                  <Typography variant="T_Bold_H4" className="text-card-foreground">0</Typography>
                </div>
                <div className="h-8 w-8 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center">
                  <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Employee Data Table */}
          <div className="space-y-4">
            <Typography variant="T_Bold_H4" className="text-foreground">
              All Employees
            </Typography>
            <EmployeeTable />
          </div>
        </div>
      </main>
    </div>
  )
}