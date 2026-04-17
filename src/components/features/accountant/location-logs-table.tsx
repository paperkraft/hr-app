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
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Search, 
  ExternalLink, 
  Clock, 
  Map as MapIcon,
  Filter,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by employee name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={filterOutsideOnly ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterOutsideOnly(!filterOutsideOnly)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {filterOutsideOnly ? "Showing Out-of-Office" : "Show Out-of-Office Only"}
          </Button>
        </div>
      </div>

      <div className="rounded-md border border-border/50 bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Employee</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Punch In / Out</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead className="text-right">Actions</TableHead>
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
                  <TableCell>
                    {log.isOutsideOffice ? (
                      <Badge variant="destructive" className="flex items-center gap-1 w-fit bg-red-500/10 text-red-600 hover:bg-red-500/20 border-red-200">
                        <XCircle className="size-3" />
                        Out of Office
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="flex items-center gap-1 w-fit bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200">
                        <CheckCircle2 className="size-3" />
                        In Office
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {log.lat && log.lng ? (
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-primary" />
                        <span className="text-xs font-mono">
                          {log.lat.toFixed(4)}, {log.lng.toFixed(4)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-xs italic">Not captured</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-mono text-muted-foreground">
                      {log.ipAddress || "N/A"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
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
