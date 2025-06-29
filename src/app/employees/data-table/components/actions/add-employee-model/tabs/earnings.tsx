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

interface EarningsTabProps {
  form: UseFormReturn<any>;
}

export function EarningsTab({ form }: EarningsTabProps) {
  const earnings = form.watch("earnings");
  
  const addEarning = () => {
    const currentEarnings = form.getValues("earnings");
    form.setValue("earnings", [
      ...currentEarnings,
      { type: "", amount: 0 }
    ]);
  };
  
  const removeEarning = (index: number) => {
    const currentEarnings = form.getValues("earnings");
    if (currentEarnings.length > 1) {
      form.setValue("earnings", currentEarnings.filter((_: any, i: number) => i !== index));
    }
  };
  
  const totalEarnings = React.useMemo(() => {
    return earnings.reduce((sum: number, earning: any) => sum + (earning.amount || 0), 0);
  }, [earnings]);
  
  const handleAmountChange = (index: number, value: string) => {
    // Only allow numbers and decimal point
    const numericValue = value.replace(/[^0-9.]/g, '');
    const amount = parseFloat(numericValue) || 0;
    form.setValue(`earnings.${index}.amount`, amount);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Earnings Configuration</h3>
          <p className="text-sm text-muted-foreground">
            Configure salary components and allowances
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total</p>
          <p className="text-lg font-semibold">
            ₹{totalEarnings.toLocaleString()}
          </p>
        </div>
      </div>
      
      <div className="space-y-2">
        {earnings.map((earning: any, index: number) => (
          <div key={index} className="flex items-end gap-2">
            <div className="flex-1">
              <FormField
                control={form.control}
                name={`earnings.${index}.type`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Earning Type</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Basic Salary, House Rent Allowance"
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
                name={`earnings.${index}.amount`}
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
            
            {earning.type !== "Basic Salary" && earning.type !== "OT Hourly Rate" && earnings.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mb-6"
                onClick={() => removeEarning(index)}
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
        onClick={addEarning}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Earning Component
      </Button>
    </div>
  );
} 