"use client";

import React from "react";
import { Bell, CheckCircle2, AlertCircle, Info, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { PageSection } from "@/components/ui";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: "success" | "warning" | "info" | "error";
  isRead?: boolean;
}

const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Leave Request Approved",
    description: "Your request for March 25-26 has been approved by HR.",
    time: "2 HOURS AGO",
    type: "success",
  },
  {
    id: "2",
    title: "Attendance Reminder",
    description: "Please remember to clock out at the end of your shift today.",
    time: "5 HOURS AGO",
    type: "warning",
  },
  {
    id: "3",
    title: "New Policy Update",
    description: "The revised remote work policy is now available in the employee handbook.",
    time: "1 DAY AGO",
    type: "info",
  }
];

export function NotificationCenter({ className }: { className?: string }) {
  return (
    <PageSection
      title="Notifications"
      description="Stay updated with your latest HR and attendance alerts."
      className={cn("animate-fade-in-up h-full", className)}
      noPadding
    >
      <div className="flex flex-col flex-1 h-full">
        <div className="divide-y divide-border/40 flex-1">
          {mockNotifications.map((notif) => (
            <div 
              key={notif.id} 
              className={cn(
                "p-4 flex items-start gap-4 hover:bg-muted/10 transition-colors group cursor-pointer",
                !notif.isRead && "bg-primary/[0.01]"
              )}
            >
              <div className={cn(
                "p-2 rounded-xl mt-0.5 shrink-0 transition-transform group-hover:scale-110",
                notif.type === "success" && "bg-emerald-100/50 text-emerald-600 dark:bg-emerald-950/30",
                notif.type === "warning" && "bg-amber-100/50 text-amber-600 dark:bg-amber-950/30",
                notif.type === "info" && "bg-blue-100/50 text-blue-600 dark:bg-blue-950/30",
                notif.type === "error" && "bg-rose-100/50 text-rose-600 dark:bg-rose-950/30",
              )}>
                {notif.type === "success" && <CheckCircle2 className="size-4" />}
                {notif.type === "warning" && <AlertCircle className="size-4" />}
                {notif.type === "info" && <Info className="size-4" />}
                {notif.type === "error" && <AlertCircle className="size-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {notif.title}
                  </p>
                  {!notif.isRead && <div className="size-1.5 rounded-full bg-primary shrink-0" />}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {notif.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                   <Clock className="size-3 text-muted-foreground/50" />
                   <span className="text-[9px] text-muted-foreground/60 font-black uppercase tracking-widest">
                    {notif.time}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <Link 
          href="#" 
          className="p-4 flex items-center justify-center gap-2 text-[10px] font-black text-primary hover:bg-primary/5 transition-colors border-t border-border/40 uppercase tracking-[0.2em]"
        >
          View All Notifications
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </PageSection>
  );
}
