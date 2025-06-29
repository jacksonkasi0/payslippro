"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table/data-table";
import { getColumns } from "./components/columns";
import { useExportConfig } from "./utils/config";
import { fetchEmployees, fetchEmployeesByIds } from "@/lib/api/employee/fetch-employees";
import { ToolbarOptions } from "./components/toolbar-options";
import { Employee } from "@/lib/schemas/employee-schema";

export default function EmployeeTable() {
  const [refreshKey, setRefreshKey] = React.useState(0);
  
  const handleRefresh = React.useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);
  
  return (
    <DataTable<Employee, any>
      key={refreshKey}
      getColumns={getColumns}
      exportConfig={useExportConfig()}
      fetchDataFn={fetchEmployees}
      fetchByIdsFn={fetchEmployeesByIds}
      idField="id"
      pageSizeOptions={[10, 20, 50, 100]}
      renderToolbarContent={({ selectedRows, allSelectedIds, totalSelectedCount, resetSelection }) => (
        <ToolbarOptions
          selectedEmployees={selectedRows}
          allSelectedIds={allSelectedIds}
          totalSelectedCount={totalSelectedCount}
          resetSelection={resetSelection}
          onRefresh={handleRefresh}
        />
      )}
      config={{
        enableRowSelection: true,
        enableSearch: true,
        enableDateFilter: true,
        enableColumnVisibility: true,
        enableUrlState: false, // Disabled
        enableToolbar: true,
        enablePagination: true,
        enableColumnResizing: true,
        columnResizingTableId: "employee-table",
      }}
    />
  );
} 