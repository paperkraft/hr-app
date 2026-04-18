"use client";

import React from "react";
import { StatCard, Grid } from "@/components/ui";
import { CalendarRange, Heart, ShieldCheck, Zap } from "lucide-react";

interface LeaveBalanceOverviewProps {
  casual: { taken: number; remaining: number; total: number };
  sick: { taken: number; remaining: number; total: number };
}

export function LeaveBalanceOverview({ casual, sick }: LeaveBalanceOverviewProps) {
  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between px-2">
        <div>
          <h2 className="text-xl font-black text-foreground tracking-tight leading-none mb-1">Entitlements</h2>
          <p className="text-[11px] text-muted-foreground/60 font-black uppercase tracking-[0.2em]">Balance Framework</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1">
        <StatCard
          label="Casual Leave"
          value={`${casual.remaining} Days`}
          subValue={`${casual.remaining} remaining this cycle`}
          icon={<CalendarRange className="size-5" />}
          progress={(casual.taken / casual.total) * 100}
          progressColor="bg-primary"
          className="h-full"
        />
        <StatCard
          label="Sick Leave"
          value={`${sick.remaining} Days`}
          subValue={`${sick.remaining} remaining this cycle`}
          icon={<Heart className="size-5" />}
          progress={(sick.taken / sick.total) * 100}
          progressColor="bg-rose-500"
          className="h-full"
        />
        <StatCard
          label="Annual Balance"
          value="24 Days"
          subValue="Projected for year-end"
          icon={<ShieldCheck className="size-5" />}
          progress={45}
          progressColor="bg-emerald-500"
          className="h-full hidden xl:flex"
        />
        <StatCard
          label="Performance Hub"
          value="98%"
          subValue="High engagement score"
          icon={<Zap className="size-5" />}
          progress={98}
          progressColor="bg-amber-500"
          className="h-full hidden xl:flex"
        />
      </div>
    </div>
  );
}
