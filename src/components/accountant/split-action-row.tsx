"use client";

import { useState, useEffect } from "react";
import { processLeaveSplit } from "@/app/actions/accountant";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, AlertCircle } from "lucide-react";

type EmployeePendingSplit = {
  userId: string;
  name: string;
  department: string;
  remainingBalance: number; // e.g., 1.5
};

export function SplitActionRow({ 
  employee, 
  onSuccess 
}: { 
  employee: { userId: string; name: string; remainingBalance: number };
  onSuccess?: () => void;
}) {
  // Policy Change: Carry forward is strictly capped at 1.0 day max.
  const initialCarry = Math.min(1.0, employee.remainingBalance);
  const initialEncash = employee.remainingBalance - initialCarry;

  const [carryForward, setCarryForward] = useState<number>(initialCarry);
  const [encashment, setEncashment] = useState<number>(initialEncash);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const MAX_CARRY = 1.0;

  const handleCarryForwardChange = (val: string) => {
    const numVal = parseFloat(val) || 0;
    const allowedMax = Math.min(MAX_CARRY, employee.remainingBalance);
    
    if (numVal >= 0 && numVal <= allowedMax) {
      setCarryForward(numVal);
      setEncashment(employee.remainingBalance - numVal);
    }
  };

  const handleEncashmentChange = (val: string) => {
    const numVal = parseFloat(val) || 0;
    if (numVal >= 0 && numVal <= employee.remainingBalance) {
      const potentialCarry = employee.remainingBalance - numVal;
      if (potentialCarry <= MAX_CARRY) {
        setEncashment(numVal);
        setCarryForward(potentialCarry);
      } else {
        const minEncash = employee.remainingBalance - MAX_CARRY;
        setEncashment(minEncash);
        setCarryForward(MAX_CARRY);
      }
    }
  };

  const handleSubmit = async () => {
    setIsProcessing(true);
    setError(null);
    
    const payload = {
      userId: employee.userId,
      remainingBalance: employee.remainingBalance,
      carriedForward: carryForward,
      encashed: encashment,
    };

    const result = await processLeaveSplit(payload);
    
    if (result.success) {
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } else {
      setError(result.error || "Failed to process the leave balance split.");
    }
    setIsProcessing(false);
  };

  if (isSuccess) {
    return (
      <tr className="bg-emerald-50/50">
        <td colSpan={10} className="p-6 text-center text-emerald-700 font-medium">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Successfully processed manual split for {employee.name}.
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="bg-muted/30 border-y-2 border-primary/20">
      <td colSpan={10} className="p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-4xl mx-auto">
          <div className="flex flex-col gap-1">
            <h4 className="font-bold text-lg text-foreground">Manual Split Adjustment</h4>
            <p className="text-sm text-muted-foreground">Adjusting scenario for <span className="text-primary font-medium">{employee.name}</span></p>
          </div>

          <div className="flex items-center gap-8 bg-background/50 p-4 rounded-xl border border-border shadow-sm">
            <div className="flex flex-col items-center gap-1">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Total Balance</span>
              <span className="text-2xl font-black text-primary">{employee.remainingBalance}</span>
            </div>

            <div className="h-10 w-px bg-border" />

            <div className="flex items-center gap-4">
              <div className="flex flex-col gap-1.5 w-28">
                <Label className="text-xs font-semibold">Carry Forward</Label>
                <Input 
                  type="number" 
                  step="0.5" 
                  min="0" 
                  max={Math.min(MAX_CARRY, employee.remainingBalance)}
                  value={carryForward}
                  onChange={(e) => handleCarryForwardChange(e.target.value)}
                  className="text-center font-bold h-10 border-indigo-200 focus-visible:ring-indigo-500"
                />
              </div>
              <span className="text-2xl font-light text-muted-foreground self-end mb-1">+</span>
              <div className="flex flex-col gap-1.5 w-28">
                <Label className="text-xs font-semibold">Encashment</Label>
                <Input 
                  type="number" 
                  step="0.5" 
                  min="0" 
                  max={employee.remainingBalance}
                  value={encashment}
                  onChange={(e) => handleEncashmentChange(e.target.value)}
                  className="text-center font-bold h-10 border-emerald-200 focus-visible:ring-emerald-500 text-emerald-600"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2 min-w-40">
            <Button 
              onClick={handleSubmit} 
              disabled={isProcessing} 
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-md shadow-primary/20"
            >
              {isProcessing ? "Processing..." : "Confirm & Save"}
            </Button>
            {error && (
              <span className="text-[10px] text-destructive font-medium flex items-center gap-1 justify-center animate-in fade-in zoom-in-95">
                <AlertCircle className="w-3 h-3"/> {error}
              </span>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}