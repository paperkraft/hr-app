"use client";

import React, { useState } from "react";
import { MapPin, Search, ExternalLink, Clock, Filter } from "lucide-react";
import { Input } from "@/components/ui";
import { Button } from "@/components/ui/button";
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

export function LocationLogsTable({ data }: { data: AttendanceLog[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterOutsideOnly, setFilterOutsideOnly] = useState(false);

  const filteredData = data.filter((log) => {
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterOutsideOnly ? log.isOutsideOffice : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-white border border-border/60 rounded-sm shadow-sm overflow-hidden animate-fade-in">
      {/* Controls */}
      <div className="px-5 py-4 border-b border-border/40 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/30" />
          <Input
            placeholder="Search by employee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9 border-border/60 focus:ring-primary/10 transition-all rounded-sm text-xs bg-muted/5 focus:bg-white"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest px-2 py-1 rounded-sm border border-border/40">
            {filteredData.length} Records
          </span>
          <Button
            variant={filterOutsideOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOutsideOnly(!filterOutsideOnly)}
            className={cn(
              "h-9 px-3 text-[10px] font-bold uppercase tracking-widest rounded-sm transition-all",
              filterOutsideOnly
                ? "bg-rose-500 hover:bg-rose-500/90 text-white border-rose-500"
                : "border-border/60 bg-muted/5 text-muted-foreground/60 hover:bg-muted/10"
            )}
          >
            <Filter className="size-3 mr-1.5" />
            {filterOutsideOnly ? "Outside Only" : "All Locations"}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-hide">
        <table className="w-full border-collapse">
          <thead className="bg-muted/5 border-b border-border/40">
            <tr>
              <th className="py-3 px-5 text-left text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/40">Employee</th>
              <th className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/40">Date</th>
              <th className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/40">Entry / Exit</th>
              <th className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/40">Status</th>
              <th className="py-3 px-4 text-left text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/40">GPS Coordinates</th>
              <th className="py-3 px-5 text-right text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground/40">Map</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {filteredData.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-20">
                    <MapPin className="size-7" />
                    <p className="text-[10px] font-black uppercase tracking-widest">No records found</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredData.map((log) => (
                <tr key={log.id} className="hover:bg-muted/5 transition-colors group">
                  {/* Employee */}
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-sm bg-muted text-foreground/40 flex items-center justify-center font-bold text-[9px] border border-border/40 group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                        {log.userName.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-[11px] font-bold text-foreground">{log.userName}</span>
                    </div>
                  </td>

                  {/* Date + IP */}
                  <td className="py-3 px-4">
                    <p className="text-[11px] font-bold text-foreground/70">
                      {format(new Date(log.date), "dd MMM, yyyy")}
                    </p>
                    <p className="text-[9px] text-muted-foreground/40 font-bold uppercase tracking-tight mt-0.5">
                      {log.ipAddress || "No IP"}
                    </p>
                  </td>

                  {/* Entry / Exit times — plain text, no badges */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        <Clock className="size-2.5 text-muted-foreground/30" />
                        <span className="text-[11px] font-bold text-foreground/70 tabular-nums">
                          {format(new Date(log.punchIn), "HH:mm")}
                        </span>
                      </div>
                      {log.punchOut && (
                        <>
                          <span className="text-muted-foreground/20">—</span>
                          <div className="flex items-center gap-1">
                            <Clock className="size-2.5 text-muted-foreground/30" />
                            <span className="text-[11px] font-bold text-foreground/70 tabular-nums">
                              {format(new Date(log.punchOut), "HH:mm")}
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </td>

                  {/* Status — plain text, no badge */}
                  <td className="py-3 px-4">
                    {log.isOutsideOffice ? (
                      <span className="text-[9px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-1">
                        <MapPin className="size-2.5" /> Outside
                      </span>
                    ) : (
                      <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                        <MapPin className="size-2.5" /> In Office
                      </span>
                    )}
                  </td>

                  {/* GPS — plain text */}
                  <td className="py-3 px-4">
                    {log.lat && log.lng ? (
                      <span className="text-[10px] font-mono font-bold text-foreground/60 tabular-nums">
                        {log.lat.toFixed(5)}, {log.lng.toFixed(5)}
                      </span>
                    ) : (
                      <span className="text-[9px] text-muted-foreground/30 font-bold uppercase tracking-tighter">—</span>
                    )}
                  </td>

                  {/* Map link */}
                  <td className="py-3 px-5 text-right">
                    {log.lat && log.lng && (
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${log.lat},${log.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-primary/50 hover:text-primary transition-colors uppercase tracking-widest"
                      >
                        <ExternalLink className="size-3" /> View
                      </a>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
