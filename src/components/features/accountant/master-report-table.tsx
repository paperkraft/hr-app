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

export function MasterReportTable({ data }: { data: ReportData[] }) {
  const [activeSplitId, setActiveSplitId] = useState<string | null>(null);

  return (
    <div className="relative w-full overflow-auto">
      <Table>
        <TableHeader className="bg-muted/5">
          <TableRow className="border-border/40 hover:bg-transparent">
            <TableHead className="h-10 font-semibold text-foreground">Employees</TableHead>
            <TableHead className="h-10 font-semibold text-foreground text-center">Present</TableHead>
            <TableHead className="h-10 font-semibold text-foreground text-center">Leaves Taken</TableHead>
            <TableHead className="h-10 font-semibold text-foreground text-center">Late Marks</TableHead>
            <TableHead className="h-10 font-semibold text-destructive bg-destructive/5 text-center">LWP (Unpaid)</TableHead>
            <TableHead className="h-10 font-semibold text-foreground text-center border-l border-border/50">Earned Leaves</TableHead>
            <TableHead className="h-10 font-semibold text-emerald-600 bg-emerald-500/5 text-center">Encashable</TableHead>
            <TableHead className="h-10 font-semibold text-foreground text-center border-l border-border/50">Short Leaves</TableHead>
            <TableHead className="h-10 font-semibold text-foreground text-center">Semi-Annual</TableHead>
            <TableHead className="h-10 font-semibold text-foreground text-center">Action</TableHead>
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
                  <TableCell className="font-medium">
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
                  <TableCell className="text-center font-semibold text-foreground">
                    {row.totalPresent}
                  </TableCell>
                  <TableCell className="text-center font-semibold text-foreground">
                    {row.leavesTaken}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1">
                      {row.punishableLate > 0 ? (
                        <Badge variant="outline" className="text-destructive border-destructive/30 bg-destructive/10">
                          {row.punishableLate} Late
                        </Badge>
                      ) : row.totalLate === 0 ? (
                        <span className="text-muted-foreground text-xs">-</span>
                      ) : null}

                      {row.specialCaseLate > 0 && (
                        <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 text-[9px] h-4">
                          {row.specialCaseLate} Covered
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-bold text-destructive bg-destructive/5">
                    {row.lwpDays > 0 ? row.lwpDays : "0"}
                  </TableCell>
                  <TableCell className="text-center font-mono border-l border-border/50">
                    {row.balances.full}
                  </TableCell>
                  <TableCell className="text-center font-mono font-bold text-emerald-600 bg-emerald-500/5">
                    {row.encashableDays > 0 ? `+${row.encashableDays}` : "0"}
                  </TableCell>
                  <TableCell className="text-center font-mono border-l border-border/50 text-muted-foreground">
                    {row.balances.short}
                  </TableCell>
                  <TableCell className="text-center font-mono text-muted-foreground">
                    {row.balances.semiAnnual}
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button
                      variant={activeSplitId === row.id ? "default" : "outline"}
                      size="sm"
                      className="h-8 text-[10px] font-bold uppercase tracking-tight"
                      onClick={() => setActiveSplitId(activeSplitId === row.id ? null : row.id)}
                    >
                      {activeSplitId === row.id ? "Close" : "Adjust"}
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
