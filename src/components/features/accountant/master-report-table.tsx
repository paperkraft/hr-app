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
      {/* Search Bar */}
      <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-xl border border-border/40">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            placeholder="Search staff..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 bg-background/50 border-border/40 focus:bg-background"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-muted rounded-full"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>
        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 py-1 bg-background/50 rounded-full border border-border/40">
          {filteredData.length} Records
        </div>
      </div>

      <div className="relative w-full overflow-auto border rounded-xl shadow-sm bg-card/30">
        <Table className="border-collapse">
          <TableHeader>
            {/* Tier 1: Spanning Group Headers */}
            <TableRow className="bg-muted/10 hover:bg-muted/10 border-b border-border/60">
              <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-r border-border/40">Staff</TableHead>
              <TableHead colSpan={3} className="h-10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center border-r border-border/40 bg-blue-500/5">Attendance</TableHead>
              <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center border-r border-border/40 bg-amber-500/5">Leave Usage</TableHead>
              <TableHead colSpan={2} className="h-10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center border-r border-border/40 bg-emerald-500/5 font-mono">Monthly P1</TableHead>
              <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center border-r border-border/40 bg-indigo-500/5 font-mono">P2</TableHead>
              <TableHead colSpan={2} className="h-10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center border-r border-border/40 bg-rose-500/5">Payroll Impact</TableHead>
              <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-right pr-6">Action</TableHead>
            </TableRow>

            {/* Tier 2: Specific Column Headers */}
            <TableRow className="bg-muted/5 border-b border-border/40">
              <TableHead className="h-12 font-bold text-foreground border-r border-border/30">Employee Name</TableHead>

              {/* Attendance Group */}
              <TableHead className="h-12 font-bold text-foreground text-center bg-blue-500/2">Present</TableHead>
              <TableHead className="h-12 font-bold text-foreground text-center bg-blue-500/2">Lates</TableHead>
              <TableHead className="h-12 font-bold text-blue-700 text-center border-r border-border/30 bg-blue-500/2">Allowance</TableHead>

              {/* Consumption Group */}
              <TableHead className="h-12 font-bold text-foreground text-center border-r border-border/30 bg-amber-500/[0.02]">Taken</TableHead>

              {/* P1 Group */}
              <TableHead className="h-12 font-bold text-foreground text-center bg-emerald-500/2">Monthly</TableHead>
              <TableHead className="h-12 font-bold text-foreground text-center border-r border-border/30 bg-emerald-500/[0.02]">Short</TableHead>

              {/* P2 Group */}
              <TableHead className="h-12 font-bold text-foreground text-center border-r border-border/30 bg-indigo-500/[0.02]">Semi-Ann.</TableHead>

              {/* Payroll Group */}
              <TableHead className="h-12 font-bold text-destructive text-center bg-rose-500/[0.02]">Unpaid (LWP)</TableHead>
              <TableHead className="h-12 font-bold text-emerald-700 text-center border-r border-border/30 bg-rose-500/[0.02]">Encash (+)</TableHead>

              <TableHead className="h-12 font-bold text-foreground text-right pr-6">---</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/40">
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 opacity-50">
                    <Search className="size-8 text-muted-foreground/30 mb-2" />
                    <p className="text-sm font-bold text-muted-foreground">No matching staff found</p>
                    <p className="text-[10px] uppercase tracking-widest font-bold">Try a different search term</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow className="hover:bg-muted/10 transition-colors group">
                    <TableCell className="font-medium border-r border-border/30 px-6">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs uppercase shadow-sm">
                          {row.name.substring(0, 2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="truncate max-w-[120px] font-bold text-sm text-foreground" title={row.name}>{row.name}</span>
                          <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-0.5">{row.role}</span>
                        </div>
                        {row.offSiteCount > 0 && (
                          <Link href={`/dashboard/accountant/location-logs?m=${month}&y=${year}`} title="View location logs">
                            <StatusBadge status="error" label={row.offSiteCount.toString()} size="sm" withDot={false} className="h-4 px-1 cursor-pointer hover:bg-destructive shadow-sm" />
                          </Link>
                        )}
                      </div>
                    </TableCell>

                    {/* Attendance */}
                    <TableCell className="text-center font-bold text-foreground bg-blue-500/[0.01]">
                      {row.totalPresent}
                    </TableCell>
                    <TableCell className="text-center bg-blue-500/[0.01]">
                      <div className="flex flex-col items-center gap-1">
                        {row.punishableLate > 0 ? (
                          <StatusBadge status="warning" label={row.punishableLate.toString()} size="sm" withDot={false} className="font-bold border-amber-200/50 bg-amber-500/10 text-amber-700 shadow-sm" />
                        ) : (
                          <span className="text-muted-foreground/30 text-[10px] font-bold">---</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-black text-blue-700 border-r border-border/30 bg-blue-500/[0.01] text-xs">
                      {row.allowanceDays > 0 ? `${row.allowanceDays}d` : "---"}
                    </TableCell>

                    {/* Leave Usage */}
                    <TableCell className="text-center font-bold text-foreground border-r border-border/30 bg-amber-500/[0.01]">
                      {row.leavesTaken}
                    </TableCell>

                    {/* P1 Balances */}
                    <TableCell className="text-center font-mono font-bold text-emerald-600 bg-emerald-500/[0.01]">
                      {row.balances.full}
                    </TableCell>
                    <TableCell className="text-center font-mono border-r border-border/30 bg-emerald-500/[0.01] text-muted-foreground font-bold">
                      {row.balances.short}
                    </TableCell>

                    {/* P2 Balance */}
                    <TableCell className="text-center font-mono border-r border-border/30 bg-indigo-500/[0.01] text-muted-foreground font-bold">
                      {row.balances.semiAnnual}
                    </TableCell>

                    {/* Payroll Impact */}
                    <TableCell className="text-center font-black text-destructive bg-rose-500/[0.01]">
                      {row.lwpDays > 0 ? row.lwpDays : "0"}
                    </TableCell>
                    <TableCell className="text-center font-mono font-black text-emerald-600 border-r border-border/30 bg-rose-500/[0.01]">
                      {row.encashableDays > 0 ? `+${row.encashableDays}` : "0"}
                    </TableCell>

                    <TableCell className="text-right pr-6">
                      <Button
                        variant={activeSplitId === row.id ? "default" : "outline"}
                        size="sm"
                        className="h-8 text-[10px] font-black uppercase tracking-widest shadow-sm hover-lift"
                        onClick={() => setActiveSplitId(activeSplitId === row.id ? null : row.id)}
                      >
                        {activeSplitId === row.id ? "Cancel" : "Adjust"}
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
