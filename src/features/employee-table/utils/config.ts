import { useMemo } from "react";

export function useExportConfig() {
  // Column mapping for export
  const columnMapping = useMemo(() => {
    return {
      id: "ID",
      employee_code: "Employee Code",
      full_name: "Full Name",
      email: "Email",
      employment_status: "Status",
      "department.name": "Department",
      "position.name": "Position",
      created_at: "Created Date",
    };
  }, []);
  
  // Column widths for Excel export
  const columnWidths = useMemo(() => {
    return [
      { wch: 15 }, // ID
      { wch: 20 }, // Employee Code
      { wch: 25 }, // Full Name
      { wch: 30 }, // Email
      { wch: 15 }, // Status
      { wch: 20 }, // Department
      { wch: 25 }, // Position
      { wch: 20 }, // Created Date
    ];
  }, []);

  // Headers for CSV export
  const headers = useMemo(() => {
    return [
      "id",
      "employee_code",
      "full_name",
      "email",
      "employment_status",
      "department.name",
      "position.name",
      "created_at",
    ];
  }, []);

  return {
    columnMapping,
    columnWidths,
    headers,
    entityName: "employees" // Used for filename
  };
} 