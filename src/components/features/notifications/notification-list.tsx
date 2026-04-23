"use client";

import { useState, useEffect } from "react";
import { 
  Bell, 
  CheckCircle2, 
  Info, 
  AlertTriangle, 
  XCircle, 
  Trash2, 
  CheckCheck,
  Calendar,
  ExternalLink,
  Search,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification, 
  clearAllNotifications 
} from "@/actions/notification";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";

export function NotificationList() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const fetchNotifications = async () => {
    setLoading(true);
    const result = await getNotifications();
    if (result.success && result.data) {
      setNotifications(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    fetchNotifications();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    fetchNotifications();
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    fetchNotifications();
  };

  const handleClearAll = async () => {
    if (confirm("Are you sure you want to delete all notifications?")) {
      await clearAllNotifications();
      fetchNotifications();
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "WARNING":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "ERROR":
        return <XCircle className="h-5 w-5 text-rose-500" />;
      default:
        return <Info className="h-5 w-5 text-sky-500" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || 
                         n.content.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || !n.isRead;
    return matchesSearch && matchesFilter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-sm shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search notifications..." 
            className="pl-9 h-10 text-xs rounded-sm border-border/60 bg-muted/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex bg-muted/40 p-1 rounded-sm border border-border/40 w-full sm:w-auto">
            <Button
              variant={filter === "all" ? "secondary" : "ghost"}
              size="sm"
              className={cn("h-7 flex-1 sm:flex-none text-[10px] uppercase font-black tracking-widest rounded-sm", filter === "all" && "shadow-sm")}
              onClick={() => setFilter("all")}
            >
              All
            </Button>
            <Button
              variant={filter === "unread" ? "secondary" : "ghost"}
              size="sm"
              className={cn("h-7 flex-1 sm:flex-none text-[10px] uppercase font-black tracking-widest rounded-sm", filter === "unread" && "shadow-sm")}
              onClick={() => setFilter("unread")}
            >
              Unread {unreadCount > 0 && `(${unreadCount})`}
            </Button>
          </div>
          <div className="hidden sm:block w-px h-6 bg-border/40 mx-1" />
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="h-9 flex-1 sm:flex-none text-[10px] uppercase font-black tracking-widest gap-2 bg-primary/2 hover:bg-primary/5 hover:text-primary transition-colors border-primary/10 px-4"
              onClick={handleMarkAllRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              <span className="sm:inline">Mark all read</span>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              className="h-9 flex-1 sm:flex-none text-[10px] uppercase font-black tracking-widest gap-2 opacity-80 hover:opacity-100 transition-all px-4"
              onClick={handleClearAll}
              disabled={notifications.length === 0}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="sm:inline">Clear All</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-card border border-border rounded-sm shadow-sm overflow-hidden min-h-[400px]">
        {loading ? (
          <div className="py-20 text-center animate-pulse opaity-50">
            <Bell className="h-10 w-10 mx-auto mb-4" />
            <p className="text-xs font-black uppercase tracking-widest">Loading history...</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="py-24 text-center flex flex-col items-center gap-4">
            <div className="size-16 rounded-full bg-muted/30 flex items-center justify-center">
              <Bell className="h-8 w-8 text-muted-foreground/30" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">No notifications found</p>
              <p className="text-xs text-muted-foreground mt-1 px-10">We couldn't find any notifications matching your current filters.</p>
            </div>
            {search || filter !== "all" ? (
              <Button 
                variant="link" 
                className="text-[10px] font-black uppercase tracking-widest text-primary"
                onClick={() => { setSearch(""); setFilter("all"); }}
              >
                Clear all filters
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {filteredNotifications.map((n) => (
              <div 
                key={n.id}
                className={cn(
                  "p-5 flex flex-row items-start sm:items-center gap-4 transition-all group hover:bg-muted/5",
                  !n.isRead && "bg-primary/3"
                )}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className={cn(
                    "mt-0.5 size-10 rounded-sm flex items-center justify-center shrink-0 border transition-colors",
                    n.type === "SUCCESS" && "bg-emerald-50 text-emerald-500 border-emerald-100",
                    n.type === "WARNING" && "bg-amber-50 text-amber-500 border-amber-100",
                    n.type === "ERROR" && "bg-rose-50 text-rose-500 border-rose-100",
                    n.type === "INFO" && "bg-sky-50 text-sky-500 border-sky-100",
                  )}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                       <h4 className={cn(
                         "text-sm font-bold tracking-tight truncate",
                         !n.isRead ? "text-foreground" : "text-muted-foreground"
                       )}>
                        {n.title}
                      </h4>
                      {!n.isRead && <span className="size-1.5 rounded-full bg-primary shrink-0" />}
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-ordered font-medium line-clamp-2 sm:line-clamp-none">
                      {n.content}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <div className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 whitespace-nowrap">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(n.createdAt), "PPP p")}
                      </div>
                      {n.link && (
                        <div 
                           className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-primary hover:underline cursor-pointer"
                           onClick={() => router.push(n.link)}
                        >
                          <ExternalLink className="h-3 w-3" />
                          Details
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  {!n.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary hover:bg-primary/5 transition-colors"
                      title="Mark as read"
                      onClick={() => handleMarkAsRead(n.id)}
                    >
                      <CheckCheck className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-50 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all"
                    title="Delete notification"
                    onClick={() => handleDelete(n.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center justify-center py-4">
        <p className="text-[10px] font-black text-muted-foreground/30 uppercase tracking-[0.2em]">
          End of history
        </p>
      </div>
    </div>
  );
}
