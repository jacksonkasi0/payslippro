import { z } from "zod";

// Employee schema definition
export const employeeSchema = z.object({
  id: z.string(),
  employee_code: z.string(),
  full_name: z.string(),
  email: z.string().email(),
  profile_photo_url: z.string().optional(),
  employment_status: z.enum(["active", "inactive", "probation"]),
  department_id: z.string().optional(),
  position_id: z.string().optional(),
  organization_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
  
  // Related data
  department: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
  
  position: z.object({
    id: z.string(),
    name: z.string(),
  }).optional(),
});

export type Employee = z.infer<typeof employeeSchema>;

// Response schema for the API
export const employeesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(employeeSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total_pages: z.number(),
    total_items: z.number(),
  }),
});

// Single employee response schema
export const employeeResponseSchema = z.object({
  success: z.boolean(),
  data: employeeSchema,
  message: z.string().optional(),
});

// Department schema
export const departmentSchema = z.object({
  id: z.string(),
  name: z.string(),
  organization_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Department = z.infer<typeof departmentSchema>;

// Position schema
export const positionSchema = z.object({
  id: z.string(),
  name: z.string(),
  organization_id: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Position = z.infer<typeof positionSchema>; 