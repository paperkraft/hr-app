import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";

interface LeaveBalanceProps {
  balances: {
    monthlyFull: number;
    monthlyShort: number;
    semiAnnual: number;
  };
}

export function LeaveBalanceCard({ balances }: LeaveBalanceProps) {
  return (
    <Card className="col-span-1 md:col-span-2 shadow-sm border-border/50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <CalendarDays className="w-5 h-5 text-muted-foreground" />
          Available Leave Balances
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-secondary/30 p-4 rounded-xl border border-border/50 flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">Monthly Full</span>
          <span className="text-3xl font-bold">{balances.monthlyFull}</span>
          <span className="text-xs text-muted-foreground mt-1">Policy 1</span>
        </div>
        <div className="bg-secondary/30 p-4 rounded-xl border border-border/50 flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">Monthly Short</span>
          <span className="text-3xl font-bold">{balances.monthlyShort}</span>
          <span className="text-xs text-muted-foreground mt-1">Policy 1 (Max 1)</span>
        </div>
        <div className="bg-primary/5 p-4 rounded-xl border border-primary/20 flex flex-col gap-1 col-span-2 md:col-span-1">
          <span className="text-sm font-medium text-primary">Semi-Annual</span>
          <span className="text-3xl font-bold text-primary">{balances.semiAnnual}</span>
          <span className="text-xs text-primary/80 mt-1">Policy 2 (Oct-Mar)</span>
        </div>
      </CardContent>
    </Card>
  );
}
