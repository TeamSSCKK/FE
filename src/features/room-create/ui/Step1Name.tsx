"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Label } from "@/shared/ui/label";
import { useRoomCreateStore } from "../model/store";
import { isValidName } from "../model/validation";
import { ClearButton } from "@/shared/ui/clear-button";
import { SoftInput } from "./SoftInput";
import { StepShell } from "./StepShell";
import { ValidationAlert } from "./ValidationAlert";

export function Step1Name() {
  const router = useRouter();
  const name = useRoomCreateStore((s) => s.name);
  const setName = useRoomCreateStore((s) => s.setName);
  const goToStep = useRoomCreateStore((s) => s.goToStep);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!isValidName(name)) {
      setAlertMessage("모임 이름을 1자 이상 30자 이하로 입력해주세요.");
      return;
    }
    goToStep(2);
  };

  return (
    <>
      <StepShell
        onBack={() => router.push("/")}
        currentStep={1}
        aboveContent="어떤 모임이에요?"
        footer={
          <Button
            onClick={handleSubmit}
            className="h-14 w-full rounded-2xl text-base font-semibold transition-all duration-200 active:scale-[0.98] active:opacity-95"
          >
            모임 생성하기
          </Button>
        }
      >
        <div className="space-y-2">
          <Label htmlFor="room-name" className="text-sm text-muted-foreground">
            모임 이름
          </Label>
          <div className="relative">
            <SoftInput
              id="room-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="예: 정아의 생일파티"
              className="pr-11"
              maxLength={30}
            />
            {name && <ClearButton onClick={() => setName("")} />}
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
