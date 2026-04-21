"use client";

import React from "react";
import { StatCard } from "@/components/ui";
import { CalendarRange, Heart, Activity, Star } from "lucide-react";

interface LeaveBalanceOverviewProps {
  casual: { remaining: number };
  casualYearly: { taken: number; total: number };
  sickYearly: { taken: number; total: number };
  earned: { remaining: number; total: number };
}

export function LeaveBalanceOverview({ casual, casualYearly, sickYearly, earned }: LeaveBalanceOverviewProps) {
  return (
    <div className="grid grid-cols-2 gap-4 h-full">
      {/* CARD 1 - Monthly Leave Pool (Combined) */}
      <StatCard
        label="Monthly Pool"
        value={`${casual.remaining}d`}
        subValue="Casual & Sick combined"
        icon={<CalendarRange className="size-4" />}
        progress={Math.min(100, Math.round((casual.remaining / 2) * 100))}
        progressColor="bg-primary"
      />
      {/* CARD 2 - Earned Leaves (Semi-annual) */}
      <StatCard
        label="Earned Leaves"
        value={`${earned.remaining}d`}
        subValue="Semi-annual cycle"
        icon={<Star className="size-4" />}
        progress={Math.round((earned.remaining / earned.total) * 100)}
        progressColor="bg-sky-500"
      />
      {/* CARD 3 - Casual Yearly Usage */}
      <StatCard
        label="Casual Usage (Y)"
        value={`${casualYearly.taken}/${casualYearly.total}`}
        subValue="Annual casual quota"
        icon={<Activity className="size-4" />}
        progress={Math.round((casualYearly.taken / casualYearly.total) * 100)}
        progressColor="bg-amber-500"
      />
      {/* CARD 4 - Sick Usage (Y) */}
      <StatCard
        label="Sick Usage (Y)"
        value={`${sickYearly.taken}/${sickYearly.total}`}
        subValue="Annual medical quota"
        icon={<Heart className="size-4" />}
        progress={Math.round((sickYearly.taken / sickYearly.total) * 100)}
        progressColor="bg-rose-500"
      />
    </div>
  );
}
