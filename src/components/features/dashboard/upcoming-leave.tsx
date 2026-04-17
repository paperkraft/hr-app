import { Plane, AlertCircle } from "lucide-react";
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
      description="Your scheduled time off"
      className="h-full animate-fade-in"
      noPadding
    >
      <div className="p-6 flex flex-col gap-6">
        {upcoming ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-foreground">{upcoming.category}</p>
                <p className="text-[11px] text-muted-foreground mt-1 font-medium">
                  {new Date(upcoming.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} to {new Date(upcoming.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <StatusBadge status="success" label="Approved" size="sm" withDot={false} className="font-black" />
            </div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-primary/5 text-primary border border-primary/10">
               <span className="text-[10px] font-black uppercase tracking-widest">
                 {upcoming.days} {upcoming.days === 1 ? 'day' : 'days'} total
               </span>
            </div>
          </div>
        ) : (
          <div className="py-6 flex flex-col items-center justify-center text-muted-foreground text-xs text-center border-2 border-dashed border-border/40 rounded-2xl bg-muted/5 opacity-60">
            <Plane className="size-5 mb-2 opacity-20" />
            <p className="font-bold">No upcoming approved leave.</p>
          </div>
        )}

        {pending && (
          <div className="p-4 rounded-xl bg-orange-500/[0.03] border border-orange-500/10 shadow-sm animate-pulse-soft">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-orange-500/10 shrink-0">
                <AlertCircle className="size-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-xs font-black text-orange-900 dark:text-orange-200 uppercase tracking-widest">Pending Approval</p>
                <p className="text-[10px] text-orange-700/80 dark:text-orange-300/60 mt-1 leading-relaxed font-medium">
                  {new Date(pending.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} request is awaiting manager review.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageSection>
  );
}

