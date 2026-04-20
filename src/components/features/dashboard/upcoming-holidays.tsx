"use client"

import { Calendar, PartyPopper, ChevronRight } from "lucide-react"
import { format, isToday, isTomorrow, differenceInDays } from "date-fns"
import { cn } from "@/lib/utils"

interface Holiday {
  id: string;
  name: string;
  date: Date;
}

interface UpcomingHolidaysProps {
  holidays: any[];
}

export function UpcomingHolidays({ holidays: initialHolidays }: UpcomingHolidaysProps) {
  const holidays = initialHolidays.map(h => ({ ...h, date: new Date(h.date) }))

  return (
    <div className="bg-card border border-border rounded-sm overflow-hidden flex flex-col">
      <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1">Upcoming Holidays</h3>
          <p className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-widest">Company calendar</p>
        </div>
        <Calendar className="size-4 text-muted-foreground/80" />
      </div>

      <div className="divide-y divide-border/20 flex-1">
        {holidays.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center gap-2 opacity-20">
            <Calendar className="size-6" />
            <p className="text-[10px] font-black uppercase tracking-widest">No upcoming holidays</p>
          </div>
        ) : (
          holidays.map((holiday) => {
            const today = isToday(holiday.date)
            const tomorrow = isTomorrow(holiday.date)
            const daysLeft = differenceInDays(holiday.date, new Date())

            return (
              <div key={holiday.id} className="px-5 py-3.5 flex items-center justify-between group hover:bg-muted/5 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "size-9 rounded-sm border flex flex-col items-center justify-center shrink-0 transition-colors",
                    today ? "bg-primary/10 border-primary/20" : "bg-muted/50 border-border"
                  )}>
                    <span className={cn(
                      "text-[8px] font-black uppercase leading-none",
                      today ? "text-primary" : "text-primary/60"
                    )}>{format(holiday.date, "MMM")}</span>
                    <span className="text-sm font-bold text-foreground leading-none mt-0.5">{format(holiday.date, "dd")}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-foreground truncate group-hover:text-primary transition-colors">{holiday.name}</p>
                    <p className="text-[9px] text-muted-foreground/50 font-bold uppercase tracking-tight">
                      {today ? (
                        <span className="text-primary font-black animate-pulse">Today</span>
                      ) : tomorrow ? (
                        "Tomorrow"
                      ) : (
                        `${format(holiday.date, "EEEE")} · In ${daysLeft} days`
                      )}
                    </p>
                  </div>
                </div>
                {today && (
                  <div className="size-2 rounded-full bg-primary animate-ping" />
                )}
              </div>
            )
          })
        )}
      </div>
      
      {holidays.length > 0 && (
        <div className="px-5 py-3 border-t border-border/20 bg-muted/5 group/link cursor-pointer hover:bg-muted/10 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">View Full Calendar</span>
            <ChevronRight className="size-3 text-muted-foreground/40 group-hover/link:text-primary group-hover/link:translate-x-0.5 transition-all" />
          </div>
        </div>
      )}
    </div>
  )
}
