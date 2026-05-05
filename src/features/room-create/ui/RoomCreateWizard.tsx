"use client";

import { useEffect } from "react";
import { useRoomCreateStore } from "../model/store";
import { Step1Name } from "./Step1Name";
import { Step2DateTime } from "./Step2DateTime";
import { Step3Host } from "./Step3Host";
import { Step4ShareLink } from "./Step4ShareLink";

export function RoomCreateWizard() {
  const step = useRoomCreateStore((s) => s.step);
  const reset = useRoomCreateStore((s) => s.reset);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  switch (step) {
    case 1:
      return <Step1Name />;
    case 2:
      return <Step2DateTime />;
    case 3:
      return <Step3Host />;
    case 4:
      return <Step4ShareLink />;
  }
}
