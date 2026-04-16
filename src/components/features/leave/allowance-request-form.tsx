"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { applyForAllowance } from "@/actions/payroll";

const schema = z.object({
  fromDate: z.string().min(1, "From date is required"),
  toDate: z.string().min(1, "To date is required"),
  location: z.string().min(3, "Location is required (min 3 chars)"),
});

type Values = z.infer<typeof schema>;

export function AllowanceRequestForm({ onSuccess }: { onSuccess?: () => void }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      fromDate: "",
      toDate: "",
      location: "",
    },
  });

  const onSubmit = async (data: Values) => {
    try {
      const result = await applyForAllowance(data);
      if (result.success) {
        toast.success("Allowance request submitted");
        reset();
        onSuccess?.();
      } else {
        toast.error(result.error || "Failed to submit request");
      }
    } catch (error) {
      toast.error("Something went wrong");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-4">
      <div className="grid grid-cols-2 gap-4">
        {/* From Date */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fromDate" className="text-[13px] font-semibold text-foreground/80 px-0.5">
            From Date
          </label>
          <input
            id="fromDate"
            type="date"
            {...register("fromDate")}
            className="flex h-10 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm ring-offset-background transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted/10 cursor-pointer"
          />
          {errors.fromDate && (
            <span className="text-[11px] font-medium text-destructive px-1">
              {errors.fromDate.message}
            </span>
          )}
        </div>

        {/* To Date */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="toDate" className="text-[13px] font-semibold text-foreground/80 px-0.5">
            To Date
          </label>
          <input
            id="toDate"
            type="date"
            {...register("toDate")}
            className="flex h-10 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm ring-offset-background transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted/10 cursor-pointer"
          />
          {errors.toDate && (
            <span className="text-[11px] font-medium text-destructive px-1">
              {errors.toDate.message}
            </span>
          )}
        </div>
      </div>

      {/* Location */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="location" className="text-[13px] font-semibold text-foreground/80 px-0.5">
          Meeting Location
        </label>
        <input
          id="location"
          type="text"
          placeholder="e.g. Client Office, City Name"
          {...register("location")}
          className="flex h-10 w-full rounded-lg border border-border/60 bg-background px-3 py-2 text-sm ring-offset-background transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:cursor-not-allowed disabled:opacity-50 hover:bg-muted/10"
        />
        <p className="text-[11px] text-muted-foreground/60 font-medium px-1 italic">
          Where is the business meeting taking place?
        </p>
        {errors.location && (
          <span className="text-[11px] font-medium text-destructive px-1">
            {errors.location.message}
          </span>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="group relative w-full h-11 inline-flex items-center justify-center rounded-xl bg-primary text-[13px] font-bold text-primary-foreground transition-all hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden active:scale-[0.98]"
      >
        <span className="relative z-10">
          {isSubmitting ? "Processing Request..." : "Submit Allowance Request"}
        </span>
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    </form>
  );
}
