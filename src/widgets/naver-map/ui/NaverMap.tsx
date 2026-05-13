"use client";

import { useEffect, useRef, useState } from "react";
import { env } from "@/shared/config/env";
import { cn } from "@/shared/lib/utils";
import { loadNaverMapScript } from "../lib/load-script";
import type { LatLng, NaverMapProps } from "../model/types";

export function NaverMap({
  center,
  marker,
  markerLabel,
  onMapClick,
  onMarkerDragEnd,
  onReady,
  className,
}: NaverMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const infoRef = useRef<any>(null);
  const clickListenerRef = useRef<any>(null);
  const dragListenerRef = useRef<any>(null);
  const onReadyRef = useRef(onReady);
  const [isReady, setIsReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    onReadyRef.current = onReady;
  }, [onReady]);

  useEffect(() => {
    let canceled = false;
    loadNaverMapScript(env.NAVER_MAP_CLIENT_ID)
      .then(() => {
        if (canceled || !containerRef.current) return;
        const { naver } = window;
        mapRef.current = new naver.maps.Map(containerRef.current, {
          center: new naver.maps.LatLng(center.lat, center.lng),
          zoom: 16,
          minZoom: 9,
          zoomControl: false,
          mapDataControl: false,
          scaleControl: false,
          logoControl: true,
        });
        setIsReady(true);
        onReadyRef.current?.();
      })
      .catch((err) => {
        if (!canceled) setLoadError(err.message ?? "지도 로드 실패");
      });

    return () => {
      canceled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const { naver } = window;
    clickListenerRef.current = naver.maps.Event.addListener(
      mapRef.current,
      "click",
      (e: any) => {
        const latlng: LatLng = { lat: e.coord.y, lng: e.coord.x };
        onMapClick?.(latlng);
      },
    );
    return () => {
      if (clickListenerRef.current) {
        naver.maps.Event.removeListener(clickListenerRef.current);
        clickListenerRef.current = null;
      }
    };
  }, [isReady, onMapClick]);

  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const { naver } = window;
    const newCenter = new naver.maps.LatLng(center.lat, center.lng);
    mapRef.current.setCenter(newCenter);
  }, [isReady, center.lat, center.lng]);

  useEffect(() => {
    if (!isReady || !mapRef.current) return;
    const { naver } = window;

    if (!marker) {
      if (markerRef.current) {
        markerRef.current.setMap(null);
        markerRef.current = null;
      }
      if (infoRef.current) {
        infoRef.current.close();
        infoRef.current = null;
      }
      return;
    }

    const position = new naver.maps.LatLng(marker.lat, marker.lng);

    if (!markerRef.current) {
      markerRef.current = new naver.maps.Marker({
        position,
        map: mapRef.current,
        draggable: true,
      });
      dragListenerRef.current = naver.maps.Event.addListener(
        markerRef.current,
        "dragend",
        (e: any) => {
          const coord = e.coord;
          onMarkerDragEnd?.({ lat: coord.y, lng: coord.x });
        },
      );
    } else {
      markerRef.current.setPosition(position);
    }

    if (markerLabel) {
      if (!infoRef.current) {
        infoRef.current = new naver.maps.InfoWindow({
          content: `<div style="padding:6px 10px;font-size:12px;font-weight:600;color:#111;background:#fff;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,.12);white-space:nowrap;">${escapeHtml(markerLabel)}</div>`,
          borderWidth: 0,
          backgroundColor: "transparent",
          disableAnchor: true,
          pixelOffset: new naver.maps.Point(0, -8),
        });
      } else {
        infoRef.current.setContent(
          `<div style="padding:6px 10px;font-size:12px;font-weight:600;color:#111;background:#fff;border-radius:10px;box-shadow:0 2px 8px rgba(0,0,0,.12);white-space:nowrap;">${escapeHtml(markerLabel)}</div>`,
        );
      }
      infoRef.current.open(mapRef.current, markerRef.current);
    } else if (infoRef.current) {
      infoRef.current.close();
    }

    return () => {
      // marker/info는 다음 effect 또는 unmount에서 정리
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, marker?.lat, marker?.lng, markerLabel, onMarkerDragEnd]);

  useEffect(() => {
    return () => {
      const naver = window.naver;
      if (!naver) return;
      if (dragListenerRef.current) {
        naver.maps.Event.removeListener(dragListenerRef.current);
      }
      if (clickListenerRef.current) {
        naver.maps.Event.removeListener(clickListenerRef.current);
      }
      if (markerRef.current) {
        markerRef.current.setMap(null);
      }
      if (infoRef.current) {
        infoRef.current.close();
      }
    };
  }, []);

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

  return <div ref={containerRef} className={cn("h-full w-full", className)} />;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
