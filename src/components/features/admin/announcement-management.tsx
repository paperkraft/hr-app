"use client"

import { useState } from "react"
import { Megaphone, Plus, Trash2, Loader2, AlertCircle, Info, AlertTriangle, Users, Globe } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createAnnouncement, deleteAnnouncement } from "@/actions/announcement"
import { cn } from "@/lib/utils"
import { AnnouncementPriority } from "@prisma/client"

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  targetDepartmentId?: string | null;
  isActive: boolean;
  createdAt: Date;
  author: { name: string | null; email: string };
  targetDepartment?: { name: string } | null;
}

interface AnnouncementManagementProps {
  initialAnnouncements: Announcement[];
  departments: { id: string; name: string }[];
}

export function AnnouncementManagement({ initialAnnouncements, departments }: AnnouncementManagementProps) {
  const [announcements, setAnnouncements] = useState<Announcement[]>(
    initialAnnouncements.map(a => ({ ...a, createdAt: new Date(a.createdAt) }))
  )
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Form State
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [priority, setPriority] = useState<AnnouncementPriority>("INFO")
  const [targetDept, setTargetDept] = useState("all")

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !content) return

    setLoading(true)
    const res = await createAnnouncement({
      title,
      content,
      priority,
      targetDepartmentId: targetDept === "all" ? undefined : targetDept,
    })

    if (res.success && res.data) {
      // Re-fetch to get author info or just append (fetching is safer for full object)
      window.location.reload() // Simple way to refresh complex data
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const res = await deleteAnnouncement(id)
    if (res.success) {
      setAnnouncements(prev => prev.filter(a => a.id !== id))
    }
    setDeletingId(null)
  }

  const priorityColors: Record<AnnouncementPriority, string> = {
    INFO: "text-sky-600 bg-sky-500/5 border-sky-500/10",
    WARNING: "text-amber-600 bg-amber-500/5 border-amber-500/10",
    CRITICAL: "text-rose-600 bg-rose-500/5 border-rose-500/10",
  }

  const PriorityIcon = ({ p, className }: { p: AnnouncementPriority; className?: string }) => {
    if (p === "CRITICAL") return <AlertCircle className={className} />
    if (p === "WARNING") return <AlertTriangle className={className} />
    return <Info className={className} />
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <div className="size-8 rounded-sm flex items-center justify-center border bg-primary/5 text-primary border-border/40">
            <Megaphone className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-0.5">Broadcast Announcement</h3>
            <p className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-widest">Send updates to all or specific departments</p>
          </div>
        </div>
        <div className="p-5">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Title</label>
                <Input
                  placeholder="e.g. Office maintenance tomorrow"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-9 bg-muted/50 border-border rounded-sm text-xs font-bold"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Priority</label>
                  <Select value={priority} onValueChange={(v: any) => setPriority(v)}>
                    <SelectTrigger className="h-9 bg-muted/50 border-border rounded-sm text-xs font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-sm">
                      <SelectItem value="INFO" className="text-xs">Info</SelectItem>
                      <SelectItem value="WARNING" className="text-xs">Warning</SelectItem>
                      <SelectItem value="CRITICAL" className="text-xs">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Target Audience</label>
                  <Select value={targetDept} onValueChange={setTargetDept}>
                    <SelectTrigger className="h-9 bg-muted/50 border-border rounded-sm text-xs font-bold">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-sm">
                      <SelectItem value="all" className="text-xs">All Departments</SelectItem>
                      {departments.map(d => (
                        <SelectItem key={d.id} value={d.id} className="text-xs">{d.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Message Content</label>
              <Textarea
                placeholder="Details of the announcement..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[100px] bg-muted/50 border-border rounded-sm text-xs font-medium resize-none shadow-none focus-visible:ring-0"
                required
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={loading || !title || !content}
                className="h-9 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[11px] uppercase tracking-widest rounded-sm"
              >
                {loading ? <Loader2 className="size-3.5 animate-spin" /> : <><Plus className="size-3.5 mr-1.5" /> Post Announcement</>}
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-sm flex items-center justify-center border bg-sky-500/5 text-sky-600 border-border/40">
              <Globe className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-0.5">Announcement Registry</h3>
              <p className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-widest">Monitor and manage active broadcasts</p>
            </div>
          </div>
        </div>
        <div className="divide-y divide-border/20">
          {announcements.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center gap-2 opacity-30">
              <Megaphone className="size-10 text-muted-foreground" />
              <p className="text-[10px] font-black uppercase tracking-widest">No announcements found</p>
            </div>
          ) : (
            announcements.map((a) => (
              <div key={a.id} className="p-5 hover:bg-muted/5 transition-colors group relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <div className={cn("px-1.5 py-0.5 rounded-sm border text-[8px] font-black uppercase tracking-widest flex items-center gap-1", priorityColors[a.priority])}>
                        <PriorityIcon p={a.priority} className="size-2.5" />
                        {a.priority}
                      </div>
                      <span className="text-[10px] font-bold text-muted-foreground/40 tabular-nums">
                        {format(a.createdAt, "MMM dd, yyyy · HH:mm")}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-foreground mt-1 group-hover:text-primary transition-colors">{a.title}</h4>
                    <p className="text-xs text-muted-foreground/70 leading-relaxed whitespace-pre-wrap line-clamp-2 mt-1">
                      {a.content}
                    </p>
                    <div className="flex items-center gap-3 mt-3">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-muted/30 border border-border/40">
                        <Users className="size-3 text-muted-foreground/60" />
                        <span className="text-[9px] font-black uppercase tracking-wide text-foreground/60">
                          {a.targetDepartment?.name || "All Departments"}
                        </span>
                      </div>
                      <div className="text-[9px] font-bold text-muted-foreground/40 italic">
                        Posted by {a.author.name || a.author.email}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8 text-muted-foreground/20 hover:text-rose-600 hover:bg-rose-500/10 rounded-sm opacity-0 group-hover:opacity-100 transition-all"
                    onClick={() => handleDelete(a.id)}
                    disabled={deletingId === a.id}
                  >
                    {deletingId === a.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
