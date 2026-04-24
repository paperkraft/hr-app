"use client";

import { Table, TableBody, TableHeader, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Clock, Check, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTransition } from "react";
import { updateLeaveStatus } from "@/actions/leave";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface PendingRequest {
  id: string;
  employeeName: string;
  role: string;
  startDate: string;
  endDate: string;
  duration: string;
  halfDayType?: string | null;
  category: string;
  reason: string;
}

interface PendingRequestsTableProps {
  data: PendingRequest[];
}

export function PendingRequestsTable({ data }: PendingRequestsTableProps) {
  const [isPending, startTransition] = useTransition();

  const handleAction = (id: string, status: "APPROVED" | "REJECTED") => {
    startTransition(async () => {
      const result = await updateLeaveStatus(id, status);
      if (result.success) {
        toast.success(`Request ${status.toLowerCase()}`);
      } else {
        toast.error("Action failed", { description: result.error });
      }
    });
  };

  return (
    <div className="bg-card border border-border rounded-sm overflow-hidden h-full">
      <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between bg-muted/5">
        <div>
          <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1">Awaiting Decisions</h3>
          <p className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-widest">Pending leave applications</p>
        </div>
        <Clock className="size-4 text-amber-500/80" />
      </div>
      <div className="overflow-x-auto scrollbar-hide">
        <Table>
          <TableHeader className="bg-muted/5 border-b border-border/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="py-3 px-5 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Employee</TableHead>
              <TableHead className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Period</TableHead>
              <TableHead className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Reason</TableHead>
              <TableHead className="py-3 px-5 text-right text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/20">
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center text-[10px] text-muted-foreground/30 font-black uppercase tracking-widest">
                  No pending requests
                </TableCell>
              </TableRow>
            ) : (
              data.map((req) => (
                <TableRow key={req.id} className="hover:bg-muted/5 transition-colors group">
                  <TableCell className="py-3 px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-sm bg-muted text-foreground/40 flex items-center justify-center font-bold text-[9px] border border-border/40">
                        {req.employeeName.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-[11px] font-bold text-foreground leading-none">{req.employeeName}</div>
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
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <p className="text-[10px] text-muted-foreground/60 font-medium truncate max-w-[150px]" title={req.reason}>
                      {req.reason}
                    </p>
                  </TableCell>
                  <TableCell className="py-3 px-5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 border border-transparent hover:border-emerald-100"
                        onClick={() => handleAction(req.id, "APPROVED")}
                        disabled={isPending}
                      >
                        <Check className="size-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-rose-600 hover:bg-rose-50 hover:text-rose-700 border border-transparent hover:border-rose-100"
                        onClick={() => handleAction(req.id, "REJECTED")}
                        disabled={isPending}
                      >
                        <X className="size-3.5" />
                      </Button>
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
