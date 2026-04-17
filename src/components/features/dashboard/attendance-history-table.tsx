"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
  TableCell,
  StatusBadge,
  Input,
  EmptyState
} from "@/components/ui";
import { Calendar, Clock, MapPin, Search, X } from "lucide-react";

interface AttendanceLog {
  id: string;
  date: Date;
  punchIn: Date | null;
  punchOut: Date | null;
  isLate: boolean;
  isAutoPunchOut: boolean;
  isOutsideOffice: boolean;
}

interface AttendanceHistoryTableProps {
  logs: AttendanceLog[];
}

export function AttendanceHistoryTable({ logs }: AttendanceHistoryTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredLogs = useMemo(() => {
    if (!searchTerm) return logs;
    const term = searchTerm.toLowerCase();
    return logs.filter(log => {
      const dateStr = new Date(log.date).toLocaleDateString().toLowerCase();
      const statusStr = log.isLate ? "late" : "on time";
      const locationStr = log.isOutsideOffice ? "site visit" : "office";
      return dateStr.includes(term) || statusStr.includes(term) || locationStr.includes(term);
    });
  }, [logs, searchTerm]);

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="px-6 py-4 border-b border-border/40 bg-muted/5 flex items-center justify-between gap-4">
         <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/50" />
            <Input 
              placeholder="Search by date or status..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 bg-background/50 border-border/40 focus:bg-background transition-all"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="size-3 text-muted-foreground" />
              </button>
            )}
         </div>
         <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
           Showing {filteredLogs.length} of {logs.length} Records
         </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="py-20">
          <EmptyState
            title="No matches found"
            description="Try adjusting your search or filters to find what you're looking for."
            icon={Search}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/10">
              <TableRow className="border-b border-border/40 hover:bg-transparent">
                <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground w-[180px]">Date</TableHead>
                <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Punch In</TableHead>
                <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Punch Out</TableHead>
                <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Location</TableHead>
                <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/5 transition-colors border-b border-border/40 last:border-0 group">
                  <TableCell className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
                        <Calendar className="size-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm text-foreground">
                          {new Date(log.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tighter">
                          {new Date(log.date).getFullYear()}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="font-mono text-sm font-black text-foreground bg-muted/20 w-fit px-2.5 py-1 rounded-lg border border-border/20">
                      {log.punchIn ? new Date(log.punchIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : "---"}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <div className="font-mono text-sm font-black text-foreground bg-muted/20 w-fit px-2.5 py-1 rounded-lg border border-border/20">
                      {log.punchOut ? new Date(log.punchOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : "---"}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    {log.isOutsideOffice ? (
                      <div className="flex items-center gap-2 text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-500/5 px-2 py-1 rounded-md border border-rose-500/10 w-fit">
                        <MapPin className="size-3" /> Site Visit
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/5 px-2 py-1 rounded-md border border-emerald-500/10 w-fit">
                        <MapPin className="size-3" /> Office
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2">
                      {log.isAutoPunchOut && (
                        <StatusBadge status="error" label="Auto" size="sm" withDot={false} animated className="font-black px-2 text-[9px]" />
                      )}
                      {log.isLate ? (
                        <StatusBadge status="warning" label="Late" size="sm" withDot={true} className="font-black px-3 text-[9px]" />
                      ) : (
                        <StatusBadge status="success" label="On Time" size="sm" withDot={true} className="font-black px-3 text-[9px]" />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
