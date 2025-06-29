import * as React from "react";
import { PlusCircle, Trash2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Employee } from "@/lib/schemas/employee-schema";
import { AddEmployeeModal } from "./actions/add-employee-model";

interface ToolbarOptionsProps {
  selectedEmployees: Employee[];
  allSelectedIds?: (string | number)[];
  totalSelectedCount: number;
  resetSelection: () => void;
  onRefresh?: () => void;
}

export const ToolbarOptions = ({
  selectedEmployees,
  allSelectedIds = [],
  totalSelectedCount,
  resetSelection,
  onRefresh,
}: ToolbarOptionsProps) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [addEmployeeOpen, setAddEmployeeOpen] = React.useState(false);
  
  const handleAddEmployee = () => {
    setAddEmployeeOpen(true);
  };

  const handleDeleteSelected = () => {
    console.log("Delete selected employees:", selectedEmployees);
    // TODO: Implement bulk delete functionality
    setDeleteDialogOpen(true);
  };

  const handleSendPayslips = () => {
    console.log("Send payslips to:", selectedEmployees);
    // TODO: Implement send payslips functionality
  };
  
  const handleAddSuccess = () => {
    onRefresh?.();
    resetSelection();
  };
  
  return (
    <>
      <div className="flex items-center gap-2">
        {/* Add Employee Button */}
        <Button onClick={handleAddEmployee}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Employee
        </Button>
        
        {/* Actions for selected employees */}
        {totalSelectedCount > 0 && (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleDeleteSelected}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete ({totalSelectedCount})
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSendPayslips}
            >
              <Send className="mr-2 h-4 w-4" />
              Send Payslips ({totalSelectedCount})
            </Button>
          </>
        )}
      </div>
      
      <AddEmployeeModal
        open={addEmployeeOpen}
        onOpenChange={setAddEmployeeOpen}
        onSuccess={handleAddSuccess}
      />
    </>
  );
}; 