import Link from "next/link";
import { Users, Calendar } from "lucide-react";
import { formatKoreanDateTime } from "@/shared/lib/format-datetime";
import type { RoomStatus } from "@/entities/room";

interface Props {
  status: RoomStatus;
}

function getProgress(s: RoomStatus): { label: string; tone: "wait" | "progress" | "done" } {
  const { totalCount, locationInputCount, preferenceInputCount } = s;
  if (totalCount === 0) return { label: "대기 중", tone: "wait" };
  const filled = locationInputCount + preferenceInputCount;
  const target = totalCount * 2;
  if (filled === 0) return { label: "대기 중", tone: "wait" };
  if (filled >= target) return { label: "입력 완료", tone: "done" };
  return { label: "진행 중", tone: "progress" };
}

const TONE_CLASS: Record<"wait" | "progress" | "done", string> = {
  wait: "bg-neutral-100 text-neutral-600",
  progress: "bg-primary/10 text-primary",
  done: "bg-green-100 text-green-700",
};

export function MyRoomCard({ status }: Props) {
  const { room, members } = status;
  const progress = getProgress(status);

  return (
    <Link
      href={`/rooms/${room.code}`}
      className="group block rounded-2xl border border-neutral-200 bg-white p-4 transition-all duration-150 hover:border-primary/40 hover:shadow-sm active:scale-[0.99]"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="min-w-0 flex-1 truncate text-[15px] font-semibold text-foreground">
          {room.name}
        </h3>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${TONE_CLASS[progress.tone]}`}
        >
          {progress.label}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-1.5 text-[13px] text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        <span>{formatKoreanDateTime(room.dateTime) || "일정 미정"}</span>
      </div>

      <div className="mt-1.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
        <Users className="h-3.5 w-3.5" />
        <span>{members.length}명 참여</span>
      </div>
    </Link>
  );
}
