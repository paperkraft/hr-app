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
    <div className={cn("bg-card border border-border rounded-sm p-5", className)}>
      <Tabs defaultValue="announcements" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/30 p-1 h-10 rounded-sm border border-border/40 mb-4">
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
        <TabsContent value="announcements" className="mt-0 ring-0 focus-visible:ring-0">
          <AnnouncementWidget 
            announcements={announcements} 
            className="border-0 shadow-none bg-transparent p-0" 
            hideHeader={true}
          />
        </TabsContent>
        <TabsContent value="notifications" className="mt-0 ring-0 focus-visible:ring-0">
          <NotificationCenter 
            notifications={notifications} 
            className="border-0 shadow-none bg-transparent p-0" 
            hideHeader={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
