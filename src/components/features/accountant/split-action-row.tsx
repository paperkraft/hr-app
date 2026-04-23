"use client";

import { useState, useEffect } from "react";
import { processLeaveSplit } from "@/actions/accountant";
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
  month,
  year,
  colSpan = 11,
  onSuccess
}: {
  employee: { userId: string; name: string; remainingBalance: number };
  month: number;
  year: number;
  colSpan?: number;
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
      month,
      year,
      remainingBalance: employee.remainingBalance,
      carriedForward: carryForward,
      encashed: encashment,
    };

    const result = await processLeaveSplit(payload);

    if ('success' in result && result.success) {
      setIsSuccess(true);
      if (onSuccess) onSuccess();
    } else {
      const errorMsg = 'error' in result ? result.error : "Failed to process the leave balance split.";
      setError(errorMsg);
    }
    setIsProcessing(false);
  };

  if (isSuccess) {
    return (
      <tr className="bg-emerald-50/50">
        <td colSpan={colSpan} className="p-4 text-center text-emerald-700 font-bold text-[10px] uppercase tracking-widest">
          <div className="flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Processed for {employee.name}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="bg-muted/30 border-y border-primary/20">
      <td colSpan={colSpan} className="p-2 md:p-4">
        {/* Sticky/Fixed-Width Container for Mobile Viewability */}
        <div className="flex flex-col items-center gap-3 w-full max-w-sm mx-auto bg-background/80 backdrop-blur-sm p-3 rounded-md border border-border shadow-lg">
          <div className="flex flex-col gap-0.5 text-center">
            <h4 className="font-black text-[10px] text-foreground uppercase tracking-widest">Manual Split Adjustment</h4>
            <p className="text-[10px] text-muted-foreground font-medium">Employee: <span className="text-primary font-bold">{employee.name}</span></p>
          </div>

          <div className="flex items-center gap-6 w-full justify-center">
            <div className="flex flex-col items-center">
              <span className="text-[8px] uppercase font-bold text-muted-foreground/40 tracking-tighter">Total</span>
              <span className="text-lg font-black text-primary tabular-nums">{employee.remainingBalance}</span>
            </div>

            <div className="h-8 w-px bg-border/60" />

            <div className="flex items-center gap-3">
              <div className="flex flex-col gap-1 w-20">
                <Label className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-widest">Carry</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  max={Math.min(MAX_CARRY, employee.remainingBalance)}
                  value={carryForward}
                  onChange={(e) => handleCarryForwardChange(e.target.value)}
                  className="text-center font-bold h-8 text-[11px] border-indigo-200 focus-visible:ring-indigo-500 bg-card"
                />
              </div>
              <span className="text-lg font-light text-muted-foreground mt-4">+</span>
              <div className="flex flex-col gap-1 w-20">
                <Label className="text-[8px] font-black uppercase text-muted-foreground/60 tracking-widest">Encash</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  max={employee.remainingBalance}
                  value={encashment}
                  onChange={(e) => handleEncashmentChange(e.target.value)}
                  className="text-center font-bold h-8 text-[11px] border-emerald-200 focus-visible:ring-emerald-500 text-emerald-600 bg-card"
                />
              </div>
            </div>
          </div>

          <div className="w-full">
            <Button
              onClick={handleSubmit}
              disabled={isProcessing}
              size="sm"
              className="w-full h-8 bg-primary hover:bg-primary/90 text-[10px] font-black uppercase tracking-widest"
            >
              {isProcessing ? "Processing..." : "Confirm & Save Split"}
            </Button>
            {error && (
              <span className="text-[9px] text-destructive font-bold flex items-center gap-1 justify-center mt-1.5">
                <AlertCircle className="w-2.5 h-2.5" /> {error}
              </span>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
}