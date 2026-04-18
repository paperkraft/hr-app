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
      <div className="px-6 py-5 flex items-center justify-between gap-4 bg-muted/5 border-b border-border/40">
         <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
            <Input 
              placeholder="Search history..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-11 h-11 bg-background/40 border-border/40 focus:bg-background focus:ring-primary/20 transition-all rounded-xl text-sm"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full transition-colors"
              >
                <X className="size-3 text-muted-foreground" />
              </button>
            )}
         </div>
         <div className="hidden md:block">
            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] bg-muted/20 px-3 py-1.5 rounded-full border border-border/20">
              {filteredLogs.length} Records Found
            </span>
         </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="py-24 animate-fade-in text-center">
          <EmptyState
            title="No records found"
            description="We couldn't find any attendance logs matching your search."
            icon={Search}
          />
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-hide">
          <Table>
            <TableHeader className="bg-muted/5">
              <TableRow className="border-b border-border/40 hover:bg-transparent">
                <TableHead className="py-5 px-6 font-black text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70 w-[200px]">Work Date</TableHead>
                <TableHead className="py-5 px-6 font-black text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">Punch In</TableHead>
                <TableHead className="py-5 px-6 font-black text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">Punch Out</TableHead>
                <TableHead className="py-5 px-6 font-black text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">Location</TableHead>
                <TableHead className="py-5 px-6 font-black text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-primary/2 transition-colors border-b border-border/40 last:border-0 group">
                  <TableCell className="py-5 px-6">
                    <div className="flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary/10 transition-all duration-300 border border-primary/10">
                        <Calendar className="size-5" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-bold text-sm text-foreground">
                          {new Date(log.date).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-60">
                          {new Date(log.date).getFullYear()}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <div className="font-mono text-sm font-black text-foreground bg-muted/20 w-fit px-3 py-1.5 rounded-xl border border-border/40 shadow-sm group-hover:border-primary/20 transition-colors">
                      {log.punchIn ? new Date(log.punchIn).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : "---"}
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    <div className="font-mono text-sm font-black text-foreground bg-muted/20 w-fit px-3 py-1.5 rounded-xl border border-border/40 shadow-sm group-hover:border-primary/20 transition-colors">
                      {log.punchOut ? new Date(log.punchOut).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : "---"}
                    </div>
                  </TableCell>
                  <TableCell className="py-5 px-6">
                    {log.isOutsideOffice ? (
                      <div className="flex items-center gap-2 text-[9px] font-black text-rose-500 uppercase tracking-[0.15em] bg-rose-500/5 px-2.5 py-1.5 rounded-lg border border-rose-500/10 w-fit shadow-sm">
                        <MapPin className="size-3" /> External
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500 uppercase tracking-[0.15em] bg-emerald-500/5 px-2.5 py-1.5 rounded-lg border border-emerald-500/10 w-fit shadow-sm">
                        <MapPin className="size-3" /> Office
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="py-5 px-6 text-right">
                    <div className="flex justify-end items-center gap-2.5">
                      {log.isAutoPunchOut && (
                        <StatusBadge status="error" label="Auto" size="sm" withDot={false} animated className="font-black px-2.5 text-[9px] h-6" />
                      )}
                      {log.isLate ? (
                        <StatusBadge status="warning" label="Late" size="sm" withDot={true} className="font-black px-3.5 text-[9px] h-6 shadow-sm border border-amber-500/10" />
                      ) : (
                        <StatusBadge status="success" label="On Time" size="sm" withDot={true} className="font-black px-3.5 text-[9px] h-6 shadow-sm border border-emerald-500/10" />
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
