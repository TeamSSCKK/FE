"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  fetchRoomStatus,
  type Room,
  type Location,
} from "@/entities/room";
import { setMeetingLocation } from "@/entities/room/api/set-meeting-location";
import { loadMemberId, saveMemberId } from "@/shared/lib/room-session";
import { formatKoreanDateTime } from "@/shared/lib/format-datetime";
import { NaverMap, reverseGeocode } from "@/widgets/naver-map";
import {
  ModeToggle,
  AddressSearchOverlay,
  SelectedLocationCard,
  SubmitButton,
  CurrentLocationButton,
  useLocationInputStore,
  getCurrentPosition,
  type PlaceSearchItem,
} from "@/features/location-input";

const SEOUL_CITY_HALL = { lat: 37.5666, lng: 126.9784 };

interface Props {
  code: string;
}

export function CurationMeetingLocationView({ code }: Props) {
  const router = useRouter();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  // 연속 idle 시 느린 reverseGeocode 응답이 최신을 덮어쓰지 않도록 하는 시퀀스 카운터
  const idleSeqRef = useRef(0);

  const mode = useLocationInputStore((s) => s.mode);
  const selected = useLocationInputStore((s) => s.selected);
  const setSelected = useLocationInputStore((s) => s.setSelected);
  const clearResults = useLocationInputStore((s) => s.clearResults);
  const isSubmitting = useLocationInputStore((s) => s.isSubmitting);
  const setIsSubmitting = useLocationInputStore((s) => s.setIsSubmitting);
  const reset = useLocationInputStore((s) => s.reset);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  useEffect(() => {
    let canceled = false;

    async function bootstrap() {
      try {
        const status = await fetchRoomStatus(code);
        if (canceled) return;
        setRoom(status.room);

        // 호스트 가드 — 모임 장소 결정은 호스트 전용. 멤버/게스트는 방으로 되돌린다.
        let mid = loadMemberId(code);
        if (!mid || !status.members.some((m) => m.id === mid)) {
          // stale sessionStorage 또는 미진입 — 호스트 단말이면 host id 재흡수
          const stored = localStorage.getItem(`room-${code}`);
          if (stored) {
            const host = status.members.find((m) => m.isHost);
            if (host) {
              saveMemberId(code, host.id);
              mid = host.id;
            }
          }
        }

        if (!mid) {
          router.replace(`/rooms/${code}`);
          return;
        }

        const me = status.members.find((m) => m.id === mid);
        if (!me?.isHost) {
          router.replace(`/rooms/${code}`);
          return;
        }

        setMemberId(mid);
      } catch (e) {
        if (!canceled) {
          setLoadError(e instanceof Error ? e.message : "모임 정보를 불러오지 못했어요.");
        }
      }
    }

    void bootstrap();
    return () => {
      canceled = true;
    };
  }, [code, router]);

  // 지도 모드 진입 + 지도 ready + selected 없을 때 1회 자동 GPS
  useEffect(() => {
    if (mode !== "map") return;
    if (!mapReady) return;
    if (selected) return;

    let canceled = false;

    async function autoLocate() {
      let coords = SEOUL_CITY_HALL;
      let label = "현재 위치";
      try {
        coords = await getCurrentPosition();
      } catch {
        label = "위치 권한 없음 — 기본 위치";
      }
      if (canceled) return;

      let roadAddress = "";
      let jibunAddress = "";
      try {
        const r = await reverseGeocode(coords);
        roadAddress = r.roadAddress;
        jibunAddress = r.jibunAddress;
      } catch {
        // ignore — 주소 못 얻어도 좌표는 살아있음
      }
      if (canceled) return;

      setSelected({ label, coords, roadAddress, jibunAddress });
    }

    void autoLocate();
    return () => {
      canceled = true;
    };
  }, [mode, mapReady, selected, setSelected]);

  // 센터 핀: 지도를 움직여 멈춘 순간의 중심 좌표를 출발지로 잡는다.
  const handleMapIdle = useCallback(
    async (coords: { lat: number; lng: number }) => {
      const seq = ++idleSeqRef.current;
      let roadAddress = "";
      let jibunAddress = "";
      try {
        const r = await reverseGeocode(coords);
        roadAddress = r.roadAddress;
        jibunAddress = r.jibunAddress;
      } catch {
        // 주소를 못 얻어도 좌표는 유효 — 핀 위치는 살아있다
      }
      // 그 사이 새 idle이 발생했으면 stale 응답이므로 폐기
      if (seq !== idleSeqRef.current) return;
      setSelected({
        label: roadAddress || jibunAddress || "지도에서 선택한 위치",
        coords,
        roadAddress,
        jibunAddress,
      });
    },
    [setSelected],
  );

  const handlePickFromSearch = useCallback(
    (item: PlaceSearchItem) => {
      setSelected({
        label: item.title,
        coords: { lat: item.lat, lng: item.lng },
        roadAddress: item.roadAddress,
        jibunAddress: item.address,
      });
      clearResults();
    },
    [setSelected, clearResults],
  );

  const handleLocateCurrentPosition = useCallback(async () => {
    setIsLocating(true);
    try {
      const coords = await getCurrentPosition();
      let roadAddress = "";
      let jibunAddress = "";
      try {
        const r = await reverseGeocode(coords);
        roadAddress = r.roadAddress;
        jibunAddress = r.jibunAddress;
      } catch {
        // 주소를 못 얻어도 좌표는 유효 — 핀은 찍는다
      }
      setSelected({ label: "현재 위치", coords, roadAddress, jibunAddress });
    } catch {
      alert("현재 위치를 가져올 수 없어요. 브라우저의 위치 권한을 확인해주세요.");
    } finally {
      setIsLocating(false);
    }
  }, [setSelected]);

  const handleSubmit = useCallback(async () => {
    if (!selected || !memberId) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const location: Location = {
        label: selected.label,
        roadAddress: selected.roadAddress,
        jibunAddress: selected.jibunAddress,
        lat: selected.coords.lat,
        lng: selected.coords.lng,
      };
      await setMeetingLocation({ code, location });
      router.push(`/rooms/${code}/curation/restaurant`);
    } catch {
      setSubmitError("모임 장소 저장에 실패했어요. 잠시 후 다시 시도해주세요.");
      setIsSubmitting(false);
    }
  }, [selected, memberId, code, router, setIsSubmitting, setSubmitError]);

  if (loadError) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-6 text-center">
        <p className="text-sm text-muted-foreground">{loadError}</p>
      </div>
    );
  }

  if (!memberId || !room) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <p className="text-sm text-muted-foreground">불러오는 중...</p>
      </div>
    );
  }

  const center = selected?.coords ?? SEOUL_CITY_HALL;

  return (
    <div className="flex h-dvh flex-col bg-background">
      {/* 헤더 */}
      <header className="flex items-center gap-2 border-b border-border/30 px-2 py-2">
        <button
          type="button"
          onClick={() => router.back()}
          aria-label="뒤로 가기"
          className="flex h-9 w-9 items-center justify-center rounded-full text-gray-700 transition active:scale-90"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate text-[12px] text-muted-foreground">
            {room.name} · {formatKoreanDateTime(room.dateTime)}
          </p>
        </div>
        <div className="h-9 w-9" aria-hidden />
      </header>

      {/* 타이틀 */}
      <div className="px-5 pt-5">
        <h1 className="text-[24px] font-bold leading-tight tracking-tight">
          어디에서 모이시나요?
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          이 장소에서 모두가 만족할 수 있는 식당을 추천해드릴게요.
        </p>
      </div>

      {/* 모드 토글 */}
      <div className="px-5 pt-4">
        <ModeToggle />
      </div>

      {/* 지도 + (검색 모드 시) 검색 오버레이 */}
      <div className="relative mx-5 mt-3 min-h-[200px] flex-1 overflow-hidden rounded-2xl bg-neutral-100">
        <NaverMap
          center={center}
          onMapIdle={handleMapIdle}
          onReady={() => setMapReady(true)}
        />
        <AddressSearchOverlay
          visible={mode === "search"}
          onPick={handlePickFromSearch}
        />
        <CurrentLocationButton
          onClick={handleLocateCurrentPosition}
          isLocating={isLocating}
          className="absolute bottom-3 right-3 z-10"
        />
      </div>

      {/* 선택한 위치 카드 */}
      <div className="px-5 pt-3">
        <SelectedLocationCard />
      </div>

      {/* 제출 */}
      <div className="sticky bottom-0 z-10 mt-3 bg-background/85 px-5 pb-5 pt-3 backdrop-blur-md">
        <SubmitButton onSubmit={handleSubmit} />
        {isSubmitting && (
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            저장 중...
          </p>
        )}
        {submitError && (
          <p className="mt-2 text-center text-[11px] text-destructive">
            {submitError}
          </p>
        )}
      </div>
    </div>
  );
}
