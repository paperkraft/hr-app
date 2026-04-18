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
    <div className="bg-white border border-border/60 rounded-sm shadow-sm overflow-hidden animate-fade-in">
      {/* Table Controls */}
      <div className="px-5 py-4 flex items-center justify-between gap-4 border-b border-border/40">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/30" />
          <Input
            placeholder="Search session log..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 border-border/60 focus:ring-primary/10 transition-all rounded-sm text-xs bg-muted/5 focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest px-2 py-1 rounded-sm border border-border/40">
            {filteredLogs.length} Records
          </span>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="py-20 text-center flex flex-col items-center gap-2 opacity-20">
          <Search className="size-8" />
          <p className="text-[10px] font-black uppercase tracking-widest">No matching history</p>
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-hide">
          <Table>
            <TableHeader className="bg-muted/5">
              <TableRow className="border-b border-border/60 hover:bg-transparent">
                <TableHead className="py-4 px-6 font-black text-[10px] uppercase tracking-[0.1em] text-muted-foreground/40 w-[180px]">Date Identity</TableHead>
                <TableHead className="py-4 px-4 font-black text-[10px] uppercase tracking-[0.1em] text-muted-foreground/40">Check In</TableHead>
                <TableHead className="py-4 px-4 font-black text-[10px] uppercase tracking-[0.1em] text-muted-foreground/40">Check Out</TableHead>
                <TableHead className="py-4 px-4 font-black text-[10px] uppercase tracking-[0.1em] text-muted-foreground/40">Location Hub</TableHead>
                <TableHead className="py-4 px-6 font-black text-[10px] uppercase tracking-[0.1em] text-muted-foreground/40 text-right">Protocol Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-muted/5 transition-colors border-b border-border/20 last:border-0 group">
                  <td className="py-3 px-6">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-sm bg-muted/20 text-muted-foreground/40 flex items-center justify-center border border-border/40 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                        <Calendar className="size-3.5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-[11px] text-foreground/70">
                          {new Date(log.date).toLocaleDateString('en-GB', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          })}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 min-w-[70px]">
                      <Clock className="size-3 text-muted-foreground/20" />
                      <span className="text-[11px] font-bold text-foreground/60 tabular-nums">
                        {log.punchIn ? new Date(log.punchIn).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : "---"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-1.5 min-w-[70px]">
                      <Clock className="size-3 text-muted-foreground/20" />
                      <span className="text-[11px] font-bold text-foreground/60 tabular-nums">
                        {log.punchOut ? new Date(log.punchOut).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : "---"}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {log.isOutsideOffice ? (
                      <span className="text-[9px] font-black text-rose-500/60 uppercase tracking-widest flex items-center gap-1.5">
                        <MapPin className="size-2.5" /> External
                      </span>
                    ) : (
                      <span className="text-[9px] font-black text-emerald-500/60 uppercase tracking-widest flex items-center gap-1.5">
                        <MapPin className="size-2.5" /> Site Office
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-6 text-right">
                    <div className="flex justify-end items-center gap-2">
                      {log.isAutoPunchOut && (
                        <div className="px-1.5 py-0.5 rounded-sm bg-rose-500/10 text-rose-600 text-[8px] font-bold uppercase border border-rose-500/10">Auto</div>
                      )}
                      {log.isLate ? (
                        <div className="px-1.5 py-0.5 rounded-sm bg-amber-500/10 text-amber-600 text-[8px] font-bold uppercase border border-amber-500/10">Delayed</div>
                      ) : (
                        <div className="px-1.5 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-600 text-[8px] font-bold uppercase border border-emerald-500/10">Session Match</div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
