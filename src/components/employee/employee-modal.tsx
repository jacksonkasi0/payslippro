"use client"

import React, { useState, useEffect } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { X, Upload, Plus, Trash2, Camera } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import Typography from "@/components/ui/typography"
import { CreateEmployeeData, Employee, Department, Position } from "@/lib/types/employee"

// Form validation schema
const employeeSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Please enter a valid email address"),
  employment_status: z.enum(['active', 'inactive', 'probation']),
  department_id: z.string().optional(),
  position_id: z.string().optional(),
  profile_photo: z.any().optional(),
  earnings: z.array(z.object({
    type: z.string().min(1, "Earning type is required"),
    amount: z.number().min(0, "Amount must be positive"),
  })),
  deductions: z.array(z.object({
    type: z.string().min(1, "Deduction type is required"),
    amount: z.number().min(0, "Amount must be positive"),
  })),
  previous_company: z.object({
    company_name: z.string().optional(),
    last_designation: z.string().optional(),
    duration_worked: z.string().optional(),
    last_drawn_salary: z.number().optional(),
    contact_mobile: z.string().optional(),
    previous_email: z.string().email().optional().or(z.literal("")),
    experience_certificates: z.array(z.any()).optional(),
    salary_slips: z.array(z.any()).optional(),
  }).optional(),
})

type EmployeeFormData = z.infer<typeof employeeSchema>

interface EmployeeModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  employee?: Employee | null
  departments: Department[]
  positions: Position[]
  onSave: (data: CreateEmployeeData) => Promise<void>
  onCreateDepartment: (name: string) => Promise<Department>
  onCreatePosition: (name: string) => Promise<Position>
}

