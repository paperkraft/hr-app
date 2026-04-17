import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, AlertCircle, Clock } from "lucide-react";

interface LeaveRequest {
  id: string;
  category: string;
  startDate: Date;
  endDate: Date;
  status: string;
  days: number;
}

interface UpcomingLeaveProps {
  requests: LeaveRequest[];
}

export function UpcomingLeave({ requests }: UpcomingLeaveProps) {
  const upcoming = requests.find(r => r.status === "APPROVED" && new Date(r.startDate) > new Date());
  const pending = requests.find(r => r.status === "PENDING");

  return (
    <Card className="shadow-sm border-border/40 h-full overflow-hidden flex flex-col">
      <CardHeader className="pb-3 border-b border-border/40 p-4 shrink-0">
        <CardTitle className="text-sm font-bold flex items-center gap-2">
          <Plane className="size-4 text-primary" />
          Upcoming Leave
        </CardTitle>
        <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-0.5">
          Your scheduled time off
        </p>
      </CardHeader>
      <CardContent className="p-5 flex-1 space-y-4">
        {upcoming ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold">{upcoming.category}</p>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {new Date(upcoming.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} to {new Date(upcoming.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                Approved
              </Badge>
            </div>
            <p className="text-[10px] font-bold text-muted-foreground italic px-2 py-1 bg-muted/50 rounded inline-block">
              {upcoming.days} {upcoming.days === 1 ? 'day' : 'days'} total
            </p>
          </div>
        ) : (
          <div className="py-4 flex flex-col items-center justify-center text-muted-foreground text-xs text-center border-2 border-dashed border-muted/50 rounded-xl">
            <p>No upcoming approved leave.</p>
          </div>
        )}

        {pending && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 shadow-sm animate-pulse-subtle">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-full bg-amber-100">
                <AlertCircle className="size-4 text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-900">Pending Approval</p>
                <p className="text-[10px] text-amber-700 mt-1 leading-relaxed">
                  Your leave request for {new Date(pending.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} is awaiting manager approval.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
