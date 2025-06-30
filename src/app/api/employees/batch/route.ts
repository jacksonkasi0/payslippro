import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET /api/employees/batch?ids=1,2,3
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get("ids");
    
    let ids: string[] = [];
    
    if (idsParam) {
      ids = idsParam.split(",")
        .map(id => id.trim())
        .filter(id => id.length > 0);
    }
    
    if (ids.length === 0) {
      return NextResponse.json({
        success: true,
        data: [] // Return empty array for no IDs
      });
    }
    
    // Create supabase client
    const supabase = await createClient();
    
    // Fetch the employees by IDs
    const { data, error } = await supabase
      .from('employees')
      .select(`
        *,
        department:departments(id, name),
        position:positions(id, name)
      `)
      .in('id', ids);
    
    if (error) {
      console.error("Database error:", error);
      return NextResponse.json({
        success: false,
        error: "Failed to fetch employees",
        details: error.message,
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error("Error batch fetching employees:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch employees",
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}

// POST /api/employees/batch - Alternative for larger ID sets
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      return NextResponse.json({
        success: true,
        data: [] // Return empty array for no IDs
      });
    }
    
    const ids = body.ids
      .map((id: unknown) => String(id))
      .filter((id: string) => id.length > 0);
    
    if (ids.length === 0) {
      return NextResponse.json({
        success: true,
        data: []
      });
    }
    
    // Create supabase client
    const supabase = await createClient();
    
    // Process IDs in batches to avoid query limitations
    const BATCH_SIZE = 50;
    const employees = [];
    
    // Process in batches
    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      const batchIds = ids.slice(i, i + BATCH_SIZE);
      
      const { data, error } = await supabase
        .from('employees')
        .select(`
          *,
          department:departments(id, name),
          position:positions(id, name)
        `)
        .in('id', batchIds);
      
      if (error) {
        console.error("Database error in batch:", error);
        return NextResponse.json({
          success: false,
          error: "Failed to fetch employee batch",
          details: error.message,
        }, { status: 500 });
      }
      
      employees.push(...(data || []));
    }
    
    return NextResponse.json({
      success: true,
      data: employees
    });
  } catch (error) {
    console.error("Error batch fetching employees:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to fetch employees",
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 });
  }
}