"use client";

import { Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { useRoomCreateStore } from "../model/store";
import { isValidName } from "../model/validation";
import { ClearButton } from "./ClearButton";
import { StepShell } from "./StepShell";
import { ValidationAlert } from "./ValidationAlert";

export function Step1Name() {
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
        aboveCard={<span>모임 생성을 해보세요.</span>}
        footerAlign="center"
        footer={
          <Button onClick={handleSubmit} className="rounded-full px-6">
            <Sparkles className="mr-1.5 h-4 w-4" />
            모임 생성하기
          </Button>
        }
      >
        <div className="space-y-2">
          <Label htmlFor="room-name">모임 이름</Label>
          <div className="relative">
            <Input
              id="room-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="정아의 생일파티"
              className="bg-background pr-10"
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
