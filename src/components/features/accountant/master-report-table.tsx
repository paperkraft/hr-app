'use client';

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Table,
  TableHeader,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Filter } from "lucide-react";
import { SplitActionRow } from "./split-action-row";
import { cn } from "@/lib/utils";

type ReportData = {
  id: string;
  name: string;
  role: string;
  totalPresent: number;
  leavesTaken: number;
  totalLate: number;
  specialCaseLate: number;
  punishableLate: number;
  lwpDays: number;
  encashableDays: number;
  allowanceDays: number;
  balances: {
    full: number;
    short: number;
    semiAnnual: number;
  };
  offSiteCount: number;
};

export function MasterReportTable({
  data,
  month,
  year
}: {
  data: ReportData[];
  month: number;
  year: number;
}) {
  const [activeSplitId, setActiveSplitId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    const term = searchTerm.toLowerCase();
    return data.filter(row =>
      row.name.toLowerCase().includes(term) ||
      row.role.toLowerCase().includes(term)
    );
  }, [data, searchTerm]);

  return (
    <div className="animate-fade-in">
      {/* Search & Statistics Bar */}
      <div className="px-5 py-3.5 flex items-center justify-between gap-4 bg-muted/5 border-b border-border/40">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/30" />
          <Input
            placeholder="Search staff members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-8 border-border/60 focus:ring-primary/10 transition-all rounded-sm text-xs bg-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 hover:bg-muted rounded-sm transition-colors"
            >
              <X className="size-3 text-muted-foreground/40" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest px-2 py-0.5 rounded-sm border border-border/20">
            {filteredData.length} Staff members
          </span>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <Table className="border-collapse min-w-[1200px]">
          <TableHeader>
            {/* Header Tier 1: Grouping */}
            <TableRow className="bg-muted/5 hover:bg-muted/5 border-b border-border/40">
              <TableHead className="py-2.5 px-5 font-black text-[9px] uppercase tracking-widest text-muted-foreground/40 border-r border-border/20">Staff Identity</TableHead>
              <TableHead colSpan={3} className="py-2.5 px-4 font-black text-[9px] uppercase tracking-widest text-muted-foreground/40 text-center border-r border-border/20 bg-primary/2">Attendance Summary</TableHead>
              <TableHead className="py-2.5 px-4 font-black text-[9px] uppercase tracking-widest text-muted-foreground/40 text-center border-r border-border/20 bg-amber-500/2">Usage</TableHead>
              <TableHead colSpan={3} className="py-2.5 px-4 font-black text-[9px] uppercase tracking-widest text-muted-foreground/40 text-center border-r border-border/20 bg-emerald-500/2">Balance Frameworks</TableHead>
              <TableHead colSpan={2} className="py-2.5 px-4 font-black text-[9px] uppercase tracking-widest text-muted-foreground/40 text-center border-r border-border/20 bg-rose-500/2">Payroll Deductions</TableHead>
              <TableHead className="py-2.5 px-5 font-black text-[9px] uppercase tracking-widest text-muted-foreground/40 text-right">Adjustment</TableHead>
            </TableRow>

            {/* Header Tier 2: Column Titles */}
            <TableRow className="bg-white border-b border-border/40">
              <TableHead className="py-3 px-5 text-[10px] font-bold text-foreground border-r border-border/10">Full Name</TableHead>
              <TableHead className="py-3 px-4 text-[10px] font-bold text-foreground text-center bg-primary/1">Present</TableHead>
              <TableHead className="py-3 px-4 text-[10px] font-bold text-foreground text-center bg-primary/1">Late Mark</TableHead>
              <TableHead className="py-3 px-4 text-[10px] font-bold text-primary text-center border-r border-border/10 bg-primary/1">Allowance</TableHead>
              <TableHead className="py-3 px-4 text-[10px] font-bold text-foreground text-center border-r border-border/10 bg-amber-500/1">Taken</TableHead>
              <TableHead className="py-3 px-4 text-[10px] font-bold text-emerald-600 text-center bg-emerald-500/1">Monthly</TableHead>
              <TableHead className="py-3 px-4 text-[10px] font-bold text-emerald-600/70 text-center bg-emerald-500/1">Short</TableHead>
              <TableHead className="py-3 px-4 text-[10px] font-bold text-emerald-600/70 text-center border-r border-border/10 bg-emerald-500/1">Semi-Ann.</TableHead>
              <TableHead className="py-3 px-4 text-[10px] font-bold text-rose-500 text-center bg-rose-500/1">LWP Days</TableHead>
              <TableHead className="py-3 px-4 text-[10px] font-bold text-emerald-600 text-center border-r border-border/10 bg-rose-500/1">Encash</TableHead>
              <TableHead className="py-3 px-5 text-right bg-muted/5">---</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="py-20 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-20">
                    <Search className="size-8" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No matches found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow className="hover:bg-muted/5 transition-colors border-b border-border/10 last:border-0 group">
                    <TableCell className="py-3 px-5 border-r border-border/10">
                      <div className="flex items-center gap-3">
                        <div className="size-7 rounded-sm bg-muted/50 text-muted-foreground/40 flex items-center justify-center font-bold text-[9px] border border-border/40 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                          {row.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-bold text-[11px] text-foreground truncate max-w-[140px] leading-tight" title={row.name}>{row.name}</span>
                          <span className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-tight mt-0.5">{row.role}</span>
                        </div>
                        {row.offSiteCount > 0 && (
                          <div className={cn(
                            "px-1.5 py-0.5 rounded-sm text-[8px] font-black uppercase tracking-tighter shrink-0",
                            "bg-rose-500/10 text-rose-600 border border-rose-500/10"
                          )} title={`${row.offSiteCount} Out-of-Office Punches`}>
                            {row.offSiteCount}
                          </div>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="py-3 px-4 text-center font-bold text-[11px] text-foreground tabular-nums bg-primary/1">
                      {row.totalPresent}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center bg-primary/1">
                      {row.punishableLate > 0 ? (
                        <div className="inline-flex h-5 px-1.5 items-center justify-center rounded-sm bg-amber-500/10 text-amber-600 text-[10px] font-bold border border-amber-500/10 min-w-[20px]">
                          {row.punishableLate}
                        </div>
                      ) : (
                        <span className="text-muted-foreground/20 text-[10px] font-bold">--</span>
                      )}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center font-bold text-primary border-r border-border/10 bg-primary/1 text-[10px] tabular-nums">
                      {row.allowanceDays > 0 ? `${row.allowanceDays}d` : "---"}
                    </TableCell>

                    <TableCell className="py-3 px-4 text-center font-bold text-[11px] text-foreground border-r border-border/10 bg-amber-500/1 tabular-nums">
                      {row.leavesTaken}
                    </TableCell>

                    <TableCell className="py-3 px-4 text-center font-bold text-[11px] text-emerald-600 bg-emerald-500/1 tabular-nums">
                      {row.balances.full}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center font-bold text-[11px] text-emerald-600/50 bg-emerald-500/1 tabular-nums">
                      {row.balances.short}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center font-bold text-[11px] text-emerald-600/50 border-r border-border/10 bg-emerald-500/1 tabular-nums">
                      {row.balances.semiAnnual}
                    </TableCell>

                    <TableCell className="py-3 px-4 text-center font-bold text-[11px] text-rose-500 bg-rose-500/1 tabular-nums">
                      {row.lwpDays > 0 ? row.lwpDays : "0"}
                    </TableCell>
                    <TableCell className="py-3 px-4 text-center font-bold text-[11px] text-emerald-600 border-r border-border/10 bg-rose-500/1 tabular-nums">
                      {row.encashableDays > 0 ? `+${row.encashableDays}` : "0"}
                    </TableCell>

                    <TableCell className="py-3 px-5 text-right bg-muted/2">
                      <Button
                        variant={activeSplitId === row.id ? "secondary" : "ghost"}
                        className="h-7 px-2.5 text-[9px] font-black uppercase tracking-widest rounded-sm transition-all border border-transparent hover:border-border/60"
                        onClick={() => setActiveSplitId(activeSplitId === row.id ? null : row.id)}
                      >
                        {activeSplitId === row.id ? "Close" : "Refine"}
                      </Button>
                    </TableCell>
                  </TableRow>

                  {activeSplitId === row.id && (
                    <SplitActionRow
                      employee={{
                        userId: row.id,
                        name: row.name,
                        remainingBalance: row.balances.full
                      }}
                      month={month}
                      year={year}
                      onSuccess={() => {
                        setTimeout(() => setActiveSplitId(null), 1500);
                      }}
                    />
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
