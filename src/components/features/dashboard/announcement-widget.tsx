"use client"

import { Megaphone, AlertCircle, AlertTriangle, Info, ChevronRight, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { AnnouncementPriority } from "@prisma/client"

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  createdAt: Date;
  targetDepartment?: { name: string } | null;
}

interface AnnouncementWidgetProps {
  announcements: Announcement[];
  className?: string;
}

export function AnnouncementWidget({ announcements: initialAnnouncements, className }: AnnouncementWidgetProps) {
  const announcements = initialAnnouncements.map(a => ({ ...a, createdAt: new Date(a.createdAt) }))

  const priorityColors: Record<AnnouncementPriority, string> = {
    INFO: "text-sky-600 bg-sky-500/5",
    WARNING: "text-amber-600 bg-amber-500/5",
    CRITICAL: "text-rose-600 bg-rose-500/5",
  }

  const borderColors: Record<AnnouncementPriority, string> = {
    INFO: "border-sky-500/10",
    WARNING: "border-amber-500/10",
    CRITICAL: "border-rose-500/20",
  }

  const PriorityIcon = ({ p, className }: { p: AnnouncementPriority; className?: string }) => {
    if (p === "CRITICAL") return <AlertCircle className={cn("size-3.5", className)} />
    if (p === "WARNING") return <AlertTriangle className={cn("size-3.5", className)} />
    return <Info className={cn("size-3.5", className)} />
  }

  return (
    <div className={cn("bg-card border border-border rounded-sm overflow-hidden flex flex-col", className)}>
      <div className="px-5 py-3 border-b border-border/40 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1">Notice Board</h3>
          <p className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-widest text-xs">Broadcasts</p>
        </div>
        <div className="relative">
          <Megaphone className="size-3.5 text-muted-foreground/80" />
          {announcements.some(a => a.priority === "CRITICAL") && (
            <span className="absolute -top-1 -right-1 size-1.5 bg-rose-500 rounded-full animate-pulse border border-card" />
          )}
        </div>
      </div>

      <div className="flex-1 divide-y divide-border/20 overflow-y-auto scrollbar-hide max-h-[280px]">
        {announcements.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center gap-2 opacity-20 px-8">
            <MessageSquare className="size-5" />
            <p className="text-[10px] font-black uppercase tracking-widest">No active notices</p>
          </div>
        ) : (
          announcements.map((a) => (
            <div key={a.id} className={cn(
              "px-5 py-3.5 transition-colors group relative",
              a.priority === "CRITICAL" ? "bg-rose-500/2" : "hover:bg-muted/5"
            )}>
              <div className="flex items-start gap-3">
                <div className={cn(
                  "size-7 rounded-sm border flex items-center justify-center shrink-0",
                  priorityColors[a.priority],
                  borderColors[a.priority]
                )}>
                  <PriorityIcon p={a.priority} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/40 tabular-nums">
                      {format(a.createdAt, "MMM dd")}
                    </span>
                    {a.targetDepartment && (
                      <span className="text-[7px] font-black uppercase px-1 py-0.5 rounded-full bg-muted text-muted-foreground/60 border border-border/40">
                        {a.targetDepartment.name}
                      </span>
                    )}
                  </div>
                  <h4 className={cn(
                    "text-[11px] font-bold mt-0.5 leading-tight",
                    a.priority === "CRITICAL" ? "text-rose-600" : "text-foreground"
                  )}>{a.title}</h4>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5 line-clamp-1 leading-relaxed">
                    {a.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
