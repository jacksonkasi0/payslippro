"use client";

import * as React from "react";
import { UseFormReturn } from "react-hook-form";
import { Plus, X } from "lucide-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface DeductionsTabProps {
  form: UseFormReturn<any>;
}

export function DeductionsTab({ form }: DeductionsTabProps) {
  const deductions = form.watch("deductions");
  
  const addDeduction = () => {
    const currentDeductions = form.getValues("deductions");
    form.setValue("deductions", [
      ...currentDeductions,
      { type: "", amount: 0 }
    ]);
  };
  
  const removeDeduction = (index: number) => {
    const currentDeductions = form.getValues("deductions");
    if (currentDeductions.length > 1) {
      form.setValue("deductions", currentDeductions.filter((_: any, i: number) => i !== index));
    }
  };
  
  const totalDeductions = React.useMemo(() => {
    return deductions.reduce((sum: number, deduction: any) => sum + (deduction.amount || 0), 0);
  }, [deductions]);
  
  const handleAmountChange = (index: number, value: string) => {
    // Only allow numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    const amount = parseFloat(numericValue) || 0;
    form.setValue(`deductions.${index}.amount`, amount);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Deductions Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure statutory and other deductions
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-lg font-semibold">
            ₹{totalDeductions.toLocaleString()}
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        {deductions.map((deduction: any, index: number) => (
          <div key={index} className="flex items-end gap-2">
            <div className="flex-1">
              <FormField
                control={form.control}
                name={`deductions.${index}.type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deduction Type</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Provident Fund, Income Tax"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="w-32">
              <FormField
                control={form.control}
                name={`deductions.${index}.amount`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount (₹)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="0"
                        value={field.value || ""}
                        onChange={(e) => handleAmountChange(index, e.target.value)}
                        onBlur={field.onBlur}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {deduction.type !== "Leave Deduction" && deductions.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mb-6"
                onClick={() => removeDeduction(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>
      
      <Button
        type="button"
        variant="outline"
        onClick={addDeduction}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Deduction Component
      </Button>
    </div>
  );
}
