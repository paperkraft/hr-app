"use client";

import { Table, TableBody, TableHeader, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Check, TrendingUp, CheckCircle2 } from "lucide-react";
import { CancelLeaveButton } from "@/components/features/leave/cancel-leave-button";
import { cn } from "@/lib/utils";

interface ApprovalRecord {
  id: string;
  employeeName: string;
  role: string;
  startDate: string;
  endDate: string;
  category: string;
  duration: string;
  halfDayType?: string | null;
  leaveType?: string;
  systemNote?: string;
  updatedAt: string | Date;
}

interface RecentApprovalsTableProps {
  data: ApprovalRecord[];
  title?: string;
  subtitle?: string;
}

export function RecentApprovalsTable({ data, title = "Recent Approvals", subtitle = "Recent valid departures" }: RecentApprovalsTableProps) {
  return (
    <div className="bg-card border border-border rounded-sm overflow-hidden h-full">
      <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between bg-muted/5">
        <div>
          <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1">{title}</h3>
          <p className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-widest">{subtitle}</p>
        </div>
        <CheckCircle2 className="size-4 text-muted-foreground/80" />
      </div>
      <div className="overflow-x-auto scrollbar-hide">
        <Table>
          <TableHeader className="bg-muted/5 border-b border-border/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="py-3 px-5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/80 md:sticky md:left-0 md:bg-card md:z-20 md:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Employee</TableHead>
              <TableHead className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Period</TableHead>
              <TableHead className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Branch</TableHead>
              <TableHead className="py-3 px-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Date</TableHead>
              <TableHead className="py-3 px-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/20">
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-[10px] text-muted-foreground/30 font-black uppercase tracking-widest">
                  No approved records found
                </TableCell>
              </TableRow>
            ) : (
              data.map((req) => (
                <TableRow key={req.id} className="hover:bg-muted/5 transition-colors group">
                  <TableCell className="py-3 px-5 md:sticky md:left-0 md:bg-card md:group-hover:bg-muted/5 md:z-10 md:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-sm bg-muted text-foreground/40 flex items-center justify-center font-bold text-[9px] border border-border/40 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                        {req.employeeName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-foreground group-hover:text-primary transition-colors leading-none">{req.employeeName}</div>
                        <div className="text-[9px] text-muted-foreground/50 font-bold uppercase mt-0.5">{req.role}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-foreground/70 leading-none">
                        {req.startDate === req.endDate ? req.startDate : `${req.startDate} — ${req.endDate}`}
                      </span>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] text-muted-foreground/40 font-black uppercase">
                          {req.duration} SESSION
                        </span>
                        {req.duration === "HALF" && req.halfDayType && (
                          <span className={cn(
                            "text-[8px] font-bold uppercase tracking-tight px-1 rounded-[2px] border",
                            req.halfDayType === "FIRST_HALF" ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/10" : "bg-amber-500/5 text-amber-600 border-amber-500/10"
                          )}>
                            {req.halfDayType === "FIRST_HALF" ? "1st Half" : "2nd Half"}
                          </span>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[10px] font-black text-foreground/60 uppercase tracking-tight">
                        {req.category.replace(/_/g, ' ')}
                      </span>
                      <span className="text-[8px] text-muted-foreground/40 font-black uppercase">{req.leaveType || 'General'}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-5 text-right">
                    <span className="text-[10px] font-bold text-muted-foreground/40 tabular-nums">
                      {new Date(req.updatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                  </TableCell>
                  <TableCell className="py-3 px-5 text-right">
                    <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                      <CancelLeaveButton requestId={req.id} employeeName={req.employeeName} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
