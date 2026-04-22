"use client";

import { useState, useMemo } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  eachDayOfInterval,
  isToday,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  TooltipProvider
} from "@/components/ui/tooltip";

interface Event {
  id: string;
  title: string;
  type: "HOLIDAY" | "BIRTHDAY" | "ANNOUNCEMENT";
  date: Date;
  description?: string;
}

interface FullCalendarProps {
  initialHolidays: any[];
  initialBirthdays: any[];
  initialAnnouncements: any[];
  className?: string;
}

export function FullCalendar({ initialHolidays, initialBirthdays, initialAnnouncements, className }: FullCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const holidays = useMemo(() => initialHolidays.map(h => ({ ...h, date: new Date(h.date), type: "HOLIDAY" })), [initialHolidays]);
  const birthdays = useMemo(() => (initialBirthdays || []).map(b => ({ ...b, date: new Date(b.date), type: "BIRTHDAY" })), [initialBirthdays]);
  const announcements = useMemo(() => initialAnnouncements.map(a => ({ ...a, date: new Date(a.date), type: "ANNOUNCEMENT" })), [initialAnnouncements]);

  const allEvents = useMemo(() => [...holidays, ...birthdays, ...announcements], [holidays, birthdays, announcements]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate
  });

  const getDayEvents = (day: Date) => {
    return allEvents.filter(event => isSameDay(event.date, day));
  };

  const selectedDayEvents = useMemo(() => getDayEvents(selectedDate), [selectedDate, allEvents]);

  const upcomingEvents = useMemo(() => {
    return allEvents
      .filter(event => isSameMonth(event.date, currentDate))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [currentDate, allEvents]);

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn("flex flex-col lg:flex-row bg-card border border-border rounded-sm overflow-hidden h-[calc(100vh-280px)] lg:h-[calc(100vh-280px)] min-h-[600px] lg:min-h-[600px] animate-in fade-in duration-500", className)}>

        {/* SIDEBAR: Event List */}
        <div className="w-full lg:w-72 border-t lg:border-t-0 lg:border-r border-border flex flex-col shrink-0 bg-muted/5 order-2 lg:order-1">
          <div className="p-4 py-4.5 h-14 border-b border-border bg-background/50 flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <CalendarIcon className="size-3" />
              Schedule
            </h3>
            <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full lowercase">
              {upcomingEvents.length} items
            </span>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide">
            <div className="p-3 space-y-4">
              {/* Selected Day View - Hidden on mobile */}
              <div className="hidden lg:block space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-black uppercase tracking-tighter text-foreground/70">
                    {format(selectedDate, "EEE, MMM d")}
                  </span>
                  {isToday(selectedDate) && (
                    <span className="text-[8px] font-black uppercase text-primary px-1.5 py-0.5 bg-primary/10 rounded-sm">Today</span>
                  )}
                </div>

                <div className="space-y-1">
                  {selectedDayEvents.length > 0 ? (
                    selectedDayEvents.map((event, idx) => (
                      <div key={event.id || idx} className="group flex flex-col gap-1 p-2.5 rounded-sm border border-border/40 bg-background hover:border-primary/20 hover:shadow-sm transition-all">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "size-1.5 rounded-full",
                            event.type === "HOLIDAY" && "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]",
                            event.type === "BIRTHDAY" && "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]",
                            event.type === "ANNOUNCEMENT" && "bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.4)]"
                          )} />
                          <span className="text-[11px] font-bold text-foreground leading-tight">{event.title}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest",
                            event.type === "HOLIDAY" && "text-rose-500/70",
                            event.type === "BIRTHDAY" && "text-amber-500/70",
                            event.type === "ANNOUNCEMENT" && "text-indigo-500/70"
                          )}>
                            {event.type}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 flex flex-col items-center justify-center text-center px-4 rounded-sm border border-dashed border-border/60">
                      <Clock className="size-4 text-muted-foreground/30 mb-2" />
                      <p className="text-[10px] text-muted-foreground font-medium italic">No events scheduled</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Monthly Overview Divider */}
              <div className="pt-2">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-px flex-1 bg-border/60" />
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 whitespace-nowrap">This Month</span>
                  <div className="h-px flex-1 bg-border/60" />
                </div>

                <div className="space-y-1.5">
                  {upcomingEvents.slice(0, 8).map((event, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "flex items-center gap-3 px-2 py-1.5 rounded-sm hover:bg-muted/40 cursor-pointer transition-colors group",
                        isSameDay(event.date, selectedDate) && "bg-primary/5 hover:bg-primary/10"
                      )}
                      onClick={() => {
                        setSelectedDate(event.date);
                        setCurrentDate(event.date);
                      }}
                    >
                      <div className="flex flex-col items-center justify-center min-w-[32px]">
                        <span className="text-[8px] font-black uppercase text-muted-foreground leading-none mb-0.5">{format(event.date, "MMM")}</span>
                        <span className="text-[12px] font-black tabular-nums leading-none">{format(event.date, "dd")}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-bold text-foreground truncate">{event.title}</p>
                        <div className="flex items-center gap-1.5">
                          <div className={cn(
                            "size-1 rounded-full",
                            event.type === "HOLIDAY" && "bg-rose-500",
                            event.type === "BIRTHDAY" && "bg-amber-500",
                            event.type === "ANNOUNCEMENT" && "bg-indigo-500"
                          )} />
                          <span className="text-[8px] font-bold uppercase tracking-tight text-muted-foreground/80">{event.type}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {upcomingEvents.length === 0 && (
                    <p className="text-[9px] text-muted-foreground text-center py-4">No regional events</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Legend */}
          <div className="p-3 border-t border-border bg-background/50 grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5">
              <div className="size-1.5 rounded-full bg-rose-500" />
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tight">Holiday</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="size-1.5 rounded-full bg-amber-500" />
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tight">Birthday</span>
            </div>
            <div className="flex items-center gap-1.5 col-span-2">
              <div className="size-1.5 rounded-full bg-indigo-500" />
              <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tight">Announcement</span>
            </div>
          </div>
        </div>

        {/* MAIN CALENDAR GRID */}
        <div className="flex-1 flex flex-col min-w-0 order-1 lg:order-2">
          {/* Header */}
          <div className="h-14 px-5 border-b border-border flex items-center justify-between bg-background/80 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <h2 className="text-sm font-black text-foreground tracking-tight leading-none">
                  {format(currentDate, "MMMM yyyy")}
                </h2>
                <div className="flex items-center gap-1 mt-1">
                  <div className="size-1 rounded-full bg-primary animate-pulse" />
                  <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">Live Calendar</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-muted/30 p-0.5 rounded-sm border border-border/50">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={prevMonth}
                  className="size-7 hover:bg-background"
                >
                  <ChevronLeft className="size-3.5" />
                </Button>
                <div className="w-px h-3 bg-border mx-0.5" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const today = new Date();
                    setCurrentDate(today);
                    setSelectedDate(today);
                  }}
                  className="h-7 px-3 text-[10px] font-black uppercase tracking-widest hover:bg-background"
                >
                  Today
                </Button>
                <div className="w-px h-3 bg-border mx-0.5" />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={nextMonth}
                  className="size-7 hover:bg-background"
                >
                  <ChevronRight className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 border-b border-border bg-muted/10">
            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, dIdx) => (
              <div key={day} className="py-2 text-center">
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-widest",
                  dIdx === 0 ? "text-rose-500/80" : "text-muted-foreground/60"
                )}>
                  {day.slice(0, 3)}
                </span>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex-1 grid grid-cols-7 divide-x divide-y divide-border/40 overflow-hidden bg-muted/5">
            {calendarDays.map((day, idx) => {
              const events = getDayEvents(day);
              const isSelectedMonth = isSameMonth(day, monthStart);
              const isTodayDay = isToday(day);
              const isSelected = isSameDay(day, selectedDate);
              const isSunday = day.getDay() === 0;
              const isHoliday = events.some(e => e.type === "HOLIDAY");
              const isSpecialDay = isSunday || isHoliday;

              return (
                <div
                  key={idx}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "h-full p-1.5 transition-all relative group cursor-pointer",
                    !isSelectedMonth && "bg-muted/10 opacity-30 cursor-default pointer-events-none",
                    isSelectedMonth && "hover:bg-primary/2",
                    isSelected && isSelectedMonth && "bg-primary/4 ring-1 ring-inset ring-primary/20 z-1",
                    isSpecialDay && isSelectedMonth && !isSelected && "bg-rose-500/1"
                  )}
                >
                  <div className="flex flex-col h-full gap-1">
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-[10px] font-bold tabular-nums min-w-[18px] h-[18px] flex items-center justify-center transition-all",
                        isTodayDay
                          ? "rounded-sm bg-primary text-primary-foreground scale-110 shadow-sm"
                          : isSelected
                            ? "text-primary scale-110"
                            : isSpecialDay
                              ? "text-rose-500/80"
                              : "text-muted-foreground/80"
                      )}>
                        {format(day, "d")}
                      </span>
                    </div>

                    <div className="flex-1 flex flex-col gap-0.5 mt-0.5 overflow-hidden">
                      {events.map((event, eIdx) => (
                        <div
                          key={eIdx}
                          className="flex items-center gap-1.5 px-1 py-0.5 group/event"
                        >
                          <div className={cn(
                            "size-1.5 rounded-full shrink-0",
                            event.type === "HOLIDAY" && "bg-rose-500 shadow-[0_0_4px_rgba(244,63,94,0.4)]",
                            event.type === "BIRTHDAY" && "bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.4)]",
                            event.type === "ANNOUNCEMENT" && "bg-indigo-500 shadow-[0_0_4px_rgba(99,102,241,0.4)]"
                          )} title={event.type} />
                          <span className="text-[9px] font-medium text-foreground/70 truncate hidden md:block uppercase tracking-tight">
                            {event.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
