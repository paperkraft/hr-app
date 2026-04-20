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
    <div className={cn("space-y-4", className)}>
      <Tabs defaultValue="announcements" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/20 p-1 h-11 rounded-sm border border-border/40">
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
        </TabsList>
        <TabsContent value="announcements" className="mt-4 ring-0 focus-visible:ring-0">
          <AnnouncementWidget announcements={announcements} className="border-0 shadow-none bg-transparent p-0" />
        </TabsContent>
        <TabsContent value="notifications" className="mt-4 ring-0 focus-visible:ring-0">
          <NotificationCenter notifications={notifications} className="border-0 shadow-none bg-transparent p-0" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
