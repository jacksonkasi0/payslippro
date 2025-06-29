import { Metadata } from "next"
import { EmployeeDashboard } from "@/components/employee/employee-dashboard"

export const metadata: Metadata = {
  title: "Employee Management - PaySlip Pro",
  description: "Manage employees, departments, and payroll information",
}

export default function EmployeesPage() {
  return (
    <div className="container mx-auto py-6">
      <EmployeeDashboard />
    </div>
  )
}