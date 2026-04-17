"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  StatusBadge,
  Input,
  Button,
} from "@/components/ui";
import { 
  MapPin, 
  Search, 
  ExternalLink, 
  Clock, 
  Filter
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AttendanceLog {
  id: string;
  userName: string;
  date: Date;
  punchIn: Date;
  punchOut: Date | null;
  lat: number | null;
  lng: number | null;
  isOutsideOffice: boolean;
  ipAddress: string | null;
}

interface LocationLogsTableProps {
  data: AttendanceLog[];
}

export function LocationLogsTable({ data }: LocationLogsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOutsideOnly, setFilterOutsideOnly] = useState(false);

  const filteredData = data.filter((log) => {
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterOutsideOnly ? log.isOutsideOffice : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card p-4 rounded-xl border border-border/40 shadow-sm mb-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
          <Input
            placeholder="Search by employee name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-10 bg-muted/20 border-border/40 focus:bg-background transition-all"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={filterOutsideOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOutsideOnly(!filterOutsideOnly)}
            className={cn(
              "h-10 px-4 font-bold flex items-center gap-2 transition-all",
              filterOutsideOnly && "bg-destructive hover:bg-destructive/90 text-white"
            )}
          >
            <Filter className={cn("h-4 w-4", !filterOutsideOnly && "text-muted-foreground")} />
            {filterOutsideOnly ? "Showing Out-of-Office" : "Filter Out-of-Office"}
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-border/50 bg-card">
        <Table>
          <TableHeader className="bg-muted/10">
            <TableRow className="border-b border-border/40 hover:bg-transparent">
              <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Employee</TableHead>
              <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Date</TableHead>
              <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Punch In / Out</TableHead>
              <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Status</TableHead>
              <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Location</TableHead>
              <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground">IP Address</TableHead>
              <TableHead className="py-4 px-6 font-bold text-[10px] uppercase tracking-[0.2em] text-muted-foreground text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No attendance logs found.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((log) => (
                <TableRow key={log.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell>
                    <div className="font-medium">{log.userName}</div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(log.date), "dd MMM, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="size-3 text-emerald-500" />
                        <span className="text-foreground">{format(new Date(log.punchIn), "hh:mm a")}</span>
                      </div>
                      {log.punchOut && (
                        <div className="flex items-center gap-1 mt-1">
                          <Clock className="size-3 text-amber-500" />
                          <span>{format(new Date(log.punchOut), "hh:mm a")}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    {log.isOutsideOffice ? (
                      <StatusBadge status="error" label="Out Office" size="sm" withDot animated className="font-bold" />
                    ) : (
                      <StatusBadge status="success" label="In Office" size="sm" withDot className="font-bold" />
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    {log.lat && log.lng ? (
                      <div className="flex items-center gap-2">
                        <MapPin className="size-3.5 text-primary" />
                        <span className="text-xs font-bold text-foreground font-mono">
                          {log.lat.toFixed(4)}, {log.lng.toFixed(4)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest italic opacity-40">Not captured</span>
                    )}
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <span className="text-xs font-mono font-medium text-muted-foreground">
                      {log.ipAddress || "---"}
                    </span>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    {log.lat && log.lng && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="h-8 w-8 p-0"
                      >
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${log.lat},${log.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="View on Google Maps"
                        >
                          <ExternalLink className="h-4 w-4 text-primary" />
                        </a>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
