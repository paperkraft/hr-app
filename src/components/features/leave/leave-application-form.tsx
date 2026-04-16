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
import { AlertCircle, CalendarRange, Clock, Sun, Moon } from "lucide-react";

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

  // Sync End Date with Start Date for HALF and SHORT durations
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
      
      toast.success("Leave application submitted successfully!");
      reset(); // Reset form on success
      if (onSuccess) onSuccess();
    } catch (error: any) {
      const msg = error.message || "Failed to submit leave request.";
      setServerError(msg);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onInvalid = () => {
    toast.error("Please fill all required fields and provide a valid reason.");
  };

  const semiAnnualEnabled = config?.semiAnnualPolicyEnabled ?? true;

  return (
    <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6">
      {/* Policy Category Selection */}
      <div className="space-y-3">
        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Leave Category</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className={`relative flex cursor-pointer rounded-lg border bg-background p-3 shadow-sm transition-all ${selectedCategory === "MONTHLY_POLICY_1" ? "border-primary ring-1 ring-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}>
            <input type="radio" value="MONTHLY_POLICY_1" className="sr-only" {...register("category")} />
            <div className="flex flex-col">
              <span className="block text-sm font-semibold">Monthly</span>
              <span className="mt-1 flex items-center text-[10px] text-muted-foreground">Standard 2 + 1 quota.</span>
            </div>
          </label>

          {semiAnnualEnabled && (
            <label className={`relative flex cursor-pointer rounded-lg border bg-background p-3 shadow-sm transition-all animate-in fade-in zoom-in duration-300 ${selectedCategory === "SEMI_ANNUAL_POLICY_2" ? "border-amber-500 ring-1 ring-amber-500 bg-amber-500/5" : "border-border hover:bg-muted/50"}`}>
              <input type="radio" value="SEMI_ANNUAL_POLICY_2" className="sr-only" {...register("category")} />
              <div className="flex flex-col">
                <span className="block text-sm font-semibold">Semi-Annual</span>
                <span className="mt-1 flex items-center text-[10px] text-muted-foreground">Cycle based (H1/H2).</span>
              </div>
            </label>
          )}

          <label className={`relative flex cursor-pointer rounded-lg border bg-background p-3 shadow-sm transition-all ${selectedCategory === "UNPAID" ? "border-rose-500 ring-1 ring-rose-500 bg-rose-500/5" : "border-border hover:bg-muted/50"}`}>
            <input type="radio" value="UNPAID" className="sr-only" {...register("category")} />
            <div className="flex flex-col">
              <span className="block text-sm font-semibold text-rose-600 dark:text-rose-400">Unpaid</span>
              <span className="mt-1 flex items-center text-[10px] text-muted-foreground">No balance required.</span>
            </div>
          </label>
        </div>
        {errors.category && <p className="text-[11px] text-destructive font-medium">{errors.category.message}</p>}
      </div>

      {/* Monthly Leave Type Selection (Sub-category) */}
      {selectedCategory === "MONTHLY_POLICY_1" && (
        <div className="space-y-3 p-4 bg-primary/5 border border-primary/10 rounded-xl animate-in fade-in slide-in-from-top-2 duration-300">
          <Label className="text-xs font-bold text-primary flex items-center gap-1.5 uppercase tracking-wider">
             Monthly Leave Type
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`relative flex items-center gap-3 cursor-pointer rounded-lg border p-3 transition-all ${watch("leaveType") === "CASUAL" ? "border-primary ring-1 ring-primary bg-primary/10 shadow-sm" : "border-border/40 bg-background/50"}`}>
              <input type="radio" value="CASUAL" className="sr-only" {...register("leaveType")} />
              <div className="flex flex-col">
                <span className="text-xs font-bold">Casual Leave</span>
                <span className="text-[10px] text-muted-foreground font-medium">Standard leave (Unpaid if backdated).</span>
              </div>
            </label>
            <label className={`relative flex items-center gap-3 cursor-pointer rounded-lg border p-3 transition-all ${watch("leaveType") === "MEDICAL" ? "border-blue-500 ring-1 ring-blue-500 bg-blue-500/10 shadow-sm" : "border-border/40 bg-background/50"}`}>
              <input type="radio" value="MEDICAL" className="sr-only" {...register("leaveType")} />
              <div className="flex flex-col">
                <span className="text-xs font-bold">Medical Leave</span>
                <span className="text-[10px] text-muted-foreground">Auto-approved if backdated.</span>
              </div>
            </label>
          </div>
          {errors.leaveType && <p className="text-[11px] text-destructive font-medium">{errors.leaveType.message}</p>}
        </div>
      )}

      {/* Duration Selection */}
      <div className="space-y-3 pt-2 border-t border-border/50">
        <Label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Duration</Label>
        <div className="grid grid-cols-3 gap-3">
          {["FULL", "HALF", "SHORT"].map((type) => {
            const isDisabled = selectedCategory === "SEMI_ANNUAL_POLICY_2" && type !== "FULL";
            return (
              <label key={type} className={`relative flex justify-center cursor-pointer rounded-md border py-2.5 px-3 shadow-sm transition-all 
                ${selectedDuration === type ? "bg-primary text-primary-foreground border-primary shadow-md" : "bg-background border-border hover:bg-muted/50"}
                ${isDisabled ? "opacity-30 cursor-not-allowed bg-secondary" : ""}
              `}>
                <input type="radio" value={type} disabled={isDisabled} className="sr-only" {...register("duration")} />
                <span className="text-xs font-bold tracking-tight">{type === "SHORT" ? "Short (2hr)" : type.charAt(0) + type.slice(1).toLowerCase()}</span>
              </label>
            );
          })}
        </div>
        {errors.duration && <p className="text-[11px] text-destructive font-medium">{errors.duration.message}</p>}
      </div>

      {/* HALF Leave Boundary Selection */}
      {selectedDuration === "HALF" && (
        <div className="space-y-3 p-4 bg-muted/20 border border-border/40 rounded-xl animate-in slide-in-from-top-4 duration-500">
          <Label className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase">
             Which Session?
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <label className={`relative flex items-center gap-3 cursor-pointer rounded-lg border p-3 transition-all ${selectedHalf === "FIRST_HALF" ? "border-emerald-500 ring-1 ring-emerald-500 bg-emerald-500/10 shadow-sm" : "border-border/40 bg-background/50"}`}>
              <input type="radio" value="FIRST_HALF" className="sr-only" {...register("halfDayType")} />
              <Sun className={`size-4 ${selectedHalf === "FIRST_HALF" ? "text-emerald-500" : "text-muted-foreground"}`} />
              <div className="flex flex-col">
                <span className="text-xs font-bold">First Half</span>
                {config && <span className="text-[9px] text-muted-foreground tabular-nums">Ends at {config.firstHalfEndTime}</span>}
              </div>
            </label>
            <label className={`relative flex items-center gap-3 cursor-pointer rounded-lg border p-3 transition-all ${selectedHalf === "SECOND_HALF" ? "border-amber-500 ring-1 ring-amber-500 bg-amber-500/10 shadow-sm" : "border-border/40 bg-background/50"}`}>
              <input type="radio" value="SECOND_HALF" className="sr-only" {...register("halfDayType")} />
              <Moon className={`size-4 ${selectedHalf === "SECOND_HALF" ? "text-amber-500" : "text-muted-foreground"}`} />
              <div className="flex flex-col">
                <span className="text-xs font-bold">Second Half</span>
                {config && <span className="text-[9px] text-muted-foreground tabular-nums">Starts at {config.secondHalfStartTime}</span>}
              </div>
            </label>
          </div>
          {errors.halfDayType && <p className="text-[11px] text-destructive font-medium">{errors.halfDayType.message}</p>}
        </div>
      )}

      {/* Date Range Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate" className="text-xs font-bold text-muted-foreground uppercase">From</Label>
          <Input id="startDate" type="date" {...register("startDate")} className="h-10 bg-muted/5 border-border/60" />
          {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate" className="text-xs font-bold text-muted-foreground uppercase">To</Label>
          <Input id="endDate" type="date" {...register("endDate")} disabled={selectedDuration === "HALF" || selectedDuration === "SHORT"} className="h-10 bg-muted/5 border-border/60" />
          {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
        </div>
      </div>

      {/* Short Leave Time Windows (Conditional) */}
      {selectedDuration === "SHORT" && (
        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300 bg-primary/5 p-4 rounded-xl border border-primary/10">
          <div className="space-y-2">
            <Label htmlFor="startTime" className="text-[10px] font-bold text-primary flex items-center gap-1 uppercase"><Clock className="size-3" /> From</Label>
            <Input id="startTime" type="time" {...register("startTime")} className="h-9 bg-background/50" />
            {errors.startTime && <p className="text-sm text-destructive text-[10px]">{errors.startTime.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="endTime" className="text-[10px] font-bold text-primary flex items-center gap-1 uppercase"><Clock className="size-3" /> To</Label>
            <Input id="endTime" type="time" {...register("endTime")} className="h-9 bg-background/50" />
            {errors.endTime && <p className="text-sm text-destructive text-[10px]">{errors.endTime.message}</p>}
          </div>
        </div>
      )}

      {/* Reason Textarea */}
      <div className="space-y-2 pt-2 border-t border-border/20">
        <Label htmlFor="reason" className="text-xs font-bold text-muted-foreground uppercase">Reason for Leave</Label>
        <Textarea
          id="reason"
          placeholder="Briefly explain your reason for requesting leave..."
          className="min-h-[80px] resize-none bg-muted/5 border-border/60 text-sm"
          {...register("reason")}
        />
        {errors.reason && <p className="text-sm text-destructive">{errors.reason.message}</p>}
      </div>

      {/* Error State */}
      {serverError && (
        <div className="bg-destructive/10 text-destructive text-[11px] p-3 rounded-lg flex items-center gap-2 border border-destructive/20 animate-in shake duration-300">
          <AlertCircle className="size-3.5 shrink-0" />
          <span className="font-semibold">{serverError}</span>
        </div>
      )}

      {/* Submit */}
      <div className="pt-2">
        <Button type="submit" className="w-full h-11 rounded-full text-xs font-bold shadow-lg shadow-primary/20 transition-all active:scale-95" disabled={isSubmitting}>
          {isSubmitting ? "Dispatching Application..." : "Submit Leave Application"}
        </Button>
      </div>
    </form>
  );
}
