import { Plane, CalendarDays, Hourglass, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const activeRequests = requests.filter(r => r.status !== "CANCELLED").slice(0, 3);

  return (
    <div className="bg-white border border-border/60 rounded-sm p-6 space-y-5 h-full animate-fade-in shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1">Upcoming Leave</h3>
          <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.1em]">Activity Pipeline</p>
        </div>
        <div className="size-8 rounded-sm bg-primary/[0.05] text-primary flex items-center justify-center border border-primary/10">
           <Plane className="size-4" />
        </div>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto scrollbar-hide">
        {activeRequests.length === 0 ? (
          <div className="py-8 text-center flex flex-col items-center gap-2 opacity-20">
             <CalendarDays className="size-6" />
             <p className="text-[10px] font-black uppercase tracking-widest">No scheduled departures</p>
          </div>
        ) : (
          activeRequests.map((request) => (
            <div 
              key={request.id} 
              className={cn(
                "p-3 rounded-sm border transition-all duration-200 flex items-start gap-3",
                request.status === "PENDING" 
                  ? "bg-amber-500/[0.02] border-amber-500/10" 
                  : "bg-emerald-500/[0.02] border-emerald-500/10"
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
                  <span className="font-bold text-[12px] text-foreground truncate">{request.category}</span>
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-tighter",
                    request.status === "PENDING" ? "text-amber-600" : "text-emerald-600"
                  )}>
                    {request.status === "PENDING" ? "Pending" : "Confirmed"}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                   <p className="text-[10px] font-bold text-muted-foreground/50 leading-none">
                     {new Date(request.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {new Date(request.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                   </p>
                   <div className="size-0.5 rounded-full bg-border/40" />
                   <span className="text-[9px] font-black text-primary uppercase tracking-widest">
                     {request.days} {request.days === 1 ? 'Day' : 'Days'}
                   </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

