"use client";

import React from "react";
import { StatCard } from "@/components/ui";
import { CalendarRange, Heart, TrendingUp, Clock } from "lucide-react";

interface LeaveBalanceOverviewProps {
  casual: { taken: number; remaining: number; total: number };
  sick: { taken: number; remaining: number; total: number };
  approvalRate?: number;
  pendingCount?: number;
}

export function LeaveBalanceOverview({ casual, sick, approvalRate = 100, pendingCount = 0 }: LeaveBalanceOverviewProps) {
  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      <StatCard
        label="Monthly Balance"
        value={`${casual.remaining} days`}
        subValue={`${casual.remaining} available now`}
        icon={<CalendarRange className="size-4" />}
        progress={Math.min(100, Math.round((casual.remaining / 3) * 100))}
        progressColor="bg-primary"
      />
      <StatCard
        label="Semester Sick Pool"
        value={`${sick.remaining} days`}
        subValue={`${sick.taken} taken in cycle`}
        icon={<Heart className="size-4" />}
        progress={Math.round((sick.taken / sick.total) * 100)}
        progressColor="bg-rose-500"
      />
      <StatCard
        label="Approval Rate"
        value={`${approvalRate}%`}
        subValue="Overall approval metric"
        icon={<TrendingUp className="size-4" />}
        progress={approvalRate}
        progressColor="bg-emerald-500"
      />
      <StatCard
        label="Pending Requests"
        value={pendingCount}
        subValue="Waiting for review"
        icon={<Clock className="size-4" />}
        progress={pendingCount > 0 ? Math.min(pendingCount * 20, 100) : 0}
        progressColor="bg-amber-500"
      />
    </div>
  );
}

