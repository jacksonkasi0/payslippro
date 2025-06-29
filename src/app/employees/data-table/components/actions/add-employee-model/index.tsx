"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmployeeDetailsTab } from "./tabs/employee-details";
import { EarningsTab } from "./tabs/earnings";
import { DeductionsTab } from "./tabs/deductions";
import { PreviousCompanyTab } from "./tabs/previous-company";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface AddEmployeeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

// Form schema
const formSchema = z.object({
  // Employee Details
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  employment_status: z.enum(["active", "inactive", "probation"]),
  department_id: z.string().min(1, "Department is required"),
  position_id: z.string().min(1, "Position is required"),
  profile_photo: z.any().optional(),
  
  // Earnings (minimum 1 required)
  earnings: z.array(z.object({
    type: z.string().min(1, "Earning type is required"),
    amount: z.number().min(0, "Amount must be positive"),
  })).min(1, "At least one earning is required"),
  
  // Deductions (minimum 1 required)
  deductions: z.array(z.object({
    type: z.string().min(1, "Deduction type is required"),
    amount: z.number().min(0, "Amount must be positive"),
  })).min(1, "At least one deduction is required"),
  
  // Previous Company (all optional)
  previous_company: z.object({
    company_name: z.string().optional(),
    last_designation: z.string().optional(),
    duration_worked: z.string().optional(),
    last_drawn_salary: z.number().optional(),
    contact_mobile: z.string().optional(),
    previous_email: z.string().email().optional().or(z.literal("")),
    experience_certificate: z.any().optional(),
    salary_slip: z.any().optional(),
  }).optional(),
});

type FormData = z.infer<typeof formSchema>;

export function AddEmployeeModal({ open, onOpenChange, onSuccess }: AddEmployeeModalProps) {
  const [activeTab, setActiveTab] = React.useState("employee-details");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onBlur",
    defaultValues: {
      employment_status: "active",
      earnings: [
        { type: "Basic Salary", amount: 0 },
        { type: "OT Hourly Rate", amount: 0 },
      ],
      deductions: [
        { type: "Leave Deduction", amount: 0 },
      ],
      previous_company: {
        company_name: "",
        last_designation: "",
        duration_worked: "",
        last_drawn_salary: 0,
        contact_mobile: "",
        previous_email: "",
      },
    },
  });
  
  const handleNext = async () => {
    const tabs = ["employee-details", "earnings", "deductions", "previous-company"];
    const currentIndex = tabs.findIndex(tab => tab === activeTab);
    
    // Validate current tab before proceeding
    let fieldsToValidate: (keyof FormData)[] = [];
    
    switch (activeTab) {
      case "employee-details":
        fieldsToValidate = ["full_name", "email", "department_id", "position_id"];
        break;
      case "earnings":
        fieldsToValidate = ["earnings"];
        break;
      case "deductions":
        fieldsToValidate = ["deductions"];
        break;
    }
    
    const isValid = await form.trigger(fieldsToValidate);
    
    if (isValid && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };
  
  const handleBack = () => {
    const tabs = ["employee-details", "earnings", "deductions", "previous-company"];
    const currentIndex = tabs.findIndex(tab => tab === activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };
  
  const onSubmit = async (data: FormData) => {
    try {
      setIsSubmitting(true);
      const supabase = createClient();
      
      // Get current user's organization
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not authenticated");
      
      // Generate employee code
      const timestamp = Date.now().toString().slice(-6);
      const employeeCode = `EM${timestamp}`;
      
      // Create employee
      const employeeData = {
        employee_code: employeeCode,
        full_name: data.full_name,
        email: data.email,
        employment_status: data.employment_status,
        department_id: data.department_id,
        position_id: data.position_id,
        organization_id: userData.user.id,
      };
      
      const { error } = await supabase
        .from("employees")
        .insert(employeeData);
      
      if (error) throw error;
      
      toast.success("Employee created successfully");
      onSuccess?.();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error("Error creating employee:", error);
      toast.error("Failed to create employee");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Add Employee</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="w-full mx-auto px-1">
                <TabsTrigger value="employee-details">Employee Details</TabsTrigger>
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
                <TabsTrigger value="deductions">Deductions</TabsTrigger>
                <TabsTrigger value="previous-company">Previous Company</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto mt-4">
                <TabsContent value="employee-details" className="mt-0">
                  <EmployeeDetailsTab form={form} />
                </TabsContent>
                
                <TabsContent value="earnings" className="mt-0">
                  <EarningsTab form={form} />
                </TabsContent>
                
                <TabsContent value="deductions" className="mt-0">
                  <DeductionsTab form={form} />
                </TabsContent>
                
                <TabsContent value="previous-company" className="mt-0">
                  <PreviousCompanyTab form={form} />
                </TabsContent>
              </div>
            </Tabs>
            
            <DialogFooter className="mt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              
              {activeTab !== "employee-details" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                >
                  Back
                </Button>
              )}
              
              {activeTab !== "previous-company" ? (
                <Button
                  type="button"
                  onClick={handleNext}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Employee"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
