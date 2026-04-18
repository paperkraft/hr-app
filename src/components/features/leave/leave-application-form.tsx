"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leaveApplicationSchema, type LeaveApplicationValues } from "@/lib/validations/leave";
import { submitLeaveRequest } from "@/actions/leave";
import { getSystemConfig } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AlertCircle, Clock, Sun, Moon, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const labelClass = "text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/50";
const inputClass = "h-9 bg-muted/5 border-border/60 rounded-sm text-xs font-medium focus:ring-primary/10";

export function LeaveApplicationForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [config, setConfig] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LeaveApplicationValues>({
    resolver: zodResolver(leaveApplicationSchema),
    defaultValues: {
      duration: "FULL",
      category: "MONTHLY_POLICY_1",
    },
  });

  const selectedCategory = watch("category");
  const selectedDuration = watch("duration");
  const selectedHalf = watch("halfDayType");
  const startDate = watch("startDate");

  useEffect(() => {
    getSystemConfig().then(setConfig);
  }, []);

  useEffect(() => {
    if ((selectedDuration === "HALF" || selectedDuration === "SHORT") && startDate) {
      setValue("endDate", startDate);
    }
  }, [selectedDuration, startDate, setValue]);

  const onSubmit = async (data: LeaveApplicationValues) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const result = await submitLeaveRequest(data);
      if (result.error) {
        setServerError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Leave application submitted!");
      reset();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      const msg = error.message || "Failed to submit leave request.";
      setServerError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const semiAnnualEnabled = config?.semiAnnualPolicyEnabled ?? true;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-fade-in">
      {/* Category Selection */}
      <div className="space-y-2">
        <Label className={labelClass}>Leave Category</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { id: "MONTHLY_POLICY_1", label: "Monthly", sub: "Standard quota", color: "primary" },
            ...(semiAnnualEnabled ? [{ id: "SEMI_ANNUAL_POLICY_2", label: "Semi-Annual", sub: "Cycle based", color: "amber-500" }] : []),
            { id: "UNPAID", label: "Unpaid", sub: "No balance", color: "rose-500" }
          ].map((cat) => (
            <label
              key={cat.id}
              className={cn(
                "relative flex flex-col p-2.5 cursor-pointer rounded-sm border transition-all",
                selectedCategory === cat.id 
                  ? `border-${cat.color} bg-${cat.color}/5 ring-1 ring-${cat.color}/20` 
                  : "border-border/60 bg-white hover:bg-muted/5"
              )}
            >
              <input type="radio" value={cat.id} className="sr-only" {...register("category")} />
              <span className={cn("text-[11px] font-bold", selectedCategory === cat.id ? `text-${cat.color}` : "text-foreground")}>
                {cat.label}
              </span>
              <span className="text-[9px] text-muted-foreground/50 font-medium uppercase tracking-tight">{cat.sub}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Monthly Sub-category */}
      {selectedCategory === "MONTHLY_POLICY_1" && (
        <div className="p-3 bg-primary/5 border border-primary/10 rounded-sm space-y-2 animate-in fade-in slide-in-from-top-2">
          <Label className="text-[9px] font-black text-primary uppercase tracking-widest">Type of Selection</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "CASUAL", label: "Casual", sub: "Regular" },
              { id: "MEDICAL", label: "Medical", sub: "Sick/Health" }
            ].map((type) => (
              <label
                key={type.id}
                className={cn(
                  "relative flex flex-col p-2 cursor-pointer rounded-sm border transition-all",
                  watch("leaveType") === type.id 
                    ? "border-primary bg-primary/10" 
                    : "border-border/40 bg-white/50"
                )}
              >
                <input type="radio" value={type.id} className="sr-only" {...register("leaveType")} />
                <span className="text-[10px] font-bold">{type.label}</span>
                <span className="text-[8px] text-muted-foreground/50 uppercase font-bold">{type.sub}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Duration Selection */}
      <div className="space-y-2 pt-1 border-t border-border/20">
        <Label className={labelClass}>Duration</Label>
        <div className="grid grid-cols-3 gap-2">
          {["FULL", "HALF", "SHORT"].map((type) => {
            const isDisabled = selectedCategory === "SEMI_ANNUAL_POLICY_2" && type !== "FULL";
            return (
              <label 
                key={type} 
                className={cn(
                  "flex justify-center p-2 cursor-pointer rounded-sm border transition-all text-[10px] font-bold uppercase tracking-widest",
                  selectedDuration === type ? "bg-primary text-white border-primary" : "bg-white border-border/60 hover:bg-muted/5",
                  isDisabled && "opacity-30 cursor-not-allowed bg-muted/20"
                )}
              >
                <input type="radio" value={type} disabled={isDisabled} className="sr-only" {...register("duration")} />
                {type === "SHORT" ? "Short" : type.toLowerCase()}
              </label>
            );
          })}
        </div>
      </div>

      {/* Half Session Selection */}
      {selectedDuration === "HALF" && (
        <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-sm space-y-2 animate-in slide-in-from-top-2">
          <Label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Select Session</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "FIRST_HALF", label: "First Half", icon: Sun, color: "emerald-500" },
              { id: "SECOND_HALF", label: "Second Half", icon: Moon, color: "amber-500" }
            ].map((session) => (
              <label
                key={session.id}
                className={cn(
                  "flex items-center gap-2 p-2 cursor-pointer rounded-sm border transition-all",
                  selectedHalf === session.id ? `border-${session.color} bg-${session.color}/10` : "border-border/40 bg-white/50"
                )}
              >
                <input type="radio" value={session.id} className="sr-only" {...register("halfDayType")} />
                <session.icon className={cn("size-3", selectedHalf === session.id ? `text-${session.color}` : "text-muted-foreground/30")} />
                <span className="text-[10px] font-bold">{session.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Date Range */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className={labelClass}>Starting Date</Label>
          <Input type="date" {...register("startDate")} className={inputClass} />
        </div>
        <div className="space-y-1.5">
          <Label className={labelClass}>Ending Date</Label>
          <Input 
            type="date" 
            {...register("endDate")} 
            disabled={selectedDuration === "HALF" || selectedDuration === "SHORT"} 
            className={cn(inputClass, (selectedDuration === "HALF" || selectedDuration === "SHORT") && "opacity-50")} 
          />
        </div>
      </div>

      {/* Short Time Windows */}
      {selectedDuration === "SHORT" && (
        <div className="grid grid-cols-2 gap-3 p-3 bg-primary/5 border border-primary/10 rounded-sm animate-in fade-in slide-in-from-top-2">
          <div className="space-y-1.5">
            <Label className="text-[9px] font-black text-primary uppercase flex items-center gap-1"><Clock className="size-3" /> Time From</Label>
            <Input type="time" {...register("startTime")} className="h-8 text-xs bg-white/50" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[9px] font-black text-primary uppercase flex items-center gap-1"><Clock className="size-3" /> Time To</Label>
            <Input type="time" {...register("endTime")} className="h-8 text-xs bg-white/50" />
          </div>
        </div>
      )}

      {/* Reason */}
      <div className="space-y-1.5 pt-1 border-t border-border/20">
        <Label className={labelClass}>Brief Statement</Label>
        <Textarea
          placeholder="Reason for leave..."
          className="min-h-[80px] bg-muted/5 border-border/60 text-xs rounded-sm resize-none focus:ring-primary/10"
          {...register("reason")}
        />
      </div>

      {/* Errors */}
      {serverError && (
        <div className="bg-rose-500/5 text-rose-600 text-[10px] p-2.5 rounded-sm flex items-center gap-2 border border-rose-500/20">
          <AlertCircle className="size-3.5 shrink-0" />
          <span className="font-bold uppercase tracking-tight">{serverError}</span>
        </div>
      )}

      {/* Submit Button */}
      <Button 
        type="submit" 
        className="w-full h-9 bg-primary hover:bg-primary/90 text-[11px] font-bold uppercase tracking-widest rounded-sm shadow-sm transition-all" 
        disabled={isSubmitting}
      >
        {isSubmitting ? "Dispatching..." : <><Send className="size-3.5 mr-1.5" /> Submit Application</>}
      </Button>
    </form>
  );
}
