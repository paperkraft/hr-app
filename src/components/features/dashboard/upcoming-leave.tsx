import { Plane, CalendarDays, Hourglass, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaveRequest {
  id: string;
  category: string;
  leaveType?: string | null;
  duration: string;
  startDate: Date;
  endDate: Date;
  status: string;
  days?: number;
}

interface UpcomingLeaveProps {
  requests: LeaveRequest[];
}

export function UpcomingLeave({ requests }: UpcomingLeaveProps) {
  const activeRequests = requests.filter(r => r.status === "PENDING" || r.status === "APPROVED").slice(0, 10);

  const getLeaveLabel = (request: LeaveRequest) => {
    if (request.duration === "SHORT") return "Short Leave";
    if (request.category === "UNPAID") return "Unpaid Leave";
    if (request.category === "SEMI_ANNUAL_POLICY_2") return "Semi-Annual";
    if (request.category === "MONTHLY_POLICY_1") {
      if (request.leaveType === "CASUAL") return "Casual Leave";
      if (request.leaveType === "MEDICAL") return "Medical Leave";
      return "Paid Leave";
    }
    return "Leave";
  };

  const formatDateRange = (start: Date, end: Date) => {
    const s = new Date(start);
    const e = new Date(end);
    const sStr = s.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    if (s.toDateString() === e.toDateString()) {
      return sStr;
    }
    const eStr = e.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    return `${sStr} - ${eStr}`;
  };

  return (
    <div className="bg-card border border-border rounded-sm p-4 space-y-4 h-[430px] flex flex-col animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1">Upcoming Leave</h3>
          <p className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-widest">Activity Pipeline</p>
        </div>
        <Plane className="size-4 text-muted-foreground/80" />
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto scrollbar-hide">
        {activeRequests.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center gap-2 opacity-20">
            <CalendarDays className="size-6" />
            <p className="text-[10px] font-black uppercase tracking-widest">No scheduled departures</p>
          </div>
        ) : (
          activeRequests.map((request) => {
            const label = getLeaveLabel(request);
            const dateDisplay = formatDateRange(request.startDate, request.endDate);
            const days = request.days || 1;

            return (
              <div
                key={request.id}
                className={cn(
                  "p-3 rounded-sm border transition-all duration-200 flex items-start gap-3",
                  request.status === "PENDING"
                    ? "bg-amber-500/2 border-amber-500/10"
                    : "bg-emerald-500/2 border-emerald-500/10"
                )}
              >
                <div className={cn(
                  "size-8 rounded-sm flex items-center justify-center shrink-0 border",
                  request.status === "PENDING" ? "bg-amber-500/10 text-amber-600 border-amber-500/10" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/10"
                )}>
                  {request.status === "PENDING" ? <Hourglass className="size-4" /> : <CheckCircle2 className="size-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5 mb-0.5">
                    <span className="font-bold text-[12px] text-foreground truncate">{label}</span>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-tighter",
                      request.status === "PENDING" ? "text-amber-600" : "text-emerald-600"
                    )}>
                      {request.status === "PENDING" ? "Pending" : "Confirmed"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-bold text-muted-foreground/50 leading-none">
                      {dateDisplay}
                    </p>
                    <div className="size-0.5 rounded-full bg-border/40" />
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                      {days} {days === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

