"use client";

import React from "react";
import { Bell, CheckCircle2, AlertCircle, Info, Clock, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
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
    title: "Leave Status Updated",
    description: "Your session for Q3 has been approved by the planning committee.",
    time: "2 HOURS AGO",
    type: "success",
  },
  {
    id: "2",
    title: "Protocol Reminder",
    description: "Please ensure manual check-out is performed by 18:00 today.",
    time: "5 HOURS AGO",
    type: "warning",
  },
  {
    id: "3",
    title: "New Policy Cluster",
    description: "The revised remote framework is now active in the central repository.",
    time: "1 DAY AGO",
    type: "info",
  }
];

export function NotificationCenter({ className }: { className?: string }) {
  return (
    <div className={cn("bg-white border border-border/60 rounded-sm flex flex-col h-full animate-fade-in shadow-sm overflow-hidden", className)}>
      {/* Widget Header */}
      <div className="p-6 pb-2 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1">Notifications</h3>
          <p className="text-[10px] text-muted-foreground/40 font-black uppercase tracking-[0.1em]">Contextual Feed</p>
        </div>
        <div className="size-8 rounded-sm bg-primary/[0.05] text-primary flex items-center justify-center border border-primary/10 relative">
           <Bell className="size-4" />
           <div className="absolute -top-0.5 -right-0.5 size-2 bg-rose-500 rounded-full border border-white" />
        </div>
      </div>

      <div className="flex-1 px-3 py-2 space-y-0.5">
        {mockNotifications.map((notif) => (
          <div 
            key={notif.id} 
            className={cn(
              "p-3 flex items-start gap-3 hover:bg-muted/5 transition-all duration-200 rounded-sm cursor-pointer group/item",
              !notif.isRead && "bg-primary/[0.01]"
            )}
          >
            <div className={cn(
              "p-2 rounded-sm shrink-0 border transition-colors",
              notif.type === "success" && "bg-emerald-500/5 text-emerald-600 border-emerald-500/10",
              notif.type === "warning" && "bg-amber-500/5 text-amber-600 border-amber-500/10",
              notif.type === "info" && "bg-sky-500/5 text-sky-600 border-sky-500/10",
              notif.type === "error" && "bg-rose-500/5 text-rose-600 border-rose-500/10",
            )}>
              {notif.type === "success" && <CheckCircle2 className="size-3.5" />}
              {notif.type === "warning" && <AlertCircle className="size-3.5" />}
              {notif.type === "info" && <Sparkles className="size-3.5" />}
              {notif.type === "error" && <AlertCircle className="size-3.5" />}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1.5 mb-0.5">
                <p className="text-[12px] font-bold text-foreground truncate group-hover/item:text-primary transition-colors">
                  {notif.title}
                </p>
                {!notif.isRead && <div className="size-1 rounded-full bg-primary" />}
              </div>
              <p className="text-[10px] text-muted-foreground leading-snug line-clamp-1 pr-2">
                {notif.description}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5 opacity-40">
                 <Clock className="size-2.5 text-muted-foreground" />
                 <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tight">
                  {notif.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 pt-1">
        <Link 
          href="#" 
          className="w-full py-2.5 rounded-sm flex items-center justify-center gap-2 text-[10px] font-black text-primary bg-primary/[0.02] border border-primary/5 hover:bg-primary/[0.05] transition-all duration-200 uppercase tracking-widest"
        >
          Audit Timeline
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  );
}
