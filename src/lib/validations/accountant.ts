import * as z from "zod";

export const splitBalanceSchema = z.object({
  userId: z.string().min(1),
  month: z.number().min(1).max(12),
  year: z.number().min(2025).max(2100),
  remainingBalance: z.number().min(0),
  carriedForward: z.number().min(0).max(1, { message: "Only up to 1 day can be carried forward." }),
  encashed: z.number().min(0),
}).refine((data) => {
  // The crucial check: The split must perfectly equal the remaining balance
  return Math.abs((data.carriedForward + data.encashed) - data.remainingBalance) < 0.01;
}, {
  message: "Carry forward and encashment must equal the total remaining balance.",
  path: ["carriedForward"], 
});

export type SplitBalanceValues = z.infer<typeof splitBalanceSchema>;