import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

// Query parameter schema following the data-table standards
const querySchema = z.object({
  search: z.string().optional(),
  from_date: z.string().optional(),
  to_date: z.string().optional(),
  sort_by: z.enum(["created_at", "full_name", "email", "employee_code", "employment_status"]).default("created_at"),
  sort_order: z.enum(["asc", "desc"]).default("desc"),
  page: z.coerce.number().default(1),
  limit: z.coerce.number().default(10),
});

// GET /api/employees - List employees with filtering, sorting, and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    
    // Parse and validate query parameters
    const result = querySchema.safeParse(queryParams);
    
    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: "Invalid query parameters",
        details: result.error.format(),
      }, { status: 400 });
    }
    
    const { search, from_date, to_date, sort_by, sort_order, page, limit } = result.data;
    
    // Create supabase client
    const supabase = await createClient();
    
    // Build the base query
    let query = supabase
      .from('employees')
      .select(`
        *,
        department:departments(id, name),
        position:positions(id, name)
      `, { count: 'exact' });
    
    // Add search filter (search across multiple fields)
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,employee_code.ilike.%${search}%`);
    }
    
    // Add date filtering
    if (from_date && to_date) {
      query = query.gte('created_at', from_date).lte('created_at', to_date);
    } else if (from_date) {
      query = query.gte('created_at', from_date);
    } else if (to_date) {
      query = query.lte('created_at', to_date);
    }
    
    // Add sorting
    const ascending = sort_order === 'asc';
    query = query.order(sort_by, { ascending });
    
    // Add pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);
    
    // Execute query
    const { data, error, count } = await query;
    
    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({
        success: false,
        error: "Failed to fetch employees",
        details: error.message,
      }, { status: 500 });
    }
    
    // Calculate pagination info
    const totalItems = count || 0;
    const totalPages = Math.ceil(totalItems / limit);
    
    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        page,
        limit,
        total_pages: totalPages,
        total_items: totalItems,
      },
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch employees",
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

// POST /api/employees - Create new employee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Create supabase client
    const supabase = await createClient();
    
    // Insert new employee
    const { data, error } = await supabase
      .from('employees')
      .insert(body)
      .select(`
        *,
        department:departments(id, name),
        position:positions(id, name)
      `)
      .single();
    
    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({
        success: false,
        error: "Failed to create employee",
        details: error.message,
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      data: data,
      message: "Employee created successfully"
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating employee:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to create employee",
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}