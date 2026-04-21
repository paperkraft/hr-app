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
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, Palmtree, MapPin, Megaphone, Clock, Cake } from "lucide-react";
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
  type: "HOLIDAY" | "BIRTHDAY" | "ANNOUNCEMENT";
  date?: Date;
  startDate?: Date;
  endDate?: Date;
  category?: string;
  status?: "PENDING" | "APPROVED" | "REJECTED";
}

interface FullCalendarProps {
  initialHolidays: any[];
  initialBirthdays: any[];
  initialAnnouncements: any[];
  className?: string;
}

export function FullCalendar({ initialHolidays, initialBirthdays, initialAnnouncements, className }: FullCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const holidays = initialHolidays.map(h => ({ ...h, date: new Date(h.date) }));
  const birthdays = (initialBirthdays || []).map(b => ({ ...b, date: new Date(b.date) }));
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
    const dayBirthdays = birthdays.filter(b => isSameDay(b.date, day));
    
    return [...dayHolidays, ...dayAnnouncements, ...dayBirthdays];
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
                  "h-full p-2 transition-all relative group overflow-hidden border-border/50",
                  !isSelectedMonth && "bg-muted/10 opacity-30",
                  isSelectedMonth && (isHoliday || isSunday) && "bg-rose-500/5",
                  isSelectedMonth && !isHoliday && !isSunday && "hover:bg-muted/5",
                  isWeekendDay && isSelectedMonth && !isHoliday && !isSunday && "bg-muted/5"
                )}
              >
                <div className="flex flex-col h-full">
                  {/* Date Number Container */}
                  <div className="flex items-center justify-between mb-1">
                    <span className={cn(
                      "text-[10px] font-bold tabular-nums",
                      isTodayDay
                        ? "size-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center"
                        : (isHoliday || isSunday)
                          ? "text-rose-600"
                          : "text-muted-foreground/80"
                    )}>
                      {format(day, "d")}
                    </span>
                  </div>

                  {/* Events Container */}
                  <div className="flex-1 min-w-0 flex flex-col gap-0.5 overflow-y-auto scrollbar-hide">
                    {events.map((event, eIdx) => (
                      <div
                        key={eIdx}
                        className="flex items-center gap-1.5 px-1 py-0.5 group/event cursor-default"
                        title={event.title}
                      >
                        <div className={cn(
                          "size-1.5 rounded-full shrink-0",
                          event.type === "HOLIDAY" && "bg-rose-500",
                          event.type === "ANNOUNCEMENT" && "bg-blue-500",
                          event.type === "BIRTHDAY" && "bg-amber-500"
                        )} />
                        <span className="text-[9px] font-medium text-foreground/80 truncate group-hover/event:text-foreground transition-colors hidden md:block">
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
            <span className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">Employee Birthday</span>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
