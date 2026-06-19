import { AlertTriangle } from "lucide-react";

/** 장소 추천이 거리 기반 추정(DISTANCE_FALLBACK)으로 산출됐을 때 노출하는 안내. */
export function FallbackNotice() {
  return (
    <div className="mx-5 mt-2 flex items-center gap-1.5 text-[12px] text-muted-foreground">
      <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0 text-yellow-500" />
      이동 시간은 거리 기반 추정치예요.
    </div>
  );
}
