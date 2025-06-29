"use client"

import React, { useState, useEffect } from "react"
import { Plus, Search, Filter, Edit, Calendar, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Typography from "@/components/ui/typography"
import { EmployeeModal } from "./employee-modal"
import { Employee, Department, Position, CreateEmployeeData } from "@/lib/types/employee"

// Mock data - replace with actual API calls
const mockEmployees: Employee[] = [
  {
    id: "1",
    employee_code: "EM00030",
    full_name: "THARSHINI M K",
    email: "tharshini.peacockindia@gmail.com",
    employment_status: "active",
    department_id: "1",
    position_id: "1",
    organization_id: "1",
    profile_photo_url: "",
    earnings: [
      { id: "1", type: "Basic", amount: 45000 },
      { id: "2", type: "HRA", amount: 7000 },
    ],
    deductions: [
      { id: "1", type: "PF", amount: 1800 },
      { id: "2", type: "Tax", amount: 3000 },
    ],
    created_at: "2024-01-01",
    updated_at: "2024-01-01",
    department: { id: "1", name: "Product", organization_id: "1", created_at: "", updated_at: "" },
    position: { id: "1", name: "Product Manager", organization_id: "1", created_at: "", updated_at: "" },
  },
  // Add more mock employees as needed
]

const mockDepartments: Department[] = [
  { id: "1", name: "Product", organization_id: "1", created_at: "", updated_at: "" },
  { id: "2", name: "IT Department", organization_id: "1", created_at: "", updated_at: "" },
]

const mockPositions: Position[] = [
  { id: "1", name: "Product Manager", organization_id: "1", created_at: "", updated_at: "" },
  { id: "2", name: "Software Engineer", organization_id: "1", created_at: "", updated_at: "" },
]

interface EmployeeDashboardProps {
  className?: string
}

export function EmployeeDashboard({ className }: EmployeeDashboardProps) {
  const [employees, setEmployees] = useState<Employee[]>(mockEmployees)
  const [departments, setDepartments] = useState<Department[]>(mockDepartments)
  const [positions, setPositions] = useState<Position[]>(mockPositions)
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [showPayslipCalendar, setShowPayslipCalendar] = useState(false)
  const [selectedMonth, setSelectedMonth] = useState(new Date())

  // Filter employees based on search and filters
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = employee.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         employee.employee_code.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDepartment = departmentFilter === "all" || employee.department_id === departmentFilter
    const matchesStatus = statusFilter === "all" || employee.employment_status === statusFilter

    return matchesSearch && matchesDepartment && matchesStatus
  })

  // Calculate statistics
  const totalEmployees = employees.length
  const configuredSalaries = employees.filter(emp => emp.earnings.length > 0).length
  const selectedForEmail = selectedEmployees.length
  const totalDepartments = departments.length

  const handleSelectEmployee = (employeeId: string, checked: boolean) => {
    if (checked) {
      setSelectedEmployees([...selectedEmployees, employeeId])
    } else {
      setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id))
    } else {
      setSelectedEmployees([])
    }
  }

  const handleAddEmployee = () => {
    setEditingEmployee(null)
    setIsModalOpen(true)
  }

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee)
    setIsModalOpen(true)
  }

  const handleDeleteEmployee = async (employeeId: string) => {
    try {
      // API call to delete employee
      setEmployees(employees.filter(emp => emp.id !== employeeId))
      toast.success("Employee deleted successfully")
    } catch (error) {
      toast.error("Failed to delete employee")
    }
  }

  const handleSaveEmployee = async (data: CreateEmployeeData) => {
    try {
      if (editingEmployee) {
        // Update existing employee
        const updatedEmployee: Employee = {
          ...editingEmployee,
          ...data,
          earnings: data.earnings.map((e, i) => ({ ...e, id: String(i + 1) })),
          deductions: data.deductions.map((d, i) => ({ ...d, id: String(i + 1) })),
          updated_at: new Date().toISOString(),
        }
        setEmployees(employees.map(emp => emp.id === editingEmployee.id ? updatedEmployee : emp))
        toast.success("Employee updated successfully")
      } else {
        // Create new employee
        const newEmployee: Employee = {
          id: String(employees.length + 1),
          employee_code: `EM${String(employees.length + 1).padStart(5, '0')}`,
          organization_id: "1",
          earnings: data.earnings.map((e, i) => ({ ...e, id: String(i + 1) })),
          deductions: data.deductions.map((d, i) => ({ ...d, id: String(i + 1) })),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...data,
        }
        setEmployees([...employees, newEmployee])
        toast.success("Employee created successfully")
      }
    } catch (error) {
      toast.error("Failed to save employee")
      throw error
    }
  }

  const handleCreateDepartment = async (name: string): Promise<Department> => {
    const newDepartment: Department = {
      id: String(departments.length + 1),
      name,
      organization_id: "1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setDepartments([...departments, newDepartment])
    return newDepartment
  }

  const handleCreatePosition = async (name: string): Promise<Position> => {
    const newPosition: Position = {
      id: String(positions.length + 1),
      name,
      organization_id: "1",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setPositions([...positions, newPosition])
    return newPosition
  }

  const handleSendPayslips = () => {
    if (selectedEmployees.length === 0) {
      toast.error("Please select employees to send payslips")
      return
    }
    setShowPayslipCalendar(true)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "inactive":
        return "secondary"
      case "probation":
        return "outline"
      default:
        return "secondary"
    }
  }

  const calculateSalary = (employee: Employee) => {
    const totalEarnings = employee.earnings.reduce((sum, earning) => sum + earning.amount, 0)
    return totalEarnings
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <Typography variant="T_Bold_H3">Employer Dashboard</Typography>
          <Typography variant="T_Regular_H6" className="text-muted-foreground">
            Manage employees and send payslips
          </Typography>
        </div>
        <Button onClick={handleAddEmployee}>
          <Plus className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <div className="w-4 h-4 bg-blue-600 rounded"></div>
            </div>
            <Typography variant="T_Regular_H6" className="text-muted-foreground">Total</Typography>
          </div>
          <Typography variant="T_Bold_H2" className="text-blue-600">{totalEmployees}</Typography>
          <Typography variant="T_Regular_H6" className="text-muted-foreground">employees</Typography>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <div className="w-4 h-4 bg-green-600 rounded"></div>
            </div>
            <Typography variant="T_Regular_H6" className="text-muted-foreground">Configured</Typography>
          </div>
          <Typography variant="T_Bold_H2" className="text-green-600">{configuredSalaries}</Typography>
          <Typography variant="T_Regular_H6" className="text-muted-foreground">salaries</Typography>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <div className="w-4 h-4 bg-orange-600 rounded"></div>
            </div>
            <Typography variant="T_Regular_H6" className="text-muted-foreground">Selected</Typography>
          </div>
          <Typography variant="T_Bold_H2" className="text-orange-600">{selectedForEmail}</Typography>
          <Typography variant="T_Regular_H6" className="text-muted-foreground">for email</Typography>
        </div>

        <div className="bg-card p-6 rounded-lg border">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <div className="w-4 h-4 bg-purple-600 rounded"></div>
            </div>
            <Typography variant="T_Regular_H6" className="text-muted-foreground">Departments</Typography>
          </div>
          <Typography variant="T_Bold_H2" className="text-purple-600">{totalDepartments}</Typography>
          <Typography variant="T_Regular_H6" className="text-muted-foreground">total</Typography>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Typography variant="T_SemiBold_H5">Employees ({filteredEmployees.length})</Typography>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search employees..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
              <SelectItem value="probation">Probation</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={selectedEmployees.length === filteredEmployees.length && filteredEmployees.length > 0}
            onCheckedChange={handleSelectAll}
          />
          <Typography variant="T_Regular_H6">Select All</Typography>
        </div>
      </div>

      {/* Employee Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">Select</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedEmployees.includes(employee.id)}
                    onCheckedChange={(checked) => handleSelectEmployee(employee.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={employee.profile_photo_url} />
                      <AvatarFallback className="text-xs">
                        {getInitials(employee.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <Typography variant="T_Medium_H6">{employee.full_name}</Typography>
                  </div>
                </TableCell>
                <TableCell>
                  <Typography variant="T_Regular_H6" className="text-muted-foreground">
                    {employee.employee_code}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="T_Regular_H6">
                    {employee.department?.name || "-"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="T_Regular_H6">
                    {employee.position?.name || "-"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="T_Regular_H6" className="text-muted-foreground">
                    {employee.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(employee.employment_status)}>
                    {employee.employment_status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Typography variant="T_Medium_H6">
                    ₹{calculateSalary(employee).toLocaleString()}
                  </Typography>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditEmployee(employee)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteEmployee(employee.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Send Payslips Section */}
      {selectedEmployees.length > 0 && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Typography variant="T_Medium_H6">
              {selectedEmployees.length} selected
            </Typography>
            {showPayslipCalendar && (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Typography variant="T_Medium_H6">2025</Typography>
                <Button variant="ghost" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          <Button onClick={handleSendPayslips}>
            <Calendar className="mr-2 h-4 w-4" />
            Send Payslips
          </Button>
        </div>
      )}

      {/* Employee Modal */}
      <EmployeeModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        employee={editingEmployee}
        departments={departments}
        positions={positions}
        onSave={handleSaveEmployee}
        onCreateDepartment={handleCreateDepartment}
        onCreatePosition={handleCreatePosition}
      />
    </div>
  )
}