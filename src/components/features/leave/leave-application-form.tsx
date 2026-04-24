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
    if (selectedCategory !== "MONTHLY_POLICY_1") {
      setValue("leaveType", undefined);
    }
  }, [selectedCategory, setValue]);

  useEffect(() => {
    if ((selectedDuration === "HALF" || selectedDuration === "SHORT") && startDate) {
      setValue("endDate", startDate);
    }
  }, [selectedDuration, startDate, setValue]);

  const startTime = watch("startTime");
  useEffect(() => {
    if (selectedDuration === "SHORT" && startTime) {
      const [hours, minutes] = startTime.split(":").map(Number);
      const endHours = (hours + 2) % 24;
      const endTimeString = `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      setValue("endTime", endTimeString);
    }
  }, [startTime, selectedDuration, setValue]);

  useEffect(() => {
    if (selectedDuration !== "SHORT") {
      setValue("startTime", undefined);
      setValue("endTime", undefined);
    }
    if (selectedDuration === "FULL") {
      setValue("halfDayType", undefined);
    }
  }, [selectedDuration, setValue]);

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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 animate-fade-in">
      {/* Category Selection */}
      <div className="space-y-2">
        <Label className={labelClass}>Leave Category</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { id: "MONTHLY_POLICY_1", label: "Monthly", sub: "Casual / Medical" },
            ...(semiAnnualEnabled ? [{ id: "SEMI_ANNUAL_POLICY_2", label: "Earned Leave", sub: "Hangout (3+ Days)" }] : []),
            { id: "UNPAID", label: "Unpaid", sub: "No balance" }
          ].map((cat) => {
            const isSelected = selectedCategory === cat.id;
            
            // Map categories to explicit Tailwind classes for JIT support
            const categoryStyles: Record<string, { border: string, bg: string, ring: string, text: string }> = {
              "MONTHLY_POLICY_1": {
                border: "border-primary",
                bg: "bg-primary/5",
                ring: "ring-primary/20",
                text: "text-primary"
              },
              "SEMI_ANNUAL_POLICY_2": {
                border: "border-amber-500",
                bg: "bg-amber-500/5",
                ring: "ring-amber-500/20",
                text: "text-amber-500"
              },
              "UNPAID": {
                border: "border-rose-500",
                bg: "bg-rose-500/5",
                ring: "ring-rose-500/20",
                text: "text-rose-500"
              }
            };

            const styles = categoryStyles[cat.id] || categoryStyles["MONTHLY_POLICY_1"];

            return (
              <label
                key={cat.id}
                className={cn(
                  "relative flex flex-col p-2.5 cursor-pointer rounded-sm border transition-all",
                  isSelected
                    ? `${styles.border} ${styles.bg} ring-1 ${styles.ring}`
                    : "border-border/60 bg-muted/5 hover:bg-muted/10 transition-colors"
                )}
              >
                <input type="radio" value={cat.id} className="sr-only" {...register("category")} />
                <span className={cn("text-[11px] font-bold", isSelected ? styles.text : "text-foreground")}>
                  {cat.label}
                </span>
                <span className="text-[9px] text-muted-foreground/50 font-medium uppercase tracking-tight">{cat.sub}</span>
              </label>
            );
          })}
        </div>
        {errors.category && <p className="text-[10px] text-rose-500 font-bold mt-1 animate-in fade-in slide-in-from-top-1">{errors.category.message}</p>}
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
                    : "border-border/40 bg-muted/5"
                )}
              >
                <input type="radio" value={type.id} className="sr-only" {...register("leaveType")} />
                <span className="text-[10px] font-bold">{type.label}</span>
                <span className="text-[8px] text-muted-foreground/50 uppercase font-bold">{type.sub}</span>
              </label>
            ))}
          </div>
          {errors.leaveType && <p className="text-[10px] text-rose-500 font-bold mt-1 animate-in fade-in slide-in-from-top-1">{errors.leaveType.message}</p>}
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
                  selectedDuration === type ? "bg-primary text-white border-primary" : "bg-muted/5 border-border/60 hover:bg-muted/10 transition-colors",
                  isDisabled && "opacity-30 cursor-not-allowed bg-muted/20"
                )}
              >
                <input type="radio" value={type} disabled={isDisabled} className="sr-only" {...register("duration")} />
                {type === "SHORT" ? "Short" : type.toLowerCase()}
              </label>
            );
          })}
        </div>
        {errors.duration && <p className="text-[10px] text-rose-500 font-bold mt-1 animate-in fade-in slide-in-from-top-1">{errors.duration.message}</p>}
      </div>

      {/* Half Session Selection */}
      {selectedDuration === "HALF" && (
        <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-sm space-y-2 animate-in slide-in-from-top-2">
          <Label className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Select Session</Label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: "FIRST_HALF", label: "First Half", icon: Sun },
              { id: "SECOND_HALF", label: "Second Half", icon: Moon }
            ].map((session) => {
              const isSelected = selectedHalf === session.id;
              const sessionStyles: Record<string, { border: string, bg: string, text: string }> = {
                "FIRST_HALF": {
                  border: "border-emerald-500",
                  bg: "bg-emerald-500/10",
                  text: "text-emerald-500"
                },
                "SECOND_HALF": {
                  border: "border-amber-500",
                  bg: "bg-amber-500/10",
                  text: "text-amber-500"
                }
              };
              const styles = sessionStyles[session.id];

              return (
                <label
                  key={session.id}
                  className={cn(
                    "flex items-center gap-2 p-2 cursor-pointer rounded-sm border transition-all",
                    isSelected ? `${styles.border} ${styles.bg}` : "border-border/40 bg-muted/5"
                  )}
                >
                  <input type="radio" value={session.id} className="sr-only" {...register("halfDayType")} />
                  <session.icon className={cn("size-3", isSelected ? styles.text : "text-muted-foreground/30")} />
                  <span className="text-[10px] font-bold">{session.label}</span>
                </label>
              );
            })}
          </div>
          {errors.halfDayType && <p className="text-[10px] text-rose-500 font-bold mt-1 animate-in fade-in slide-in-from-top-1">{errors.halfDayType.message}</p>}
        </div>
      )}

      {/* Date Range */}
      <div className="space-y-2">
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
        {(errors.startDate || errors.endDate) && (
          <div className="flex gap-3">
            <div className="flex-1">
              {errors.startDate && <p className="text-[10px] text-rose-500 font-bold mt-1 animate-in fade-in slide-in-from-top-1">{errors.startDate.message}</p>}
            </div>
            <div className="flex-1">
              {errors.endDate && <p className="text-[10px] text-rose-500 font-bold mt-1 animate-in fade-in slide-in-from-top-1">{errors.endDate.message}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Short Time Windows */}
      {selectedDuration === "SHORT" && (
        <div className="p-3 bg-primary/5 border border-primary/10 rounded-sm space-y-2 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black text-primary uppercase flex items-center gap-1"><Clock className="size-3" /> Time From</Label>
              <Input type="time" {...register("startTime")} className="h-8 text-xs bg-card border-border/40" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[9px] font-black text-primary uppercase flex items-center gap-1"><Clock className="size-3" /> Time To</Label>
              <Input type="time" {...register("endTime")} className="h-8 text-xs bg-card border-border/40" />
            </div>
          </div>
          {(errors.startTime || errors.endTime) && (
            <p className="text-[10px] text-rose-500 font-bold mt-1 animate-in fade-in slide-in-from-top-1">
              {errors.startTime?.message || errors.endTime?.message}
            </p>
          )}
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
        {errors.reason && <p className="text-[10px] text-rose-500 font-bold mt-1 animate-in fade-in slide-in-from-top-1">{errors.reason.message}</p>}
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
        className="w-full h-9 bg-primary hover:bg-primary/90 text-[11px] font-bold uppercase tracking-widest rounded-sm transition-colors"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Dispatching..." : <><Send className="size-3.5 mr-1.5" /> Submit Application</>}
      </Button>
    </form>
  );
}
