"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableHeader,
  TableRow,
  TableHead,
  Input,
  TableCell,
} from "@/components/ui";
import { Calendar, Clock, MapPin, Search } from "lucide-react";
import { cn } from "@/lib/utils";

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
      const locationStr = log.isOutsideOffice ? "external" : "office";
      return dateStr.includes(term) || statusStr.includes(term) || locationStr.includes(term);
    });
  }, [logs, searchTerm]);

  return (
    <div className="animate-fade-in">
      {/* Table Controls */}
      <div className="px-5 py-3.5 flex items-center justify-between gap-4 border-b border-border/40 bg-muted/5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/30" />
          <Input
            placeholder="Search dates or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-8 border-border/60 focus:ring-primary/10 transition-all rounded-sm text-xs bg-white"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest px-2 py-0.5 rounded-sm border border-border/20">
            {filteredLogs.length} Records found
          </span>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center gap-2 opacity-20">
          <Search className="size-7" />
          <p className="text-[10px] font-black uppercase tracking-widest">No matching history</p>
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-hide">
          <Table>
            <TableHeader className="bg-muted/5">
              <TableRow className="border-b border-border/40 hover:bg-transparent">
                <TableHead className="py-3 px-5 font-black text-[10px] uppercase tracking-widest text-muted-foreground/40 w-[180px]">Date</TableHead>
                <TableHead className="py-3 px-4 font-black text-[10px] uppercase tracking-widest text-muted-foreground/40">Check In</TableHead>
                <TableHead className="py-3 px-4 font-black text-[10px] uppercase tracking-widest text-muted-foreground/40">Check Out</TableHead>
                <TableHead className="py-3 px-4 font-black text-[10px] uppercase tracking-widest text-muted-foreground/40">Location</TableHead>
                <TableHead className="py-3 px-5 font-black text-[10px] uppercase tracking-widest text-muted-foreground/40 text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/5 transition-colors border-b border-border/10 group last:border-0">
                  <TableCell className="py-3 px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-sm bg-primary/5 text-primary flex items-center justify-center border border-primary/5 group-hover:bg-primary/10 transition-colors">
                        <Calendar className="size-3.5" />
                      </div>
                      <span className="font-bold text-[11px] text-foreground/70">
                        {new Date(log.date).toLocaleDateString('en-GB', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center gap-1.5 tabular-nums">
                      <Clock className="size-3 text-muted-foreground/20" />
                      <span className="text-[11px] font-bold text-foreground/60">
                        {log.punchIn ? new Date(log.punchIn).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center gap-1.5 tabular-nums">
                      <Clock className="size-3 text-muted-foreground/20" />
                      <span className="text-[11px] font-bold text-foreground/60">
                        {log.punchOut ? new Date(log.punchOut).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center gap-1.5">
                      <MapPin className={cn("size-3", log.isOutsideOffice ? "text-rose-400" : "text-emerald-400")} />
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-tight",
                        log.isOutsideOffice ? "text-rose-500/70" : "text-emerald-600/70"
                      )}>
                        {log.isOutsideOffice ? "External Site" : "Main Office"}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-5 text-right">
                    <div className="flex justify-end items-center gap-1.5">
                      {log.isAutoPunchOut && (
                        <div className="px-1.5 py-0.5 rounded-sm bg-rose-500/10 text-rose-600 text-[8px] font-black uppercase border border-rose-500/10">Auto</div>
                      )}

                      <div className={cn(
                        "size-1.5 rounded-full",
                        log.isLate ? "bg-amber-500 animate-pulse" : "bg-emerald-500"
                      )} />
                      <span className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        log.isLate ? "text-amber-600" : "text-emerald-600"
                      )}>
                        {log.isLate ? "Late Entry" : "On Time"}
                      </span>
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
