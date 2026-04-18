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
        label="Casual Leave"
        value={`${casual.remaining} days`}
        subValue={`${casual.taken} taken · ${casual.remaining} remaining`}
        icon={<CalendarRange className="size-4" />}
        progress={Math.round((casual.taken / casual.total) * 100)}
        progressColor="bg-primary"
      />
      <StatCard
        label="Sick Leave"
        value={`${sick.remaining} days`}
        subValue={`${sick.taken} taken · ${sick.remaining} remaining`}
        icon={<Heart className="size-4" />}
        progress={Math.round((sick.taken / sick.total) * 100)}
        progressColor="bg-rose-500"
      />
      <StatCard
        label="Approval Rate"
        value={`${approvalRate}%`}
        subValue="Leave request approvals"
        icon={<TrendingUp className="size-4" />}
        progress={approvalRate}
        progressColor="bg-emerald-500"
      />
      <StatCard
        label="Pending Requests"
        value={pendingCount}
        subValue="Awaiting approval"
        icon={<Clock className="size-4" />}
        progress={pendingCount > 0 ? Math.min(pendingCount * 20, 100) : 0}
        progressColor="bg-amber-500"
      />
    </div>
  );
}
