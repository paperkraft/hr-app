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
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-6 bg-muted/5 border-b border-border/40">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground/40" />
          <Input
            placeholder="Search employees..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 h-11 bg-background/40 border-border/40 focus:bg-background focus:ring-primary/20 transition-all rounded-xl text-sm"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant={filterOutsideOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOutsideOnly(!filterOutsideOnly)}
            className={cn(
              "h-11 px-5 font-black uppercase text-[10px] tracking-widest transition-all rounded-xl border-border/40 shadow-sm",
              filterOutsideOnly 
                ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20 border-rose-500" 
                : "bg-background/50 hover:bg-muted/50"
            )}
          >
            <Filter className={cn("size-3.5 mr-2", !filterOutsideOnly && "text-muted-foreground")} />
            {filterOutsideOnly ? "Outside Office Only" : "Showing All Locations"}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto scrollbar-hide">
        <Table>
          <TableHeader className="bg-muted/5">
            <TableRow className="border-b border-border/40 hover:bg-transparent">
              <TableHead className="py-3 px-4 font-black text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70 w-[200px]">Employee</TableHead>
              <TableHead className="py-3 px-4 font-black text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">Timeline</TableHead>
              <TableHead className="py-3 px-4 font-black text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">Entry / Exit</TableHead>
              <TableHead className="py-3 px-4 font-black text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">Status</TableHead>
              <TableHead className="py-3 px-4 font-black text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70">GPS Coordinates</TableHead>
              <TableHead className="py-3 px-4 font-black text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-30">
                    <MapPin className="size-12 mb-2 text-muted-foreground" />
                    <p className="text-sm font-black uppercase tracking-[0.2em]">No Location Logs Found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((log) => (
                <TableRow key={log.id} className="hover:bg-primary/[0.02] transition-colors border-b border-border/40 last:border-0 group">
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black text-[10px]">
                        {log.userName.charAt(0)}
                      </div>
                      <div className="font-bold text-xs text-foreground">{log.userName}</div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex flex-col gap-0.5">
                       <span className="text-xs font-bold text-foreground">
                         {format(new Date(log.date), "dd MMM, yyyy")}
                       </span>
                       <span className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest leading-tight">
                         {log.ipAddress || "No IP Captured"}
                       </span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 min-w-[70px]">
                        <Clock className="size-3 text-emerald-500/70" />
                        <span className="font-mono text-[11px] font-bold text-foreground">
                          {format(new Date(log.punchIn), "hh:mm a")}
                        </span>
                      </div>
                      {log.punchOut && (
                        <div className="flex items-center gap-1.5">
                          <Clock className="size-3 text-amber-500/70" />
                          <span className="font-mono text-[11px] font-bold text-foreground">
                            {format(new Date(log.punchOut), "hh:mm a")}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    {log.isOutsideOffice ? (
                      <StatusBadge status="error" label="Out Office" size="sm" withDot animated className="font-black uppercase tracking-widest px-2 h-6 text-[9px] shadow-sm border border-rose-500/10" />
                    ) : (
                      <StatusBadge status="success" label="In Office" size="sm" withDot className="font-black uppercase tracking-widest px-2 h-6 text-[9px] shadow-sm border border-emerald-500/10" />
                    )}
                  </TableCell>
                  <TableCell className="py-3 px-4">
                    {log.lat && log.lng ? (
                      <div className="flex items-center gap-2 group/coord">
                        <MapPin className="size-3 text-primary/60 group-hover/coord:text-primary transition-colors" />
                        <span className="text-[11px] font-bold text-foreground/80 font-mono tracking-tight group-hover/coord:text-foreground transition-colors">
                          {log.lat.toFixed(5)}, {log.lng.toFixed(5)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-[9px] font-black uppercase tracking-[0.2em] italic opacity-30">Not available</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3 px-4 text-right">
                    {log.lat && log.lng && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${log.lat},${log.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-primary/60 hover:text-primary transition-colors underline-offset-4 hover:underline"
                        title="View on Google Maps"
                      >
                        <ExternalLink className="size-3" />
                        Map
                      </a>
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
