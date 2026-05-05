"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/button";
import { useRoomCreateStore } from "../model/store";
import { isValidDateTime } from "../model/validation";
import {
  combineDateTime,
  formatDatePreview,
  parseDateTime,
  to12h,
  to24h,
} from "../lib/datetime-parts";
import { MonthCalendar } from "./MonthCalendar";
import { Period, TimePicker } from "./TimePicker";
import { StepShell } from "./StepShell";
import { ValidationAlert } from "./ValidationAlert";

export function Step2DateTime() {
  const name = useRoomCreateStore((s) => s.name);
  const dateTime = useRoomCreateStore((s) => s.dateTime);
  const setDateTime = useRoomCreateStore((s) => s.setDateTime);
  const goToStep = useRoomCreateStore((s) => s.goToStep);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const initial = parseDateTime(dateTime);
  const initialPeriod = initial ? to12h(initial.hour24).period : null;
  const initialHour12 = initial ? to12h(initial.hour24).hour12 : null;

  const [selectedDate, setSelectedDate] = useState<Date | null>(
    initial?.date ?? null,
  );
  const [period, setPeriod] = useState<Period | null>(initialPeriod);
  const [hour12, setHour12] = useState<number | null>(initialHour12);
  const [minute, setMinute] = useState<number | null>(initial?.minute ?? null);

  useEffect(() => {
    if (
      selectedDate &&
      period !== null &&
      hour12 !== null &&
      minute !== null
    ) {
      const hour24 = to24h(period, hour12);
      setDateTime(combineDateTime(selectedDate, hour24, minute));
    } else if (dateTime) {
      setDateTime("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, period, hour12, minute]);

  const handleSubmit = () => {
    if (!isValidDateTime(dateTime)) {
      setAlertMessage("모임 날짜와 시간을 모두 선택해주세요.");
      return;
    }
    goToStep(3);
  };

  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const hasPreview =
    selectedDate && period !== null && hour12 !== null && minute !== null;

  return (
    <>
      <StepShell
        onBack={() => goToStep(1)}
        currentStep={2}
        aboveContent={name}
        footer={
          <Button
            onClick={handleSubmit}
            className="h-14 w-full rounded-2xl text-base font-semibold transition-all duration-200 active:scale-[0.98] active:opacity-95"
          >
            다음
          </Button>
        }
      >
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">언제 만나요?</p>
          <div className="min-h-[28px] text-[15px] font-semibold text-foreground">
            {hasPreview ? (
              <span>
                {formatDatePreview(selectedDate)}{" "}
                <span className="text-primary">
                  {period} {hour12}시
                  {minute !== 0 ? ` ${String(minute).padStart(2, "0")}분` : ""}
                </span>
              </span>
            ) : (
              <span className="text-muted-foreground/60">
                날짜와 시간을 선택해주세요
              </span>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-primary/[0.04] p-4">
          <MonthCalendar
            value={selectedDate}
            onChange={setSelectedDate}
            minDate={startOfToday}
          />
        </div>

        <div className="rounded-2xl bg-primary/[0.04] p-4">
          <TimePicker
            period={period}
            hour12={hour12}
            minute={minute}
            onPeriodChange={setPeriod}
            onHour12Change={setHour12}
            onMinuteChange={setMinute}
          />
        </div>
      </StepShell>

      <ValidationAlert
        open={!!alertMessage}
        message={alertMessage ?? ""}
        onClose={() => setAlertMessage(null)}
      />
    </>
  );
}
