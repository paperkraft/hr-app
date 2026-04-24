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
  Button,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

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

  const totalPages = Math.ceil(filteredLogs.length / pageSize);
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  return (
    <div className="animate-fade-in flex flex-col h-full">
      {/* Table Controls */}
      <div className="px-5 py-3.5 flex items-center justify-between gap-4 border-b border-border/40 bg-muted/5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/30" />
          <Input
            placeholder="Search dates or status..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 h-8 border-border/60 focus:ring-primary/20 transition-all rounded-sm text-xs bg-muted/20"
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
        <>
          <div className="overflow-x-auto scrollbar-hide flex-1">
            <Table>
              <TableHeader className="bg-muted/5">
                <TableRow className="border-b border-border/40 hover:bg-transparent">
                  <TableHead className="py-3 px-5 font-black text-[10px] uppercase tracking-widest text-muted-foreground/80 w-[180px]">Date</TableHead>
                  <TableHead className="py-3 px-4 font-black text-[10px] uppercase tracking-widest text-muted-foreground/80">Check In</TableHead>
                  <TableHead className="py-3 px-4 font-black text-[10px] uppercase tracking-widest text-muted-foreground/80">Check Out</TableHead>
                  <TableHead className="py-3 px-5 font-black text-[10px] uppercase tracking-widest text-muted-foreground/80 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedLogs.map((log) => (
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
                        <Clock className="size-3 text-muted-foreground" />
                        <span className="text-[11px] font-bold text-foreground/60">
                          {log.punchIn ? new Date(log.punchIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : "--:--"}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <div className="flex items-center gap-1.5 tabular-nums">
                        <Clock className="size-3 text-muted-foreground" />
                        <span className="text-[11px] font-bold text-foreground/60">
                          {log.punchOut ? new Date(log.punchOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : "--:--"}
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

          {/* Pagination Controls */}
          <div className="px-5 py-3 border-t border-border/40 bg-muted/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest whitespace-nowrap">
                  Show
                </span>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(val) => {
                    setPageSize(parseInt(val));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="h-7 w-[70px] text-[10px] font-bold border-border/60 bg-muted/20 rounded-sm">
                    <SelectValue placeholder={pageSize.toString()} />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 100].map((size) => (
                      <SelectItem key={size} value={size.toString()} className="text-[10px] font-bold">
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest border-l border-border/40 pl-4">
                Page {currentPage} of {totalPages || 1}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-[10px] font-black uppercase tracking-widest rounded-sm border-border/60 hover:bg-muted/10 transition-all disabled:opacity-30"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Prev
              </Button>
              <div className="flex items-center gap-1 px-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                  if (
                    totalPages > 5 &&
                    p !== 1 &&
                    p !== totalPages &&
                    Math.abs(p - currentPage) > 1
                  ) {
                    if (p === 2 || p === totalPages - 1) return <span key={p} className="text-muted-foreground/30 text-[10px]">...</span>;
                    return null;
                  }
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={cn(
                        "size-6 rounded-sm text-[10px] font-bold transition-all",
                        currentPage === p ? "bg-primary text-white" : "text-muted-foreground/40 hover:bg-muted/10"
                      )}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-3 text-[10px] font-black uppercase tracking-widest rounded-sm border-border/60 hover:bg-muted/10 transition-all disabled:opacity-30"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
