"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnnouncementWidget } from "./announcement-widget";
import { NotificationCenter } from "./notification-center";
import { Bell, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommunicationHubProps {
  announcements: any[];
  notifications: any[];
  className?: string;
}

export function CommunicationHub({ announcements, notifications, className }: CommunicationHubProps) {
  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  return (
    <div className={cn("bg-card border border-border rounded-sm flex flex-col h-[430px]", className)}>
      <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between bg-muted/5">
        <div>
          <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1">Communication Hub</h3>
          <p className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-widest">Notification and Events</p>
        </div>
        <Megaphone className="size-4 text-muted-foreground/80" />
      </div>

      <div className="p-4 divide-y divide-border/20 flex-1 flex flex-col overflow-hidden">
        <Tabs defaultValue="notifications" className="w-full flex-1 flex flex-col overflow-hidden">
          <TabsList className="grid w-full grid-cols-2 bg-muted/30 p-1 h-10 rounded-sm border border-border">
            <TabsTrigger
              value="notifications"
              className="rounded-sm text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all flex items-center gap-2"
            >
              <Bell className="size-3" />
              Feed
              {unreadNotifications > 0 && (
                <span className="bg-rose-500 text-[8px] text-white px-1 minimum-w-[12px] h-3 flex items-center justify-center rounded-full font-black">
                  {unreadNotifications}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="announcements"
              className="rounded-sm text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-card data-[state=active]:shadow-sm transition-all flex items-center gap-2"
            >
              <Megaphone className="size-3" />
              Notices
              {announcements.length > 0 && (
                <span className="size-1.5 rounded-full bg-primary" />
              )}
            </TabsTrigger>

          </TabsList>

          <TabsContent value="notifications" className="mt-0 ring-0 focus-visible:ring-0 flex-1 overflow-hidden">
            <NotificationCenter
              notifications={notifications}
              className="border-0 shadow-none bg-transparent p-0 h-full"
              hideHeader={true}
            />
          </TabsContent>

          <TabsContent value="announcements" className="mt-0 ring-0 focus-visible:ring-0 flex-1 overflow-hidden">
            <AnnouncementWidget
              announcements={announcements}
              className="border-0 shadow-none bg-transparent p-0 h-full"
              hideHeader={true}
            />
          </TabsContent>

        </Tabs>
      </div>

    </div>
  );
}
