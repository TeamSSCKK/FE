import { cn } from "@/shared/lib/utils";

interface Props {
  label: string;
  selected: boolean;
  onClick: () => void;
}

export function RestrictionChip({ label, selected, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full px-4 py-2 text-sm font-medium transition-colors",
        selected
          ? "bg-purple-100 text-purple-700 border-2 border-purple-500"
          : "bg-gray-200 text-gray-700",
      )}
    >
      {label}
    </button>
  );
}
