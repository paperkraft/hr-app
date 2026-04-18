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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings2, MapPinOff, Search, X } from "lucide-react";
import { SplitActionRow } from "./split-action-row";
import { StatusBadge } from "@/components/ui";

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
    <div className="space-y-4">
      {/* Search Bar & Controls */}
      <div className="px-6 py-5 flex items-center justify-between gap-4 bg-muted/5 border-b border-border/40">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
          <Input
            placeholder="Search staff members..."
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
        <div className="hidden lg:flex items-center gap-3">
          <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] bg-muted/20 px-4 py-2 rounded-full border border-border/20 shadow-sm">
            {filteredData.length} Staff Records
          </span>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <Table className="border-collapse min-w-[1200px]">
          <TableHeader>
            {/* Header Tier 1: Categories */}
            <TableRow className="bg-muted/10 hover:bg-muted/10 border-b border-border/60">
              <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/70 border-r border-border/40">Individual</TableHead>
              <TableHead colSpan={3} className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/70 text-center border-r border-border/40 bg-blue-500/10">Attendance Activity</TableHead>
              <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/70 text-center border-r border-border/40 bg-amber-500/10">Usage</TableHead>
              <TableHead colSpan={2} className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/70 text-center border-r border-border/40 bg-emerald-500/10">Policy 1 (Monthly)</TableHead>
              <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/70 text-center border-r border-border/40 bg-indigo-500/10">Policy 2</TableHead>
              <TableHead colSpan={2} className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/70 text-center border-r border-border/40 bg-rose-500/10">Payroll impact</TableHead>
              <TableHead className="py-4 px-6 text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground/70 text-right">Adjust</TableHead>
            </TableRow>

            {/* Header Tier 2: Specific Fields */}
            <TableRow className="bg-muted/5 border-b border-border/40">
              <TableHead className="py-3 px-4 font-bold text-foreground border-r border-border/30">Staff Name</TableHead>

              <TableHead className="py-3 px-4 font-bold text-foreground text-center bg-blue-500/2">Present</TableHead>
              <TableHead className="py-3 px-4 font-bold text-foreground text-center bg-blue-500/2">Lates</TableHead>
              <TableHead className="py-3 px-4 font-bold text-primary text-center border-r border-border/30 bg-blue-500/2">Allowance</TableHead>

              <TableHead className="py-3 px-4 font-bold text-foreground text-center border-r border-border/30 bg-amber-500/2">Taken</TableHead>

              <TableHead className="py-3 px-4 font-bold text-foreground text-center bg-emerald-500/2">Full</TableHead>
              <TableHead className="py-3 px-4 font-bold text-foreground text-center border-r border-border/30 bg-emerald-500/2">Short</TableHead>

              <TableHead className="py-3 px-4 font-bold text-foreground text-center border-r border-border/30 bg-indigo-500/2">Semi-Ann.</TableHead>

              <TableHead className="py-3 px-4 font-bold text-rose-600 text-center bg-rose-500/2">Unpaid</TableHead>
              <TableHead className="py-3 px-4 font-bold text-emerald-600 text-center border-r border-border/30 bg-rose-500/2">Encash</TableHead>

              <TableHead className="py-3 px-4"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 opacity-30">
                    <Search className="size-12 mb-2 text-muted-foreground" />
                    <p className="text-sm font-black uppercase tracking-[0.2em]">No Matches Found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow className="hover:bg-primary/2 transition-colors border-b border-border/40 last:border-0 group">
                    <TableCell className="py-2.5 px-4 border-r border-border/30">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-black text-[10px] shadow-sm group-hover:bg-primary group-hover:text-white transition-all duration-300">
                          {row.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-xs text-foreground truncate max-w-[120px]" title={row.name}>{row.name}</span>
                          <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest opacity-60 leading-tight">{row.role}</span>
                        </div>
                        {row.offSiteCount > 0 && (
                          <Link href={`/dashboard/accountant/location-logs?m=${month}&y=${year}`} title={`${row.offSiteCount} Out-of-Office Punches`}>
                            <StatusBadge status="error" label={row.offSiteCount.toString()} size="sm" withDot={false} className="h-4 px-1 font-black hover:bg-rose-600 shadow-sm cursor-pointer" />
                          </Link>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="py-2.5 px-4 text-center font-black text-xs text-foreground bg-blue-500/2">
                      {row.totalPresent}
                    </TableCell>
                    <TableCell className="py-2.5 px-4 text-center bg-blue-500/2">
                      {row.punishableLate > 0 ? (
                        <StatusBadge status="warning" label={row.punishableLate.toString()} size="sm" withDot={false} className="font-black px-2 h-5 text-[10px] shadow-sm shadow-amber-500/10" />
                      ) : (
                        <span className="text-muted-foreground/30 text-[9px] font-black italic">---</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2.5 px-4 text-center font-black text-primary border-r border-border/30 bg-blue-500/2 text-[10px]">
                      {row.allowanceDays > 0 ? `${row.allowanceDays}d` : "---"}
                    </TableCell>

                    <TableCell className="py-2.5 px-4 text-center font-black text-xs text-foreground border-r border-border/30 bg-amber-500/2">
                      {row.leavesTaken}
                    </TableCell>

                    <TableCell className="py-2.5 px-4 text-center font-mono font-black text-xs text-emerald-600 bg-emerald-500/2">
                      {row.balances.full}
                    </TableCell>
                    <TableCell className="py-2.5 px-4 text-center font-mono font-black text-xs text-muted-foreground/70 border-r border-border/30 bg-emerald-500/2">
                      {row.balances.short}
                    </TableCell>

                    <TableCell className="py-2.5 px-4 text-center font-mono font-black text-xs text-indigo-600 border-r border-border/30 bg-indigo-500/2">
                      {row.balances.semiAnnual}
                    </TableCell>

                    <TableCell className="py-2.5 px-4 text-center font-black text-xs text-rose-500 bg-rose-500/2">
                      {row.lwpDays > 0 ? row.lwpDays : "0"}
                    </TableCell>
                    <TableCell className="py-2.5 px-4 text-center font-mono font-black text-xs text-emerald-600 border-r border-border/30 bg-rose-500/2">
                      {row.encashableDays > 0 ? `+${row.encashableDays}` : "0"}
                    </TableCell>

                    <TableCell className="py-2.5 px-4 text-right">
                      <Button
                        variant={activeSplitId === row.id ? "default" : "outline"}
                        size="sm"
                        className="h-7 px-3 text-[9px] font-black uppercase tracking-widest shadow-sm rounded-lg transition-all active:scale-95"
                        onClick={() => setActiveSplitId(activeSplitId === row.id ? null : row.id)}
                      >
                        {activeSplitId === row.id ? "Cancel" : "Refine"}
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
                        setTimeout(() => setActiveSplitId(null), 2000);
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
