import { Plane, AlertCircle, CalendarDays } from "lucide-react";
import { PageSection, StatusBadge } from "@/components/ui";
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
  const upcoming = requests.find(r => r.status === "APPROVED" && new Date(r.startDate) > new Date());
  const pending = requests.find(r => r.status === "PENDING");

  return (
    <PageSection
      title="Upcoming Leave"
      description="Your scheduled time off and pending requests"
      className="h-full animate-fade-in shadow-xl border-border/40"
      noPadding
    >
      <div className="flex flex-col h-full max-h-[400px] bg-gradient-to-br from-background to-muted/20">
        <div className="divide-y divide-border/40 overflow-y-auto flex-1 scrollbar-hide">
          {requests.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground italic text-xs flex flex-col items-center justify-center gap-3 opacity-60">
               <Plane className="size-6 opacity-20" />
               <p className="font-bold text-[10px] uppercase tracking-widest">No upcoming leave requests found.</p>
            </div>
          ) : (
            requests.map((request) => (
              <div key={request.id} className="p-5 flex items-start justify-between hover:bg-muted/10 transition-colors group">
                <div className="flex flex-col gap-1.5 min-w-0 flex-1 pr-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground truncate">{request.category}</span>
                    <StatusBadge 
                      status={request.status === "APPROVED" ? "success" : request.status === "PENDING" ? "warning" : "error"} 
                      label={request.status} 
                      size="sm" 
                      withDot={false} 
                      className="font-black text-[8px] px-1.5 py-0 h-4 uppercase tracking-tighter" 
                    />
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="size-3 opacity-60" />
                      <span className="text-[10px] font-medium truncate">
                        {new Date(request.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(request.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <div className="size-1 rounded-full bg-border/60" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">
                      {request.days} {request.days === 1 ? 'Day' : 'Days'}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 group-hover:translate-x-1 transition-transform opacity-30 group-hover:opacity-100">
                   <Plane className="size-4 text-primary" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </PageSection>
  );
}

