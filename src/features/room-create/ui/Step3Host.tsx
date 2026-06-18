"use client";

import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { formatKoreanDateTime } from "@/shared/lib/format-datetime";
import { useRoomCreateStore } from "../model/store";
import { isValidHost } from "../model/validation";
import { ClearButton } from "@/shared/ui/clear-button";
import { SoftInput } from "./SoftInput";
import { StepShell } from "./StepShell";
import { ValidationAlert } from "./ValidationAlert";
import { useState } from "react";

export function Step3Host() {
  const name = useRoomCreateStore((s) => s.name);
  const dateTime = useRoomCreateStore((s) => s.dateTime);
  const hostName = useRoomCreateStore((s) => s.hostName);
  const setHostName = useRoomCreateStore((s) => s.setHostName);
  const goToStep = useRoomCreateStore((s) => s.goToStep);
  const submit = useRoomCreateStore((s) => s.submit);
  const isSubmitting = useRoomCreateStore((s) => s.isSubmitting);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!isValidHost(hostName)) {
      setAlertMessage("주최자 이름을 1자 이상 20자 이하로 입력해주세요.");
      return;
    }
    void submit();
  };

  return (
    <>
      <StepShell
        onBack={() => goToStep(2)}
        currentStep={3}
        aboveContent={
          <span>
            {name}
            <span className="ml-2 text-muted-foreground">
              · {formatKoreanDateTime(dateTime)}
            </span>
          </span>
        }
        footer={
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="h-14 w-full rounded-2xl text-base font-semibold transition-all duration-200 active:scale-[0.98] active:opacity-95 disabled:opacity-60"
          >
            {isSubmitting ? "생성 중..." : "다음"}
          </Button>
        }
      >
        <div className="space-y-2">
          <Label htmlFor="host-name" className="text-sm text-muted-foreground">
            주최자 이름
          </Label>
          <div className="relative">
            <SoftInput
              id="host-name"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="pr-11"
              maxLength={20}
            />
            {hostName && <ClearButton onClick={() => setHostName("")} />}
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
