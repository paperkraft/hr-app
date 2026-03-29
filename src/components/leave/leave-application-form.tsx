"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leaveApplicationSchema, type LeaveApplicationValues } from "@/lib/validations/leave";
import { submitLeaveRequest } from "@/app/actions/leave";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle, CalendarRange } from "lucide-react";

export function LeaveApplicationForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
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

  const onSubmit = async (data: LeaveApplicationValues) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const result = await submitLeaveRequest(data);
      if (result.error) throw new Error(result.error);

      if (onSuccess) onSuccess();
    } catch (error: any) {
      setServerError(error.message || "Failed to submit leave request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center gap-2 pb-4 border-b border-border/50">
        <CalendarRange className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">Apply for Leave</h2>
      </div>

      {/* Date Range Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Start Date</Label>
          <Input id="startDate" type="date" {...register("startDate")} />
          {errors.startDate && <p className="text-sm text-destructive">{errors.startDate.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">End Date</Label>
          <Input id="endDate" type="date" {...register("endDate")} />
          {errors.endDate && <p className="text-sm text-destructive">{errors.endDate.message}</p>}
        </div>
      </div>

      {/* Policy Category Selection */}
      <div className="space-y-3">
        <Label>Leave Category</Label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className={`relative flex cursor-pointer rounded-lg border bg-background p-4 shadow-sm focus:outline-none ${selectedCategory === "MONTHLY_POLICY_1" ? "border-primary ring-1 ring-primary" : "border-border"}`}>
            <input type="radio" value="MONTHLY_POLICY_1" className="sr-only" {...register("category")} />
            <div className="flex flex-col">
              <span className="block text-sm font-medium">Monthly (Policy 1)</span>
              <span className="mt-1 flex items-center text-xs text-muted-foreground">Paid: 2 Full / 1 Short.</span>
            </div>
          </label>

          <label className={`relative flex cursor-pointer rounded-lg border bg-background p-4 shadow-sm focus:outline-none ${selectedCategory === "SEMI_ANNUAL_POLICY_2" ? "border-primary ring-1 ring-primary" : "border-border"}`}>
            <input type="radio" value="SEMI_ANNUAL_POLICY_2" className="sr-only" {...register("category")} />
            <div className="flex flex-col">
              <span className="block text-sm font-medium">Semi-Annual (Policy 2)</span>
              <span className="mt-1 flex items-center text-xs text-muted-foreground">Paid: 6-month cycle.</span>
            </div>
          </label>

          {/* NEW: Unpaid Leave Option */}
          <label className={`relative flex cursor-pointer rounded-lg border bg-background p-4 shadow-sm focus:outline-none ${selectedCategory === "UNPAID" ? "border-destructive ring-1 ring-destructive" : "border-border"}`}>
            <input type="radio" value="UNPAID" className="sr-only" {...register("category")} />
            <div className="flex flex-col">
              <span className="block text-sm font-medium text-destructive">Leave Without Pay</span>
              <span className="mt-1 flex items-center text-xs text-muted-foreground">Unpaid emergency/medical.</span>
            </div>
          </label>
        </div>
        {errors.category && <p className="text-sm text-destructive">{errors.category.message}</p>}
      </div>

      {/* Duration Selection */}
      <div className="space-y-3">
        <Label>Duration</Label>
        <div className="grid grid-cols-3 gap-3">
          {["FULL", "HALF", "SHORT"].map((type) => {
            const isDisabled = selectedCategory === "SEMI_ANNUAL_POLICY_2" && type !== "FULL";
            return (
              <label key={type} className={`relative flex justify-center cursor-pointer rounded-md border py-3 px-3 shadow-sm focus:outline-none 
                ${selectedDuration === type ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border"}
                ${isDisabled ? "opacity-50 cursor-not-allowed bg-secondary" : "hover:bg-secondary/50"}
              `}>
                <input type="radio" value={type} disabled={isDisabled} className="sr-only" {...register("duration")} />
                <span className="text-sm font-medium">{type === "SHORT" ? "Short (2hr)" : type.charAt(0) + type.slice(1).toLowerCase()}</span>
              </label>
            );
          })}
        </div>
        {errors.duration && <p className="text-sm text-destructive">{errors.duration.message}</p>}
      </div>

      {/* Reason Textarea */}
      <div className="space-y-2">
        <Label htmlFor="reason">Reason for Leave</Label>
        <Textarea
          id="reason"
          placeholder="Briefly explain your reason for requesting leave..."
          className="min-h-25 resize-none"
          {...register("reason")}
        />
        {errors.reason && <p className="text-sm text-destructive">{errors.reason.message}</p>}
      </div>

      {/* Error State */}
      {serverError && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {serverError}
        </div>
      )}

      {/* Submit */}
      <div className="pt-2">
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Submitting Request..." : "Submit Leave Application"}
        </Button>
      </div>
    </form>
  );
}