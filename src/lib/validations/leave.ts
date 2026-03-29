import * as z from "zod";

export const leaveApplicationSchema = z.object({
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  duration: z.enum(["FULL", "HALF", "SHORT"], {
    required_error: "Please select a leave duration.",
  }),
  category: z.enum(["MONTHLY_POLICY_1", "SEMI_ANNUAL_POLICY_2"], {
    required_error: "Please select which policy to deduct this leave from.",
  }),
  reason: z.string().min(10, "Please provide a reason (minimum 10 characters).").max(500),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return end >= start;
}, {
  message: "End date cannot be before start date.",
  path: ["endDate"],
}).refine((data) => {
  // Business Logic Enforcement: Semi-Annual leaves are only FULL days.
  if (data.category === "SEMI_ANNUAL_POLICY_2" && data.duration !== "FULL") {
    return false;
  }
  return true;
}, {
  message: "Semi-Annual leaves (Policy 2) can only be taken as Full days.",
  path: ["duration"],
});

export type LeaveApplicationValues = z.infer<typeof leaveApplicationSchema>;