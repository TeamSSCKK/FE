"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useRoomCreateStore } from "../model/store";
import { isValidDateTime } from "../model/validation";
import { ClearButton } from "./ClearButton";
import { StepShell } from "./StepShell";
import { ValidationAlert } from "./ValidationAlert";

export function Step2DateTime() {
  const name = useRoomCreateStore((s) => s.name);
  const dateTime = useRoomCreateStore((s) => s.dateTime);
  const setDateTime = useRoomCreateStore((s) => s.setDateTime);
  const goToStep = useRoomCreateStore((s) => s.goToStep);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!isValidDateTime(dateTime)) {
      setAlertMessage("모임 날짜와 시간을 선택해주세요.");
      return;
    }
    goToStep(3);
  };

  return (
    <>
      <StepShell
        aboveCard={<span>{name}</span>}
        footer={
          <Button onClick={handleSubmit} className="rounded-full px-5" size="sm">
            다음
          </Button>
        }
      >
        <div className="space-y-2">
          <Label htmlFor="room-datetime">모임 날짜 및 시간</Label>
          <div className="relative">
            <Input
              id="room-datetime"
              type="datetime-local"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="bg-background pr-10"
            />
            {dateTime && <ClearButton onClick={() => setDateTime("")} />}
          </div>
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
