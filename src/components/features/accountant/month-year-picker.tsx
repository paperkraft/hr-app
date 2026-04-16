"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Provide a reasonable range of years
const YEARS = Array.from({ length: 10 }, (_, i) => 2024 + i); // 2024 to 2033

interface MonthYearPickerProps {
  currentMonth: number;
  currentYear: number;
}

export function MonthYearPicker({ currentMonth, currentYear }: MonthYearPickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleUpdate = (month: number, year: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("m", month.toString());
    params.set("y", year.toString());
    router.push(`/dashboard/accountant?${params.toString()}`);
  };

  const goToPrevious = () => {
    let newMonth = currentMonth - 1;
    let newYear = currentYear;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    handleUpdate(newMonth, newYear);
  };

  const goToNext = () => {
    let newMonth = currentMonth + 1;
    let newYear = currentYear;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    handleUpdate(newMonth, newYear);
  };

    const today = new Date();
    const isFuture = (year: number, month: number) => {
        return year > today.getFullYear() || (year === today.getFullYear() && month > (today.getMonth() + 1));
    };

    const isNextDisabled = isFuture(currentYear, currentMonth + 1) || (currentMonth === 12 && isFuture(currentYear + 1, 1));

    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={goToPrevious} 
          className="size-8 hover:bg-primary/5 hover:text-primary transition-colors"
          title="Previous Month"
        >
          <ChevronLeft className="size-4" />
        </Button>
  
        <div className="flex items-center gap-1.5">
          <Select
            value={currentMonth.toString()}
            onValueChange={(val) => handleUpdate(parseInt(val), currentYear)}
          >
            <SelectTrigger className="w-[130px] h-8 bg-background shadow-none border-border/60 hover:border-primary/50 transition-colors">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent position="popper" align="start" className="min-w-[130px]">
              {MONTHS.map((month, index) => {
                const disabled = isFuture(currentYear, index + 1);
                return (
                  <SelectItem key={month} value={(index + 1).toString()} disabled={disabled}>
                    {month}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
  
          <Select
            value={currentYear.toString()}
            onValueChange={(val) => handleUpdate(currentMonth, parseInt(val))}
          >
            <SelectTrigger className="w-[90px] h-8 bg-background shadow-none border-border/60 hover:border-primary/50 transition-colors">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent position="popper" align="start" className="min-w-[90px]">
              {YEARS.map((year) => {
                const disabled = year > today.getFullYear();
                return (
                  <SelectItem key={year} value={year.toString()} disabled={disabled}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
  
        <Button 
          variant="outline" 
          size="icon" 
          onClick={goToNext} 
          disabled={isNextDisabled}
          className="size-8 hover:bg-primary/5 hover:text-primary transition-colors disabled:opacity-30"
          title="Next Month"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    );
}
