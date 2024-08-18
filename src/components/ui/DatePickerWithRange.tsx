"use client";

import * as React from "react";
import { format, addDays, isBefore, isSameDay, isAfter } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import type { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps {
  value: DateRange | undefined;
  onChange: (range: DateRange | undefined) => void;
  className?: string;
}

export function DatePickerWithRange({
  value,
  onChange,
  className,
}: DatePickerWithRangeProps) {
  // Today's date to restrict past selection
  const today = new Date();

  // Function to handle date selection with restrictions
  const handleSelect = (range: DateRange | undefined) => {
    if (range?.from && range.to) {
      const diff =
        (range.to.getTime() - range.from.getTime()) / (1000 * 60 * 60 * 24);
      if (diff > 14) {
        return; // Prevent selecting more than 14 days
      }
    }

    if (
      range?.from &&
      (isBefore(range.from, today) || (range.to && isBefore(range.to, today)))
    ) {
      return; // Prevent selecting dates in the past
    }

    onChange(range);
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !value && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value?.from ? (
              value.to ? (
                <>
                  {format(value.from, "LLL dd, y")} -{" "}
                  {format(value.to, "LLL dd, y")}
                </>
              ) : (
                format(value.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={value?.from}
            selected={value}
            onSelect={handleSelect}
            numberOfMonths={2}
            fromDate={today} // Disable past dates
            toDate={addDays(today, 365)}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
