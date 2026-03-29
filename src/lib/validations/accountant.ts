import * as z from "zod";

export const splitBalanceSchema = z.object({
  userId: z.string().min(1),
  remainingBalance: z.number().positive(),
  carriedForward: z.number().min(0).max(1, { message: "Only up to 1 day can be carried forward." }),
  encashed: z.number().min(0),
}).refine((data) => {
  // The crucial check: The split must perfectly equal the remaining balance
  return Number((data.carriedForward + data.encashed).toFixed(1)) === data.remainingBalance;
}, {
  message: "Carry forward and encashment must equal the total remaining balance.",
  path: ["carriedForward"], 
});

export type SplitBalanceValues = z.infer<typeof splitBalanceSchema>;