"use client"

import { useState } from "react"
import { Calendar as CalendarIcon, Plus, Trash2, Loader2, PartyPopper } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { addHoliday, deleteHoliday } from "@/actions/holiday"
import { cn } from "@/lib/utils"

interface Holiday {
  id: string;
  name: string;
  date: Date;
}

interface HolidayManagementProps {
  initialHolidays: any[];
}

export function HolidayManagement({ initialHolidays }: HolidayManagementProps) {
  const [holidays, setHolidays] = useState<Holiday[]>(
    initialHolidays.map(h => ({ ...h, date: new Date(h.date) }))
  )
  const [name, setName] = useState("")
  const [date, setDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !date) return

    setLoading(true)
    const res = await addHoliday(name, new Date(date))
    if (res.success && res.data) {
      setHolidays(prev => [...prev, { ...res.data, date: new Date(res.data.date) }].sort((a, b) => a.date.getTime() - b.date.getTime()))
      setName("")
      setDate("")
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    const res = await deleteHoliday(id)
    if (res.success) {
      setHolidays(prev => prev.filter(h => h.id !== id))
    }
    setDeletingId(null)
  }

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <div className="size-8 rounded-sm flex items-center justify-center border bg-primary/5 text-primary border-border/40">
            <Plus className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-0.5">Add Public Holiday</h3>
            <p className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-widest">Register company-wide calendar exclusions</p>
          </div>
        </div>
        <div className="p-5">
          <form onSubmit={handleAdd} className="flex flex-col md:flex-row items-end gap-4">
            <div className="flex-1 space-y-1.5 w-full">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Holiday Name</label>
              <Input
                placeholder="e.g. Independence Day"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-9 bg-muted/50 border-border rounded-sm text-xs font-bold"
                required
              />
            </div>
            <div className="flex-1 space-y-1.5 w-full">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/80">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 bg-muted/50 border-border rounded-sm text-xs font-bold"
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading || !name || !date}
              className="h-9 px-6 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-[11px] uppercase tracking-widest rounded-sm shrink-0"
            >
              {loading ? <Loader2 className="size-3.5 animate-spin" /> : <><Plus className="size-3.5 mr-1.5" /> Add Holiday</>}
            </Button>
          </form>
        </div>
      </div>

      <div className="bg-card border border-border rounded-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center gap-3">
          <div className="size-8 rounded-sm flex items-center justify-center border bg-emerald-500/5 text-emerald-600 border-border/40">
            <CalendarIcon className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-0.5">Holiday Schedule</h3>
            <p className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-widest">Master list of recognized holidays</p>
          </div>
        </div>
        <div className="divide-y divide-border/20">
          {holidays.length === 0 ? (
            <div className="py-12 text-center flex flex-col items-center gap-2 opacity-30">
              <PartyPopper className="size-8 text-muted-foreground" />
              <p className="text-[10px] font-black uppercase tracking-widest">No holidays registered</p>
            </div>
          ) : (
            holidays.map((holiday) => (
              <div key={holiday.id} className="px-5 py-4 flex items-center justify-between group hover:bg-muted/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="size-10 rounded-sm bg-muted/50 border border-border flex flex-col items-center justify-center shrink-0">
                    <span className="text-[9px] font-black uppercase text-primary/60 leading-none">{format(holiday.date, "MMM")}</span>
                    <span className="text-sm font-bold text-foreground leading-none mt-0.5">{format(holiday.date, "dd")}</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{holiday.name}</p>
                    <p className="text-[10px] text-muted-foreground/50 font-bold uppercase tracking-tight">{format(holiday.date, "EEEE, yyyy")}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-muted-foreground/40 hover:text-rose-600 hover:bg-rose-500/10 rounded-sm opacity-0 group-hover:opacity-100 transition-all"
                  onClick={() => handleDelete(holiday.id)}
                  disabled={deletingId === holiday.id}
                >
                  {deletingId === holiday.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                </Button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
