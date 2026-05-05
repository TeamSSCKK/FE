"use client";

import { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { formatKoreanDateTime } from "@/shared/lib/format-datetime";
import { useRoomCreateStore } from "../model/store";
import { isValidHost, isValidPassword } from "../model/validation";
import { ClearButton } from "./ClearButton";
import { StepShell } from "./StepShell";
import { ValidationAlert } from "./ValidationAlert";

export function Step3Host() {
  const name = useRoomCreateStore((s) => s.name);
  const dateTime = useRoomCreateStore((s) => s.dateTime);
  const hostName = useRoomCreateStore((s) => s.hostName);
  const password = useRoomCreateStore((s) => s.password);
  const setHostName = useRoomCreateStore((s) => s.setHostName);
  const setPassword = useRoomCreateStore((s) => s.setPassword);
  const submit = useRoomCreateStore((s) => s.submit);
  const isSubmitting = useRoomCreateStore((s) => s.isSubmitting);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleSubmit = () => {
    if (!isValidHost(hostName)) {
      setAlertMessage("주최자 이름을 1자 이상 20자 이하로 입력해주세요.");
      return;
    }
    if (!isValidPassword(password)) {
      setAlertMessage("비밀번호는 4자 이상 20자 이하로 입력해주세요.");
      return;
    }
    void submit();
  };

  return (
    <>
      <StepShell
        aboveCard={<span>{name}</span>}
        footer={
          <Button
            onClick={handleSubmit}
            className="rounded-full px-5"
            size="sm"
            disabled={isSubmitting}
          >
            {isSubmitting ? "생성 중..." : "다음"}
          </Button>
        }
      >
        <p className="text-sm text-muted-foreground">
          {formatKoreanDateTime(dateTime)}
        </p>

        <div className="space-y-2">
          <Label htmlFor="host-name">주최자 정보</Label>
          <div className="relative">
            <Input
              id="host-name"
              value={hostName}
              onChange={(e) => setHostName(e.target.value)}
              placeholder="이름을 입력하세요."
              className="bg-background pr-10"
              maxLength={20}
            />
            {hostName && <ClearButton onClick={() => setHostName("")} />}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="host-password">비밀번호</Label>
          <div className="relative">
            <Input
              id="host-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호를 입력하세요."
              className="bg-background pr-10"
              maxLength={20}
            />
            {password && <ClearButton onClick={() => setPassword("")} />}
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
