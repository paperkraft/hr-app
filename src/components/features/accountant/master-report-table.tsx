"use client";

import React, { useState } from "react";
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
import { Settings2, MapPinOff } from "lucide-react";
import { SplitActionRow } from "./split-action-row";

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

  return (
    <div className="relative w-full overflow-auto border rounded-lg shadow-sm bg-card/30">
      <Table className="border-collapse">
        <TableHeader>
          {/* Tier 1: Spanning Group Headers */}
          <TableRow className="bg-muted/10 hover:bg-muted/10 border-b border-border/60">
            <TableHead className="h-10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-r border-border/40">Staff</TableHead>
            <TableHead colSpan={2} className="h-10 text-[10px] font-bold uppercase tracking-wider text-muted-foreground text-center border-r border-border/40 bg-blue-500/5">Attendance</TableHead>
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
            <TableHead className="h-12 font-bold text-foreground text-center bg-blue-500/[0.02]">Present</TableHead>
            <TableHead className="h-12 font-bold text-foreground text-center border-r border-border/30 bg-blue-500/[0.02]">Lates</TableHead>
            
            {/* Consumption Group */}
            <TableHead className="h-12 font-bold text-foreground text-center border-r border-border/30 bg-amber-500/[0.02]">Taken</TableHead>
            
            {/* P1 Group */}
            <TableHead className="h-12 font-bold text-foreground text-center bg-emerald-500/[0.02]">Monthly</TableHead>
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
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                No staff data found for this month.
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <React.Fragment key={row.id}>
                <TableRow className="hover:bg-muted/10 transition-colors group">
                  <TableCell className="font-medium border-r border-border/30">
                    <div className="flex items-center gap-2">
                      {row.name}
                      {row.offSiteCount > 0 && (
                        <Badge variant="outline" className="text-rose-600 border-rose-200 bg-rose-50 text-[9px] h-4 flex items-center gap-0.5 px-1 font-bold">
                          {row.offSiteCount} &nbsp;Outside
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setActiveSplitId(activeSplitId === row.id ? null : row.id)}
                      >
                        <Settings2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  
                  {/* Attendance */}
                  <TableCell className="text-center font-semibold text-foreground bg-blue-500/[0.01]">
                    {row.totalPresent}
                  </TableCell>
                  <TableCell className="text-center border-r border-border/30 bg-blue-500/[0.01]">
                    <div className="flex flex-col items-center gap-1">
                      {row.punishableLate > 0 ? (
                        <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10 text-[10px]">
                          {row.punishableLate}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground/30 text-xs">-</span>
                      )}
                      {row.specialCaseLate > 0 && (
                        <span className="text-[8px] text-amber-600 font-bold uppercase tracking-tighter">+{row.specialCaseLate} Cov</span>
                      )}
                    </div>
                  </TableCell>

                  {/* Leave Usage */}
                  <TableCell className="text-center font-semibold text-foreground border-r border-border/30 bg-amber-500/[0.01]">
                    {row.leavesTaken}
                  </TableCell>

                  {/* P1 Balances */}
                  <TableCell className="text-center font-mono bg-emerald-500/[0.01]">
                    {row.balances.full}
                  </TableCell>
                  <TableCell className="text-center font-mono border-r border-border/30 bg-emerald-500/[0.01] text-muted-foreground">
                    {row.balances.short}
                  </TableCell>

                  {/* P2 Balance */}
                  <TableCell className="text-center font-mono border-r border-border/30 bg-indigo-500/[0.01] text-muted-foreground">
                    {row.balances.semiAnnual}
                  </TableCell>

                  {/* Payroll Impact */}
                  <TableCell className="text-center font-bold text-destructive bg-rose-500/[0.01]">
                    {row.lwpDays > 0 ? row.lwpDays : "0"}
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold text-emerald-600 border-r border-border/30 bg-rose-500/[0.01]">
                    {row.encashableDays > 0 ? `+${row.encashableDays}` : "0"}
                  </TableCell>

                  <TableCell className="text-right pr-6">
                    <Button
                      variant={activeSplitId === row.id ? "default" : "outline"}
                      size="sm"
                      className="h-8 text-[10px] font-bold uppercase tracking-tight"
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
  );
}
