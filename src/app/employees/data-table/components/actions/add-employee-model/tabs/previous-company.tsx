"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { Upload, X, FileText, File } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface PreviousCompanyTabProps {
  form: UseFormReturn<any>;
}

export function PreviousCompanyTab({ form }: PreviousCompanyTabProps) {
  const [experienceCertificate, setExperienceCertificate] = React.useState<File | null>(null);
  const [salarySlip, setSalarySlip] = React.useState<File | null>(null);
  
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "experience" | "salary"
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error("File size should be less than 10MB");
        return;
      }
      
      if (type === "experience") {
        setExperienceCertificate(file);
        form.setValue("previous_company.experience_certificate", file);
      } else {
        setSalarySlip(file);
        form.setValue("previous_company.salary_slip", file);
      }
    }
  };
  
  const removeFile = (type: "experience" | "salary") => {
    if (type === "experience") {
      setExperienceCertificate(null);
      form.setValue("previous_company.experience_certificate", null);
    } else {
      setSalarySlip(null);
      form.setValue("previous_company.salary_slip", null);
    }
  };
  
  const handleSalaryChange = (value: string) => {
    // Only allow numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    const amount = parseFloat(numericValue) || 0;
    form.setValue("previous_company.last_drawn_salary", amount);
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-light text-gray-900">Previous Employment Details</h3>
        <p className="text-sm text-gray-600 mt-1">
          All fields in this section are optional. Provide information if the employee has prior work experience.
        </p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="previous_company.company_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Previous Company
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., XYZ Technologies" 
                  {...field} 
                />
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
              <FormLabel>
                Last Designation
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Software Engineer" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="previous_company.duration_worked"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Duration Worked
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="e.g., Jan 2021 - Mar 2024" 
                  {...field} 
                />
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
              <FormLabel>
                Last Drawn Salary
              </FormLabel>
              <FormControl>
                <Input
                  placeholder="₹45,000"
                  value={field.value || ""}
                  onChange={(e) => handleSalaryChange(e.target.value)}
                  onBlur={field.onBlur}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="previous_company.contact_mobile"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Contact Mobile
              </FormLabel>
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
              <FormLabel>
                Previous Email Address
              </FormLabel>
              <FormControl>
                <Input type="email" placeholder="hr@previouscompany.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <Card className="p-6">
        <h4 className="font-medium mb-4">
          Attachments
        </h4>
        
        <div className="space-y-4">
          {/* Experience Certificate */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Experience Certificate</p>
              <p className="text-xs text-muted-foreground">
                Upload the experience certificate from the previous company
              </p>
            </div>
            <div className="flex items-center gap-2">
              {experienceCertificate ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm max-w-[150px] truncate">
                      {experienceCertificate.name}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile("experience")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("experience-upload")?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Add File
                </Button>
              )}
            </div>
          </div>
          
          {/* Salary Slip */}
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium">Salary Slip</p>
              <p className="text-xs text-muted-foreground">
                Upload a salary slip from the previous company
              </p>
            </div>
            <div className="flex items-center gap-2">
              {salarySlip ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1 bg-muted rounded-md">
                    <File className="h-4 w-4" />
                    <span className="text-sm max-w-[150px] truncate">
                      {salarySlip.name}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeFile("salary")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("salary-upload")?.click()}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Add File
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mt-4">
          Supports: PDF, DOC, DOCX, JPG, PNG (Max 10MB each) • Multiple files allowed
        </p>
      </Card>
      
      {/* Hidden file inputs */}
      <input
        id="experience-upload"
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.png"
        className="hidden"
        onChange={(e) => handleFileUpload(e, "experience")}
      />
      <input
        id="salary-upload"
        type="file"
        accept=".pdf,.doc,.docx,.jpg,.png"
        className="hidden"
        onChange={(e) => handleFileUpload(e, "salary")}
      />
    </div>
  );
}
