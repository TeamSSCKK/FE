"use client";

import { cn } from "@/shared/lib/utils";

export type Period = "오전" | "오후";

interface Props {
  period: Period | null;
  hour12: number | null;
  minute: number | null;
  onPeriodChange: (p: Period) => void;
  onHour12Change: (h: number) => void;
  onMinuteChange: (m: number) => void;
}

const HOURS = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const MINUTES = [0, 10, 20, 30, 40, 50];
const PERIODS: Period[] = ["오전", "오후"];

export function TimePicker({
  period,
  hour12,
  minute,
  onPeriodChange,
  onHour12Change,
  onMinuteChange,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        {PERIODS.map((p) => {
          const selected = period === p;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPeriodChange(p)}
              className={cn(
                "h-11 rounded-xl text-[14px] font-semibold transition-all duration-150 active:scale-[0.97]",
                selected
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-primary/5 text-foreground/70 hover:bg-primary/10",
              )}
            >
              {p}
            </button>
          );
        })}
      </div>

      <div>
        <p className="mb-2 text-[11px] font-medium text-muted-foreground">시</p>
        <div className="grid grid-cols-4 gap-2">
          {HOURS.map((h) => {
            const selected = hour12 === h;
            return (
              <button
                key={h}
                type="button"
                onClick={() => onHour12Change(h)}
                className={cn(
                  "h-11 rounded-xl text-[14px] font-semibold transition-all duration-150 active:scale-[0.95]",
                  selected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-primary/5 text-foreground/80 hover:bg-primary/10",
                )}
              >
                {h}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-medium text-muted-foreground">분</p>
        <div className="grid grid-cols-6 gap-2">
          {MINUTES.map((m) => {
            const selected = minute === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => onMinuteChange(m)}
                className={cn(
                  "h-11 rounded-xl text-[14px] font-semibold transition-all duration-150 active:scale-[0.95]",
                  selected
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-primary/5 text-foreground/80 hover:bg-primary/10",
                )}
              >
                {String(m).padStart(2, "0")}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
