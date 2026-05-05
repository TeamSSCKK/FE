"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { getMonthGrid, isSameDay } from "../lib/datetime-parts";

interface Props {
  value: Date | null;
  onChange: (d: Date) => void;
  minDate?: Date;
}

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

export function MonthCalendar({ value, onChange, minDate }: Props) {
  const today = new Date();
  const initial = value ?? today;
  const [view, setView] = useState({
    year: initial.getFullYear(),
    month: initial.getMonth(),
  });

  const cells = getMonthGrid(view.year, view.month);
  const minTime = minDate
    ? new Date(
        minDate.getFullYear(),
        minDate.getMonth(),
        minDate.getDate(),
      ).getTime()
    : null;

  const handlePrev = () => {
    setView((v) =>
      v.month === 0
        ? { year: v.year - 1, month: 11 }
        : { year: v.year, month: v.month - 1 },
    );
  };
  const handleNext = () => {
    setView((v) =>
      v.month === 11
        ? { year: v.year + 1, month: 0 }
        : { year: v.year, month: v.month + 1 },
    );
  };

  return (
    <div>
      <div className="mb-3 flex items-center justify-between px-1">
        <button
          type="button"
          aria-label="이전 달"
          onClick={handlePrev}
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-all duration-150 hover:bg-primary/5 hover:text-foreground active:scale-95"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.25} />
        </button>
        <div className="text-[15px] font-bold tracking-tight">
          {view.year}년 {view.month + 1}월
        </div>
        <button
          type="button"
          aria-label="다음 달"
          onClick={handleNext}
          className="flex h-9 w-9 items-center justify-center rounded-full text-foreground/70 transition-all duration-150 hover:bg-primary/5 hover:text-foreground active:scale-95"
        >
          <ChevronRight className="h-5 w-5" strokeWidth={2.25} />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-y-1 px-1">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={cn(
              "py-2 text-center text-[11px] font-semibold",
              i === 0 && "text-rose-500/80",
              i === 6 && "text-blue-500/80",
              i !== 0 && i !== 6 && "text-muted-foreground",
            )}
          >
            {w}
          </div>
        ))}
        {cells.map((d, idx) => {
          if (!d) return <div key={`b-${idx}`} className="aspect-square" />;

          const isPast = minTime !== null && d.getTime() < minTime;
          const isSelected = value ? isSameDay(d, value) : false;
          const isToday = isSameDay(d, today);
          const weekday = idx % 7;

          return (
            <button
              key={d.toISOString()}
              type="button"
              disabled={isPast}
              onClick={() => onChange(d)}
              className={cn(
                "mx-auto flex aspect-square w-full max-w-[40px] items-center justify-center rounded-full text-[14px] font-medium transition-all duration-150 active:scale-90",
                isSelected && "bg-primary text-primary-foreground shadow-sm",
                !isSelected && isToday && "ring-1 ring-primary/40",
                !isSelected && !isPast && weekday === 0 && "text-rose-500",
                !isSelected && !isPast && weekday === 6 && "text-blue-500",
                !isSelected &&
                  !isPast &&
                  weekday !== 0 &&
                  weekday !== 6 &&
                  "text-foreground hover:bg-primary/5",
                isPast && "cursor-not-allowed text-foreground/25",
              )}
            >
              {d.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}
