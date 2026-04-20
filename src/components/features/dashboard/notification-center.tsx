"use client";

import { Bell, CheckCircle2, AlertCircle, Info, Clock, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { markAllAsRead } from "@/actions/notification";

import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  type: string;
  isRead: boolean;
}

interface NotificationCenterProps {
  notifications: any[];
  className?: string;
}

export function NotificationCenter({ notifications: initialNotifications, className }: NotificationCenterProps) {
  const notifications = (initialNotifications || []).map(n => ({
    ...n,
    createdAt: new Date(n.createdAt)
  })) as Notification[];

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className={cn("bg-card border border-border rounded-sm flex flex-col h-full animate-fade-in overflow-hidden", className)}>
      {/* Widget Header */}
      <div className="p-6 pb-2 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1">Notifications</h3>
          <p className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-widest text-xs">Feed</p>
        </div>
        <div className="size-8 rounded-sm bg-primary/5 text-primary flex items-center justify-center border border-primary/10 relative">
          <Bell className="size-4" />
          {unreadCount > 0 && <div className="absolute -top-0.5 -right-0.5 size-2 bg-rose-500 rounded-full border border-card animate-pulse" />}
        </div>
      </div>

      <div className="flex-1 px-3 py-2 space-y-0.5 min-h-[140px]">
        {notifications.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center gap-2 opacity-20 px-8">
            <Bell className="size-5" />
            <p className="text-[10px] font-black uppercase tracking-widest">Clear feed</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div
              key={notif.id}
              className={cn(
                "p-3 flex items-start gap-3 hover:bg-muted/5 transition-all duration-200 rounded-sm cursor-pointer group/item",
                !notif.isRead && "bg-primary/2"
              )}
            >
              <div className={cn(
                "p-2 rounded-sm shrink-0 border transition-colors",
                notif.type === "SUCCESS" && "bg-emerald-500/5 text-emerald-600 border-emerald-500/10",
                notif.type === "WARNING" && "bg-amber-500/5 text-amber-600 border-amber-500/10",
                notif.type === "INFO" && "bg-sky-500/5 text-sky-600 border-sky-500/10",
                notif.type === "ERROR" && "bg-rose-500/5 text-rose-600 border-rose-500/10",
              )}>
                {notif.type === "SUCCESS" && <CheckCircle2 className="size-3" />}
                {notif.type === "WARNING" && <AlertCircle className="size-3" />}
                {notif.type === "INFO" && <Info className="size-3" />}
                {notif.type === "ERROR" && <ArrowRight className="size-3 rotate-45" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1.5 mb-0.1">
                  <p className="text-[11px] font-bold text-foreground truncate group-hover/item:text-primary transition-colors">
                    {notif.title}
                  </p>
                  {!notif.isRead && <div className="size-1 rounded-full bg-primary" />}
                </div>
                <p className="text-[10px] text-muted-foreground leading-snug line-clamp-1 pr-2">
                  {notif.content}
                </p>
                <div className="flex items-center gap-1.5 mt-1 opacity-40">
                  <span className="text-[9px] text-muted-foreground font-black uppercase tracking-tight">
                    {formatDistanceToNow(notif.createdAt, { addSuffix: true }).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-4 pt-1">
        <button
          onClick={() => markAllAsRead()}
          className="w-full py-2.5 rounded-sm flex items-center justify-center gap-2 text-[10px] font-black text-primary bg-primary/2 border border-primary/5 hover:bg-primary/5 transition-all duration-200 uppercase tracking-widest shadow-none"
        >
          Dismiss All
          <ArrowRight className="size-3" />
        </button>
      </div>
    </div>
  );
}
