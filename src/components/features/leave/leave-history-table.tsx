"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
  Input,
  TableCell,
} from "@/components/ui";
import { CalendarRange, MessageSquare, Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface LeaveRequest {
  id: string;
  startDate: Date | string;
  endDate: Date | string;
  leaveType: string | null;
  duration: string;
  halfDayType: string | null;
  category: string;
  status: string;
  reason: string | null;
  startTime: string | null;
  endTime: string | null;
}

interface LeaveHistoryTableProps {
  leaves: LeaveRequest[];
}

export function LeaveHistoryTable({ leaves }: LeaveHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const formatTime = (timeStr?: string | null) => {
    if (!timeStr) return "--:--";

    // If it already seems to be formatted (contains AM or PM), return as is
    if (timeStr.toUpperCase().includes("AM") || timeStr.toUpperCase().includes("PM")) {
      return timeStr;
    }

    try {
      // Expecting HH:mm format
      const parts = timeStr.split(':');
      if (parts.length < 2) return timeStr;

      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);

      if (isNaN(hours) || isNaN(minutes)) return timeStr;

      // Create a dummy date and set hours/minutes to get localized AM/PM
      const date = new Date();
      date.setHours(hours, minutes, 0, 0);

      return date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (e) {
      return timeStr;
    }
  };

  const filteredLeaves = useMemo(() => {
    if (!searchTerm) return leaves;
    const term = searchTerm.toLowerCase();
    return leaves.filter(leave => {
      const typeStr = (leave.leaveType === "CASUAL" ? "casual" : leave.leaveType === "MEDICAL" ? "sick" : "leave").toLowerCase();
      const statusStr = leave.status.toLowerCase();
      const reasonStr = (leave.reason || "").toLowerCase();
      return typeStr.includes(term) || statusStr.includes(term) || reasonStr.includes(term);
    });
  }, [leaves, searchTerm]);

  return (
    <div className="animate-fade-in">
      {/* Table Controls - Consistent with Attendance */}
      <div className="px-5 py-3.5 flex items-center justify-between gap-4 border-b border-border/40 bg-muted/5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/30" />
          <Input
            placeholder="Search leaves or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-8 border-border/60 focus:ring-primary/20 transition-all rounded-sm text-xs bg-muted/20"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest px-2 py-0.5 rounded-sm border border-border/20">
            {filteredLeaves.length} Requests found
          </span>
        </div>
      </div>

      {filteredLeaves.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center gap-2 opacity-20">
          <Search className="size-7" />
          <p className="text-[10px] font-black uppercase tracking-widest">No matching history</p>
        </div>
      ) : (
        <>
          {/* Scrollable Table View - Unified for all screen sizes */}
          <div className="overflow-x-auto scrollbar-hide border-t border-border/10">
            <Table>
              <TableHeader className="bg-muted/5">
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead className="py-3 px-5 font-black text-[10px] uppercase tracking-widest text-muted-foreground/80 w-[200px] whitespace-nowrap md:sticky md:left-0 md:bg-card md:z-20 md:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Timeline</TableHead>
                  <TableHead className="py-3 px-4 font-black text-[10px] uppercase tracking-widest text-muted-foreground/80 text-center whitespace-nowrap">Duration</TableHead>
                  <TableHead className="py-3 px-4 font-black text-[10px] uppercase tracking-widest text-muted-foreground/80 whitespace-nowrap">Type</TableHead>
                  <TableHead className="py-3 px-4 font-black text-[10px] uppercase tracking-widest text-muted-foreground/80 whitespace-nowrap">Reason</TableHead>
                  <TableHead className="py-3 px-5 font-black text-[10px] uppercase tracking-widest text-muted-foreground/80 text-right whitespace-nowrap">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeaves.map((leave) => {
                  const start = new Date(leave.startDate);
                  const end = new Date(leave.endDate);
                  const days = (() => {
                    let count = 0;
                    let cur = new Date(start);
                    while (cur <= end) {
                      if (cur.getDay() !== 0) count++;
                      cur.setDate(cur.getDate() + 1);
                    }
                    return count;
                  })();

                  return (
                    <TableRow key={leave.id} className="hover:bg-muted/5 transition-colors border-b border-border/10 group last:border-0">
                      <TableCell className="py-3 px-5 md:sticky md:left-0 md:bg-card md:group-hover:bg-muted/5 md:z-10 md:shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)] transition-colors">
                        <div className="flex items-center gap-2.5 min-w-[150px]">
                          <div className="size-7 rounded-sm bg-primary/5 text-primary flex items-center justify-center border border-primary/5 group-hover:bg-primary/10 transition-colors">
                            <CalendarRange className="size-3.5" />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-foreground leading-none">
                              {start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                            {start.getTime() !== end.getTime() && (
                              <p className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-tight mt-0.5">
                                — {end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 px-4 text-center">
                        <div className="inline-flex flex-col items-center min-w-[80px]">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm border mb-0.5",
                            leave.duration === "FULL" ? "bg-muted/20 text-muted-foreground/80 border-border/20" :
                              leave.duration === "HALF" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/10" :
                                "bg-primary/10 text-primary border-primary/10"
                          )}>
                            {leave.duration === "FULL" ? "Full day" : leave.duration === "HALF" ? "Half day" : "Short"}
                          </span>
                          {leave.duration === "HALF" && leave.halfDayType && (
                            <span className={cn(
                              "text-[8px] font-bold uppercase tracking-tight mb-1",
                              leave.halfDayType === "FIRST_HALF" ? "text-emerald-500" : "text-amber-500"
                            )}>
                              {leave.halfDayType === "FIRST_HALF" ? "1st Half" : "2nd Half"}
                            </span>
                          )}
                          <span className="text-[9px] font-bold text-muted-foreground/40 tabular-nums">
                            {leave.duration === "SHORT" ? (
                              `${formatTime(leave.startTime)} - ${formatTime(leave.endTime)}`
                            ) : (
                              `${days} ${days === 1 ? 'day' : 'days'}`
                            )}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 px-4">
                        <div className="flex flex-col min-w-[100px]">
                          <span className="text-[11px] font-bold text-foreground/70 uppercase tracking-tight">
                            {leave.leaveType === "CASUAL" ? "Casual Leave" : leave.leaveType === "MEDICAL" ? "Sick Leave" : "Other Leave"}
                          </span>
                          <span className="text-[9px] text-muted-foreground/60 font-bold uppercase tracking-widest mt-0.5">
                            {leave.category === "MONTHLY_POLICY_1" ? "Monthly" : leave.category === "UNPAID" ? "Unpaid" : "Policy"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 px-4">
                        <div className="flex items-start gap-1.5 group/reason min-w-[150px]">
                          <MessageSquare className="size-3 text-muted-foreground/40 mt-0.5" />
                          <p className="text-[10px] font-medium text-muted-foreground/80 leading-snug line-clamp-2 italic" title={leave.reason || ""}>
                            {leave.reason || "No reason specified"}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5 min-w-[80px]">
                          <div className={cn(
                            "size-1.5 rounded-full",
                            leave.status === "APPROVED" && "bg-emerald-500",
                            leave.status === "REJECTED" && "bg-rose-500",
                            leave.status === "PENDING" && "bg-amber-500 animate-pulse"
                          )} />
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest",
                            leave.status === "APPROVED" && "text-emerald-600",
                            leave.status === "REJECTED" && "text-rose-600",
                            leave.status === "PENDING" && "text-amber-600"
                          )}>
                            {leave.status}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </div>
  );
}
