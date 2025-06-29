"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";


import { ProfileImageUpload } from "@/components/ui/profile-image-upload";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/ui/searchable-select";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

interface EmployeeDetailsTabProps {
  form: UseFormReturn<any>;
}

export function EmployeeDetailsTab({ form }: EmployeeDetailsTabProps) {
  const [departments, setDepartments] = React.useState<any[]>([]);
  const [positions, setPositions] = React.useState<any[]>([]);
  const [profileImage, setProfileImage] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    fetchDepartments();
    fetchPositions();
  }, []);
  
  const fetchDepartments = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("departments")
        .select("*")
        .order("name");
      
      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };
  
  const fetchPositions = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("positions")
        .select("*")
        .order("name");
      
      if (error) throw error;
      setPositions(data || []);
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };
  
  const handleProfileImageChange = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("profile_photo", file);
    } else {
      setProfileImage(null);
      form.setValue("profile_photo", null);
    }
  };
  
  const handleCreateDepartment = async (name: string) => {
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from("departments")
        .insert({
          name,
          organization_id: userData.user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      setDepartments(prev => [...prev, data]);
      toast.success("Department created successfully");
      
      return data;
    } catch (error) {
      console.error("Error creating department:", error);
      toast.error("Failed to create department");
      throw error;
    }
  };
  
  const handleCreatePosition = async (name: string) => {
    try {
      const supabase = createClient();
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("User not authenticated");
      }
      
      const { data, error } = await supabase
        .from("positions")
        .insert({
          name,
          organization_id: userData.user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      // Update local state
      setPositions(prev => [...prev, data]);
      toast.success("Position created successfully");
      
      return data;
    } catch (error) {
      console.error("Error creating position:", error);
      toast.error("Failed to create position");
      throw error;
    }
  };
  
  // Generate employee ID
  const employeeId = React.useMemo(() => {
    const timestamp = Date.now().toString().slice(-6);
    return `EM${timestamp}`;
  }, []);
  
  return (
    <div className="space-y-6">
      {/* Profile Picture Upload */}
      <div>
        <div className="mb-3">
          <h3 className="text-sm font-medium text-gray-900">Profile picture</h3>
        </div>
        
        <div className="flex items-start gap-6">
          <ProfileImageUpload
            value={profileImage}
            onChange={handleProfileImageChange}
            size="md"
            maxSizeInMB={10}
            onError={(error) => toast.error(error)}
            onUploadSuccess={() => toast.success("Image uploaded successfully")}
            className="flex-shrink-0"
          />
          
          <div className="flex-1 pt-2">
            <p className="text-sm text-gray-600 mb-1">
              Click or drag to upload your profile photo
            </p>
            <p className="text-xs text-gray-500">Supports: JPG, PNG, WebP (max 10MB)</p>
          </div>
        </div>
      </div>
      
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-sm font-medium text-red-400">
                Full Name
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter full name" 
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-offset-0 transition-colors"
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-red-400 mt-1">Required</p>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-sm font-medium text-red-400">
                Email Address
              </FormLabel>
              <FormControl>
                <Input 
                  type="email" 
                  placeholder="employee@company.com" 
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:ring-offset-0 transition-colors"
                  {...field}
                />
              </FormControl>
              <p className="text-xs text-red-400 mt-1">Required</p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="employment_status"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-sm font-medium text-gray-900">
                Employment Status
              </FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="w-full border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      Active
                    </span>
                  </SelectItem>
                  <SelectItem value="inactive">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      Inactive
                    </span>
                  </SelectItem>
                  <SelectItem value="probation">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500" />
                      Probation
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormItem className="w-full">
          <FormLabel className="text-sm font-medium text-gray-900">
            Employee ID
          </FormLabel>
          <FormControl>
            <Input 
              value={employeeId} 
              disabled 
              className="w-full bg-gray-50 border-gray-300 text-gray-500"
            />
          </FormControl>
        </FormItem>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="department_id"
          render={({ field, fieldState }) => (
            <FormItem className="w-full">
              <FormLabel className="text-sm font-medium text-red-400">
                Department
              </FormLabel>
              <FormControl>
                <SearchableSelect
                  items={departments}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select department"
                  searchPlaceholder="Search departments..."
                  error={!!fieldState.error}
                  required
                  allowCreate={true}
                  createLabel="department"
                  onCreateNew={handleCreateDepartment}
                  className="w-full border border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </FormControl>
              <p className="text-xs text-red-400 mt-1">Required</p>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="position_id"
          render={({ field, fieldState }) => (
            <FormItem className="w-full">
              <FormLabel className="text-sm font-medium text-red-400">
                Position
              </FormLabel>
              <FormControl>
                <SearchableSelect
                  items={positions}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="Select position"
                  searchPlaceholder="Search positions..."
                  error={!!fieldState.error}
                  required
                  allowCreate={true}
                  createLabel="position"
                  onCreateNew={handleCreatePosition}
                  className="w-full border border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                />
              </FormControl>
              <p className="text-xs text-red-400 mt-1">Required</p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}