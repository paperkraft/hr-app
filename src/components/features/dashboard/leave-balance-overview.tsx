"use client";

import React from "react";
import { PageSection, StatCard, Grid, ProgressRing } from "@/components/ui";
import { CalendarRange, AlertCircle, Heart } from "lucide-react";

interface LeaveBalanceOverviewProps {
  casual: { taken: number; remaining: number; total: number };
  sick: { taken: number; remaining: number; total: number };
}

export function LeaveBalanceOverview({ casual, sick }: LeaveBalanceOverviewProps) {
  return (
    <PageSection 
      title="Leave Balance & Allotment" 
      description="Your remaining annual leave entitlements."
      className="animate-fade-in-up"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Casual Leave Progress */}
        <div className="p-5 rounded-2xl bg-muted/20 border border-border/40 flex items-center gap-6 group hover:border-primary/20 transition-colors">
          <div className="relative size-16 shrink-0">
             <ProgressRing 
               value={(casual.taken / casual.total) * 100} 
               size={64} 
               strokeWidth={6} 
               strokeColor="text-primary"
             />
             <div className="absolute inset-0 flex items-center justify-center">
                <CalendarRange className="size-5 text-primary opacity-60" />
             </div>
          </div>
          <div className="flex-1">
             <div className="flex justify-between items-end mb-1">
                <h4 className="text-sm font-bold text-foreground">Casual Leave</h4>
                <span className="text-xs font-black text-primary">{casual.remaining} DAYS LEFT</span>
             </div>
             <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
               {casual.taken} of {casual.total} Days Utilized
             </p>
          </div>
        </div>

        {/* Sick Leave Progress */}
        <div className="p-5 rounded-2xl bg-muted/20 border border-border/40 flex items-center gap-6 group hover:border-rose-500/20 transition-colors">
          <div className="relative size-16 shrink-0">
             <ProgressRing 
               value={(sick.taken / sick.total) * 100} 
               size={64} 
               strokeWidth={6} 
               strokeColor="text-rose-500"
             />
             <div className="absolute inset-0 flex items-center justify-center">
                <Heart className="size-5 text-rose-500 opacity-60" />
             </div>
          </div>
          <div className="flex-1">
             <div className="flex justify-between items-end mb-1">
                <h4 className="text-sm font-bold text-foreground">Sick Leave</h4>
                <span className="text-xs font-black text-rose-500">{sick.remaining} DAYS LEFT</span>
             </div>
             <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
               {sick.taken} of {sick.total} Days Utilized
             </p>
          </div>
        </div>
      </div>
    </PageSection>
  );
}
