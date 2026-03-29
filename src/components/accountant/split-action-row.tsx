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

export function SplitActionRow({ employee }: { employee: EmployeePendingSplit }) {
  // Policy Change: Carry forward is strictly capped at 1.0 day max.
  const initialCarry = Math.min(1.0, employee.remainingBalance);
  const initialEncash = employee.remainingBalance - initialCarry;

  const [carryForward, setCarryForward] = useState<number>(initialCarry);
  const [encashment, setEncashment] = useState<number>(initialEncash);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const MAX_CARRY = 1.0;

  // Auto-calculate the inverse value for flawless UX
  const handleCarryForwardChange = (val: string) => {
    const numVal = parseFloat(val) || 0;
    // Enforce 0 <= numVal <= min(1, remainingBalance)
    const allowedMax = Math.min(MAX_CARRY, employee.remainingBalance);
    
    if (numVal >= 0 && numVal <= allowedMax) {
      setCarryForward(numVal);
      setEncashment(employee.remainingBalance - numVal);
    }
  };

  const handleEncashmentChange = (val: string) => {
    const numVal = parseFloat(val) || 0;
    if (numVal >= 0 && numVal <= employee.remainingBalance) {
      // Force minimum encashment to keep carry <= 1
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

    // Call Server Action
    const result = await processLeaveSplit(payload);
    
    if (result.success) {
      setIsSuccess(true);
    } else {
      setError(result.error || "Failed to process the leave balance split.");
    }
    setIsProcessing(false);
  };

  if (isSuccess) {
    return (
      <tr className="border-b bg-emerald-50/50">
        <td colSpan={4} className="p-4 align-middle text-emerald-700 font-medium flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5" />
          Successfully processed split for {employee.name}.
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b transition-colors hover:bg-muted/50">
      <td className="p-4 align-middle">
        <div className="font-medium">{employee.name}</div>
        <div className="text-xs text-muted-foreground">{employee.department}</div>
      </td>
      <td className="p-4 align-middle font-bold text-lg text-primary">
        {employee.remainingBalance}
      </td>
      <td className="p-4 align-middle">
        <div className="flex items-center gap-4">
          <div className="flex flex-col gap-1 w-24">
            <Label className="text-xs text-muted-foreground">Carry Fwd</Label>
            <Input 
              type="number" 
              step="0.5" 
              min="0" 
              max={Math.min(MAX_CARRY, employee.remainingBalance)}
              value={carryForward}
              onChange={(e) => handleCarryForwardChange(e.target.value)}
              className="text-center font-semibold"
            />
          </div>
          <span className="text-muted-foreground pt-4">+</span>
          <div className="flex flex-col gap-1 w-24">
            <Label className="text-xs text-muted-foreground">Encash</Label>
            <Input 
              type="number" 
              step="0.5" 
              min="0" 
              max={employee.remainingBalance}
              value={encashment}
              onChange={(e) => handleEncashmentChange(e.target.value)}
              className="text-center font-semibold"
            />
          </div>
        </div>
        {error && <span className="text-xs text-destructive flex items-center gap-1 mt-2"><AlertCircle className="w-3 h-3"/> {error}</span>}
      </td>
      <td className="p-4 align-middle text-right">
        <Button onClick={handleSubmit} disabled={isProcessing} className="w-full max-w-30">
          {isProcessing ? "Saving..." : "Confirm Split"}
        </Button>
      </td>
    </tr>
  );
}