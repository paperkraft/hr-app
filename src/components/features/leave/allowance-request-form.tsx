"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { applyForAllowance } from "@/actions/payroll";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Send, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const schema = z.object({
  fromDate: z.string().min(1, "From date is required"),
  toDate: z.string().min(1, "To date is required"),
  location: z.string().min(3, "Location is required (min 3 chars)"),
});

type Values = z.infer<typeof schema>;

const labelClass = "text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/50";
const inputClass = "h-9 bg-muted/5 border-border/60 rounded-sm text-xs font-medium focus:ring-primary/10";

export function AllowanceRequestForm({ onSuccess }: { onSuccess?: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      fromDate: "",
      toDate: "",
      location: "",
    },
  });

  const onSubmit = async (data: Values) => {
    setIsSubmitting(true);
    setServerError(null);
    try {
      const result = await applyForAllowance(data);
      if (result.success) {
        toast.success("Allowance request submitted");
        reset();
        onSuccess?.();
      } else {
        setServerError(result.error || "Failed to submit request");
        toast.error(result.error || "Failed to submit request");
      }
    } catch (error) {
      setServerError("Something went wrong");
      toast.error("Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 animate-fade-in px-0.5">
      <div className="grid grid-cols-2 gap-4">
        {/* From Date */}
        <div className="space-y-1.5">
          <Label htmlFor="fromDate" className={labelClass}>
            From Date
          </Label>
          <Input
            id="fromDate"
            type="date"
            {...register("fromDate")}
            className={inputClass}
          />
          {errors.fromDate && (
            <span className="text-[10px] font-medium text-destructive px-1">
              {errors.fromDate.message}
            </span>
          )}
        </div>

        {/* To Date */}
        <div className="space-y-1.5">
          <Label htmlFor="toDate" className={labelClass}>
            To Date
          </Label>
          <Input
            id="toDate"
            type="date"
            {...register("toDate")}
            className={inputClass}
          />
          {errors.toDate && (
            <span className="text-[10px] font-medium text-destructive px-1">
              {errors.toDate.message}
            </span>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="space-y-1.5 pt-1 border-t border-border/20">
        <Label htmlFor="location" className={labelClass}>
          Meeting Location
        </Label>
        <div className="relative group/input">
          <Input
            id="location"
            type="text"
            placeholder="e.g. Client Office, City Name"
            {...register("location")}
            className={cn(inputClass, "pl-8")}
          />
          <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/40 group-focus-within/input:text-primary transition-colors" />
        </div>
        <p className="text-[9px] text-muted-foreground/50 font-medium px-1 uppercase tracking-tight">
          Where is the business meeting taking place?
        </p>
        {errors.location && (
          <span className="text-[10px] font-medium text-destructive px-1">
            {errors.location.message}
          </span>
        )}
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
        disabled={isSubmitting}
        className="w-full h-9 bg-primary hover:bg-primary/90 text-[11px] font-bold uppercase tracking-widest rounded-sm shadow-sm transition-all"
      >
        {isSubmitting ? (
          "Processing..."
        ) : (
          <>
            <Send className="size-3.5 mr-1.5" /> Submit Request
          </>
        )}
      </Button>
    </form>
  );
}

