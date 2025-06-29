import { employeesResponseSchema } from "@/lib/schemas/employee-schema";

const API_BASE_URL = "/api";

export async function fetchEmployees({
  search = "",
  from_date = "",
  to_date = "",
  sort_by = "created_at",
  sort_order = "desc",
  page = 1,
  limit = 10,
}: {
  search?: string;
  from_date?: string;
  to_date?: string;
  sort_by?: string;
  sort_order?: string;
  page?: number;
  limit?: number;
}) {
  // Build query parameters
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (from_date) params.append("from_date", from_date);
  if (to_date) params.append("to_date", to_date);
  params.append("sort_by", sort_by);
  params.append("sort_order", sort_order);
  params.append("page", page.toString());
  params.append("limit", limit.toString());

  // Fetch data
  const response = await fetch(`${API_BASE_URL}/employees?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Failed to fetch employees: ${response.statusText}`);
  }
  
  const data = await response.json();
  return employeesResponseSchema.parse(data);
}

export async function fetchEmployeesByIds(ids: (string | number)[]): Promise<any[]> {
  if (ids.length === 0) {
    return [];
  }
  
  // Use batching for efficiency
  const BATCH_SIZE = 50;
  const results = [];
  
  // Process in batches
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batchIds = ids.slice(i, i + BATCH_SIZE);
    const params = new URLSearchParams();
    
    // Add each ID as a parameter
    batchIds.forEach(id => {
      params.append("ids", id.toString());
    });
    
    const response = await fetch(`${API_BASE_URL}/employees/batch?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch employees batch: ${response.statusText}`);
    }
    
    const data = await response.json();
    if (data.success && Array.isArray(data.data)) {
      results.push(...data.data);
    }
  }
  
  return results;
} 