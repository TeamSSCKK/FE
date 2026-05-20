import { cn } from "@/shared/lib/utils";
import type { ChipState } from "../model/store";

interface Props {
  label: string;
  state: ChipState;
  onClick: () => void;
}

export function PreferenceChip({ label, state, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
        state === "neutral" && "bg-gray-200 text-gray-700",
        state === "like" &&
          "border-2 border-green-500 bg-green-100 text-green-700",
        state === "dislike" &&
          "border-2 border-red-500 bg-red-100 text-red-700",
      )}
    >
      {label}
    </button>
  );
}