export function EmployeeModal({
  open,
  onOpenChange,
  employee,
  departments,
  positions,
  onSave,
  onCreateDepartment,
  onCreatePosition,
}: EmployeeModalProps) {
  const [activeTab, setActiveTab] = useState("details")
  const [isLoading, setIsLoading] = useState(false)
  const [profilePreview, setProfilePreview] = useState<string | null>(null)
  const [newDepartment, setNewDepartment] = useState("")
  const [newPosition, setNewPosition] = useState("")
  const [showNewDepartment, setShowNewDepartment] = useState(false)
  const [showNewPosition, setShowNewPosition] = useState(false)

  const form = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      full_name: "",
      email: "",
      employment_status: "active",
      earnings: [{ type: "Basic", amount: 0 }],
      deductions: [{ type: "Provident Fund (PF)", amount: 0 }],
      previous_company: {
        company_name: "",
        last_designation: "",
        duration_worked: "",
        last_drawn_salary: 0,
        contact_mobile: "",
        previous_email: "",
        experience_certificates: [],
        salary_slips: [],
      },
    },
  })

  const {
    fields: earningsFields,
    append: appendEarning,
    remove: removeEarning,
  } = useFieldArray({
    control: form.control,
    name: "earnings",
  })

  const {
    fields: deductionsFields,
    append: appendDeduction,
    remove: removeDeduction,
  } = useFieldArray({
    control: form.control,
    name: "deductions",
  })

  // Calculate totals
  const earnings = form.watch("earnings")
  const deductions = form.watch("deductions")
  const totalEarnings = earnings.reduce((sum, item) => sum + (item.amount || 0), 0)
  const totalDeductions = deductions.reduce((sum, item) => sum + (item.amount || 0), 0)
  const netPay = totalEarnings - totalDeductions

  // Load employee data for editing
  useEffect(() => {
    if (employee) {
      form.reset({
        full_name: employee.full_name,
        email: employee.email,
        employment_status: employee.employment_status,
        department_id: employee.department_id,
        position_id: employee.position_id,
        earnings: employee.earnings.length > 0 ? employee.earnings : [{ type: "Basic", amount: 0 }],
        deductions: employee.deductions.length > 0 ? employee.deductions : [{ type: "Provident Fund (PF)", amount: 0 }],
        previous_company: employee.previous_company || {
          company_name: "",
          last_designation: "",
          duration_worked: "",
          last_drawn_salary: 0,
          contact_mobile: "",
          previous_email: "",
          experience_certificates: [],
          salary_slips: [],
        },
      })
      setProfilePreview(employee.profile_photo_url || null)
    } else {
      form.reset({
        full_name: "",
        email: "",
        employment_status: "active",
        earnings: [{ type: "Basic", amount: 0 }],
        deductions: [{ type: "Provident Fund (PF)", amount: 0 }],
        previous_company: {
          company_name: "",
          last_designation: "",
          duration_worked: "",
          last_drawn_salary: 0,
          contact_mobile: "",
          previous_email: "",
          experience_certificates: [],
          salary_slips: [],
        },
      })
      setProfilePreview(null)
    }
  }, [employee, form])

  const handleProfilePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
        toast.error("Please select a valid image file (JPG, PNG, or WebP)")
        return
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size must be less than 10MB")
        return
      }

      form.setValue("profile_photo", file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfilePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCreateDepartment = async () => {
    if (!newDepartment.trim()) return

    try {
      const department = await onCreateDepartment(newDepartment.trim())
      form.setValue("department_id", department.id)
      setNewDepartment("")
      setShowNewDepartment(false)
      toast.success("Department created successfully")
    } catch (error) {
      toast.error("Failed to create department")
    }
  }

  const handleCreatePosition = async () => {
    if (!newPosition.trim()) return

    try {
      const position = await onCreatePosition(newPosition.trim())
      form.setValue("position_id", position.id)
      setNewPosition("")
      setShowNewPosition(false)
      toast.success("Position created successfully")
    } catch (error) {
      toast.error("Failed to create position")
    }
  }

  const onSubmit = async (data: EmployeeFormData) => {
    setIsLoading(true)
    try {
      const submitData: CreateEmployeeData = {
        full_name: data.full_name,
        email: data.email,
        employment_status: data.employment_status,
        department_id: data.department_id,
        position_id: data.position_id,
        earnings: data.earnings,
        deductions: data.deductions,
        previous_company: data.previous_company,
      }

      await onSave(submitData)
      onOpenChange(false)
      toast.success(employee ? "Employee updated successfully" : "Employee created successfully")
    } catch (error) {
      toast.error("Failed to save employee")
    } finally {
      setIsLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <Typography variant="T_Bold_H4">
              {employee ? "Edit Employee" : "Add Employee"}
            </Typography>
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Employee Details</TabsTrigger>
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
                <TabsTrigger value="deductions">Deductions</TabsTrigger>
                <TabsTrigger value="previous">Previous Company</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-6">
                {/* Profile Picture */}
                <div className="space-y-2">
                  <Label>Profile Picture</Label>
                  <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={profilePreview || undefined} />
                      <AvatarFallback className="text-lg">
                        {form.watch("full_name") ? getInitials(form.watch("full_name")) : "NE"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        onChange={handleProfilePhotoChange}
                        className="hidden"
                        id="profile-photo"
                      />
                      <Label htmlFor="profile-photo" className="cursor-pointer">
                        <Button type="button" variant="outline" asChild>
                          <span>
                            <Camera className="mr-2 h-4 w-4" />
                            Upload Photo
                          </span>
                        </Button>
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        JPG, PNG, or WebP. Max 10MB. Images will be automatically resized to 1000×1000px.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Employment Status */}
                <FormField
                  control={form.control}
                  name="employment_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select employment status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="probation">Probation</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Name and Email */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="employee@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Department and Position */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="department_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Department *</FormLabel>
                        <div className="space-y-2">
                          {!showNewDepartment ? (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select or create department" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {departments.map((dept) => (
                                  <SelectItem key={dept.id} value={dept.id}>
                                    {dept.name}
                                  </SelectItem>
                                ))}
                                <SelectItem value="__create_new__" onSelect={() => setShowNewDepartment(true)}>
                                  + Create New Department
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex gap-2">
                              <Input
                                placeholder="Enter department name"
                                value={newDepartment}
                                onChange={(e) => setNewDepartment(e.target.value)}
                              />
                              <Button type="button" onClick={handleCreateDepartment} size="sm">
                                Create
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowNewDepartment(false)}
                                size="sm"
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Position *</FormLabel>
                        <div className="space-y-2">
                          {!showNewPosition ? (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select or create position" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {positions.map((pos) => (
                                  <SelectItem key={pos.id} value={pos.id}>
                                    {pos.name}
                                  </SelectItem>
                                ))}
                                <SelectItem value="__create_new__" onSelect={() => setShowNewPosition(true)}>
                                  + Create New Position
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="flex gap-2">
                              <Input
                                placeholder="Enter position name"
                                value={newPosition}
                                onChange={(e) => setNewPosition(e.target.value)}
                              />
                              <Button type="button" onClick={handleCreatePosition} size="sm">
                                Create
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowNewPosition(false)}
                                size="sm"
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Payslip Summary */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <Typography variant="T_SemiBold_H6" className="mb-3">
                    Payslip Summary
                  </Typography>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Earnings</p>
                      <p className="font-semibold">₹{totalEarnings.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Deductions</p>
                      <p className="font-semibold">₹{totalDeductions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Net Pay</p>
                      <p className="font-semibold">₹{netPay.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="earnings" className="space-y-6">
                <div className="flex justify-between items-center">
                  <Typography variant="T_SemiBold_H5">Earnings</Typography>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendEarning({ type: "", amount: 0 })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {earningsFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-5">
                        <Label>Earning Type</Label>
                        <Input
                          placeholder="e.g., Basic, House Rent Allowance"
                          {...form.register(`earnings.${index}.type`)}
                        />
                      </div>
                      <div className="col-span-5">
                        <Label>Amount (₹)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          {...form.register(`earnings.${index}.amount`, { valueAsNumber: true })}
                        />
                      </div>
                      <div className="col-span-2">
                        {earningsFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeEarning(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <Typography variant="T_SemiBold_H6">Total Earnings</Typography>
                    <Typography variant="T_SemiBold_H6">₹{totalEarnings.toLocaleString()}</Typography>
                  </div>
                </div>

                {/* Payslip Summary */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <Typography variant="T_SemiBold_H6" className="mb-3">
                    Payslip Summary
                  </Typography>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Earnings</p>
                      <p className="font-semibold">₹{totalEarnings.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Deductions</p>
                      <p className="font-semibold">₹{totalDeductions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Net Pay</p>
                      <p className="font-semibold">₹{netPay.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="deductions" className="space-y-6">
                <div className="flex justify-between items-center">
                  <Typography variant="T_SemiBold_H5">Deductions</Typography>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => appendDeduction({ type: "", amount: 0 })}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                <div className="space-y-4">
                  {deductionsFields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-4 items-end">
                      <div className="col-span-5">
                        <Label>Deduction Type</Label>
                        <Input
                          placeholder="e.g., Provident Fund, Income Tax"
                          {...form.register(`deductions.${index}.type`)}
                        />
                      </div>
                      <div className="col-span-5">
                        <Label>Amount (₹)</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          {...form.register(`deductions.${index}.amount`, { valueAsNumber: true })}
                        />
                      </div>
                      <div className="col-span-2">
                        {deductionsFields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => removeDeduction(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-muted/50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <Typography variant="T_SemiBold_H6">Total Deductions</Typography>
                    <Typography variant="T_SemiBold_H6">₹{totalDeductions.toLocaleString()}</Typography>
                  </div>
                </div>

                {/* Payslip Summary */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <Typography variant="T_SemiBold_H6" className="mb-3">
                    Payslip Summary
                  </Typography>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Earnings</p>
                      <p className="font-semibold">₹{totalEarnings.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Deductions</p>
                      <p className="font-semibold">₹{totalDeductions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Net Pay</p>
                      <p className="font-semibold">₹{netPay.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="previous" className="space-y-6">
                <Typography variant="T_SemiBold_H5">Previous Company</Typography>

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="previous_company.company_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Previous Company</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., XYZ Technologies" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="previous_company.last_designation"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Designation</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Software Engineer" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="previous_company.duration_worked"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration Worked</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Jan 2021 - Mar 2024" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="previous_company.last_drawn_salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Drawn Salary</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="₹45,000"
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="previous_company.contact_mobile"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Mobile</FormLabel>
                        <FormControl>
                          <Input placeholder="+91 9876543210" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="previous_company.previous_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Previous Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="hr@previouscompany.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* File Uploads */}
                <div className="space-y-6">
                  <div>
                    <Label>Experience Certificate</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload the experience certificate from the previous company
                    </p>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Drag and drop files here, or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Supports: PDF, DOC, DOCX, JPG, PNG (Max 10MB each) • Multiple files allowed
                      </p>
                      <Button type="button" variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Files
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label>Salary Slip</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Upload a salary slip from the previous company
                    </p>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                      <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-sm text-muted-foreground mb-2">
                        Drag and drop files here, or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Supports: PDF, DOC, DOCX, JPG, PNG (Max 10MB each) • Multiple files allowed
                      </p>
                      <Button type="button" variant="outline">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Files
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Payslip Summary */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <Typography variant="T_SemiBold_H6" className="mb-3">
                    Payslip Summary
                  </Typography>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Earnings</p>
                      <p className="font-semibold">₹{totalEarnings.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total Deductions</p>
                      <p className="font-semibold">₹{totalDeductions.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Net Pay</p>
                      <p className="font-semibold">₹{netPay.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Footer Actions */}
            <div className="flex justify-between pt-6 border-t">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <div className="flex gap-2">
                {activeTab !== "details" && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const tabs = ["details", "earnings", "deductions", "previous"]
                      const currentIndex = tabs.indexOf(activeTab)
                      if (currentIndex > 0) {
                        setActiveTab(tabs[currentIndex - 1])
                      }
                    }}
                  >
                    Back
                  </Button>
                )}
                {activeTab !== "previous" ? (
                  <Button
                    type="button"
                    onClick={() => {
                      const tabs = ["details", "earnings", "deductions", "previous"]
                      const currentIndex = tabs.indexOf(activeTab)
                      if (currentIndex < tabs.length - 1) {
                        setActiveTab(tabs[currentIndex + 1])
                      }
                    }}
                  >
                    Next
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : employee ? "Update Employee" : "Save Employee"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}