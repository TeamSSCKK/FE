"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  fetchRoomStatus,
  updateMemberLocation,
  type Room,
  type Location,
} from "@/entities/room";
import { loadMemberId, saveMemberId } from "@/shared/lib/room-session";
import { formatKoreanDateTime } from "@/shared/lib/format-datetime";
import { NaverMap, reverseGeocode } from "@/widgets/naver-map";
import {
  ModeToggle,
  AddressSearchOverlay,
  SelectedLocationCard,
  SubmitButton,
  useLocationInputStore,
  getCurrentPosition,
  type PlaceSearchItem,
} from "@/features/location-input";

const SEOUL_CITY_HALL = { lat: 37.5666, lng: 126.9784 };

interface Props {
  roomCode: string;
}

export function RoomLocationView({ roomCode }: Props) {
  const router = useRouter();
  const [memberId, setMemberId] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const mode = useLocationInputStore((s) => s.mode);
  const selected = useLocationInputStore((s) => s.selected);
  const setSelected = useLocationInputStore((s) => s.setSelected);
  const isSubmitting = useLocationInputStore((s) => s.isSubmitting);
  const setIsSubmitting = useLocationInputStore((s) => s.setIsSubmitting);
  const setError = useLocationInputStore((s) => s.setError);
  const reset = useLocationInputStore((s) => s.reset);

  useEffect(() => {
    return () => reset();
  }, [reset]);

  useEffect(() => {
    let canceled = false;

    async function bootstrap() {
      try {
        const status = await fetchRoomStatus(roomCode);
        if (canceled) return;
        setRoom(status.room);

        const existingId = loadMemberId(roomCode);
        if (existingId) {
          setMemberId(existingId);
          return;
        }

        // host 임시 흡수: localStorage에 room-{code}가 있다면 이 단말이 방 생성자
        const stored = localStorage.getItem(`room-${roomCode}`);
        if (stored) {
          const host = status.members.find((m) => m.isHost);
          if (host) {
            saveMemberId(roomCode, host.id);
            setMemberId(host.id);
            return;
          }
        }

        router.replace(`/rooms/${roomCode}`);
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
  }, [roomCode, router]);

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

  const handleMapInteraction = useCallback(
    async (coords: { lat: number; lng: number }) => {
      let roadAddress = "";
      let jibunAddress = "";
      try {
        const r = await reverseGeocode(coords);
        roadAddress = r.roadAddress;
        jibunAddress = r.jibunAddress;
      } catch {
        // ignore
      }
      setSelected({
        label: "선택한 위치",
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
    },
    [setSelected],
  );

  const handleSubmit = useCallback(async () => {
    if (!selected || !memberId) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const location: Location = {
        label: selected.label,
        roadAddress: selected.roadAddress,
        jibunAddress: selected.jibunAddress,
        lat: selected.coords.lat,
        lng: selected.coords.lng,
      };
      await updateMemberLocation({ code: roomCode, memberId, location });
      router.push(`/rooms/${roomCode}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장 실패");
      setIsSubmitting(false);
    }
  }, [selected, memberId, roomCode, router, setIsSubmitting, setError]);

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
  const marker = selected?.coords;
  const markerLabel = selected?.label;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
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
          어디에서 출발하시나요?
        </h1>
        <p className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          모두의 이동 시간을 함께 고려해 공정한 모임 장소를 추천해드려요.
        </p>
      </div>

      {/* 모드 토글 */}
      <div className="px-5 pt-4">
        <ModeToggle />
      </div>

      {/* 지도 + (검색 모드 시) 검색 오버레이 */}
      <div className="relative mx-5 mt-3 flex-1 overflow-hidden rounded-2xl bg-neutral-100">
        <NaverMap
          center={center}
          marker={marker}
          markerLabel={markerLabel}
          onMapClick={handleMapInteraction}
          onMarkerDragEnd={handleMapInteraction}
          onReady={() => setMapReady(true)}
        />
        {mode === "search" && (
          <AddressSearchOverlay onPick={handlePickFromSearch} />
        )}
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
      </div>
    </div>
  );
}
