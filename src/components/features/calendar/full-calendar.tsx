"use client";

import { useState } from "react";
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
  isWeekend,
  isToday,
  startOfDay
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, Palmtree, MapPin, Megaphone, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";

interface Event {
  id: string;
  title: string;
  type: "HOLIDAY" | "LEAVE" | "ANNOUNCEMENT";
  date?: Date;
  startDate?: Date;
  endDate?: Date;
  category?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
}

interface FullCalendarProps {
  initialHolidays: any[];
  initialLeaves: any[];
  initialAnnouncements: any[];
  className?: string;
}

export function FullCalendar({ initialHolidays, initialLeaves, initialAnnouncements, className }: FullCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const holidays = initialHolidays.map(h => ({ ...h, date: new Date(h.date) }));
  const leaves = initialLeaves.map(l => ({ ...l, startDate: new Date(l.startDate), endDate: new Date(l.endDate) }));
  const announcements = initialAnnouncements.map(a => ({ ...a, date: new Date(a.date) }));

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
    const dayHolidays = holidays.filter(h => isSameDay(h.date, day));
    const dayAnnouncements = announcements.filter(a => isSameDay(a.date, day));
    const dayLeaves = leaves.filter(l => {
      const dayStart = startOfDay(day);
      const leaveStart = startOfDay(new Date(l.startDate));
      const leaveEnd = startOfDay(new Date(l.endDate));
      return dayStart >= leaveStart && dayStart <= leaveEnd;
    });
    return [...dayHolidays, ...dayAnnouncements, ...dayLeaves];
  };

  return (
    <TooltipProvider delayDuration={0}>
      <div className={cn("bg-card border border-border rounded-sm overflow-hidden flex flex-col h-[calc(100vh-240px)] animate-fade-in", className)}>
        {/* Calendar Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-muted/5 shrink-0">
          <div className="flex items-center gap-4">
            <div className="size-8 rounded-sm bg-primary/10 text-primary hidden md:flex items-center justify-center border border-primary/20">
              <CalendarIcon className="size-4" />
            </div>
            <div>
              <h2 className="text-md font-bold text-foreground tracking-tight leading-none mb-1">
                {format(currentDate, "MMMM yyyy")}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevMonth}
              className="size-8"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date())}
              className="h-8 px-4"
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
              className="size-8"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 border-b border-border bg-muted/50 shrink-0">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, dIdx) => (
            <div key={day} className="py-2.5 text-center">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest",
                dIdx === 0 ? "text-rose-600" : "text-muted-foreground"
              )}>
                {day}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 grid-rows-[repeat(6,1fr)] divide-x divide-y min-h-0 overflow-hidden">
          {calendarDays.map((day, idx) => {
            const events = getDayEvents(day);
            const isSelectedMonth = isSameMonth(day, monthStart);
            const isTodayDay = isToday(day);
            const isWeekendDay = isWeekend(day);
            const isHoliday = events.some(e => e.type === "HOLIDAY");
            const isSunday = day.getDay() === 0;

            return (
              <div
                key={idx}
                className={cn(
                  "h-full p-4 transition-all relative group overflow-hidden border-border/50",
                  !isSelectedMonth && "bg-muted/10 opacity-30",
                  isSelectedMonth && (isHoliday || isSunday) && "bg-rose-500/5",
                  isSelectedMonth && !isHoliday && !isSunday && "hover:bg-muted/5",
                  isWeekendDay && isSelectedMonth && !isHoliday && !isSunday && "bg-muted/5"
                )}
              >
                <div className="flex flex-col md:flex-row md:items-start md:gap-2 h-full">
                  {/* Date Number Container */}
                  <div className="flex items-center justify-center md:justify-start shrink-0">
                    <span className={cn(
                      "text-[10px] font-bold tabular-nums",
                      isTodayDay
                        ? "size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center -ml-1 -mt-1 md:-ml-0.5 md:-mt-0.5"
                        : (isHoliday || isSunday)
                          ? "text-rose-600"
                          : "text-muted-foreground/80"
                    )}>
                      {format(day, "d")}
                    </span>
                  </div>

                  {/* Events Container */}
                  <div className="flex-1 min-w-0 mt-1 md:mt-0 flex justify-center md:block">
                    {/* Desktop View */}
                    <div className="hidden md:block space-y-1 overflow-y-auto max-h-[100px] scrollbar-hide">
                      {events.map((event, eIdx) => (
                        <div
                          key={eIdx}
                          className={cn(
                            "px-2 py-1 rounded-sm text-[9px] font-bold truncate transition-all flex items-center gap-1.5 border",
                            event.type === "HOLIDAY" && "bg-rose-500/10 text-rose-600 border-rose-500/20",
                            event.type === "ANNOUNCEMENT" && "bg-blue-500/10 text-blue-600 border-blue-500/20",
                            event.type === "LEAVE" && (
                              event.status === "PENDING"
                                ? "bg-amber-500/5 text-amber-600/70 border-amber-500/20 border-dashed"
                                : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                            )
                          )}
                          title={`${event.title}${event.status === "PENDING" ? " (Pending)" : ""}`}
                        >
                          {event.type === "HOLIDAY" && <Palmtree className="size-2.5 shrink-0" />}
                          {event.type === "ANNOUNCEMENT" && <Megaphone className="size-2.5 shrink-0" />}
                          {event.type === "LEAVE" && (
                            event.status === "PENDING"
                              ? <Clock className="size-2.5 shrink-0 animate-pulse" />
                              : <User className="size-2.5 shrink-0" />
                          )}
                          <span className="truncate flex-1 min-w-0">{event.title}</span>
                        </div>
                      ))}
                    </div>

                    {/* Mobile View */}
                    <div className="flex md:hidden flex-wrap gap-1">
                      {events.length > 0 && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex gap-0.5">
                              {events.map((event, eIdx) => (
                                <div
                                  key={eIdx}
                                  className={cn(
                                    "size-1.5 rounded-full shrink-0",
                                    event.type === "HOLIDAY" && "bg-rose-600",
                                    event.type === "ANNOUNCEMENT" && "bg-blue-600",
                                    event.type === "LEAVE" && (event.status === "PENDING" ? "bg-amber-600 opacity-40 ring-1 ring-amber-600 ring-offset-1" : "bg-amber-600")
                                  )}
                                />
                              ))}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="flex flex-col gap-1.5 p-3" side="top">
                            {events.map((event, eIdx) => (
                              <div key={eIdx} className="flex items-center gap-2 text-[10px] font-bold">
                                <div className={cn(
                                  "size-1.5 rounded-full",
                                  event.type === "HOLIDAY" && "bg-rose-600",
                                  event.type === "ANNOUNCEMENT" && "bg-blue-600",
                                  event.type === "LEAVE" && "bg-amber-600"
                                )} />
                                <span className="opacity-80 font-black uppercase tracking-widest text-[8px]">{event.type}</span>
                                <span className="text-white">{event.title}</span>
                              </div>
                            ))}
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend Footer */}
        <div className="px-6 py-3 border-t border-border bg-muted/50 flex items-center gap-6 shrink-0">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-rose-500" />
            <span className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Public Holiday</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-blue-500" />
            <span className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Announcement</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-amber-500" />
            <span className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Staff Leave</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
