"use client";

import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { env } from "@/shared/config/env";
import { cn } from "@/shared/lib/utils";
import { loadNaverMapScript } from "../lib/load-script";
import type { NaverMapProps } from "../model/types";

// 사용자 조작과 프로그래매틱 이동을 가르는 좌표 노이즈 임계값 (약 0.1m)
const EPS = 1e-6;

export function NaverMap({
  center,
  onMapIdle,
  onReady,
  className,
}: NaverMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const onReadyRef = useRef(onReady);
  const centerRef = useRef(center);
  const onMapIdleRef = useRef(onMapIdle);
  const programmaticMoveRef = useRef(false);
  const lastZoomRef = useRef(16);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ref 동기화 — 선언 순서 유지: centerRef가 아래 setCenter effect보다 먼저 갱신돼야 한다.
  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    centerRef.current = { lat: center.lat, lng: center.lng };
  }, [center.lat, center.lng]);

  useEffect(() => {
    onMapIdleRef.current = onMapIdle;
  }, [onMapIdle]);

  // 지도 생성
  useEffect(() => {
    let canceled = false;
    let resizeObserver: ResizeObserver | null = null;

    loadNaverMapScript(env.NAVER_MAP_CLIENT_ID)
      .then(() => {
        if (canceled || !containerRef.current) return;
        const { naver } = window;
        const map = new naver.maps.Map(containerRef.current, {
          center: new naver.maps.LatLng(center.lat, center.lng),
          zoom: 16,
          minZoom: 9,
          zoomControl: false,
          mapDataControl: false,
          scaleControl: false,
          // 기본 줌은 포인터 기준이라 끈다 — 아래 커스텀 줌이 중심(핀) 기준으로 처리
          scrollWheel: false,
          disableDoubleClickZoom: true,
          // 네이버 로고는 약관상 제거 불가 — 위치만 좌측 하단으로 이동
          logoControl: true,
          logoControlOptions: {
            position: naver.maps.Position.BOTTOM_LEFT,
          },
        });
        mapRef.current = map;
        setIsReady(true);
        onReadyRef.current?.();

        // 컨테이너 크기가 0→실제값으로 잡히는 첫 렌더 타이밍 보정.
        // ResizeObserver는 observe 직후 1회 즉시 콜백하므로 초기 타일 로드도 보장된다.
        resizeObserver = new ResizeObserver(() => {
          naver.maps.Event.trigger(map, "resize");
        });
        resizeObserver.observe(containerRef.current);
      })
      .catch((err) => {
        if (!canceled) setLoadError(err.message ?? "지도 로드 실패");
      });

    return () => {
      canceled = true;
      resizeObserver?.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // idle 리스너 — isReady 후 1회 등록. 줌이 완전히 끝난 시점이라 보정이 확실히 반영된다.
  // - 프로그래매틱 이동(setCenter)이 유발한 idle: 가드 플래그로 무시
  // - 줌으로 중심이 밀린 경우: 핀 위치로 복원하되 위치는 갱신하지 않음
  // - 순수 드래그: onMapIdle 호출
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const { naver } = window;
    const listener = naver.maps.Event.addListener(
      mapRef.current,
      "idle",
      () => {
        const map = mapRef.current;
        const currentZoom = map.getZoom();
        const zoomChanged = currentZoom !== lastZoomRef.current;
        lastZoomRef.current = currentZoom;

        // setCenter()가 유발한 idle → 1회 소비하고 무시
        if (programmaticMoveRef.current) {
          programmaticMoveRef.current = false;
          return;
        }

        const c = map.getCenter();
        const cur = centerRef.current;
        const centerMoved =
          Math.abs(c.y - cur.lat) >= EPS || Math.abs(c.x - cur.lng) >= EPS;

        // 줌으로 중심이 밀렸으면 핀 위치로 복원 — "핀(화면 중앙) 기준 줌".
        // 위치 자체는 바꾸지 않으므로 onMapIdle은 호출하지 않는다.
        if (zoomChanged) {
          if (centerMoved) {
            programmaticMoveRef.current = true;
            map.setCenter(new naver.maps.LatLng(cur.lat, cur.lng));
          }
          return;
        }

        // 줌 변화 없이 중심만 이동 = 사용자 드래그 → 위치 갱신
        if (!centerMoved) return;
        onMapIdleRef.current?.({ lat: c.y, lng: c.x });
      },
    );
    return () => {
      naver.maps.Event.removeListener(listener);
    };
  }, [isReady]);

  // 커스텀 줌 — 휠/더블클릭을 map.setZoom으로 처리한다.
  // setZoom은 항상 지도 중심 기준이라 줌 애니메이션 자체가 핀(화면 중앙) 기준이 된다.
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const { naver } = window;
    const map = mapRef.current;
    const container = containerRef.current;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      map.setZoom(map.getZoom() + (e.deltaY < 0 ? 1 : -1), true);
    };
    container?.addEventListener("wheel", handleWheel, { passive: false });

    const dblListener = naver.maps.Event.addListener(map, "dblclick", () => {
      map.setZoom(map.getZoom() + 1, true);
    });

    return () => {
      container?.removeEventListener("wheel", handleWheel);
      naver.maps.Event.removeListener(dblListener);
    };
  }, [isReady]);

  // center prop 변경 → 지도 이동(프로그래매틱). panTo로 부드럽게 미끄러지며,
  // 애니메이션 끝에 발생하는 idle 1회를 가드 플래그로 무시시킨다.
  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const { naver } = window;
    const c = mapRef.current.getCenter();
    // 이미 그 위치면 이동 스킵 — 효과 없는 호출 + 가드 플래그 오염 방지
    if (Math.abs(c.y - center.lat) < EPS && Math.abs(c.x - center.lng) < EPS) {
      return;
    }
    programmaticMoveRef.current = true;
    mapRef.current.panTo(new naver.maps.LatLng(center.lat, center.lng), {
      duration: 500,
      easing: "easeOutCubic",
    });
  }, [isReady, center.lat, center.lng]);

  if (loadError) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-neutral-100 text-sm text-muted-foreground",
          className,
        )}
      >
        지도를 불러오지 못했어요. {loadError}
      </div>
    );
  }

  return (
    <div className={cn("relative h-full w-full", className)}>
      <div ref={containerRef} className="naver-map h-full w-full" />
      {/* 센터 핀 — 화면 정중앙 고정. pointer-events-none으로 지도 드래그를 막지 않는다.
          -translate-y-full로 핀 하단 꼭지점이 지도 중심을 가리키게 한다. */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-full">
        <MapPin
          className="h-9 w-9 fill-primary text-primary drop-shadow-md"
          strokeWidth={1.5}
          aria-hidden
        />
      </div>
      {/* 핀이 정확히 가리키는 좌표를 표시하는 정밀 앵커 — 검은 점 + 흰 링 */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 z-10 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black ring-1 ring-white" />
    </div>
  );
}
