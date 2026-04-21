"use client";

import { Calendar, Cake, Gift, ChevronRight, PartyPopper } from "lucide-react";
import { format, isToday, isTomorrow, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

type EventType = "BIRTHDAY" | "ANNIVERSARY" | "HOLIDAY";

interface DashboardEvent {
  id: string;
  name: string;
  date: Date;
  type: EventType;
}

interface Holiday {
  id: string;
  name: string;
  date: Date | string;
}

interface UpcomingMilestonesProps {
  holidays: Holiday[];
  nextBirthday: { name: string | null; date: string | Date } | null;
  nextAnniversary: { name: string | null; date: string | Date; years: number } | null;
}

export function UpcomingMilestones({ holidays: initialHolidays, nextBirthday, nextAnniversary }: UpcomingMilestonesProps) {
  const events: DashboardEvent[] = initialHolidays.map(h => ({
    id: h.id,
    name: h.name,
    date: new Date(h.date),
    type: "HOLIDAY" as EventType
  }));

  if (nextBirthday) {
    events.push({
      id: "bday-next",
      name: `${nextBirthday.name}'s Birthday`,
      date: new Date(nextBirthday.date),
      type: "BIRTHDAY"
    });
  }

  if (nextAnniversary) {
    events.push({
      id: "anniv-next",
      name: `${nextAnniversary.name}'s Work Anniversary (${nextAnniversary.years}y)`,
      date: new Date(nextAnniversary.date),
      type: "ANNIVERSARY"
    });
  }

  // Sort events by date
  const sortedEvents = events.sort((a, b) => a.date.getTime() - b.date.getTime()).slice(0, 10);

  const eventConfigs = {
    BIRTHDAY: { icon: Cake, color: "text-amber-500", bg: "bg-amber-500/10", label: "Birthday" },
    ANNIVERSARY: { icon: Gift, color: "text-sky-500", bg: "bg-sky-500/10", label: "Work Anniv." },
    HOLIDAY: { icon: Calendar, color: "text-rose-500", bg: "bg-rose-500/10", label: "Holiday" }
  };

  return (
    <div className="bg-card border border-border rounded-sm overflow-hidden flex flex-col h-[430px]">
      <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between bg-muted/5">
        <div>
          <h3 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1">Upcoming Events</h3>
          <p className="text-[10px] text-muted-foreground/80 font-black uppercase tracking-widest">Team milestones & holidays</p>
        </div>
        <PartyPopper className="size-4 text-primary/60" />
      </div>

      <div className="divide-y divide-border/20 flex-1 overflow-y-auto scrollbar-hide">
        {sortedEvents.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center gap-2 opacity-20">
            <Calendar className="size-6" />
            <p className="text-[10px] font-black uppercase tracking-widest">The horizon is clear</p>
          </div>
        ) : (
          sortedEvents.map((event) => {
            const today = isToday(event.date);
            const tomorrow = isTomorrow(event.date);
            const daysLeft = differenceInDays(event.date, new Date());
            const config = eventConfigs[event.type];

            return (
              <div key={event.id} className="px-5 py-3.5 flex items-center justify-between group hover:bg-muted/5 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn(
                    "size-9 rounded-sm border flex flex-col items-center justify-center shrink-0 transition-colors",
                    today ? "bg-primary/10 border-primary/20" : "bg-muted/50 border-border"
                  )}>
                    <span className={cn(
                      "text-[8px] font-black uppercase leading-none",
                      today ? "text-primary" : "text-muted-foreground/60"
                    )}>{format(event.date, "MMM")}</span>
                    <span className="text-sm font-bold text-foreground leading-none mt-0.5">{format(event.date, "dd")}</span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-foreground truncate group-hover:text-primary transition-colors flex items-center gap-1.5">
                      {event.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn("text-[8px] font-black uppercase px-1.5 py-0.5 rounded-[2px]", config.bg, config.color)}>
                        {config.label}
                      </span>
                      <p className="text-[9px] text-muted-foreground/50 font-bold uppercase tracking-tight">
                        {today ? (
                          <span className="text-primary font-black animate-pulse uppercase tracking-widest">Celebrating Today</span>
                        ) : tomorrow ? (
                          "Tomorrow"
                        ) : (
                          `${format(event.date, "EEEE")} · In ${daysLeft} days`
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <config.icon className={cn("size-3.5 opacity-20 group-hover:opacity-100 transition-all", config.color)} />
              </div>
            );
          })
        )}
      </div>

      <Link
        href="/dashboard/calendar"
        className="px-5 py-3 border-t border-border/20 bg-muted/5 group/link cursor-pointer hover:bg-muted/10 transition-colors block"
      >
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Open Company Calendar</span>
          <ChevronRight className="size-3 text-muted-foreground/40 group-hover/link:text-primary group-hover/link:translate-x-0.5 transition-all" />
        </div>
      </Link>
    </div>
  );
}
